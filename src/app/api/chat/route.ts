import { loadChat, saveChat } from "@/lib/chat-store";
import { SYSTEM_PROMPT } from "@/prompts/prompts";
import { anthropic } from "@ai-sdk/anthropic";
import {
	type ModelMessage,
	type UIMessage,
	convertToModelMessages,
	createIdGenerator,
	streamText,
} from "ai";
import { type NextRequest } from "next/server";

export async function POST(request: NextRequest) {
	const body = await request.json();
	const id = body.id;

	if (!id) {
		return new Response("Chat ID is required", { status: 400 });
	}

	// Support both sending all messages or just the last message (optimization)
	// If 'message' is provided, load previous messages and append it
	// Otherwise, use all 'messages' (backward compatibility)
	let messages: UIMessage[];
	if (body.message) {
		// Load previous messages from storage and append the new message
		const previousMessages = await loadChat(id);
		messages = [...previousMessages, body.message];
	} else if (body.messages) {
		// Backward compatibility: use all messages if provided
		messages = body.messages;
	} else {
		// Load existing messages or start fresh
		messages = await loadChat(id);
	}

	// Convert to model messages for the AI SDK
	const modelMessages: ModelMessage[] = await convertToModelMessages(messages);

	const streamTextResult = streamText({
		model: anthropic("claude-3-5-haiku-20241022"),
		messages: modelMessages,
		system: SYSTEM_PROMPT,
	});

	// Consume stream to ensure it runs to completion even if client disconnects
	// This ensures onFinish is called and messages are persisted
	streamTextResult.consumeStream();

	return streamTextResult.toUIMessageStreamResponse({
		originalMessages: messages,
		// Generate consistent server-side IDs for persistence
		generateMessageId: createIdGenerator({
			prefix: "msg",
			size: 16,
		}),
		onFinish: async ({ messages }) => {
			try {
				await saveChat({ chatId: id, messages });
			} catch (error) {
				// Log error but don't fail the request
				// The response has already been sent, so we can't return an error
				console.error(`Failed to persist chat ${id}:`, error);
				// In production, you might want to:
				// - Send to error tracking service (Sentry, etc.)
				// - Queue for retry
				// - Notify admin
			}
		},
	});
}
