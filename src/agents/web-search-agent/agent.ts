import { anthropic } from "@ai-sdk/anthropic";
import {
	type LanguageModel,
	type ModelMessage,
	stepCountIs,
	streamText,
} from "ai";
import { createWebSearchToolset } from "@/tools/web-search";
import { WEB_SEARCH_AGENT_PROMPT } from "./prompt";

export function webSearchAgent(
	messages: ModelMessage[],
	options: {
		conversationId?: string;
		abortSignal?: AbortSignal;
		model?: LanguageModel;
	} = {},
) {
	const model = options.model ?? anthropic("claude-sonnet-4-5-20250929");
	return streamText({
		model,
		system: WEB_SEARCH_AGENT_PROMPT,
		messages,
		tools: createWebSearchToolset({
			conversationId: options.conversationId,
			modelName: typeof model === "string" ? model : model.modelId,
		}),
		abortSignal: options.abortSignal,
		stopWhen: [stepCountIs(10)],
	});
}
