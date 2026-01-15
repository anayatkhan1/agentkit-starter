"use client"

import { SidebarTrigger } from "@/components/ui/sidebar";
import { type UIMessage, useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { ChatInput } from "./chat-input";
import { ChatStream } from "./chat-stream";
import { useMemo } from "react";

// Extract text from message parts for title
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

export function ChatContent({
	id,
	initialMessages,
}: { id?: string; initialMessages?: UIMessage[] }) {

    // useChat provides streaming state and messages
    const { messages, sendMessage, status, stop } = useChat({
        id,
        messages: initialMessages,
        // Optimize: only send the last message to the server
        // The server will load previous messages from storage
        transport: new DefaultChatTransport({
            api: "/api/chat",
            prepareSendMessagesRequest({ messages, id }) {
                const lastMessage = messages[messages.length - 1];
                // Extract searchMode from message metadata if present
                const searchMode = (lastMessage as any).searchMode ?? false;
                return {
                    body: {
                        message: lastMessage, // Only send last message
                        id,
                        searchMode, // Pass searchMode to API
                    },
                };
            },
        }),
    });

    // Derive loading state from SDK status
    const isLoading = status === "submitted" || status === "streaming";

    // Generate chat title from messages
    const chatTitle = useMemo(() => generateChatTitle(messages), [messages]);

    return (
        <main className="flex h-screen flex-col overflow-hidden">
            <header className="bg-background z-10 flex h-14.5 w-full shrink-0 items-center gap-2 border-b px-4">
                <SidebarTrigger className="-ml-1" />
                <div className="text-foreground font-medium">{chatTitle}</div>
            </header>

            <div className="relative flex-1 overflow-y-auto">
                <ChatStream messages={messages} />
            </div>

            <ChatInput
                isLoading={isLoading}
                stop={stop}
                onSubmit={sendMessage}
                className="bg-background z-10 shrink-0 px-3 pb-3 md:px-5 md:pb-5"
            />
        </main>
    );
}
