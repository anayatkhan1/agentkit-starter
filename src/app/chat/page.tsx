import { createChat } from "@/lib/chat-store";
import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";

export default async function ChatPage() {
	const { userId } = await auth();

	if (!userId) {
		redirect("/sign-in");
	}

	const id = await createChat(userId);
	redirect(`/chat/${id}`);
}
