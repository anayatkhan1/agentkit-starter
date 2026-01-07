"use client"

import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { type UIMessage } from "ai";
import { ChatContent } from "./chat-content"
import { ChatSidebar } from "./chat-sidebar"

export function FullChatApp({
	id,
	initialMessages,
}: { id?: string; initialMessages?: UIMessage[] }) {
  return (
    <SidebarProvider>
      <ChatSidebar currentChatId={id} />
      <SidebarInset>
        <ChatContent id={id} initialMessages={initialMessages} />
      </SidebarInset>
    </SidebarProvider>
  )
}


