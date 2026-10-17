import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { afterEach, beforeEach, mock, test } from "node:test";
import { runInNewContext } from "node:vm";
import { simulateReadableStream } from "ai";
import { MockLanguageModelV3 } from "ai/test";
import ts from "typescript";
import { webSearchAgent } from "../src/agents/web-search-agent/agent";
import { createWebSearchToolset } from "../src/tools/web-search/toolset";

const MCP_URL = "https://search.parallel.ai/mcp";
const USER_AGENT =
	"agentkit-starter/0.1.0 (https://github.com/anayatkhan1/agentkit-starter)";
const source = {
	url: "https://example.com/news?topic=agents&year=2026",
	title: "Agent news",
	excerpts: ["A current fact.", "Supporting detail."],
};
const expected = {
	results: [
		{
			url: source.url,
			title: source.title,
			text: source.excerpts.join("\n\n"),
		},
	],
};
const usage = {
	inputTokens: { total: 10, noCache: 10, cacheRead: 0, cacheWrite: 0 },
	outputTokens: { total: 10, text: 10, reasoning: 0 },
};
const envKeys = ["EXA_API_KEY", "WEB_SEARCH_PROVIDER", "PARALLEL_API_KEY"];
let savedEnv: Record<string, string | undefined>;

beforeEach(() => {
	savedEnv = Object.fromEntries(envKeys.map((key) => [key, process.env[key]]));
	for (const key of envKeys) delete process.env[key];
});
afterEach(() => {
	mock.restoreAll();
	for (const key of envKeys) {
		if (savedEnv[key] === undefined) delete process.env[key];
		else process.env[key] = savedEnv[key];
	}
});

function protocolFixture(
	options: {
		result?: unknown;
		isError?: boolean;
		textOnly?: boolean;
		status?: number;
		hangAt?: string;
		tools?: boolean;
		sse?: boolean;
		onHang?: () => void;
	} = {},
) {
	const requests: {
		url: string;
		headers: Headers;
		body?: Record<string, any>;
	}[] = [];
	mock.method(
		globalThis,
		"fetch",
		async (url: RequestInfo | URL, init?: RequestInit) => {
			const headers = new Headers(init?.headers);
			assert.equal(String(url), MCP_URL);
			assert.equal(headers.get("user-agent"), USER_AGENT);
			assert.equal(headers.get("authorization"), null);
			assert.equal(headers.get("x-api-key"), null);
			const body = init?.body ? JSON.parse(String(init.body)) : undefined;
			requests.push({ url: String(url), headers, body });
			if (init?.method === "GET") return new Response(null, { status: 405 });
			if (body.method === options.hangAt) {
				options.onHang?.();
				return new Promise<Response>((_, reject) => {
					const signal = init?.signal;
					if (signal?.aborted) reject(signal.reason);
					else
						signal?.addEventListener("abort", () => reject(signal.reason), {
							once: true,
						});
				});
			}
			if (!Object.hasOwn(body, "id"))
				return new Response(null, { status: 202 });
			let result: unknown;
			if (body.method === "initialize") {
				result = {
					protocolVersion: "2025-03-26",
					capabilities: { tools: {} },
					serverInfo: { name: "fixture", version: "1.0.0" },
				};
			} else if (body.method === "tools/list") {
				result = {
					tools:
						options.tools === false
							? []
							: [
									{
										name: "web_search",
										inputSchema: {
											type: "object",
											properties: {},
											required: [],
										},
									},
								],
				};
			} else {
				assert.equal(body.method, "tools/call");
				assert.equal(headers.get("mcp-session-id"), "fixture-connection");
				if (options.status)
					return new Response("Service unavailable", {
						status: options.status,
					});
				const data = options.result ?? { results: [source] };
				result = {
					content: [{ type: "text", text: JSON.stringify(data) }],
					...(!options.textOnly ? { structuredContent: data } : {}),
					isError: options.isError ?? false,
				};
			}
			const payload = JSON.stringify({ jsonrpc: "2.0", id: body.id, result });
			return new Response(
				options.sse ? `event: message\ndata: ${payload}\n\n` : payload,
				{
					headers: {
						"content-type": options.sse
							? "text/event-stream"
							: "application/json",
						...(body.method === "initialize"
							? { "mcp-session-id": "fixture-connection" }
							: {}),
					},
				},
			);
		},
	);
	return requests;
}

// Scripted model: the real streamText loop dispatches webSearch, then this model
// verifies that the next step receives the result before emitting a citation.
function scriptedModel(
	expectOutput: (value: unknown) => void = (value) =>
		assert.deepEqual(value, expected),
) {
	let step = 0;
	return new MockLanguageModelV3({
		modelId: "fixture-model-v1",
		doStream: async ({ prompt }) => {
			const first = step++ === 0;
			if (!first) {
				const result = prompt.find((message) => message.role === "tool");
				assert.ok(result);
				const content = result.content[0];
				assert.equal(content.type, "tool-result");
				if (content.type === "tool-result") expectOutput(content.output);
			}
			return {
				stream: simulateReadableStream({
					chunks: [
						...(first
							? [
									{
										type: "tool-call" as const,
										toolCallId: "search-1",
										toolName: "webSearch",
										input: JSON.stringify({ query: "current agent news" }),
									},
									{
										type: "finish" as const,
										finishReason: {
											unified: "tool-calls" as const,
											raw: undefined,
										},
										usage,
									},
								]
							: [
									{ type: "text-start" as const, id: "answer" },
									{
										type: "text-delta" as const,
										id: "answer",
										delta: `A current fact. [Source](${source.url})`,
									},
									{ type: "text-end" as const, id: "answer" },
									{
										type: "finish" as const,
										finishReason: { unified: "stop" as const, raw: undefined },
										usage,
									},
								]),
					],
				}),
			};
		},
	});
}

async function runAgent() {
	const model = scriptedModel((output) =>
		assert.deepEqual(output, { type: "json", value: expected }),
	);
	const stream = webSearchAgent(
		[{ role: "user", content: "Find current agent news" }],
		{
			conversationId: "chat-123",
			model,
		},
	);
	assert.equal(await stream.text, `A current fact. [Source](${source.url})`);
	assert.equal(model.doStreamCalls.length, 2);
	const steps = await stream.steps;
	assert.deepEqual(steps[0].toolResults[0].output, expected);
	return steps;
}

for (const sse of [false, true]) {
	test(`fresh no-key agent consumes search results and cites URLs (${sse ? "SSE" : "JSON"})`, async () => {
		const requests = protocolFixture({ sse });
		await runAgent();
		assert.ok(
			requests.some((request) => request.body?.method === "initialize"),
		);
		assert.ok(
			requests.some((request) => request.body?.method === "tools/list"),
		);
		const call = requests.find(
			(request) => request.body?.method === "tools/call",
		)?.body;
		assert.deepEqual(call?.params, {
			name: "web_search",
			arguments: {
				objective: "current agent news",
				search_queries: ["current agent news"],
				session_id: createHash("sha256").update("chat-123").digest("hex"),
				model_name: "fixture-model-v1",
			},
		});
	});
}

test("conversation identity persists across toolsets and turns", async () => {
	const requests = protocolFixture();
	await runAgent();
	await runAgent();
	const calls = requests.filter(
		(request) => request.body?.method === "tools/call",
	);
	assert.equal(
		calls[0].body?.params.arguments.session_id,
		calls[1].body?.params.arguments.session_id,
	);
});

test("explicit Parallel overrides configured Exa credentials", async () => {
	process.env.EXA_API_KEY = "fixture-exa-key";
	process.env.PARALLEL_API_KEY = "must-not-be-sent";
	process.env.WEB_SEARCH_PROVIDER = "parallel";
	protocolFixture();
	await runAgent();
});

for (const explicit of [false, true]) {
	test(`${explicit ? "explicit" : "existing configured"} Exa selection stays on Exa`, async () => {
		process.env.EXA_API_KEY = "fixture-exa-key";
		if (explicit) process.env.WEB_SEARCH_PROVIDER = "exa";
		mock.method(
			globalThis,
			"fetch",
			async (url: RequestInfo | URL, init?: RequestInit) => {
				assert.equal(String(url), "https://api.exa.ai/search");
				assert.equal(
					new Headers(init?.headers).get("x-api-key"),
					"fixture-exa-key",
				);
				assert.equal(JSON.parse(String(init?.body)).type, "auto");
				return Response.json(expected);
			},
		);
		await runAgent();
	});
}

async function executeSearch(signal?: AbortSignal) {
	const search = createWebSearchToolset().webSearch;
	assert.ok(search.execute);
	return search.execute(
		{ query: "current agent news" },
		{ toolCallId: "search-1", messages: [], abortSignal: signal },
	);
}

test("explicit Exa without a key fails without fallback", async () => {
	process.env.WEB_SEARCH_PROVIDER = "exa";
	const fetch = mock.method(globalThis, "fetch");
	await assert.rejects(executeSearch(), /EXA_API_KEY is required/);
	assert.equal(fetch.mock.callCount(), 0);
});

test("invalid provider fails closed", () => {
	process.env.WEB_SEARCH_PROVIDER = "unknown";
	assert.throws(() => createWebSearchToolset(), /WEB_SEARCH_PROVIDER/);
});

test("text-only MCP result is normalized for source cards", async () => {
	protocolFixture({ textOnly: true });
	assert.deepEqual(await executeSearch(), expected);
});

test("MCP tool errors reach the agent as errors without a provider fallback", async () => {
	const requests = protocolFixture({
		isError: true,
		result: { message: "Search quota reached" },
	});
	const model = scriptedModel((output) => {
		assert.equal((output as { type: string }).type, "error-text");
		assert.match((output as { value: string }).value, /Search quota reached/);
	});
	await webSearchAgent([{ role: "user", content: "Search" }], { model }).text;
	assert.equal(
		requests.filter((request) => request.body?.method === "tools/call").length,
		1,
	);
});

test("HTTP errors are propagated", async () => {
	protocolFixture({ status: 503 });
	await assert.rejects(executeSearch(), /Service unavailable/);
});

test("missing search tool and malformed responses fail", async () => {
	protocolFixture({ tools: false });
	await assert.rejects(executeSearch(), /did not provide web_search/);
	mock.restoreAll();
	protocolFixture({ result: { results: [{ url: source.url }] } });
	await assert.rejects(executeSearch());
});

test("unsafe result URLs are rejected", async () => {
	protocolFixture({
		result: { results: [{ ...source, url: "javascript:alert(1)" }] },
	});
	await assert.rejects(executeSearch());
});

for (const hangAt of ["initialize", "tools/list", "tools/call"]) {
	test(`cancellation interrupts ${hangAt}`, async () => {
		const controller = new AbortController();
		protocolFixture({
			hangAt,
			onHang: () => controller.abort(new Error("Chat cancelled")),
		});
		await assert.rejects(
			executeSearch(controller.signal),
			/Chat cancelled|aborted|closed/i,
		);
	});
}

test("pre-aborted search makes no request", async () => {
	const fetch = mock.method(globalThis, "fetch");
	await assert.rejects(executeSearch(AbortSignal.abort()), /abort/i);
	assert.equal(fetch.mock.callCount(), 0);
});

for (const hangAt of ["initialize", "tools/list", "tools/call"]) {
	test(`30-second deadline covers ${hangAt}`, async () => {
		const controller = new AbortController();
		mock.method(AbortSignal, "timeout", (milliseconds: number) => {
			assert.equal(milliseconds, 30_000);
			return controller.signal;
		});
		protocolFixture({
			hangAt,
			onHang: () =>
				controller.abort(new DOMException("Search timed out", "TimeoutError")),
		});
		await assert.rejects(executeSearch(), /timed out|closed/i);
	});
}

// Execute the transpiled route with controlled external boundaries. This checks
// its real authentication/toggle branches without Clerk or a database account.
function routeHarness(authenticated: boolean) {
	let searchCalls = 0;
	let plainCalls = 0;
	const searchInputs: { conversationId: string; abortSignal: AbortSignal }[] =
		[];
	const stream = {
		consumeStream() {},
		toUIMessageStreamResponse: () => new Response("chat response"),
	};
	const dependencies: Record<string, unknown> = {
		"@ai-sdk/anthropic": { anthropic: () => "fixture-model" },
		"@clerk/nextjs/server": {
			auth: async () => ({ userId: authenticated ? "user-1" : null }),
		},
		ai: {
			convertToModelMessages: async (messages: unknown) => messages,
			createIdGenerator: () => () => "message-1",
			streamText: () => {
				plainCalls++;
				return stream;
			},
		},
		"@/agents/web-search-agent": {
			webSearchAgent: (
				_messages: unknown,
				options: { conversationId: string; abortSignal: AbortSignal },
			) => {
				searchCalls++;
				searchInputs.push(options);
				return stream;
			},
		},
		"@/lib/chat-store": { loadChat: async () => [], saveChat: async () => {} },
	};
	const { outputText } = ts.transpileModule(
		readFileSync("src/app/api/chat/route.ts", "utf8"),
		{
			compilerOptions: {
				module: ts.ModuleKind.CommonJS,
				target: ts.ScriptTarget.ES2022,
			},
		},
	);
	const exports: { POST?: (request: Request) => Promise<Response> } = {};
	runInNewContext(outputText, {
		exports,
		require: (name: string) => {
			assert.ok(name in dependencies, name);
			return dependencies[name];
		},
		Response,
		fetch: async () => new Response(null),
	});
	return { exports, searchInputs, counts: () => ({ searchCalls, plainCalls }) };
}

test("unauthenticated requests cannot invoke search", async () => {
	const harness = routeHarness(false);
	const response = await harness.exports.POST?.(
		new Request("http://localhost/api/chat", {
			method: "POST",
			body: JSON.stringify({ id: "chat-1", searchMode: true, messages: [] }),
		}),
	);
	assert.equal(response?.status, 401);
	assert.deepEqual(harness.counts(), { searchCalls: 0, plainCalls: 0 });
});

test("disabled or omitted search toggle never invokes the search agent", async () => {
	for (const searchMode of [false, undefined]) {
		const harness = routeHarness(true);
		const response = await harness.exports.POST?.(
			new Request("http://localhost/api/chat", {
				method: "POST",
				body: JSON.stringify({ id: "chat-1", searchMode, messages: [] }),
			}),
		);
		assert.equal(response?.status, 200);
		assert.deepEqual(harness.counts(), { searchCalls: 0, plainCalls: 1 });
	}
});

test("enabled search passes chat identity and cancellation into the agent", async () => {
	const harness = routeHarness(true);
	const request = new Request("http://localhost/api/chat", {
		method: "POST",
		body: JSON.stringify({ id: "chat-1", searchMode: true, messages: [] }),
	});
	assert.equal((await harness.exports.POST?.(request))?.status, 200);
	assert.deepEqual(harness.counts(), { searchCalls: 1, plainCalls: 0 });
	assert.equal(harness.searchInputs[0].conversationId, "chat-1");
	assert.equal(harness.searchInputs[0].abortSignal, request.signal);
});
