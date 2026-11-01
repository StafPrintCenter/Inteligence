import { ExternalLink, History, Plus, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { MessageList } from "@/components/conversation/message";
import { ComposerBlock } from "@/components/conversation/composer";
import { EmbedHistory } from "@/components/spc/EmbedHistory";
import { SpcMobLogo } from "@/components/site";
import { Button } from "@/components/ui/button";
import { useEmbedChat } from "@/lib/spc/useEmbedChat";

/** Volet compact : même historique local que le chat principal. */
export function EmbedChat({ app }: { app: string }) {
  const chat = useEmbedChat(app);
  const [historyOpen, setHistoryOpen] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!historyOpen) bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chat.active?.messages.length, chat.loading, historyOpen]);

  if (!chat.ready) return <div className="h-dvh bg-background" />;

  const fullScreenPath = chat.active ? `/c/${encodeURIComponent(chat.active.id)}` : "/";
  const lastMessage = chat.active?.messages.at(-1);
  const canRetry = lastMessage?.role === "user" && !chat.loading;

  return (
    <div className="flex h-dvh flex-col overflow-hidden bg-background text-foreground">
      <header className="flex items-center gap-1 border-b border-border px-3 py-2">
        <SpcMobLogo className="h-7 w-7 shrink-0" />
        <div className="min-w-0 flex-1 pl-1">
          <p className="truncate text-sm font-semibold">
            SPC Intelligence
          </p>
          <p
            className="truncate text-xs text-muted-foreground"
            title={chat.user?.email}>
            {chat.user?.space ?? "Espace Public"}
          </p>
        </div>

        <Button
          size="icon"
          variant={historyOpen ? "secondary" : "ghost"}
          aria-label="Historique des conversations"
          title="Historique des conversations"
          aria-pressed={historyOpen}
          onClick={() => setHistoryOpen(!historyOpen)}
        >
          <History className="size-4" />
        </Button>

        <Button
          size="icon"
          variant="ghost"
          aria-label="Nouvelle discussion"
          title="Nouvelle discussion"
          disabled={chat.loading}
          onClick={() => { chat.newChat(); setHistoryOpen(false); }}
        >
          <Plus className="size-4" />
        </Button>

        <Button
          size="icon"
          variant="ghost"
          asChild
          aria-label="Ouvrir en plein écran">
          <a href={fullScreenPath}
            target="_blank"
            rel="noopener noreferrer"
            title="Ouvrir ai.stafprint.com"
          >
            <ExternalLink className="size-4" />
          </a>
        </Button>

        <Button
          size="icon"
          variant="ghost"
          aria-label="Fermer"
          title="Fermer"
          onClick={chat.close}
        >
          <X className="size-4" />
        </Button>
      </header>

      {chat.user &&
        <div className="border-b border-border px-3 py-1.5">
          <p className="truncate text-xs text-muted-foreground" title={chat.user.email}>
            {chat.user.name} · {chat.user.email}
          </p>
        </div>
      }

      {!historyOpen && chat.active &&
        <div className="border-b border-border px-3 py-2">
          <p className="truncate text-sm font-medium" title={chat.active.title}>
            {chat.active.title}
          </p>
        </div>
      }

      <main className="spc-scroll min-h-0 flex-1 overflow-y-auto px-3 py-4">
        {historyOpen ?
          <EmbedHistory
            conversations={chat.conversations}
            activeId={chat.active?.id}
            onSelect={(id) => { chat.select(id); setHistoryOpen(false); }}
          /> : !chat.active?.messages.length
            ? (
              <div className="mt-10 space-y-3 text-center">
                <SpcMobLogo className="mx-auto h-12 w-12" />
                <p className="text-base font-semibold">
                  Comment puis-je vous aider ?
                </p>

                <p className="text-sm text-muted-foreground">
                  Je tiens compte de la page sur laquelle vous êtes.
                </p>

                <div className="flex flex-col gap-2 pt-2">
                  {[
                    "Explique-moi cette page",
                    "Aide-moi à remplir ce formulaire",
                    "Demander un devis"].map((s) =>
                      <Button
                        key={s}
                        variant="outline"
                        size="sm"
                        disabled={chat.loading}
                        onClick={() => chat.send(s, [])}>{s}
                      </Button>
                    )}
                </div>
              </div>
            ) : <MessageList
              messages={chat.active.messages}
              userName={chat.user?.name ?? "Visiteur"}
              loading={chat.loading}
              animatedId={chat.animatedId}
              retryMessageId={canRetry ? lastMessage?.id ?? null : null}
              onRetry={chat.retry}
              onSuggest={chat.suggest}
            />
        }
        <div ref={bottomRef} />
      </main>

      {!historyOpen &&
        <div className="border-t border-border px-2 py-2">
          <ComposerBlock
            disabled={chat.loading}
            canUpload={Boolean(chat.user)}
            quotaLabel={chat.quotaLabel}
            onBlockedUpload={() => toast.info("Connectez-vous sur ai.stafprint.com pour envoyer des fichiers.")}
            onSend={chat.send}
            {...(chat.prefill
              ? { initialText: chat.prefill.text, prefillKey: chat.prefill.n }
              : {})}
          />
        </div>}
    </div>
  );
}
