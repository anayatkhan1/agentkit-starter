import { ToolSet } from "ai";
import { webSearch } from "@exalabs/ai-sdk";

export const webSearchToolset = {
	webSearch: webSearch(),
} as ToolSet;
