import { useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";

import { ChatHeader } from "@/components/spc/chat/ChatHeader";
import { MessageList } from "@/components/spc/chat/MessageList";
import { WelcomeScreen } from "@/components/spc/chat/WelcomeScreen";
import { ChatSidebar } from "@/components/spc/ChatSidebar";
import { Composer } from "@/components/spc/Composer";
import { DetailsPanel } from "@/components/spc/DetailsPanel";
import { NoticeDialog } from "@/components/spc/NoticeDialog";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useIsMobile } from "@/hooks/use-mobile";
import { chatWithSpc } from "@/lib/spc/gemini.functions";
import type { GeminiTurn } from "@/lib/spc/gemini.server";
import { detectGeneration, makeGeneratedDocument, makeGeneratedImage } from "@/lib/spc/generation";
import {
  acceptNotice,
  canPin,
  consumeAnonQuota,
  getAnonQuota,
  getTheme,
  getUser,
  loadConversations,
  newConversation,
  noticeAccepted,
  saveConversations,
  setTheme,
  signOut,
  titleFrom,
  uid,
  type Theme,
} from "@/lib/spc/store";
import type { SpcAttachment, SpcConversation, SpcMessage, SpcUser } from "@/lib/spc/types";

function toTurns(messages: SpcMessage[]): GeminiTurn[] {
  return messages.slice(-12).map((m) => ({
    role: m.role === "user" ? ("user" as const) : ("model" as const),
    parts: [
      { text: m.content },
      ...(m.role === "user"
        ? (m.attachments ?? [])
            .filter((a) => a.origin === "uploaded")
            .flatMap((a) => [
              ...(a.extractedText?.trim()
                ? [
                    {
                      text: `\n[Texte extrait du fichier « ${a.name} » (${a.mimeType})] :\n${a.extractedText.slice(0, 120000)}\n`,
                    },
                  ]
                : []),
              ...(a.mimeType.startsWith("image/") || a.mimeType === "application/pdf"
                ? [{ inlineData: { mimeType: a.mimeType, data: a.dataUrl.split(",")[1] ?? "" } }]
                : []),
            ])
        : []),
    ],
  }));
}

export function ChatApp({ conversationId }: { conversationId?: string }) {
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
  const [theme, setThemeState] = useState<Theme>("dark");
  const [loading, setLoading] = useState(false);
  const [animatedId, setAnimatedId] = useState<string | null>(null);
  const [quota, setQuota] = useState({ used: 0, left: 3, max: 3 });
  const bottomRef = useRef<HTMLDivElement>(null);
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
    setShowNotice(!noticeAccepted());
    setReady(true);
  }, []);

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

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [active?.messages.length, loading]);

  const openGate = (reason: string) => {
    setGateReason(reason);
    setGateOpen(true);
  };

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
        if (result.fallback) toast.warning("Moteur de secours activé (clés API indisponibles).");
      } catch {
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

  const handleSend = async (text: string, attachments: SpcAttachment[]) => {
    if (!user && quota.left <= 0) {
      openGate("Vous avez utilisé vos 3 messages gratuits du jour.");
      return;
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
    }

    if (isNew) {
      autoRun.current = false;
      void navigate({ to: "/c/$conversationId", params: { conversationId: withUser.id } });
      return;
    }

    autoRun.current = true;
    await runCompletion(withUser, list);
  };

  const handleNew = () => {
    if (isMobile) setSidebarOpen(false);
    void navigate({ to: "/" });
  };

  const handleTogglePin = (id: string) => {
    const target = conversations.find((c) => c.id === id);
    if (!target) return;
    if (!target.pinned && !canPin(conversations)) {
      toast.error("Maximum 3 conversations épinglées.");
      return;
    }
    persist(conversations.map((c) => (c.id === id ? { ...c, pinned: !c.pinned } : c)));
  };

  const handleDelete = (id: string) => {
    const next = conversations.filter((c) => c.id !== id);
    persist(next);
    if (activeId === id) void navigate({ to: "/" });
  };

  const handleSignOut = () => {
    signOut();
    setUser(null);
    setConversations(loadConversations("anonymous"));
    setQuota(getAnonQuota());
    toast.success("Déconnecté — historique du compte masqué.");
    void navigate({ to: "/" });
  };

  const toggleTheme = () => {
    const next: Theme = theme === "dark" ? "light" : "dark";
    setThemeState(next);
    setTheme(next);
  };

  if (!ready) return <div className="min-h-dvh bg-background" />;

  const hasMessages = Boolean(active && active.messages.length > 0);

  return (
    <div className="flex h-dvh overflow-hidden bg-background text-foreground">
      <ChatSidebar
        open={sidebarOpen}
        mobile={isMobile}
        conversations={conversations}
        activeId={activeId}
        user={user}
        onClose={() => setSidebarOpen(false)}
        onSelect={(id) => {
          if (isMobile) setSidebarOpen(false);
          void navigate({ to: "/c/$conversationId", params: { conversationId: id } });
        }}
        onNew={handleNew}
        onRename={(id, title) =>
          persist(conversations.map((c) => (c.id === id ? { ...c, title } : c)))
        }
        onDelete={handleDelete}
        onTogglePin={handleTogglePin}
        onSignOut={handleSignOut}
        onDetails={() => setDetailsOpen(true)}
      />

      <div className="flex min-w-0 flex-1 flex-col">
        <ChatHeader
          title={active?.title ?? "SPC Intelligence"}
          user={user}
          theme={theme}
          hasConversation={hasMessages}
          onToggleSidebar={() => setSidebarOpen((v) => !v)}
          onToggleTheme={toggleTheme}
          onDetails={() => setDetailsOpen(true)}
        />

        <main className="spc-scroll flex-1 overflow-y-auto">
          <div className="mx-auto w-full max-w-3xl px-4 py-6">
            {!hasMessages ? (
              <WelcomeScreen onPick={(s) => void handleSend(s, [])} />
            ) : (
              <MessageList
                messages={active!.messages}
                userName={user?.name ?? "Visiteur"}
                loading={loading}
                animatedId={animatedId}
              />
            )}
            <div ref={bottomRef} />
          </div>
        </main>

        <div className="border-t border-border bg-background px-3 py-3 sm:px-4">
          <div className="mx-auto w-full max-w-3xl">
            <Composer
              disabled={loading}
              canUpload={Boolean(user)}
              quotaLabel={
                user
                  ? null
                  : `${quota.left}/${quota.max} messages restants aujourd'hui · connectez-vous pour un accès illimité`
              }
              onBlockedUpload={() =>
                openGate("L'envoi de fichiers est réservé aux espaces connectés.")
              }
              onSend={(t, a) => void handleSend(t, a)}
            />
          </div>
        </div>
      </div>

      {hasMessages && (
        <DetailsPanel conversation={active} open={detailsOpen} onOpenChange={setDetailsOpen} />
      )}
      <NoticeDialog
        open={showNotice}
        onAccept={() => {
          acceptNotice();
          setShowNotice(false);
        }}
      />

      <Dialog open={gateOpen} onOpenChange={setGateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Connexion requise</DialogTitle>
            <DialogDescription>{gateReason}</DialogDescription>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Connectez-vous à votre espace (Client, Apprenant, Formateur ou Administrateur) pour des
            messages illimités, l'analyse de fichiers et la génération de documents et visuels.
          </p>
          <Button onClick={() => void navigate({ to: "/login" })}>Aller à la connexion</Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}
