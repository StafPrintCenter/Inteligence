import type { SpcConversation, SpcMessage } from "./types";

export type SharedPayload = {
  title: string;
  createdAt: number;
  messages: Pick<SpcMessage, "id" | "role" | "content" | "createdAt" | "sources">[];
};

function toBase64Url(bytes: Uint8Array) {
  let binary = "";
  bytes.forEach((b) => {
    binary += String.fromCharCode(b);
  });
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromBase64Url(value: string) {
  const padded = value.replace(/-/g, "+").replace(/_/g, "/");
  const binary = atob(padded + "=".repeat((4 - (padded.length % 4)) % 4));
  return Uint8Array.from(binary, (c) => c.charCodeAt(0));
}

async function gzip(bytes: Uint8Array) {
  const stream = new Blob([bytes as BlobPart]).stream().pipeThrough(new CompressionStream("gzip"));
  return new Uint8Array(await new Response(stream).arrayBuffer());
}

async function gunzip(bytes: Uint8Array) {
  const stream = new Blob([bytes as BlobPart])
    .stream()
    .pipeThrough(new DecompressionStream("gzip"));
  return new Uint8Array(await new Response(stream).arrayBuffer());
}

/** Conversation (ou message unique) encodée dans le lien : aucun stockage serveur. */
export function toPayload(conversation: SpcConversation, messageId?: string): SharedPayload {
  const messages = (
    messageId ? conversation.messages.filter((m) => m.id === messageId) : conversation.messages
  ).map((m) => ({
    id: m.id,
    role: m.role,
    content: m.content,
    createdAt: m.createdAt,
    ...(m.sources ? { sources: m.sources } : {}),
  }));
  return { title: conversation.title, createdAt: conversation.createdAt, messages };
}

export async function encodeShare(payload: SharedPayload) {
  const raw = new TextEncoder().encode(JSON.stringify(payload));
  return toBase64Url(await gzip(raw));
}

export async function decodeShare(token: string): Promise<SharedPayload | null> {
  try {
    const raw = await gunzip(fromBase64Url(token));
    const parsed = JSON.parse(new TextDecoder().decode(raw)) as SharedPayload;
    if (!parsed || !Array.isArray(parsed.messages)) return null;
    return parsed;
  } catch {
    return null;
  }
}

export async function buildShareUrl(conversation: SpcConversation, messageId?: string) {
  const token = await encodeShare(toPayload(conversation, messageId));
  const origin = typeof window !== "undefined" ? window.location.origin : "";
  return `${origin}/s#${token}`;
}
