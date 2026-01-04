import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,

} from "@/components/ui/sidebar"
import {
    PlusIcon,
    Search,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "../theme-toggle"
import Link from "next/link"
import { Icons } from "../icons"

// Initial conversation history
const conversationHistory = [
    {
        period: "Today",
        conversations: [
            {
                id: "t1",
                title: "Project roadmap discussion",
                lastMessage:
                    "Let's prioritize the authentication features for the next sprint.",
                timestamp: new Date().setHours(new Date().getHours() - 2),
            },
            {
                id: "t2",
                title: "API Documentation Review",
                lastMessage:
                    "The endpoint descriptions need more detail about rate limiting.",
                timestamp: new Date().setHours(new Date().getHours() - 5),
            },
            {
                id: "t3",
                title: "Frontend Bug Analysis",
                lastMessage:
                    "I found the issue - we need to handle the null state in the user profile component.",
                timestamp: new Date().setHours(new Date().getHours() - 8),
            },
        ],
    },
    {
        period: "Yesterday",
        conversations: [
            {
                id: "y1",
                title: "Database Schema Design",
                lastMessage:
                    "Let's add indexes to improve query performance on these tables.",
                timestamp: new Date().setDate(new Date().getDate() - 1),
            },
            {
                id: "y2",
                title: "Performance Optimization",
                lastMessage:
                    "The lazy loading implementation reduced initial load time by 40%.",
                timestamp: new Date().setDate(new Date().getDate() - 1),
            },
        ],
    },
    {
        period: "Last 7 days",
        conversations: [
            {
                id: "w1",
                title: "Authentication Flow",
                lastMessage: "We should implement the OAuth2 flow with refresh tokens.",
                timestamp: new Date().setDate(new Date().getDate() - 3),
            },
            {
                id: "w2",
                title: "Component Library",
                lastMessage:
                    "These new UI components follow the design system guidelines perfectly.",
                timestamp: new Date().setDate(new Date().getDate() - 5),
            },
            {
                id: "w3",
                title: "UI/UX Feedback",
                lastMessage:
                    "The navigation redesign received positive feedback from the test group.",
                timestamp: new Date().setDate(new Date().getDate() - 6),
            },
        ],
    },
    {
        period: "Last month",
        conversations: [
            {
                id: "m1",
                title: "Initial Project Setup",
                lastMessage:
                    "All the development environments are now configured consistently.",
                timestamp: new Date().setDate(new Date().getDate() - 15),
            },
        ],
    },
]

export function ChatSidebar() {
    return (
        <Sidebar>
            <SidebarHeader className="flex flex-row items-center justify-between gap-2 px-2 py-4">
                <div className="flex flex-row items-center gap-2 px-2">

                    <div className="flex flex-row items-center gap-2 text-md font-base text-primary tracking-tight">
                        <Link href="/" className="flex flex-row items-center gap-2">
                            <Icons.logo className="size-8" />
                            <span className="text-md font-base text-primary tracking-tight">AgentKit</span>
                        </Link>
                    </div>
                </div>
                <Button variant="ghost" className="size-8">
                    <Search className="size-4" />
                </Button>
            </SidebarHeader>
            <SidebarContent className="pt-4">
                <div className="px-4">
                    <Button
                        variant="outline"
                        className="mb-4 flex w-full items-center gap-2"
                    >
                        <PlusIcon className="size-4" />
                        <span>New Chat</span>
                    </Button>
                </div>
                {conversationHistory.map((group) => (
                    <SidebarGroup key={group.period}>
                        <SidebarGroupLabel>{group.period}</SidebarGroupLabel>
                        <SidebarMenu>
                            {group.conversations.map((conversation) => (
                                <SidebarMenuButton key={conversation.id}>
                                    <span>{conversation.title}</span>
                                </SidebarMenuButton>
                            ))}
                        </SidebarMenu>
                    </SidebarGroup>
                ))}
            </SidebarContent>
            <SidebarFooter className="pb-2">
                <ThemeToggle />
            </SidebarFooter>
        </Sidebar>
    )
}