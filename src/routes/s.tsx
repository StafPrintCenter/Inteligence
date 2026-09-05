import { createFileRoute, Link } from "@tanstack/react-router";
import { MessageSquare } from "lucide-react";
import { useEffect, useState } from "react";

import { CopyButton } from "@/components/spc/CopyButton";
import { Markdown } from "@/components/spc/Markdown";
import { SpcLogo } from "@/components/spc/SpcLogo";
import { Button } from "@/components/ui/button";
import { decodeShare, type SharedPayload } from "@/lib/spc/share";

export const Route = createFileRoute("/s")({
  head: () => ({
    meta: [
      { title: "Conversation partagée · SPC Intelligence" },
      {
        name: "description",
        content:
          "Lecture d'une conversation partagée avec SPC Intelligence, l'assistant IA de STAF PRINT CENTER.",
      },
      { property: "og:title", content: "Conversation partagée · SPC Intelligence" },
      {
        property: "og:description",
        content: "Consultez un échange partagé avec l'assistant IA STAF PRINT CENTER.",
      },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: SharedPage,
});

function SharedPage() {
  const [state, setState] = useState<"loading" | "error" | "ready">("loading");
  const [payload, setPayload] = useState<SharedPayload | null>(null);

  useEffect(() => {
    const token = window.location.hash.replace(/^#/, "");
    if (!token) {
      setState("error");
      return;
    }
    void decodeShare(token).then((data) => {
      if (!data) {
        setState("error");
        return;
      }
      setPayload(data);
      setState("ready");
      document.title = `${data.title} · Partagé — SPC Intelligence`;
    });
  }, []);

  return (
    <div className="min-h-dvh bg-background text-foreground">
      <header className="flex items-center gap-3 border-b border-border px-4 py-3">
        <span className="grid size-8 shrink-0 place-items-center overflow-hidden rounded-full border border-border bg-card p-1">
          <SpcLogo className="size-full" />
        </span>
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-sm font-semibold">
            {payload?.title ?? "Conversation partagée"}
          </h1>
          <p className="text-xs text-primary">Lecture seule · SPC Intelligence</p>
        </div>
        <Button asChild size="sm">
          <Link to="/">
            <MessageSquare className="size-4" /> Ouvrir le chat
          </Link>
        </Button>
      </header>

      <main className="mx-auto w-full max-w-3xl px-4 py-6">
        {state === "loading" && (
          <p className="text-sm text-muted-foreground">Chargement du partage…</p>
        )}
        {state === "error" && (
          <p className="text-sm text-muted-foreground">
            Ce lien de partage est invalide ou incomplet.
          </p>
        )}
        {state === "ready" && payload && (
          <div className="space-y-6">
            {payload.messages.map((m) => (
              <div key={m.id} className={`flex gap-3 ${m.role === "user" ? "flex-row-reverse" : ""}`}>
                <span
                  className={`grid size-8 shrink-0 place-items-center overflow-hidden rounded-full border border-border ${m.role === "user" ? "bg-accent text-xs font-bold" : "bg-card p-1"
                    }`}
                  aria-hidden
                >
                  {m.role === "user" ? "V" : <SpcLogo className="size-full" />}
                </span>
                <div
                  className={`flex min-w-0 flex-col ${m.role === "user" ? "items-end" : "items-start"}`}
                >
                  <div
                    className={
                      m.role === "user"
                        ? "max-w-full rounded-2xl rounded-tr-sm bg-primary px-4 py-2.5 text-sm text-primary-foreground"
                        : "min-w-0 max-w-full"
                    }
                  >
                    {m.role === "user" ? (
                      <p className="whitespace-pre-wrap">{m.content}</p>
                    ) : (
                      <Markdown>{m.content}</Markdown>
                    )}
                  </div>
                  <CopyButton value={m.content} className="mt-1" />
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
