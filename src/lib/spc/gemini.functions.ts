import { createServerFn } from "@tanstack/react-start";
import { askGemini, type EmbedContext, type GeminiTurn } from "./gemini.server";

export type ChatInput = { turns: GeminiTurn[]; context?: EmbedContext };

export const chatWithSpc = createServerFn({ method: "POST" })
  .validator((data: ChatInput) => {
    if (!data || !Array.isArray(data.turns) || data.turns.length === 0) {
      throw new Error("turns requis");
    }
    return data;
  })
  .handler(async ({ data }) => askGemini(data.turns, data.context));
