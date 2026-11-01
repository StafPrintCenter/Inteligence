import { useServerFn } from "@tanstack/react-start";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { extractTitle } from "./actions";
import { chatWithSpc } from "./gemini.functions";
import { consumeAnonQuota, consumeUserQuota, formatCooldown, getAnonQuota, getTheme, getUser, getUserQuota, loadConversations, newConversation, saveConversations, setLocalUser, setTheme, signOut, titleFrom, uid } from "./store";
import { toTurns } from "./turns";
import type { SpcAttachment, SpcConversation, SpcMessage, SpcUser } from "./types";
import { parseWidgetProfile } from "./widget-profile";

type HostContext = { app?: string; url?: string; title?: string; text?: string };

export function useEmbedChat(app: string) {
  const ask = useServerFn(chatWithSpc);
  const [ready, setReady] = useState(false);
  const [user, setUser] = useState<SpcUser | null>(null);
  const [conversations, setConversations] = useState<SpcConversation[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [failedId, setFailedId] = useState<string | null>(null);
  const [animatedId, setAnimatedId] = useState<string | null>(null);
  const [prefill, setPrefill] = useState<{ text: string; n: number }>();
  const [quotaLabel, setQuotaLabel] = useState<string | null>(null);
  const ctxRef = useRef<HostContext>({ app });
  const parentOrigin = useRef<string | null>(null);
  const inFlight = useRef(false);
  const ownerRef = useRef("anonymous");
  const active = conversations.find((c) => c.id === activeId) ?? null;

  const sync = useCallback(() => {
    const currentUser = getUser();
    const owner = currentUser?.id ?? "anonymous";
    if (ownerRef.current !== owner) {
      ownerRef.current = owner;
      setActiveId(null);
      setFailedId(null);
      setAnimatedId(null);
    }
    setUser(currentUser);
    setConversations(loadConversations(owner));
    if (currentUser) {
      const q = getUserQuota(currentUser.id);
      const end = q.windowStart + 3 * 60 * 60 * 1000;
      setQuotaLabel(q.blocked ? `Limite atteinte · reprise à ${new Date(end).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })} (${formatCooldown(end)})` : `${q.left}/6 messages disponibles${q.windowStart ? ` · renouvellement à ${new Date(end).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}` : ""}`);
    } else {
      const q = getAnonQuota();
      setQuotaLabel(`${q.left}/${q.max} messages restants aujourd'hui`);
    }
  }, []);

  useEffect(() => {
    setTheme(getTheme());
    sync();
    // Reprend les anciens échanges du widget, une seule fois, sans les perdre.
    const legacyKey = `spc.embed.messages.${app}`;
    try {
      const legacy = JSON.parse(sessionStorage.getItem(legacyKey) ?? "[]") as SpcMessage[];
      if (Array.isArray(legacy) && legacy.length && legacy.every((m) => m && typeof m.content === "string" && (m.role === "user" || m.role === "assistant"))) {
        const conv = newConversation(ownerRef.current);
        saveConversations(ownerRef.current, [{ ...conv, title: titleFrom(legacy[0]?.content ?? "Discussion du widget"), messages: legacy }, ...loadConversations(ownerRef.current)]);
        sessionStorage.removeItem(legacyKey);
        sync();
      }
    } catch { /* ancien stockage inaccessible ou invalide */ }
    setReady(true);
    const onMessage = (e: MessageEvent) => {
      if (window.parent === window || e.source !== window.parent) return;
      if (parentOrigin.current && e.origin !== parentOrigin.current) return;
      const d = e.data;
      if (!d || typeof d !== "object") return;
      if (d.type === "spc:context" && d.context && typeof d.context === "object") {
        parentOrigin.current = e.origin;
        const c = d.context;
        ctxRef.current = { app, url: typeof c.url === "string" ? c.url.slice(0, 2000) : undefined, title: typeof c.title === "string" ? c.title.slice(0, 200) : undefined, text: typeof c.text === "string" ? c.text.slice(0, 12000) : undefined };
      }
      if (d.type === "spc:prompt" && typeof d.prompt === "string") setPrefill({ text: d.prompt.slice(0, 4000), n: Date.now() });
      if (d.type === "spc:user" && parentOrigin.current) {
        if (d.user === null) signOut();
        else {
          const profile = parseWidgetProfile(d.user);
          if (profile) setLocalUser(profile);
        }
        sync();
      }
    };
    const onStorage = () => sync();
    window.addEventListener("message", onMessage);
    window.addEventListener("storage", onStorage);
    window.addEventListener("spc:store-changed", onStorage);
    window.addEventListener("focus", onStorage);
    const timer = window.setInterval(sync, 30000);
    window.parent.postMessage({ type: "spc:ready" }, "*");
    return () => {
      window.removeEventListener("message", onMessage);
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("spc:store-changed", onStorage);
      window.removeEventListener("focus", onStorage);
      window.clearInterval(timer);
    };
  }, [app, sync]);

  const persistOne = useCallback((conv: SpcConversation) => {
    const latest = loadConversations(conv.ownerId);
    saveConversations(conv.ownerId, [conv, ...latest.filter((c) => c.id !== conv.id)]);
    if (ownerRef.current === conv.ownerId) sync();
  }, [sync]);

  const complete = useCallback(async (conv: SpcConversation) => {
    if (inFlight.current) return;
    inFlight.current = true;
    setLoading(true);
    setFailedId(null);
    try {
      const result = await ask({ data: { turns: toTurns(conv.messages), context: ctxRef.current } });
      const { title, text } = extractTitle(result.text);
      const reply: SpcMessage = { id: uid(), role: "assistant", content: text, createdAt: Date.now(), attachments: [], reasoning: result.reasoning, sources: result.sources };
      // Ne rétablit pas une discussion supprimée et conserve son éventuel renommage.
      const current = loadConversations(conv.ownerId).find((c) => c.id === conv.id);
      if (!current || current.messages.at(-1)?.id !== conv.messages.at(-1)?.id) return;
      const autoTitle = title && conv.messages.length === 1 && current.title === titleFrom(conv.messages[0]?.content ?? "") ? title : current.title;
      persistOne({ ...current, title: autoTitle, updatedAt: Date.now(), messages: [...current.messages, reply] });
      if (ownerRef.current === conv.ownerId) setAnimatedId(reply.id);
    } catch {
      if (ownerRef.current === conv.ownerId) {
        setFailedId(conv.id);
        toast.error("Impossible de contacter SPC Intelligence. Réessayez.");
      }
    } finally {
      inFlight.current = false;
      setLoading(false);
    }
  }, [ask, persistOne]);

  const send = useCallback((text: string, attachments: SpcAttachment[]) => {
    if (inFlight.current) return;
    const currentUser = getUser();
    if (currentUser) {
      const q = getUserQuota(currentUser.id);
      if (q.blocked) { sync(); toast.error(`Limite atteinte. Renouvellement dans ${formatCooldown(q.blockedUntil)}.`); return; }
      consumeUserQuota(currentUser.id);
    } else {
      if (getAnonQuota().left <= 0) { toast.error("Vos 3 messages gratuits du jour sont utilisés. Connectez-vous sur ai.stafprint.com."); return; }
      consumeAnonQuota();
    }
    const owner = currentUser?.id ?? "anonymous";
    const conv = loadConversations(owner).find((c) => c.id === activeId) ?? newConversation(owner);
    const msg: SpcMessage = { id: uid(), role: "user", content: text, createdAt: Date.now(), attachments: currentUser ? attachments : [] };
    const next = { ...conv, title: conv.messages.length ? conv.title : titleFrom(text), updatedAt: Date.now(), messages: [...conv.messages, msg] };
    persistOne(next);
    setActiveId(next.id);
    void complete(next);
  }, [activeId, complete, persistOne, sync]);

  return {
    ready, user, conversations, active, loading, animatedId, prefill, quotaLabel, send,
    failed: active?.id === failedId,
    select: (id: string) => { setActiveId(id); setAnimatedId(null); },
    newChat: () => { setActiveId(null); setAnimatedId(null); },
    suggest: (text: string) => setPrefill({ text, n: Date.now() }),
    retry: () => { if (active) void complete(active); },
    close: () => window.parent.postMessage({ type: "spc:close" }, parentOrigin.current ?? "*"),
  };
}