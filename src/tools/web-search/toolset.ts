import { webSearch } from "@exalabs/ai-sdk";
import { jsonSchema, type ToolSet } from "ai";
import { tavily } from "@tavily/core";

export const webSearchToolset = {
	webSearch: webSearch(),
} as ToolSet;

const tavilyClient = tavily({
	apiKey: process.env.TAVILY_API_KEY ?? "",
});

type TavilySearchInput = {
	query: string;
	maxResults?: number;
	searchDepth?: "basic" | "advanced";
	topic?: "general" | "news" | "finance";
};

export const tavilyWebSearchToolset: ToolSet = {
	tavilyWebSearch: {
		description:
			"Search the web for current information using Tavily. Returns relevant results with titles, URLs, and content snippets.",
		inputSchema: jsonSchema<TavilySearchInput>({
			type: "object",
			properties: {
				query: {
					type: "string",
					description: "The search query to look up on the web",
				},
				maxResults: {
					type: "number",
					description: "Maximum number of results to return (1-20)",
				},
				searchDepth: {
					type: "string",
					enum: ["basic", "advanced"],
					description:
						"Search depth: basic for fast results, advanced for more thorough search",
				},
				topic: {
					type: "string",
					enum: ["general", "news", "finance"],
					description: "The topic category for the search",
				},
			},
			required: ["query"],
		}),
		execute: async ({
			query,
			maxResults = 5,
			searchDepth = "basic",
			topic = "general",
		}: TavilySearchInput) => {
			try {
				const response = await tavilyClient.search(query, {
					maxResults,
					searchDepth,
					topic,
				});
				return {
					results: response.results.map((result) => ({
						title: result.title,
						url: result.url,
						content: result.content,
						score: result.score,
					})),
				};
			} catch (err) {
				const message =
					err instanceof Error ? err.message : "Unknown error";
				return { results: [], error: message };
			}
		},
	},
};
