import { generateId, type UIMessage } from "ai";
import { existsSync, mkdirSync, renameSync } from "fs";
import { readFile, writeFile } from "fs/promises";
import path from "path";

// Validate chat ID to prevent path traversal attacks
function validateChatId(id: string): boolean {
    // Only allow alphanumeric characters, hyphens, and underscores
    // This matches the format from generateId() which uses base64url encoding
    return /^[a-zA-Z0-9_-]+$/.test(id) && id.length > 0 && id.length < 256;
}

// Sanitize and validate chat ID, throw if invalid
function sanitizeChatId(id: string): string {
    if (!validateChatId(id)) {
        throw new Error(`Invalid chat ID format: ${id}`);
    }
    return id;
}

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

export async function createChat(): Promise<string> {
    const id = generateId();
    const file = getChatFile(id);
    
    try {
        // Atomic write: write to temp file first, then rename
        const tempFile = `${file}.tmp`;
        await writeFile(tempFile, "[]", "utf8");
        renameSync(tempFile, file);
        return id;
    } catch (error) {
        console.error(`Failed to create chat ${id}:`, error);
        throw new Error(`Failed to create chat: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
}

export async function loadChat(id: string): Promise<UIMessage[]> {
    const sanitizedId = sanitizeChatId(id);
    const file = getChatFile(sanitizedId);
    
    if (!existsSync(file)) {
        return [];
    }
    
    try {
        const content = await readFile(file, "utf8");
        
        // Handle empty files
        if (!content.trim()) {
            return [];
        }
        
        const messages = JSON.parse(content);
        
        // Validate parsed data
        if (!Array.isArray(messages)) {
            console.warn(`Chat ${sanitizedId} contains invalid data, returning empty array`);
            return [];
        }
        
        return messages;
    } catch (error) {
        // Log error but don't throw - return empty array for corrupted files
        console.error(`Failed to load chat ${sanitizedId}:`, error);
        return [];
    }
}

export async function saveChat({
    chatId,
    messages,
}: {
    chatId: string;
    messages: UIMessage[];
}): Promise<void> {
    // Validate inputs
    const sanitizedId = sanitizeChatId(chatId);
    validateMessages(messages);
    
    const file = getChatFile(sanitizedId);
    
    try {
        // Atomic write: write to temp file first, then rename
        // This prevents corruption if the process crashes mid-write
        const tempFile = `${file}.tmp`;
        const content = JSON.stringify(messages, null, 2);
        
        await writeFile(tempFile, content, "utf8");
        
        // Atomic rename - this is the critical operation
        // On most filesystems, rename is atomic
        renameSync(tempFile, file);
        
        // Optional: Log successful save (can be removed in production if too verbose)
        // console.log(`Successfully saved chat ${sanitizedId} with ${messages.length} messages`);
    } catch (error) {
        // Log error and rethrow - caller should handle this
        console.error(`Failed to save chat ${sanitizedId}:`, error);
        throw new Error(`Failed to save chat: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
}

function getChatFile(id: string): string {
    const chatDir = path.join(process.cwd(), ".chats");
    
    // Ensure directory exists
    if (!existsSync(chatDir)) {
        mkdirSync(chatDir, { recursive: true });
    }
    
    // Path.join automatically handles path separators and prevents traversal
    // But we've already validated the ID above, so this is safe
    return path.join(chatDir, `${id}.json`);
}
