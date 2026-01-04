import {
    ChatContainerContent,
    ChatContainerRoot,
} from "@/components/ui/chat-container";
import {
    Message,
    MessageAction,
    MessageActions,
    MessageContent,
} from "@/components/ui/message";
import { ScrollButton } from "@/components/ui/scroll-button";
import { Button } from "@/components/ui/button";

import { cn } from "@/lib/utils";
import {
    Copy,
    Pencil,
    ThumbsDown,
    ThumbsUp,
    Trash,
} from "lucide-react";
import { UIMessage } from "ai";

import { useState } from "react";
import { Check } from "lucide-react";

interface ChatStreamProps {
    messages: UIMessage[];
}

function CopyAction({ content, className }: { content: string; className?: string }) {
    const [isCopied, setIsCopied] = useState(false);

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(content);
            setIsCopied(true);
            setTimeout(() => setIsCopied(false), 2000);
        } catch (err) {
            console.error("Failed to copy text: ", err);
        }
    };

    return (
        <MessageAction tooltip={isCopied ? "Copied" : "Copy"} delayDuration={100}>
            <Button
                variant="ghost"
                size="icon"
                className={cn("rounded-full", className)}
                onClick={handleCopy}
            >
                {isCopied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            </Button>
        </MessageAction>
    );
}

export function ChatStream({ messages }: ChatStreamProps) {
    return (
        <ChatContainerRoot className="h-full">
            <ChatContainerContent className="space-y-0 px-5 py-12">
                {messages.map((message, index) => {
                    const isAssistant = message.role === "assistant"
                    const isLastMessage = index === messages.length - 1
                    
                    const messageContent = message.parts
                        .filter((part) => part.type === "text")
                        .map((part) => part.text)
                        .join("");

                    return (
                        <Message
                            key={message.id}
                            className={cn(
                                "mx-auto flex w-full max-w-3xl flex-col gap-2 px-6",
                                isAssistant ? "items-start" : "items-end"
                            )}
                        >
                            {isAssistant ? (
                                <div className="group flex w-full flex-col gap-0">
                                    <MessageContent
                                        className="text-foreground prose flex-1 rounded-lg bg-transparent p-0"
                                        markdown
                                    >
                                        {messageContent}
                                    </MessageContent>
                                    <MessageActions
                                        className={cn(
                                            "-ml-2.5 flex gap-0 opacity-0 transition-opacity duration-150 group-hover:opacity-100",
                                            isLastMessage && "opacity-100"
                                        )}
                                    >
                                        <CopyAction content={messageContent} />
                                        <MessageAction tooltip="Upvote" delayDuration={100}>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="rounded-full"
                                            >
                                                <ThumbsUp />
                                            </Button>
                                        </MessageAction>
                                        <MessageAction tooltip="Downvote" delayDuration={100}>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="rounded-full"
                                            >
                                                <ThumbsDown />
                                            </Button>
                                        </MessageAction>
                                    </MessageActions>
                                </div>
                            ) : (
                                <div className="group flex flex-col items-end gap-1">
                                    <MessageContent className="bg-muted text-primary max-w-[85%] rounded-3xl px-5 py-2.5 sm:max-w-[75%]">
                                        {messageContent}
                                    </MessageContent>
                                    <MessageActions
                                        className={cn(
                                            "flex gap-0 opacity-0 transition-opacity duration-150 group-hover:opacity-100"
                                        )}
                                    >
                                        <MessageAction tooltip="Edit" delayDuration={100}>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="rounded-full"
                                            >
                                                <Pencil />
                                            </Button>
                                        </MessageAction>
                                        <MessageAction tooltip="Delete" delayDuration={100}>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="rounded-full"
                                            >
                                                <Trash />
                                            </Button>
                                        </MessageAction>
                                        <CopyAction content={messageContent} />
                                    </MessageActions>
                                </div>
                            )}
                        </Message>
                    )
                })}
            </ChatContainerContent>
            <div className="absolute bottom-4 left-1/2 flex w-full max-w-3xl -translate-x-1/2 justify-end px-5">
                <ScrollButton className="shadow-sm" />
            </div>
        </ChatContainerRoot>
    )
}