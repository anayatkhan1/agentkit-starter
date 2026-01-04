"use client"

import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { ChatContent } from "./chat-content"
import { ChatSidebar } from "./chat-sidebar"



export function FullChatApp() {
  return (
    <SidebarProvider>
      <ChatSidebar />
      <SidebarInset>
        <ChatContent />
      </SidebarInset>
    </SidebarProvider>
  )
}


