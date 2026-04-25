import { webSearch as exaWebSearch } from "@exalabs/ai-sdk";
import { tool, ToolSet } from "ai";
import { z } from "zod";

type YouSearchResponse = {
	results?: {
		web?: Array<{
			title?: string;
			url?: string;
			description?: string;
			snippets?: string[];
		}>;
	};
};

const provider = (process.env.WEB_SEARCH_PROVIDER ?? "exa").toLowerCase();
const exaTool = exaWebSearch();

const youSearchTool = tool({
	description:
		"Search the web with you.com Search API and return concise, cited sources.",
	inputSchema: z.object({
		query: z.string().describe("The search query."),
		count: z
			.number()
			.int()
			.min(1)
			.max(20)
			.default(5)
			.describe("Number of results to return (1-20)."),
	}),
	execute: async ({ query, count }) => {
		const params = new URLSearchParams({
			query,
			count: String(count),
		});

		const headers: Record<string, string> = {};
		if (process.env.YDC_API_KEY || process.env.YOU_API_KEY) {
			headers["X-API-Key"] = process.env.YDC_API_KEY ?? process.env.YOU_API_KEY ?? "";
		}

		try {
			const response = await fetch(`https://api.you.com/v1/agents/search?${params.toString()}`, {
				headers,
			});

			if (!response.ok) {
				throw new Error(`you.com search failed (${response.status})`);
			}

			const data = (await response.json()) as YouSearchResponse;
			const results = (data.results?.web ?? []).slice(0, count).map((item) => ({
				title: item.title ?? "Untitled",
				url: item.url ?? "",
				snippet: item.snippets?.[0] ?? item.description ?? "",
			}));

			return {
				provider: "you",
				query,
				results,
			};
		} catch (error) {
			if (process.env.EXA_API_KEY) {
				return exaTool.execute({ query });
			}

			const message = error instanceof Error ? error.message : "Unknown error";
			return {
				provider: "you",
				error:
					`${message}. Set YDC_API_KEY (or YOU_API_KEY) for authenticated you.com usage or configure EXA_API_KEY as fallback.`,
				results: [],
			};
		}
	},
});

export const webSearchToolset = {
	webSearch: provider === "you" ? youSearchTool : exaTool,
} as ToolSet;
