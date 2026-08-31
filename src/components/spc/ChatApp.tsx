import { Link, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { Download, Info, LogIn, Moon, PanelLeft, Sparkles, Sun } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";

import logos from "@/assets/logos.json";
import { AssistantMessageItem } from "@/components/spc/AssistantMessageItem";
import { ChatSidebar } from "@/components/spc/ChatSidebar";
import { Composer } from "@/components/spc/Composer";
import { CopyButton } from "@/components/spc/CopyButton";
import { DetailsPanel } from "@/components/spc/DetailsPanel";
import { NoticeDialog } from "@/components/spc/NoticeDialog";
import { ReasoningPanel } from "@/components/spc/ReasoningPanel";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import {
  SPACE_LABELS,
  type SpcAttachment,
  type SpcConversation,
  type SpcMessage,
  type SpcUser,
} from "@/lib/spc/types";

const SUGGESTIONS = [
  "Présente-moi l'écosystème STAF PRINT CENTER",
  "Quels services d'impression proposez-vous ?",
  "Rédige un devis type pour 500 flyers A5",
  "Comment fonctionne l'espace apprenant ?",
];

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

  const [ready, setReady] = useState(false);
  const [user, setUser] = useState<SpcUser | null>(null);
  const [conversations, setConversations] = useState<SpcConversation[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [gateOpen, setGateOpen] = useState(false);
  const [gateReason, setGateReason] = useState("");
  const [showNotice, setShowNotice] = useState(false);
  const [theme, setThemeState] = useState<Theme>("dark");
  const [loading, setLoading] = useState(false);
  const [isGeneratingText, setIsGeneratingText] = useState(false);
  const [quota, setQuota] = useState({ used: 0, left: 3, max: 3 });
  const bottomRef = useRef<HTMLDivElement>(null);
  const autoRun = useRef(false);

  const ownerId = user?.id ?? "anonymous";
  const activeId = conversationId ?? null;

  const botLogo = theme === "dark" ? logos.mw : logos.mc;
  const userInitial = user?.name ? user.name.trim().charAt(0).toUpperCase() : "U";

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

  const latestAssistantMessageId = useMemo(() => {
    if (!active) return null;
    const lastMsg = active.messages.at(-1);
    return lastMsg?.role === "assistant" ? lastMsg.id : null;
  }, [active]);

  useEffect(() => {
    if (typeof document === "undefined") return;
    document.title = active?.title
      ? `${active.title} · SPC Intelligence`
      : "SPC Intelligence — Assistant IA de STAF PRINT CENTER";
  }, [active?.title]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [active?.messages.length, loading, isGeneratingText]);

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

        // On injecte le message et on passe en mode génération visuelle du texte
        setIsGeneratingText(true);
        setLoading(false);

        persist(
          list.map((c) =>
            c.id === conv.id
              ? { ...conv, updatedAt: Date.now(), messages: [...conv.messages, assistant] }
              : c,
          ),
        );

        if (result.fallback) toast.warning("Moteur de secours activé (clés API indisponibles).");

        // Calcul du temps nécessaire pour l'animation complète (ex: 20ms par mot)
        const wordCount = result.text.split(" ").length;
        const animationDuration = wordCount * 20 + 200;

        setTimeout(() => {
          setIsGeneratingText(false);
        }, animationDuration);
      } catch {
        setLoading(false);
        setIsGeneratingText(false);
        toast.error("Impossible de contacter SPC Intelligence. Réessayez.");
      }
    },
    [ask, persist],
  );

  useEffect(() => {
    if (!ready || autoRun.current || loading || isGeneratingText) return;
    if (!active || active.messages.at(-1)?.role !== "user") return;
    autoRun.current = true;
    void runCompletion(active, conversations);
  }, [ready, active, conversations, loading, isGeneratingText, runCompletion]);

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

  return (
    <div className="flex h-dvh overflow-hidden bg-background text-foreground">
      <ChatSidebar
        open={sidebarOpen}
        conversations={conversations}
        activeId={activeId}
        user={user}
        onClose={() => setSidebarOpen(false)}
        onSelect={(id) =>
          void navigate({ to: "/c/$conversationId", params: { conversationId: id } })
        }
        onNew={handleNew}
        onRename={(id, title) =>
          persist(conversations.map((c) => (c.id === id ? { ...c, title } : c)))
        }
        onDelete={handleDelete}
        onTogglePin={handleTogglePin}
        onSignOut={handleSignOut}
        onDetails={() => active && setDetailsOpen(true)}
      />

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center gap-2 border-b border-border px-4 py-3">
          <Button
            size="icon"
            variant="ghost"
            aria-label="Afficher/masquer la barre latérale"
            className="cursor-pointer"
            onClick={() => setSidebarOpen((v) => !v)}
          >
            <PanelLeft className="size-4" />
          </Button>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold">{active?.title ?? "SPC Intelligence"}</p>
            <p className="text-xs text-primary">
              {user ? SPACE_LABELS[user.role] : SPACE_LABELS.public}
            </p>
          </div>
          <Button
            size="icon"
            variant="ghost"
            aria-label="Changer de thème"
            className="cursor-pointer"
            onClick={toggleTheme}
          >
            {theme === "dark" ? <Sun className="size-4" /> : <Moon className="size-4" />}
          </Button>
          {active && (
            <Button
              size="icon"
              variant="ghost"
              aria-label="Détails de la conversation"
              className="cursor-pointer"
              onClick={() => setDetailsOpen(true)}
            >
              <Info className="size-4" />
            </Button>
          )}
          {!user && (
            <Button asChild size="sm" className="cursor-pointer md:px-3 px-2">
              <Link to="/login" title="Connexion">
                <LogIn className="size-4" />
                <span className="hidden md:inline">Connexion</span>
              </Link>
            </Button>
          )}
        </header>

        <main className="spc-scroll flex-1 overflow-y-auto">
          <div className="mx-auto w-full max-w-3xl px-4 py-6">
            {!active || active.messages.length === 0 ? (
              <div className="py-12 text-center">
                <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-card border border-border p-2">
                  <img src={botLogo} alt="SPC Intelligence" className="size-full object-contain" />
                </div>
                <h1 className="mt-4 text-2xl font-bold">Bonjour, je suis SPC Intelligence</h1>
                <p className="mt-2 text-sm text-muted-foreground">
                  L'assistant IA de l'écosystème STAF PRINT CENTER.
                </p>
                <div className="mt-6 grid gap-2 sm:grid-cols-2">
                  {SUGGESTIONS.map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => void handleSend(s, [])}
                      className="rounded-xl border border-border bg-card p-3 text-left text-sm transition-colors hover:border-primary cursor-pointer"
                    >
                      <Sparkles className="mb-1 size-4 text-primary" />
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {active.messages.map((m) => {
                  if (m.role === "user") {
                    return (
                      <div
                        key={m.id}
                        className="group flex gap-3 flex-row-reverse items-start"
                      >
                        <span className="grid size-8 shrink-0 place-items-center rounded-full bg-primary text-xs font-bold text-primary-foreground shadow-sm">
                          {userInitial}
                        </span>
                        <div className="flex flex-col items-end max-w-[80%]">
                          <div className="rounded-2xl rounded-tr-xs bg-primary px-4 py-2.5 text-sm text-primary-foreground">
                            <p className="whitespace-pre-wrap">{m.content}</p>
                            {(m.attachments ?? []).length > 0 && (
                              <div className="mt-3 space-y-2">
                                {m.attachments!.map((a) =>
                                  a.kind === "image" ? (
                                    <figure
                                      key={a.id}
                                      className="overflow-hidden rounded-xl border border-border bg-card"
                                    >
                                      <img src={a.dataUrl} alt={a.name} className="w-full" />
                                      <figcaption className="flex items-center justify-between p-2 text-xs text-muted-foreground">
                                        {a.name}
                                        <a
                                          href={a.dataUrl}
                                          download={a.name}
                                          className="text-primary cursor-pointer"
                                        >
                                          <Download className="size-4" />
                                        </a>
                                      </figcaption>
                                    </figure>
                                  ) : (
                                    <a
                                      key={a.id}
                                      href={a.dataUrl}
                                      download={a.name}
                                      className="flex items-center gap-2 rounded-xl border border-border bg-card-foreground/40 p-3 text-xs hover:border-primary cursor-pointer"
                                    >
                                      <Download className="size-4 text-primary" />
                                      {a.name}
                                    </a>
                                  ),
                                )}
                              </div>
                            )}
                          </div>
                          <CopyButton
                            value={m.content}
                            className="mt-1 opacity-0 max-md:opacity-100 transition-opacity group-hover:opacity-100 focus:opacity-100 cursor-pointer"
                          />
                        </div>
                      </div>
                    );
                  }

                  return (
                    <AssistantMessageItem
                      key={m.id}
                      message={m}
                      botLogo={botLogo}
                      isGenerating={isGeneratingText && m.id === latestAssistantMessageId}
                    />
                  );
                })}

                {loading && (
                  <div className="flex flex-col gap-2">
                    <ReasoningPanel reasoning="" live />
                    <div className="flex items-center gap-3">
                      <div className="relative grid size-8 shrink-0 place-items-center rounded-lg border border-border bg-card p-1 shadow-sm">
                        <div className="absolute inset-0 rounded-lg border-2 border-primary border-t-transparent animate-spin" />
                        <img src={botLogo} alt="SPC Bot" className="size-full object-contain" />
                      </div>
                      <p className="animate-pulse text-sm text-muted-foreground">
                        SPC Intelligence réfléchit…
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}
            <div ref={bottomRef} />
          </div>
        </main>

        <div className="border-t border-border bg-background px-4 py-3">
          <div className="mx-auto w-full max-w-3xl">
            <Composer
              disabled={loading || isGeneratingText}
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

          <p className="text-xs text-muted-foreground text-center mt-4">
            SPC Intelligence · Vérifiez les informations importantes.
          </p>
        </div>
      </div>

      <DetailsPanel conversation={active} open={detailsOpen} onOpenChange={setDetailsOpen} />
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
          <Button className="cursor-pointer" onClick={() => void navigate({ to: "/login" })}>
            Aller à la connexion
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}