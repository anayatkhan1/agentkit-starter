import { FullChatApp } from "@/components/chat-ui/chat-ui";
import { loadChat } from "@/lib/chat-store";

export default async function Page(props: { params: Promise<{ id: string }> }) {
	const { id } = await props.params;
	const messages = await loadChat(id);
	return <FullChatApp id={id} initialMessages={messages} />;
}
