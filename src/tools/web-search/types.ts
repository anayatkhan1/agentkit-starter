import { InferUITools, UIMessage } from "ai";
import { webSearchToolset } from "./toolset";

type WebSearchTools = InferUITools<typeof webSearchToolset>;

export type WebSearchUIMessage = UIMessage<never, never, WebSearchTools>;
