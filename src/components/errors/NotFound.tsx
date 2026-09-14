import { Link } from "@tanstack/react-router";
import {
  ArrowLeft,
  Bot,
  Home,
  MessageSquareOff,
  Search,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export function NotFoundComponent() {
  return (
    <div className="relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-background p-6 text-foreground select-none">
      {/* Grille de fond */}
      <div className="pointer-events-none absolute inset-0 paper-grid opacity-70" />

      {/* Halo décoratif */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-1/2 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/5 blur-3xl"
      />

      <main className="relative z-10 w-full max-w-3xl">
        <div className="overflow-hidden rounded-3xl border border-border/70 bg-card/80 shadow-panel backdrop-blur-xl">

          {/* Barre supérieure façon conversation */}
          <div className="flex items-center justify-between border-b border-border/60 px-5 py-3.5">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Bot className="h-4 w-4" />
              </div>

              <div>
                <p className="text-sm font-semibold text-foreground">
                  Assistant IA
                </p>
                <p className="font-mono text-[10px] text-muted-foreground">
                  conversation
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 rounded-full border border-border/60 bg-muted/50 px-2.5 py-1">
              <span className="h-1.5 w-1.5 rounded-full bg-destructive" />
              <span className="font-mono text-[10px] font-medium text-muted-foreground">
                CONTEXTE_INTROUVABLE
              </span>
            </div>
          </div>

          {/* Conversation */}
          <div className="px-6 py-12 md:px-12 md:py-16">

            {/* Message utilisateur */}
            <div className="ml-auto flex max-w-md items-start gap-3">
              <div className="flex-1 rounded-2xl rounded-tr-md bg-muted px-4 py-3">
                <p className="font-mono text-xs text-muted-foreground">
                  Où est ma conversation ?
                </p>
              </div>

              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-border bg-background text-muted-foreground">
                <Search className="h-3.5 w-3.5" />
              </div>
            </div>

            {/* Réponse IA */}
            <div className="mt-6 flex items-start gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Sparkles className="h-4 w-4" />
              </div>

              <div className="max-w-xl">
                <div className="rounded-2xl rounded-tl-md border border-border/60 bg-background px-5 py-4">
                  <div className="mb-3 flex items-center gap-2">
                    <MessageSquareOff className="h-4 w-4 text-destructive" />
                    <span className="font-mono text-xs font-semibold text-destructive">
                      ERREUR_404
                    </span>
                  </div>

                  <h1 className="font-display text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">
                    Cette conversation n'existe pas.
                  </h1>

                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                    Le fil que vous cherchez est introuvable. Il a peut-être
                    été supprimé, déplacé ou l'adresse utilisée n'est plus
                    valide.
                  </p>
                </div>

                {/* Indicateur de contexte */}
                <div className="mt-3 flex items-center gap-2 px-1 font-mono text-[10px] text-muted-foreground/70">
                  <span className="h-1.5 w-1.5 rounded-full bg-destructive/70" />
                  contexte = null
                  <span className="text-border">•</span>
                  thread = 404
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:pl-12">
              <Button asChild size="lg" className="w-full sm:w-auto">
                <Link to="/">
                  <Home className="mr-2 h-4 w-4" />
                  Nouvelle conversation
                </Link>
              </Button>

              <Button
                variant="outline"
                size="lg"
                className="w-full sm:w-auto"
                onClick={() => window.history.back()}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Retour
              </Button>
            </div>
          </div>

          {/* Barre inférieure */}
          <div className="flex items-center justify-between border-t border-border/60 bg-muted/20 px-5 py-3">
            <span className="font-mono text-[10px] text-muted-foreground">
              SYSTEM_STATUS: OPERATIONAL
            </span>

            <span className="font-mono text-[10px] text-muted-foreground/60">
              response.status = 404
            </span>
          </div>
        </div>
      </main>
    </div>
  );
}
