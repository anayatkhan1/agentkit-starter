import type { InferUITools, UIMessage } from "ai";
import type { createWebSearchToolset } from "./toolset";

type WebSearchTools = InferUITools<ReturnType<typeof createWebSearchToolset>>;

export type WebSearchUIMessage = UIMessage<never, never, WebSearchTools>;
