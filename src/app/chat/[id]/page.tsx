import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { FullChatApp } from "@/components/chat-ui/chat-ui";
import { loadChat } from "@/lib/chat-store";

export default async function Page(props: { params: Promise<{ id: string }> }) {
	const { userId } = await auth();

	if (!userId) {
		redirect("/sign-in");
	}

	const { id } = await props.params;
	const messages = await loadChat(id, userId);
	return <FullChatApp id={id} initialMessages={messages} />;
}
