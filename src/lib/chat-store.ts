import { type UIMessage } from "ai";
import prisma from "./prisma";

// Validate messages array structure
function validateMessages(messages: UIMessage[]): void {
	if (!Array.isArray(messages)) {
		throw new Error("Messages must be an array");
	}
	// Basic validation - ensure each message has required fields
	for (const msg of messages) {
		if (!msg.role || !msg.id) {
			throw new Error("Invalid message structure: missing role or id");
		}
	}
}

// Helper function to convert UIMessage to Prisma-compatible JSON
// This ensures the message structure matches what was stored in the filesystem
function messageToPrismaJson(msg: UIMessage): unknown {
	// Serialize and parse to ensure we have a plain object
	// This matches the structure from the original JSON files
	return JSON.parse(JSON.stringify(msg));
}

/**
 * Create a new chat for a user
 * @param userId - Clerk user ID
 * @returns Chat ID
 */
export async function createChat(userId: string): Promise<string> {
	if (!userId) {
		throw new Error("User ID is required to create a chat");
	}

	try {
		const chat = await prisma.chat.create({
			data: {
				userId,
				title: null, // Will be set when first message is added
			},
		});
		return chat.id;
	} catch (error) {
		console.error(`Failed to create chat for user ${userId}:`, error);
		throw new Error(
			`Failed to create chat: ${error instanceof Error ? error.message : "Unknown error"}`,
		);
	}
}

export async function loadChat(
	id: string,
	userId?: string,
): Promise<UIMessage[]> {
	try {
		// First, verify the chat exists and belongs to the user (if userId provided)
		const chat = await prisma.chat.findUnique({
			where: { id },
			select: { userId: true },
		});

		if (!chat) {
			return [];
		}

		// If userId is provided, verify ownership
		if (userId && chat.userId !== userId) {
			throw new Error("Unauthorized: Chat does not belong to user");
		}

		// Load all messages for this chat, ordered by creation time
		const messages = await prisma.message.findMany({
			where: { chatId: id },
			orderBy: { createdAt: "asc" },
		});

		// Convert database messages back to UIMessage format
		return messages.map((msg) => {
			// Prisma returns JsonValue, we need to cast it properly
			const content = msg.content as unknown;
			return content as UIMessage;
		});
	} catch (error) {
		// Log error but don't throw - return empty array for non-existent chats
		if (error instanceof Error && error.message.includes("Unauthorized")) {
			throw error; // Re-throw authorization errors
		}
		console.error(`Failed to load chat ${id}:`, error);
		return [];
	}
}

export async function saveChat({
	chatId,
	messages,
	userId,
}: {
	chatId: string;
	messages: UIMessage[];
	userId?: string;
}): Promise<void> {
	// Validate inputs
	validateMessages(messages);

	try {
		// Verify chat exists and belongs to user (if userId provided)
		if (userId) {
			const chat = await prisma.chat.findUnique({
				where: { id: chatId },
				select: { userId: true },
			});

			if (!chat) {
				throw new Error(`Chat ${chatId} not found`);
			}

			if (chat.userId !== userId) {
				throw new Error("Unauthorized: Chat does not belong to user");
			}
		}

		// Use a transaction to ensure atomicity
		// This ensures all operations succeed or fail together
		await prisma.$transaction(async (tx) => {
			// Get existing message IDs for this chat to determine what needs to be updated vs created
			const existingMessages = await tx.message.findMany({
				where: { chatId },
				select: { id: true },
			});
			const existingMessageIds = new Set(existingMessages.map((m) => m.id));
			const currentMessageIds = new Set(messages.map((m) => m.id));

			// Separate messages into new and existing for batch operations
			const messagesToCreate: Array<{
				id: string;
				chatId: string;
				role: string;
				// eslint-disable-next-line @typescript-eslint/no-explicit-any
				content: any;
			}> = [];
			const messagesToUpdate: Array<{
				id: string;
				role: string;
				// eslint-disable-next-line @typescript-eslint/no-explicit-any
				content: any;
			}> = [];

			for (const msg of messages) {
				const messageContent = messageToPrismaJson(msg);
				if (existingMessageIds.has(msg.id)) {
					// Message exists, prepare for update
					messagesToUpdate.push({
						id: msg.id,
						role: msg.role,
						// eslint-disable-next-line @typescript-eslint/no-explicit-any
						content: messageContent as any,
					});
				} else {
					// New message, prepare for create
					messagesToCreate.push({
						id: msg.id,
						chatId,
						role: msg.role,
						// eslint-disable-next-line @typescript-eslint/no-explicit-any
						content: messageContent as any,
					});
				}
			}

			// Batch create new messages (more efficient than individual creates)
			if (messagesToCreate.length > 0) {
				await tx.message.createMany({
					data: messagesToCreate as never,
					skipDuplicates: true, // Safety net in case of race conditions
				});
			}

			// Batch update existing messages
			// Note: Prisma doesn't support batch update with different data per row,
			// so we update individually, but this is still better than delete+recreate
			for (const msgUpdate of messagesToUpdate) {
				await tx.message.update({
					where: { id: msgUpdate.id },
					data: {
						role: msgUpdate.role,
						content: msgUpdate.content,
					},
				});
			}

			// Remove messages that are no longer in the array (shouldn't happen in normal flow,
			// but handles edge cases like message deletion or reordering)
			const messagesToDelete = Array.from(existingMessageIds).filter(
				(id) => !currentMessageIds.has(id),
			);
			if (messagesToDelete.length > 0) {
				await tx.message.deleteMany({
					where: {
						chatId,
						id: { in: messagesToDelete },
					},
				});
			}

			// Update chat title and updatedAt timestamp
			const title = generateChatTitle(messages);
			await tx.chat.update({
				where: { id: chatId },
				data: {
					title,
					updatedAt: new Date(),
				},
			});
		});
	} catch (error) {
		console.error(`Failed to save chat ${chatId}:`, error);
		throw new Error(
			`Failed to save chat: ${error instanceof Error ? error.message : "Unknown error"}`,
		);
	}
}

// Extract text from message parts for title/preview
function extractTextFromMessage(message: UIMessage): string {
	if (!message.parts || message.parts.length === 0) {
		return "";
	}

	return message.parts
		.filter((part) => part.type === "text")
		.map((part) => (part as { text: string }).text)
		.join(" ")
		.trim();
}

// Generate a title from messages (use first user message or first message)
function generateChatTitle(messages: UIMessage[]): string {
	if (messages.length === 0) {
		return "New Chat";
	}

	// Try to find first user message
	const firstUserMessage = messages.find((msg) => msg.role === "user");
	if (firstUserMessage) {
		const text = extractTextFromMessage(firstUserMessage);
		if (text) {
			// Use first 50 characters as title
			return text.length > 50 ? text.substring(0, 50) + "..." : text;
		}
	}

	// Fallback to first message
	const firstMessage = messages[0];
	const text = extractTextFromMessage(firstMessage);
	if (text) {
		return text.length > 50 ? text.substring(0, 50) + "..." : text;
	}

	return "New Chat";
}

// Get last message preview
function getLastMessagePreview(messages: UIMessage[]): string {
	if (messages.length === 0) {
		return "No messages yet";
	}

	// Get last message
	const lastMessage = messages[messages.length - 1];
	const text = extractTextFromMessage(lastMessage);

	if (text) {
		return text.length > 60 ? text.substring(0, 60) + "..." : text;
	}

	return "No text content";
}

export interface ChatMetadata {
	id: string;
	title: string;
	lastMessage: string;
	timestamp: number;
	messageCount: number;
}

export async function listChats(userId: string): Promise<ChatMetadata[]> {
	if (!userId) {
		throw new Error("User ID is required to list chats");
	}

	try {
		// Get all chats for the user with their message counts
		const chats = await prisma.chat.findMany({
			where: { userId },
			include: {
				messages: {
					orderBy: { createdAt: "desc" },
					take: 1, // Only need the last message for preview
				},
				_count: {
					select: { messages: true },
				},
			},
			orderBy: { updatedAt: "desc" },
		});

		return chats
			.filter((chat) => chat._count.messages > 0) // Only return chats with messages
			.map((chat) => {
				const lastMessage = chat.messages[0];
				const lastMessageContent = lastMessage
					? (lastMessage.content as unknown as UIMessage)
					: null;

				return {
					id: chat.id,
					title: chat.title || "New Chat",
					lastMessage: lastMessageContent
						? getLastMessagePreview([lastMessageContent])
						: "No messages yet",
					timestamp: chat.updatedAt.getTime(),
					messageCount: chat._count.messages,
				};
			});
	} catch (error) {
		console.error(`Failed to list chats for user ${userId}:`, error);
		return [];
	}
}

export async function getChatTitle(
	id: string,
	userId?: string,
): Promise<string> {
	try {
		const chat = await prisma.chat.findUnique({
			where: { id },
			select: { title: true, userId: true },
		});

		if (!chat) {
			return "Chat";
		}

		// If userId is provided, verify ownership
		if (userId && chat.userId !== userId) {
			throw new Error("Unauthorized: Chat does not belong to user");
		}

		return chat.title || "New Chat";
	} catch (error) {
		console.error(`Failed to get chat title for ${id}:`, error);
		return "Chat";
	}
}
