"use client";

import { PlusIcon, Search } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarGroup,
	SidebarGroupLabel,
	SidebarHeader,
	SidebarMenu,
	SidebarMenuButton,
} from "@/components/ui/sidebar";
import type { ChatMetadata } from "@/lib/chat-store";
import { Icons } from "../icons";
import { ThemeToggle } from "../theme-toggle";
import { NavUser } from "./nav-user";

// Group chats by time periods
function groupChatsByPeriod(chats: ChatMetadata[]) {
	const now = Date.now();
	const oneDay = 24 * 60 * 60 * 1000;
	const sevenDays = 7 * oneDay;
	const thirtyDays = 30 * oneDay;

	const groups: {
		period: string;
		chats: ChatMetadata[];
	}[] = [
		{ period: "Today", chats: [] },
		{ period: "Yesterday", chats: [] },
		{ period: "Last 7 days", chats: [] },
		{ period: "Last month", chats: [] },
		{ period: "Older", chats: [] },
	];

	chats.forEach((chat) => {
		const diff = now - chat.timestamp;

		if (diff < oneDay) {
			groups[0].chats.push(chat);
		} else if (diff < 2 * oneDay) {
			groups[1].chats.push(chat);
		} else if (diff < sevenDays) {
			groups[2].chats.push(chat);
		} else if (diff < thirtyDays) {
			groups[3].chats.push(chat);
		} else {
			groups[4].chats.push(chat);
		}
	});

	// Remove empty groups
	return groups.filter((group) => group.chats.length > 0);
}

export function ChatSidebar({ currentChatId }: { currentChatId?: string }) {
	const router = useRouter();
	const [chats, setChats] = useState<ChatMetadata[]>([]);
	const [isLoading, setIsLoading] = useState(true);

	// Fetch chats from API
	useEffect(() => {
		async function fetchChats() {
			try {
				const response = await fetch("/api/chats");
				if (response.ok) {
					const data = await response.json();
					setChats(data);
				}
			} catch (error) {
				console.error("Failed to fetch chats:", error);
			} finally {
				setIsLoading(false);
			}
		}

		fetchChats();

		// Refresh chats periodically (every 30 seconds)
		const interval = setInterval(fetchChats, 30000);
		return () => clearInterval(interval);
	}, []);

	const handleNewChat = () => {
		// Navigate to /chat which will create a new chat and redirect
		router.push("/chat");
	};

	const groupedChats = groupChatsByPeriod(chats);

	return (
		<Sidebar>
			<SidebarHeader className="flex flex-row items-center justify-between gap-2 border-b px-4 py-3">
				<div className="flex flex-row items-center gap-2">
					<div className="flex flex-row items-center gap-2 font-base text-md text-primary tracking-tight">
						<Link href="/" className="flex flex-row items-center gap-2">
							<Icons.logo className="size-8" />
							<span className="font-base text-md text-primary tracking-tight">
								AgentKit
							</span>
						</Link>
					</div>
				</div>
				<Button variant="ghost" className="size-8 p-0">
					<Search className="size-4" />
				</Button>
			</SidebarHeader>
			<SidebarContent className="px-2 py-3">
				<div className="mb-2 px-2">
					<Button
						variant="outline"
						className="flex h-9 w-full items-center gap-2"
						onClick={handleNewChat}
					>
						<PlusIcon className="size-4" />
						<span>New Chat</span>
					</Button>
				</div>
				{isLoading ? (
					<div className="px-4 py-3 text-muted-foreground text-sm">
						Loading chats...
					</div>
				) : groupedChats.length === 0 ? (
					<div className="px-4 py-3 text-muted-foreground text-sm">
						No chats yet. Start a new conversation!
					</div>
				) : (
					groupedChats.map((group) => (
						<SidebarGroup key={group.period} className="mb-4 last:mb-0">
							<SidebarGroupLabel className="px-4 py-2 font-medium text-muted-foreground text-xs uppercase tracking-wider">
								{group.period}
							</SidebarGroupLabel>
							<SidebarMenu className="px-2">
								{group.chats.map((chat) => (
									<SidebarMenuButton
										key={chat.id}
										asChild
										isActive={currentChatId === chat.id}
										className="h-auto rounded-md px-3 py-2.5"
									>
										<Link href={`/chat/${chat.id}`} className="w-full">
											<div className="flex w-full min-w-0 flex-col items-start gap-0.5">
												<span className="w-full truncate font-medium text-sm leading-tight">
													{chat.title}
												</span>
												<span className="w-full truncate text-muted-foreground text-xs leading-tight">
													{chat.lastMessage}
												</span>
											</div>
										</Link>
									</SidebarMenuButton>
								))}
							</SidebarMenu>
						</SidebarGroup>
					))
				)}
			</SidebarContent>
			<div className="px-4 py-3">
				<ThemeToggle />
			</div>

			<SidebarFooter className="flex flex-col gap-2 border-t px-4 py-3">
				<NavUser />
			</SidebarFooter>
		</Sidebar>
	);
}
