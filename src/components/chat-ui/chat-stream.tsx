import { UIMessage } from "ai";
import {
	Check,
	Copy,
	Paperclip,
	Pencil,
	ThumbsDown,
	ThumbsUp,
	Trash,
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
	ChatContainerContent,
	ChatContainerRoot,
} from "@/components/ui/chat-container";
import {
	Message,
	MessageAction,
	MessageActions,
	MessageContent,
} from "@/components/ui/message";
import { ScrollButton } from "@/components/ui/scroll-button";
import { Source, SourceContent, SourceTrigger } from "@/components/ui/source";
import {
	Steps,
	StepsContent,
	StepsItem,
	StepsTrigger,
} from "@/components/ui/steps";
import { cn } from "@/lib/utils";

interface ChatStreamProps {
	messages: UIMessage[];
}

type MessagePart = NonNullable<UIMessage["parts"]>[number];

type WebSearchToolCall = MessagePart & {
	type: "tool-webSearch";
	toolCallId?: string;
	input?: { query?: string };
};

type WebSearchToolResult = MessagePart & {
	type: "tool-webSearch";
	toolCallId?: string;
	output?: unknown;
};

type WebSearchResultItem = {
	url?: string;
	link?: string;
	title?: string;
	name?: string;
	content?: string;
	text?: string;
	snippet?: string;
	description?: string;
};

function CopyAction({
	content,
	className,
}: {
	content: string;
	className?: string;
}) {
	const [isCopied, setIsCopied] = useState(false);

	const handleCopy = async () => {
		try {
			await navigator.clipboard.writeText(content);
			setIsCopied(true);
			setTimeout(() => setIsCopied(false), 2000);
		} catch (err) {
			console.error("Failed to copy text: ", err);
		}
	};

	return (
		<MessageAction tooltip={isCopied ? "Copied" : "Copy"} delayDuration={100}>
			<Button
				variant="ghost"
				size="icon"
				className={cn("rounded-full", className)}
				onClick={handleCopy}
			>
				{isCopied ? (
					<Check className="h-4 w-4" />
				) : (
					<Copy className="h-4 w-4" />
				)}
			</Button>
		</MessageAction>
	);
}

// Helper function to extract web search tool calls and results
function extractWebSearchTools(message: UIMessage) {
	// #region agent log
	fetch("http://127.0.0.1:7244/ingest/f534629e-950a-47de-8405-66a055ceff08", {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({
			location: "chat-stream.tsx:98",
			message: "extractWebSearchTools entry",
			data: {
				hasParts: !!message.parts,
				partsLength: message.parts?.length || 0,
				role: message.role,
			},
			timestamp: Date.now(),
			sessionId: "debug-session",
			runId: "run1",
			hypothesisId: "A",
		}),
	}).catch(() => {});
	// #endregion
	if (!message.parts) {
		// #region agent log
		fetch("http://127.0.0.1:7244/ingest/f534629e-950a-47de-8405-66a055ceff08", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				location: "chat-stream.tsx:100",
				message: "No parts array found",
				data: { role: message.role },
				timestamp: Date.now(),
				sessionId: "debug-session",
				runId: "run1",
				hypothesisId: "E",
			}),
		}).catch(() => {});
		// #endregion
		return { toolCalls: [], toolResults: [] };
	}

	const parts = message.parts as MessagePart[];
	// Check for duplicate tool-webSearch parts
	const toolWebSearchParts = parts.filter(
		(p) => (p as { type?: string }).type === "tool-webSearch",
	);
	const toolCallIdsInParts = toolWebSearchParts
		.map((p) => (p as { toolCallId?: string }).toolCallId)
		.filter(Boolean);
	const duplicateIds = toolCallIdsInParts.filter(
		(id, index) => toolCallIdsInParts.indexOf(id) !== index,
	);
	// #region agent log
	fetch("http://127.0.0.1:7244/ingest/f534629e-950a-47de-8405-66a055ceff08", {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({
			location: "chat-stream.tsx:105",
			message: "Parts array details",
			data: {
				partsLength: parts.length,
				partTypes: parts.map((p) => ({
					type: (p as { type?: string }).type,
					toolCallId: (p as { toolCallId?: string }).toolCallId,
				})),
				toolWebSearchCount: toolWebSearchParts.length,
				toolCallIdsInParts,
				duplicateIds,
				hasDuplicates: duplicateIds.length > 0,
			},
			timestamp: Date.now(),
			sessionId: "debug-session",
			runId: "run1",
			hypothesisId: "A",
		}),
	}).catch(() => {});
	// #endregion

	const toolCalls = parts.filter((part): part is WebSearchToolCall => {
		const partType = (part as { type?: string }).type;
		// Log full part structure for debugging
		const partKeys = Object.keys(part);
		const partData = partKeys.reduce(
			(acc, key) => {
				const value = (part as Record<string, unknown>)[key];
				// Only log primitive values or short strings to avoid huge logs
				if (
					typeof value === "string" ||
					typeof value === "number" ||
					typeof value === "boolean" ||
					value === null ||
					value === undefined
				) {
					acc[key] = value;
				} else if (typeof value === "object" && value !== null) {
					acc[key] = Array.isArray(value)
						? `[Array(${value.length})]`
						: `[Object(${Object.keys(value).length} keys)]`;
				}
				return acc;
			},
			{} as Record<string, unknown>,
		);
		// #region agent log
		fetch("http://127.0.0.1:7244/ingest/f534629e-950a-47de-8405-66a055ceff08", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				location: "chat-stream.tsx:110",
				message: "Filtering tool call part - full structure",
				data: { partType, partKeys, partData },
				timestamp: Date.now(),
				sessionId: "debug-session",
				runId: "run1",
				hypothesisId: "B",
			}),
		}).catch(() => {});
		// #endregion
		// Tool calls have type "tool-webSearch" and contain args
		if (partType !== "tool-webSearch") return false;
		// Check for args property - it might be nested or have different structure
		const hasArgs = "args" in part || "input" in part || "query" in part;
		// #region agent log
		fetch("http://127.0.0.1:7244/ingest/f534629e-950a-47de-8405-66a055ceff08", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				location: "chat-stream.tsx:120",
				message: "Tool call check result",
				data: {
					partType,
					hasArgs,
					hasInput: "input" in part,
					hasQuery: "query" in part,
				},
				timestamp: Date.now(),
				sessionId: "debug-session",
				runId: "run1",
				hypothesisId: "B",
			}),
		}).catch(() => {});
		// #endregion
		return hasArgs;
	});
	// #region agent log
	fetch("http://127.0.0.1:7244/ingest/f534629e-950a-47de-8405-66a055ceff08", {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({
			location: "chat-stream.tsx:115",
			message: "Tool calls extracted",
			data: {
				toolCallsCount: toolCalls.length,
				toolCallIds: toolCalls.map((tc) => tc.toolCallId),
				toolCallInputs: toolCalls.map((tc) => tc.input),
			},
			timestamp: Date.now(),
			sessionId: "debug-session",
			runId: "run1",
			hypothesisId: "B",
		}),
	}).catch(() => {});
	// #endregion

	// Deduplicate tool calls by toolCallId (in case same tool call appears multiple times during streaming)
	const toolCallMap = new Map<string, WebSearchToolCall>();
	toolCalls.forEach((tc) => {
		if (tc.toolCallId) {
			toolCallMap.set(tc.toolCallId, tc);
		}
	});
	const uniqueToolCalls = Array.from(toolCallMap.values());
	// #region agent log
	fetch("http://127.0.0.1:7244/ingest/f534629e-950a-47de-8405-66a055ceff08", {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({
			location: "chat-stream.tsx:147",
			message: "Deduplication result",
			data: {
				originalCount: toolCalls.length,
				uniqueCount: uniqueToolCalls.length,
				originalIds: toolCalls.map((tc) => tc.toolCallId),
				uniqueIds: uniqueToolCalls.map((tc) => tc.toolCallId),
			},
			timestamp: Date.now(),
			sessionId: "debug-session",
			runId: "run1",
			hypothesisId: "B",
		}),
	}).catch(() => {});
	// #endregion

	const toolCallIds = new Set<string>(
		uniqueToolCalls
			.map((tc) => tc.toolCallId)
			.filter((id): id is string => Boolean(id)),
	);
	// #region agent log
	fetch("http://127.0.0.1:7244/ingest/f534629e-950a-47de-8405-66a055ceff08", {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({
			location: "chat-stream.tsx:123",
			message: "Tool call IDs set",
			data: {
				toolCallIdsCount: toolCallIds.size,
				toolCallIds: Array.from(toolCallIds),
			},
			timestamp: Date.now(),
			sessionId: "debug-session",
			runId: "run1",
			hypothesisId: "D",
		}),
	}).catch(() => {});
	// #endregion

	const toolResults = parts.filter((part): part is WebSearchToolResult => {
		const partType = (part as { type?: string }).type;
		const { toolCallId } = part as { toolCallId?: string };
		// Log full part structure for debugging
		const partKeys = Object.keys(part);
		const partData = partKeys.reduce(
			(acc, key) => {
				const value = (part as Record<string, unknown>)[key];
				// Only log primitive values or short strings to avoid huge logs
				if (
					typeof value === "string" ||
					typeof value === "number" ||
					typeof value === "boolean" ||
					value === null ||
					value === undefined
				) {
					acc[key] = value;
				} else if (typeof value === "object" && value !== null) {
					acc[key] = Array.isArray(value)
						? `[Array(${value.length})]`
						: `[Object(${Object.keys(value).length} keys)]`;
				}
				return acc;
			},
			{} as Record<string, unknown>,
		);
		// #region agent log
		fetch("http://127.0.0.1:7244/ingest/f534629e-950a-47de-8405-66a055ceff08", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				location: "chat-stream.tsx:130",
				message: "Filtering tool result part - full structure",
				data: { partType, toolCallId, partKeys, partData },
				timestamp: Date.now(),
				sessionId: "debug-session",
				runId: "run1",
				hypothesisId: "D",
			}),
		}).catch(() => {});
		// #endregion
		// Tool results have type "tool-webSearch" and contain result (and optionally toolCallId)
		// Check for result property - it might be nested or have different structure
		const hasResult = "result" in part || "output" in part || "content" in part;
		const matches =
			partType === "tool-webSearch" &&
			hasResult &&
			typeof toolCallId === "string" &&
			toolCallIds.has(toolCallId);
		// #region agent log
		fetch("http://127.0.0.1:7244/ingest/f534629e-950a-47de-8405-66a055ceff08", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				location: "chat-stream.tsx:145",
				message: "Tool result check result",
				data: {
					partType,
					toolCallId,
					hasResult,
					hasOutput: "output" in part,
					hasContent: "content" in part,
					isToolWebSearch: partType === "tool-webSearch",
					hasMatchingId:
						typeof toolCallId === "string" && toolCallIds.has(toolCallId),
					matches,
				},
				timestamp: Date.now(),
				sessionId: "debug-session",
				runId: "run1",
				hypothesisId: "D",
			}),
		}).catch(() => {});
		// #endregion
		return matches;
	});
	// #region agent log
	fetch("http://127.0.0.1:7244/ingest/f534629e-950a-47de-8405-66a055ceff08", {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({
			location: "chat-stream.tsx:136",
			message: "Tool results extracted",
			data: {
				toolResultsCount: toolResults.length,
				toolResultIds: toolResults.map((tr) => tr.toolCallId),
				hasResults: toolResults.length > 0,
			},
			timestamp: Date.now(),
			sessionId: "debug-session",
			runId: "run1",
			hypothesisId: "D",
		}),
	}).catch(() => {});
	// #endregion

	// #region agent log
	fetch("http://127.0.0.1:7244/ingest/f534629e-950a-47de-8405-66a055ceff08", {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({
			location: "chat-stream.tsx:138",
			message: "extractWebSearchTools exit",
			data: {
				toolCallsCount: uniqueToolCalls.length,
				toolResultsCount: toolResults.length,
				originalCount: toolCalls.length,
			},
			timestamp: Date.now(),
			sessionId: "debug-session",
			runId: "run1",
			hypothesisId: "A",
		}),
	}).catch(() => {});
	// #endregion
	return { toolCalls: uniqueToolCalls, toolResults };
}

// Separate component for tool call UI to prevent hydration mismatches
function ToolCallUI({
	searchQuery,
	searchResults,
	isStreaming,
}: {
	searchQuery: string;
	searchResults: WebSearchResultItem[];
	isStreaming: boolean;
}) {
	return (
		<div className="space-y-4" suppressHydrationWarning>
			<Steps defaultOpen={false}>
				<StepsTrigger>Web search: {searchQuery}</StepsTrigger>
				<StepsContent>
					<div className="space-y-2">
						<StepsItem>Searching across curated sources...</StepsItem>
						{searchResults.length > 0 && (
							<>
								<StepsItem>Top matches</StepsItem>
								<div className="flex flex-wrap gap-1.5">
									{searchResults.map((result, resultIndex) => {
										const url = result.url || result.link || "";
										const title = result.title || result.name || url;
										const content =
											result.content ||
											result.text ||
											result.snippet ||
											result.description ||
											"";

										if (!url) return null;

										return (
											<Source key={resultIndex} href={url}>
												<SourceTrigger
													label={url.replace(/^https?:\/\//, "").split("/")[0]}
													showFavicon
												/>
												<SourceContent
													title={title}
													description={
														content.substring(0, 150) ||
														"No description available"
													}
												/>
											</Source>
										);
									})}
								</div>
								{isStreaming && (
									<StepsItem>
										Extracting key sections and summarizing…
									</StepsItem>
								)}
							</>
						)}
					</div>
				</StepsContent>
			</Steps>
		</div>
	);
}

function normalizeResults(resultData: unknown): WebSearchResultItem[] {
	if (Array.isArray(resultData)) return resultData as WebSearchResultItem[];

	if (resultData && typeof resultData === "object") {
		const asObject = resultData as { results?: unknown; content?: unknown };

		if (Array.isArray(asObject.results)) {
			return asObject.results as WebSearchResultItem[];
		}

		if (Array.isArray(asObject.content)) {
			return asObject.content as WebSearchResultItem[];
		}
	}

	return [];
}

export function ChatStream({ messages }: ChatStreamProps) {
	// #region agent log
	fetch("http://127.0.0.1:7244/ingest/f534629e-950a-47de-8405-66a055ceff08", {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({
			location: "chat-stream.tsx:222",
			message: "ChatStream render",
			data: {
				totalMessages: messages.length,
				messageIds: messages.map((m) => m.id),
				duplicateIds: messages
					.map((m) => m.id)
					.filter((id, idx, arr) => arr.indexOf(id) !== idx),
			},
			sessionId: "debug-session",
			runId: "run1",
			hypothesisId: "F",
		}),
	}).catch(() => {});
	// #endregion

	return (
		<ChatContainerRoot className="h-full">
			<ChatContainerContent className="space-y-0 px-5 py-12">
				{messages.map((message, index) => {
					const isAssistant = message.role === "assistant";
					const isLastMessage = index === messages.length - 1;

					// #region agent log
					fetch(
						"http://127.0.0.1:7244/ingest/f534629e-950a-47de-8405-66a055ceff08",
						{
							method: "POST",
							headers: { "Content-Type": "application/json" },
							body: JSON.stringify({
								location: "chat-stream.tsx:222",
								message: "Rendering message",
								data: {
									messageId: message.id,
									index,
									role: message.role,
									partsLength: message.parts?.length || 0,
									totalMessages: messages.length,
								},
								sessionId: "debug-session",
								runId: "run1",
								hypothesisId: "F",
							}),
						},
					).catch(() => {});
					// #endregion

					const textParts =
						message.parts?.filter((part) => part.type === "text") || [];
					const fileParts =
						message.parts?.filter((part) => part.type === "file") || [];

					// Check if message is still streaming by checking text part states
					const textPartStates = textParts.map((part) => {
						const partObj = part as { state?: string; text?: string };
						return {
							state: partObj.state,
							hasText: !!partObj.text,
							textLength: partObj.text?.length || 0,
						};
					});
					const hasStreamingText = textParts.some((part) => {
						const state = (part as { state?: string }).state;
						return (
							state === "streaming" ||
							state === "input-streaming" ||
							state === "output-streaming" ||
							state === "done"
						);
					});
					// Message is streaming if it's the last message and has text parts that might still be updating
					// If all text parts have state "done" or no state (completed), it's not streaming
					const allTextPartsDone =
						textParts.length > 0 &&
						textParts.every((part) => {
							const state = (part as { state?: string }).state;
							return state === "done" || state === undefined || state === null;
						});
					const isMessageStreaming = isLastMessage && !allTextPartsDone;

					const messageContent =
						textParts.map((part) => part.text).join("") || "";

					// #region agent log
					fetch(
						"http://127.0.0.1:7244/ingest/f534629e-950a-47de-8405-66a055ceff08",
						{
							method: "POST",
							headers: { "Content-Type": "application/json" },
							body: JSON.stringify({
								location: "chat-stream.tsx:242",
								message: "Message streaming check",
								data: {
									messageId: message.id,
									isLastMessage,
									hasStreamingText,
									allTextPartsDone,
									isMessageStreaming,
									textPartStates,
									textPartsCount: textParts.length,
								},
								sessionId: "debug-session",
								runId: "run1",
								hypothesisId: "F",
							}),
						},
					).catch(() => {});
					// #endregion

					// Extract web search tool calls and results
					const { toolCalls, toolResults } = extractWebSearchTools(message);

					// Final deduplication by toolCallId to ensure no duplicates (defensive)
					const seenToolCallIds = new Set<string>();
					const finalToolCalls = toolCalls.filter((tc) => {
						if (!tc.toolCallId) {
							// #region agent log
							fetch(
								"http://127.0.0.1:7244/ingest/f534629e-950a-47de-8405-66a055ceff08",
								{
									method: "POST",
									headers: { "Content-Type": "application/json" },
									body: JSON.stringify({
										location: "chat-stream.tsx:250",
										message: "Filtering tool call without ID",
										data: { messageId: message.id },
										sessionId: "debug-session",
										runId: "run1",
										hypothesisId: "F",
									}),
								},
							).catch(() => {});
							// #endregion
							return false;
						}
						if (seenToolCallIds.has(tc.toolCallId)) {
							// #region agent log
							fetch(
								"http://127.0.0.1:7244/ingest/f534629e-950a-47de-8405-66a055ceff08",
								{
									method: "POST",
									headers: { "Content-Type": "application/json" },
									body: JSON.stringify({
										location: "chat-stream.tsx:255",
										message: "Filtering duplicate tool call",
										data: {
											messageId: message.id,
											toolCallId: tc.toolCallId,
											seenIds: Array.from(seenToolCallIds),
										},
										sessionId: "debug-session",
										runId: "run1",
										hypothesisId: "F",
									}),
								},
							).catch(() => {});
							// #endregion
							return false;
						}
						seenToolCallIds.add(tc.toolCallId);
						return true;
					});
					// #region agent log
					fetch(
						"http://127.0.0.1:7244/ingest/f534629e-950a-47de-8405-66a055ceff08",
						{
							method: "POST",
							headers: { "Content-Type": "application/json" },
							body: JSON.stringify({
								location: "chat-stream.tsx:264",
								message: "Final tool calls after deduplication",
								data: {
									messageId: message.id,
									originalCount: toolCalls.length,
									finalCount: finalToolCalls.length,
									originalIds: toolCalls.map((tc) => tc.toolCallId),
									finalIds: finalToolCalls.map((tc) => tc.toolCallId),
								},
								sessionId: "debug-session",
								runId: "run1",
								hypothesisId: "F",
							}),
						},
					).catch(() => {});
					// #endregion

					// #region agent log
					fetch(
						"http://127.0.0.1:7244/ingest/f534629e-950a-47de-8405-66a055ceff08",
						{
							method: "POST",
							headers: { "Content-Type": "application/json" },
							body: JSON.stringify({
								location: "chat-stream.tsx:162",
								message: "After extraction in render",
								data: {
									messageId: message.id,
									index,
									isAssistant,
									toolCallsCount: finalToolCalls.length,
									originalCount: toolCalls.length,
									toolResultsCount: toolResults.length,
									willRender: finalToolCalls.length > 0,
									toolCallIds: finalToolCalls.map((tc) => tc.toolCallId),
								},
								sessionId: "debug-session",
								runId: "run1",
								hypothesisId: "F",
							}),
						},
					).catch(() => {});
					// #endregion

					// Ensure unique key - use id if available, otherwise fallback to index
					const messageKey = message.id || `message-${index}-${message.role}`;

					return (
						<Message
							key={messageKey}
							className={cn(
								"mx-auto flex w-full max-w-3xl flex-col gap-2 px-6",
								isAssistant ? "items-start" : "items-end",
							)}
						>
							{isAssistant ? (
								<div className="group flex w-full flex-col gap-0">
									{/* Render text content first */}
									{messageContent && (
										<MessageContent
											className="prose flex-1 rounded-lg bg-transparent p-0 text-foreground"
											markdown
										>
											{messageContent}
										</MessageContent>
									)}

									{/* Render web search tool calls with Steps and Source components - below text */}
									{finalToolCalls.length > 0 && (
										<div
											className="mt-3"
											key={`toolcalls-${message.id || index}`}
										>
											{finalToolCalls.map((toolCall, toolIndex) => {
												// #region agent log
												fetch(
													"http://127.0.0.1:7244/ingest/f534629e-950a-47de-8405-66a055ceff08",
													{
														method: "POST",
														headers: { "Content-Type": "application/json" },
														body: JSON.stringify({
															location: "chat-stream.tsx:275",
															message: "Rendering individual tool call",
															data: {
																messageId: message.id,
																toolCallId: toolCall.toolCallId,
																toolIndex,
																totalToolCalls: toolCalls.length,
																hasInput: !!toolCall.input,
																hasRawInput: "rawInput" in toolCall,
															},
															sessionId: "debug-session",
															runId: "run1",
															hypothesisId: "F",
														}),
													},
												).catch(() => {});
												// #endregion
												const toolResult = toolResults.find(
													(tr) => tr.toolCallId === toolCall.toolCallId,
												);
												// Try to get query from input or rawInput
												let searchQuery = "";
												if (
													toolCall.input &&
													typeof toolCall.input === "object"
												) {
													searchQuery =
														(toolCall.input as { query?: string })?.query || "";
												}
												// If input is null/undefined, try rawInput
												if (
													!searchQuery &&
													"rawInput" in toolCall &&
													toolCall.rawInput
												) {
													const rawInput = toolCall.rawInput as {
														query?: string;
													};
													searchQuery = rawInput?.query || "";
												}

												const searchResults = normalizeResults(
													toolResult?.output ?? [],
												);

												// Only show "Extracting..." if message is actually still streaming
												// Use the isMessageStreaming from outer scope (calculated above)
												const isStreaming =
													isMessageStreaming && searchResults.length > 0;

												// #region agent log
												fetch(
													"http://127.0.0.1:7244/ingest/f534629e-950a-47de-8405-66a055ceff08",
													{
														method: "POST",
														headers: { "Content-Type": "application/json" },
														body: JSON.stringify({
															location: "chat-stream.tsx:188",
															message: "Rendering tool call",
															data: {
																searchQuery,
																hasToolResult: !!toolResult,
																searchResultsCount: searchResults.length,
																hasOutput: !!toolResult?.output,
																isStreaming,
																isMessageStreaming,
																isLastMessage,
																allTextPartsDone,
															},
															timestamp: Date.now(),
															sessionId: "debug-session",
															runId: "run1",
															hypothesisId: "F",
														}),
													},
												).catch(() => {});
												// #endregion

												return (
													<ToolCallUI
														key={`${message.id || index}-${toolCall.toolCallId || toolIndex}`}
														searchQuery={searchQuery}
														searchResults={searchResults}
														isStreaming={isStreaming}
													/>
												);
											})}
										</div>
									)}
									<MessageActions
										className={cn(
											"-ml-2.5 flex gap-0 opacity-0 transition-opacity duration-150 group-hover:opacity-100",
											isLastMessage && "opacity-100",
										)}
									>
										<CopyAction content={messageContent} />
										<MessageAction tooltip="Upvote" delayDuration={100}>
											<Button
												variant="ghost"
												size="icon"
												className="rounded-full"
											>
												<ThumbsUp />
											</Button>
										</MessageAction>
										<MessageAction tooltip="Downvote" delayDuration={100}>
											<Button
												variant="ghost"
												size="icon"
												className="rounded-full"
											>
												<ThumbsDown />
											</Button>
										</MessageAction>
									</MessageActions>
								</div>
							) : (
								<div className="group flex flex-col items-end gap-2">
									{/* File attachments */}
									{fileParts.length > 0 && (
										<div className="flex max-w-[85%] flex-wrap gap-2 sm:max-w-[75%]">
											{fileParts.map((filePart, fileIndex) => (
												<div
													key={fileIndex}
													className="flex items-center gap-2 rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-slate-700 text-sm"
												>
													<Paperclip className="h-4 w-4 text-slate-500" />
													<span className="max-w-[160px] truncate">
														{filePart.filename || "File"}
													</span>
												</div>
											))}
										</div>
									)}
									{/* Text content */}
									{messageContent && (
										<MessageContent className="max-w-[85%] rounded-3xl bg-muted px-5 py-2.5 text-primary sm:max-w-[75%]">
											{messageContent}
										</MessageContent>
									)}
									<MessageActions
										className={cn(
											"flex gap-0 opacity-0 transition-opacity duration-150 group-hover:opacity-100",
										)}
									>
										<MessageAction tooltip="Edit" delayDuration={100}>
											<Button
												variant="ghost"
												size="icon"
												className="rounded-full"
											>
												<Pencil />
											</Button>
										</MessageAction>
										<MessageAction tooltip="Delete" delayDuration={100}>
											<Button
												variant="ghost"
												size="icon"
												className="rounded-full"
											>
												<Trash />
											</Button>
										</MessageAction>
										<CopyAction content={messageContent} />
									</MessageActions>
								</div>
							)}
						</Message>
					);
				})}
			</ChatContainerContent>
			<div className="absolute bottom-4 left-1/2 flex w-full max-w-3xl -translate-x-1/2 justify-end px-5">
				<ScrollButton className="shadow-sm" />
			</div>
		</ChatContainerRoot>
	);
}
