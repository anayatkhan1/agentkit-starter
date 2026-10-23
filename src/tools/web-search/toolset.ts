import { webSearch } from "@exalabs/ai-sdk";
import type { ToolSet } from "ai";
import { type ParallelSearchOptions, parallelWebSearch } from "./parallel";

export function createWebSearchToolset(options: ParallelSearchOptions = {}) {
	const provider =
		process.env.WEB_SEARCH_PROVIDER ??
		(process.env.EXA_API_KEY ? "exa" : "parallel");
	if (provider !== "exa" && provider !== "parallel") {
		throw new Error("WEB_SEARCH_PROVIDER must be 'parallel' or 'exa'.");
	}
	return {
		webSearch: provider === "exa" ? webSearch() : parallelWebSearch(options),
	} satisfies ToolSet;
}
