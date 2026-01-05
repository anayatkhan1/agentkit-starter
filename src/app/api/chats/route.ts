import { listChats } from "@/lib/chat-store";
import { type NextRequest } from "next/server";

export async function GET(request: NextRequest) {
	try {
		const chats = await listChats();
		return Response.json(chats);
	} catch (error) {
		console.error("Failed to list chats:", error);
		return Response.json(
			{ error: "Failed to list chats" },
			{ status: 500 }
		);
	}
}

