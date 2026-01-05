

import { SidebarTrigger } from "@/components/ui/sidebar";
import { type UIMessage, useChat } from "@ai-sdk/react";
import { ChatInput } from "./chat-input";
import { ChatStream } from "./chat-stream";

export function ChatContent({
	id,
	initialMessages,
}: { id?: string; initialMessages?: UIMessage[] }) {

    // useChat provides streaming state and messages
    const { messages, sendMessage, status, stop } = useChat({
        id,
        messages: initialMessages,
    });

    // Derive loading state from SDK status
    const isLoading = status === "submitted" || status === "streaming";

    return (
        <main className="flex h-screen flex-col overflow-hidden">
            <header className="bg-background z-10 flex h-16 w-full shrink-0 items-center gap-2 border-b px-4">
                <SidebarTrigger className="-ml-1" />
                <div className="text-foreground">Project roadmap discussion</div>
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
