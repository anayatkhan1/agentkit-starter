import { createHash, randomUUID } from "node:crypto";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";
import { CallToolResultSchema } from "@modelcontextprotocol/sdk/types.js";
import { tool } from "ai";
import { z } from "zod";

const MCP_URL = "https://search.parallel.ai/mcp";
const USER_AGENT =
	"agentkit-starter/0.1.0 (https://github.com/anayatkhan1/agentkit-starter)";

const searchResponse = z.object({
	results: z.array(
		z.object({
			url: z
				.string()
				.url()
				.refine((url) => /^https?:\/\//i.test(url)),
			title: z.string().nullable().optional(),
			excerpts: z.array(z.string()),
		}),
	),
});

export interface ParallelSearchOptions {
	conversationId?: string;
	modelName?: string;
}

export function parallelWebSearch(options: ParallelSearchOptions = {}) {
	// Hash chat IDs so the same conversation keeps its identity across turns
	// without sending the application's raw database identifier to the service.
	const sessionId = options.conversationId
		? createHash("sha256").update(options.conversationId).digest("hex")
		: randomUUID();

	return tool({
		description:
			"Search the web for current information, news, documentation and facts. Returns source URLs and relevant excerpts for citations.",
		inputSchema: z.object({
			query: z.string().min(1).max(500).describe("The web search query"),
		}),
		execute: async ({ query }, { abortSignal }) => {
			const timeout = AbortSignal.timeout(30_000);
			const signal = abortSignal
				? AbortSignal.any([abortSignal, timeout])
				: timeout;
			signal.throwIfAborted();

			const client = new Client({ name: "agentkit-starter", version: "0.1.0" });
			const transport = new StreamableHTTPClientTransport(new URL(MCP_URL), {
				requestInit: { headers: { "User-Agent": USER_AGENT } },
				// Cover discovery and streaming HTTP reads as well as tools/call.
				fetch: (url, init) =>
					fetch(url, {
						...init,
						signal: init?.signal
							? AbortSignal.any([signal, init.signal])
							: signal,
					}),
			});
			try {
				await client.connect(transport);
				const { tools } = await client.listTools({}, { signal });
				if (!tools.some((entry) => entry.name === "web_search")) {
					throw new Error("Parallel MCP did not provide web_search.");
				}
				const response = CallToolResultSchema.parse(
					await client.callTool(
						{
							name: "web_search",
							arguments: {
								objective: query,
								search_queries: [query],
								session_id: sessionId,
								...(options.modelName ? { model_name: options.modelName } : {}),
							},
						},
						CallToolResultSchema,
						{ signal },
					),
				);
				if (response.isError) {
					const message = response.content
						.filter((part) => part.type === "text")
						.map((part) => part.text)
						.join("\n");
					throw new Error(`Parallel search failed: ${message}`);
				}
				const text = response.content.find((part) => part.type === "text");
				const data = searchResponse.parse(
					response.structuredContent ??
						(text?.type === "text" ? JSON.parse(text.text) : undefined),
				);
				// Keep the existing webSearch result contract for chat source cards
				// and for the model's next step.
				return {
					results: data.results.map((result) => ({
						url: result.url,
						title: result.title ?? result.url,
						text: result.excerpts.join("\n\n"),
					})),
				};
			} finally {
				await client.close();
			}
		},
	});
}
