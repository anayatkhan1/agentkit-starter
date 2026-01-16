import { anthropic } from "@ai-sdk/anthropic";
import { type ModelMessage, stepCountIs, streamText } from "ai";
import { webSearchToolset } from "@/tools/web-search";
import { WEB_SEARCH_AGENT_PROMPT } from "./prompt";

export function webSearchAgent(messages: ModelMessage[]) {
	return streamText({
		model: anthropic("claude-sonnet-4-5-20250929"),
		system: WEB_SEARCH_AGENT_PROMPT,
		messages,
		tools: {
			...webSearchToolset,
		},
		stopWhen: [stepCountIs(10)],
	});
}
