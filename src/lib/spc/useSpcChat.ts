import { useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";

import { useIsMobile } from "@/hooks/use-mobile";
import { chatWithSpc } from "@/lib/spc/gemini.functions";
import { detectGeneration, makeGeneratedDocument, makeGeneratedImage } from "@/lib/spc/generation";
import {
  canPin,
  consumeAnonQuota,
  consumeUserQuota,
  formatCooldown,
  getAnonQuota,
  getTheme,
  getUser,
  getUserQuota,
  loadConversations,
  newConversation,
  noticeAccepted,
  saveConversations,
  setTheme,
  signOut,
  titleFrom,
  uid,
  type Theme,
  type UserQuotaState,
} from "@/lib/spc/store";
import { toTurns } from "@/lib/spc/turns";
import type { SpcAttachment, SpcConversation, SpcMessage, SpcUser } from "@/lib/spc/types";

/** Toute la logique du chat : état local, quotas, appels au moteur et navigation. */
export function useSpcChat(conversationId?: string) {
  const navigate = useNavigate();
  const ask = useServerFn(chatWithSpc);
  const isMobile = useIsMobile();

  const [ready, setReady] = useState(false);
  const [user, setUser] = useState<SpcUser | null>(null);
  const [conversations, setConversations] = useState<SpcConversation[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [gateOpen, setGateOpen] = useState(false);
  const [gateReason, setGateReason] = useState("");
  const [showNotice, setShowNotice] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [shareMessageId, setShareMessageId] = useState<string | undefined>(undefined);
  const [theme, setThemeState] = useState<Theme>("light");
  const [loading, setLoading] = useState(false);
  const [animatedId, setAnimatedId] = useState<string | null>(null);
  const [failedConvId, setFailedConvId] = useState<string | null>(null);
  const [quota, setQuota] = useState({ used: 0, left: 3, max: 3 });
  const [userQuota, setUserQuota] = useState<UserQuotaState | null>(null);
  const autoRun = useRef(false);

  const ownerId = user?.id ?? "anonymous";
  const activeId = conversationId ?? null;

  useEffect(() => {
    const t = getTheme();
    setThemeState(t);
    setTheme(t);
    const u = getUser();
    setUser(u);
    setConversations(loadConversations(u?.id ?? "anonymous"));
    setQuota(getAnonQuota());
    setUserQuota(u ? getUserQuota(u.id) : null);
    setShowNotice(!noticeAccepted());
    setReady(true);
  }, []);

  /* Rafraîchit l'état de la pause pour lever le blocage à son expiration */
  useEffect(() => {
    if (!user || !userQuota?.blocked) return;
    const timer = window.setInterval(() => setUserQuota(getUserQuota(user.id)), 30000);
    return () => window.clearInterval(timer);
  }, [user, userQuota?.blocked]);

  /* La barre latérale reste fermée par défaut sur mobile */
  useEffect(() => {
    setSidebarOpen(!isMobile);
  }, [isMobile]);

  /* Sur mobile, toute navigation referme la barre latérale */
  useEffect(() => {
    if (isMobile) setSidebarOpen(false);
  }, [isMobile, conversationId]);

  const persist = useCallback(
    (list: SpcConversation[]) => {
      const sorted = [...list].sort(
        (a, b) => Number(b.pinned) - Number(a.pinned) || b.updatedAt - a.updatedAt,
      );
      setConversations(sorted);
      saveConversations(ownerId, sorted);
      return sorted;
    },
    [ownerId],
  );

  const active = useMemo(
    () => conversations.find((c) => c.id === activeId) ?? null,
    [conversations, activeId],
  );

  /* Titre de l'onglet dynamique selon la conversation */
  useEffect(() => {
    if (typeof document === "undefined") return;
    document.title = active?.title
      ? `${active.title} · SPC Intelligence`
      : "SPC Intelligence — Assistant IA de STAF PRINT CENTER";
  }, [active?.title]);

  const openGate = useCallback((reason: string) => {
    setGateReason(reason);
    setGateOpen(true);
  }, []);

  const runCompletion = useCallback(
    async (conv: SpcConversation, list: SpcConversation[]) => {
      setLoading(true);
      try {
        const prompt = conv.messages.at(-1)?.content ?? "";
        const result = await ask({ data: { turns: toTurns(conv.messages) } });

        const generated: SpcAttachment[] = [];
        if (getUser()) {
          const kind = detectGeneration(prompt);
          if (kind === "image") generated.push(makeGeneratedImage(prompt));
          if (kind === "document") generated.push(makeGeneratedDocument(prompt, result.text));
        }

        const assistant: SpcMessage = {
          id: uid(),
          role: "assistant",
          content: result.text,
          createdAt: Date.now(),
          attachments: generated,
          reasoning: result.reasoning,
          sources: result.sources,
        };

        setAnimatedId(assistant.id);
        persist(
          list.map((c) =>
            c.id === conv.id
              ? { ...conv, updatedAt: Date.now(), messages: [...conv.messages, assistant] }
              : c,
          ),
        );
        if (result.fallback) toast.warning("Moteur de secours activé.");
        setFailedConvId(null);
      } catch {
        setFailedConvId(conv.id);
        toast.error("Impossible de contacter SPC Intelligence. Réessayez.");
      } finally {
        setLoading(false);
      }
    },
    [ask, persist],
  );

  /* Reprend une réponse en attente après navigation vers /c/$id */
  useEffect(() => {
    if (!ready || autoRun.current || loading) return;
    if (!active || active.messages.at(-1)?.role !== "user") return;
    autoRun.current = true;
    void runCompletion(active, conversations);
  }, [ready, active, conversations, loading, runCompletion]);

  const handleSend = useCallback(
    async (text: string, attachments: SpcAttachment[]) => {
      if (!user && quota.left <= 0) {
        openGate("Vous avez utilisé vos 3 messages gratuits du jour.");
        return;
      }

      if (user) {
        const state = getUserQuota(user.id);
        setUserQuota(state);
        if (state.blocked) {
          toast.error(
            `Limite atteinte : ${state.max} messages envoyés. Réessayez dans ${formatCooldown(state.blockedUntil)}.`,
          );
          return;
        }
      }

      const isNew = !active;
      const conv = active ?? newConversation(ownerId);
      const base = isNew ? [conv, ...conversations] : conversations;

      const userMessage: SpcMessage = {
        id: uid(),
        role: "user",
        content: text,
        createdAt: Date.now(),
        attachments: user ? attachments : [],
      };

      const withUser: SpcConversation = {
        ...conv,
        title: conv.messages.length === 0 ? titleFrom(text) : conv.title,
        updatedAt: Date.now(),
        messages: [...conv.messages, userMessage],
      };
      const list = persist(base.map((c) => (c.id === withUser.id ? withUser : c)));

      if (!user) {
        consumeAnonQuota();
        setQuota(getAnonQuota());
      } else {
        setUserQuota(consumeUserQuota(user.id));
      }

      if (isNew) {
        autoRun.current = false;
        void navigate({ to: "/c/$conversationId", params: { conversationId: withUser.id } });
        return;
      }

      autoRun.current = true;
      await runCompletion(withUser, list);
    },
    [active, conversations, navigate, openGate, ownerId, persist, quota.left, runCompletion, user],
  );

  const handleNew = useCallback(() => {
    if (isMobile) setSidebarOpen(false);
    void navigate({ to: "/" });
  }, [isMobile, navigate]);

  const handleSelect = useCallback(
    (id: string) => {
      if (isMobile) setSidebarOpen(false);
      void navigate({ to: "/c/$conversationId", params: { conversationId: id } });
    },
    [isMobile, navigate],
  );

  const handleTogglePin = useCallback(
    (id: string) => {
      const target = conversations.find((c) => c.id === id);
      if (!target) return;
      if (!target.pinned && !canPin(conversations)) {
        toast.error("Maximum 3 conversations épinglées.");
        return;
      }
      persist(conversations.map((c) => (c.id === id ? { ...c, pinned: !c.pinned } : c)));
    },
    [conversations, persist],
  );

  const handleRename = useCallback(
    (id: string, title: string) =>
      persist(conversations.map((c) => (c.id === id ? { ...c, title } : c))),
    [conversations, persist],
  );

  const handleDelete = useCallback(
    (id: string) => {
      persist(conversations.filter((c) => c.id !== id));
      if (activeId === id) void navigate({ to: "/" });
    },
    [activeId, conversations, navigate, persist],
  );

  const handleSignOut = useCallback(() => {
    signOut();
    setUser(null);
    setConversations(loadConversations("anonymous"));
    setQuota(getAnonQuota());
    setUserQuota(null);
    toast.success("Déconnecté — historique du compte masqué.");
    void navigate({ to: "/" });
  }, [navigate]);

  const toggleTheme = useCallback(() => {
    setThemeState((current) => {
      const next: Theme = current === "dark" ? "light" : "dark";
      setTheme(next);
      return next;
    });
  }, []);

  const openShare = useCallback((messageId?: string) => {
    setShareMessageId(messageId);
    setShareOpen(true);
  }, []);

  const retry = useCallback(() => {
    if (!active) return;
    setFailedConvId(null);
    void runCompletion(active, conversations);
  }, [active, conversations, runCompletion]);

  const quotaLabel = !user
    ? `${quota.left}/${quota.max} messages restants aujourd'hui · connectez-vous pour plus de messages`
    : userQuota?.blocked
      ? `Limite atteinte (${userQuota.max} messages) · reprise dans ${formatCooldown(userQuota.blockedUntil)}, vers ${new Date(userQuota.blockedUntil).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}`
      : userQuota
        ? `${userQuota.left}/${userQuota.max} messages avant une pause de 3 h`
        : null;

  const retryMessageId =
    active && failedConvId === active.id
      ? (active.messages.filter((m) => m.role === "user").at(-1)?.id ?? null)
      : null;

  return {
    ready,
    isMobile,
    user,
    conversations,
    active,
    activeId,
    hasMessages: Boolean(active && active.messages.length > 0),
    loading,
    animatedId,
    theme,
    quotaLabel,
    retryMessageId,
    blocked: Boolean(userQuota?.blocked),
    sidebarOpen,
    setSidebarOpen,
    detailsOpen,
    setDetailsOpen,
    gateOpen,
    setGateOpen,
    gateReason,
    openGate,
    showNotice,
    setShowNotice,
    shareOpen,
    setShareOpen,
    shareMessageId,
    openShare,
    handleSend,
    handleNew,
    handleSelect,
    handleRename,
    handleDelete,
    handleTogglePin,
    handleSignOut,
    toggleTheme,
    retry,
  };
}
