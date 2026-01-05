import { createChat } from "@/lib/chat-store";
import { redirect } from "next/navigation";

export default async function ChatPage() {
	const id = await createChat();
	redirect(`/chat/${id}`);
}
