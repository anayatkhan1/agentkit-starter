import { SYSTEM_PROMPT } from "@/prompts/prompts";
import { anthropic } from "@ai-sdk/anthropic";
import {
	type ModelMessage,
	type UIMessage,
	convertToModelMessages,
	createUIMessageStreamResponse,
	streamText,
} from "ai";
import { type NextRequest } from "next/server";

export async function POST(request: NextRequest) {
	const body = await request.json();

	const messages: UIMessage[] = body.messages;

	const modelMessages: ModelMessage[] = await convertToModelMessages(messages);

	const streamTextResult = streamText({
		model: anthropic("claude-3-5-haiku-20241022"),
		messages: modelMessages,
		system: SYSTEM_PROMPT,
	});
	const stream = streamTextResult.toUIMessageStream();
	return createUIMessageStreamResponse({
		stream,
	});
}
