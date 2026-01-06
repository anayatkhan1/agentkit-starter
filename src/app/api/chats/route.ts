import { listChats } from "@/lib/chat-store";
import { type NextRequest } from "next/server";
import { auth } from "@clerk/nextjs/server";

export async function GET(request: NextRequest) {
	try {
		// Get authenticated user ID
		const { userId } = await auth();

		if (!userId) {
			return Response.json(
				{ error: "Unauthorized" },
				{ status: 401 }
			);
		}

		const chats = await listChats(userId);
		return Response.json(chats);
	} catch (error) {
		console.error("Failed to list chats:", error);
		return Response.json(
			{ error: "Failed to list chats" },
			{ status: 500 }
		);
	}
}


