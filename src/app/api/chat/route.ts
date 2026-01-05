import { saveChat } from "@/lib/chat-store";
import { SYSTEM_PROMPT } from "@/prompts/prompts";
import { anthropic } from "@ai-sdk/anthropic";
import {
	type ModelMessage,
	type UIMessage,
	convertToModelMessages,
	streamText,
} from "ai";
import { type NextRequest } from "next/server";

export async function POST(request: NextRequest) {
	const { messages, id } = await request.json();

	// Validate that messages is an array
	if (!Array.isArray(messages)) {
		return new Response("Invalid request: messages must be an array", { status: 400 });
	}

	const modelMessages: ModelMessage[] = await convertToModelMessages(messages);

	const streamTextResult = streamText({
		model: anthropic("claude-3-5-haiku-20241022"),
		messages: modelMessages,
		system: SYSTEM_PROMPT,
	});

	return streamTextResult.toUIMessageStreamResponse({
		originalMessages: messages,
		onFinish: async ({ messages }) => {
			// Only save if chat ID is provided
			if (id) {
				try {
					// CRITICAL: Await the save operation
					// This ensures persistence completes before the request closes
					await saveChat({ chatId: id, messages: messages as UIMessage[] });
				} catch (error) {
					// Log error but don't fail the request
					// The response has already been sent, so we can't return an error
					console.error(`Failed to persist chat ${id}:`, error);
					// In production, you might want to:
					// - Send to error tracking service (Sentry, etc.)
					// - Queue for retry
					// - Notify admin
				}
			}
		},
	});
}
