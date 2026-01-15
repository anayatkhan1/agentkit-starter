import { loadChat, saveChat } from "@/lib/chat-store";
import {
	type ModelMessage,
	type UIMessage,
	convertToModelMessages,
	createIdGenerator,
	streamText,
} from "ai";
import { type NextRequest } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { webSearchAgent } from "@/agents/web-search-agent";
import { anthropic } from "@ai-sdk/anthropic";

export async function POST(request: NextRequest) {
	// Get authenticated user ID
	const { userId } = await auth();

	if (!userId) {
		return new Response("Unauthorized", { status: 401 });
	}

	const body = await request.json();
	const id = body.id;
	const searchMode = body.searchMode ?? false; // Default to false if not provided

	// #region agent log
	fetch('http://127.0.0.1:7244/ingest/f534629e-950a-47de-8405-66a055ceff08',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'route.ts:23',message:'API request received',data:{id,searchMode,hasSearchMode:body.searchMode!==undefined},sessionId:'debug-session',runId:'run1',hypothesisId:'G'})}).catch(()=>{});
	// #endregion

	if (!id) {
		return new Response("Chat ID is required", { status: 400 });
	}

	// Support both sending all messages or just the last message (optimization)
	// If 'message' is provided, load previous messages and append it
	// Otherwise, use all 'messages' (backward compatibility)
	let messages: UIMessage[];
	if (body.message) {
		// Load previous messages from storage and append the new message
		const previousMessages = await loadChat(id, userId);
		messages = [...previousMessages, body.message];
	} else if (body.messages) {
		// Backward compatibility: use all messages if provided
		messages = body.messages;
	} else {
		// Load existing messages or start fresh
		messages = await loadChat(id, userId);
	}

	// Convert to model messages for the AI SDK
	const modelMessages: ModelMessage[] = await convertToModelMessages(messages);

	// Simple logic: use webSearchAgent if searchMode is enabled, otherwise just streamText without tools
	const streamTextResult = searchMode 
		? webSearchAgent(modelMessages)
		: streamText({
				model: anthropic("claude-sonnet-4-5-20250929"),
				system: "You are a helpful AI assistant. Provide clear, accurate, and concise responses to user questions.",
				messages: modelMessages,
				// No tools when searchMode is disabled
			});
	
	// #region agent log
	fetch('http://127.0.0.1:7244/ingest/f534629e-950a-47de-8405-66a055ceff08',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'route.ts:51',message:'Agent selected',data:{searchMode,agentType:searchMode?'webSearchAgent':'streamText'},sessionId:'debug-session',runId:'run1',hypothesisId:'G'})}).catch(()=>{});
	// #endregion


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
				await saveChat({ chatId: id, messages, userId });
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
