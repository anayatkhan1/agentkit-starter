import { webSearch } from "@exalabs/ai-sdk";
import { ToolSet } from "ai";

export const webSearchToolset = {
	webSearch: webSearch(),
} as ToolSet;
