import { useServerFn } from "@tanstack/react-start";
import { ExternalLink, RotateCcw, X } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { MessageList } from "@/components/conversation/message";
import { ComposerBlock } from "@/components/conversation/composer";
import { SpcMobLogo } from "@/components/site";
import { Button } from "@/components/ui/button";
import { extractTitle } from "@/lib/spc/actions";
import { chatWithSpc } from "@/lib/spc/gemini.functions";
import {
  consumeAnonQuota,
  consumeUserQuota,
  formatCooldown,
  getAnonQuota,
  getTheme,
  getUser,
  getUserQuota,
  setTheme,
  uid,
} from "@/lib/spc/store";
import { toTurns } from "@/lib/spc/turns";
import type { SpcAttachment, SpcMessage, SpcUser } from "@/lib/spc/types";

type HostContext = { app?: string; url?: string; title?: string; text?: string };

const STORE_KEY = "spc.embed.messages";

/** Volet compact affiché dans l'iframe du widget (ai.stafprint.com/embed). */
export function EmbedChat({ app }: { app: string }) {
  const ask = useServerFn(chatWithSpc);
  const [ready, setReady] = useState(false);
  const [user, setUser] = useState<SpcUser | null>(null);
  const [messages, setMessages] = useState<SpcMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [failed, setFailed] = useState(false);
  const [animatedId, setAnimatedId] = useState<string | null>(null);
  const [prefill, setPrefill] = useState<{ text: string; n: number } | undefined>();
  const ctxRef = useRef<HostContext>({ app });
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setTheme(getTheme());
    setUser(getUser());
    try {
      setMessages(JSON.parse(sessionStorage.getItem(`${STORE_KEY}.${app}`) ?? "[]"));
    } catch {
      /* ignore */
    }
    setReady(true);

    /* Réception du contexte envoyé par la page hôte */
    const onMsg = (e: MessageEvent) => {
      const d = e.data as { type?: string; context?: HostContext; prompt?: string } | null;
      if (!d || typeof d !== "object") return;
      if (d.type === "spc:context" && d.context) ctxRef.current = { ...d.context, app };
      if (d.type === "spc:prompt" && typeof d.prompt === "string")
        setPrefill({ text: d.prompt.slice(0, 4000), n: Date.now() });
    };
    window.addEventListener("message", onMsg);
    window.parent?.postMessage({ type: "spc:ready" }, "*");
    return () => window.removeEventListener("message", onMsg);
  }, [app]);

  useEffect(() => {
    if (ready) sessionStorage.setItem(`${STORE_KEY}.${app}`, JSON.stringify(messages));
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading, ready, app]);

  const complete = useCallback(
    async (history: SpcMessage[]) => {
      setLoading(true);
      setFailed(false);
      try {
        const result = await ask({ data: { turns: toTurns(history), context: ctxRef.current } });
        const { text } = extractTitle(result.text);
        const reply: SpcMessage = {
          id: uid(),
          role: "assistant",
          content: text,
          createdAt: Date.now(),
          attachments: [],
          reasoning: result.reasoning,
          sources: result.sources,
        };
        setAnimatedId(reply.id);
        setMessages([...history, reply]);
      } catch {
        setFailed(true);
        toast.error("Impossible de contacter SPC Intelligence. Réessayez.");
      } finally {
        setLoading(false);
      }
    },
    [ask],
  );

  const send = useCallback(
    (text: string, attachments: SpcAttachment[]) => {
      if (user) {
        const q = getUserQuota(user.id);
        if (q.blocked) {
          toast.error(`Limite atteinte. Renouvellement dans ${formatCooldown(q.blockedUntil)}.`);
          return;
        }
        consumeUserQuota(user.id);
      } else {
        if (getAnonQuota().left <= 0) {
          toast.error("Vos 3 messages gratuits du jour sont utilisés. Connectez-vous sur ai.stafprint.com.");
          return;
        }
        consumeAnonQuota();
      }
      const msg: SpcMessage = {
        id: uid(),
        role: "user",
        content: text,
        createdAt: Date.now(),
        attachments: user ? attachments : [],
      };
      const next = [...messages, msg];
      setMessages(next);
      void complete(next);
    },
    [complete, messages, user],
  );

  if (!ready) return <div className="h-dvh bg-background" />;

  return (
    <div className="flex h-dvh flex-col overflow-hidden bg-background text-foreground">
      <header className="flex items-center gap-2 border-b border-border px-3 py-2">
        <SpcMobLogo className="h-7 w-7" />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold">SPC Intelligence</p>
          <p className="truncate text-xs text-muted-foreground">Assistant de l'écosystème STAF PRINT</p>
        </div>
        <Button
          size="icon"
          variant="ghost"
          aria-label="Nouvelle discussion"
          title="Nouvelle discussion"
          disabled={loading}
          onClick={() => setMessages([])}
        >
          <RotateCcw className="h-4 w-4" />
        </Button>
        <Button size="icon" variant="ghost" asChild aria-label="Ouvrir en plein écran">
          <a href="/" target="_blank" rel="noopener noreferrer" title="Ouvrir ai.stafprint.com">
            <ExternalLink className="h-4 w-4" />
          </a>
        </Button>
        <Button
          size="icon"
          variant="ghost"
          aria-label="Fermer"
          onClick={() => window.parent?.postMessage({ type: "spc:close" }, "*")}
        >
          <X className="h-4 w-4" />
        </Button>
      </header>

      <main className="spc-scroll flex-1 overflow-y-auto px-3 py-4">
        {messages.length === 0 ? (
          <div className="mt-10 space-y-3 text-center">
            <SpcMobLogo className="mx-auto h-12 w-12" />
            <p className="text-base font-semibold">Comment puis-je vous aider ?</p>
            <p className="text-sm text-muted-foreground">
              Je tiens compte de la page sur laquelle vous êtes.
            </p>
            <div className="flex flex-col gap-2 pt-2">
              {["Explique-moi cette page", "Aide-moi à remplir ce formulaire", "Demander un devis"].map(
                (s) => (
                  <Button key={s} variant="outline" size="sm" onClick={() => send(s, [])}>
                    {s}
                  </Button>
                ),
              )}
            </div>
          </div>
        ) : (
          <MessageList
            messages={messages}
            userName={user?.name ?? "Visiteur"}
            loading={loading}
            animatedId={animatedId}
            retryMessageId={failed ? (messages.at(-1)?.id ?? null) : null}
            onRetry={() => void complete(messages)}
            onSuggest={(p) => setPrefill({ text: p, n: Date.now() })}
          />
        )}
        <div ref={bottomRef} />
      </main>

      <div className="border-t border-border px-2 py-2">
        <ComposerBlock
          disabled={loading}
          canUpload={Boolean(user)}
          quotaLabel={null}
          onBlockedUpload={() => toast.info("Connectez-vous sur ai.stafprint.com pour envoyer des fichiers.")}
          onSend={send}
          {...(prefill ? { initialText: prefill.text, prefillKey: prefill.n } : {})}
        />
      </div>
    </div>
  );
}
