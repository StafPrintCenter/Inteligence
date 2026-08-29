import { useRouter, Link } from "@tanstack/react-router";
import { useEffect } from "react";
import { AlertCircle, RefreshCw, BookOpen, Terminal } from "lucide-react";
import { reportError } from "@/lib/error/reporting";
import { SITE } from "@/data/site";

export function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();

  useEffect(() => {
    reportError(error, { boundary: "docs_root_error_component" });
  }, [error]);

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-background px-6 py-12 overflow-hidden bg-grain select-none">
      {/* Effet visuel d'erreur */}
      <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-destructive/8 blur-[100px] pointer-events-none" />

      <div className="relative z-10 max-w-xl w-full">
        <div className="rounded-3xl border border-border bg-card p-8 md:p-10 shadow-xl backdrop-blur-sm">
          {/* En-tête de l'erreur */}
          <div className="flex items-center gap-4 mb-6">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-destructive/10 text-destructive">
              <AlertCircle className="h-6 w-6" strokeWidth={1.5} />
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-bold text-foreground font-display">
                Erreur de rendu de la documentation
              </h1>
              <p className="text-sm text-muted-foreground mt-0.5">
                Un problème technique est survenu lors du chargement de la documentation {SITE.name}.
              </p>
            </div>
          </div>

          {/* Console / Stack trace pour développeurs/utilisateurs */}
          <div className="my-6 rounded-2xl bg-muted p-4 border border-border/60 max-h-40 overflow-y-auto font-mono text-xs text-muted-foreground leading-relaxed">
            <div className="flex items-center gap-1.5 text-foreground/70 mb-2 pb-1.5 border-b border-border/40 font-sans font-medium">
              <Terminal className="h-3.5 w-3.5 text-destructive" />
              <span>Détails de l'exception</span>
            </div>
            <p className="font-semibold text-foreground mb-1">{error?.name || "Error"}</p>
            <p className="whitespace-pre-wrap">{error?.message || "Erreur indéterminée dans le composant de doc."}</p>
          </div>

          {/* Boutons d'action */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-end gap-3">
            <button
              onClick={() => {
                router.invalidate();
                reset();
              }}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground shadow-md transition-all duration-300 hover:bg-primary/95 hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
            >
              <RefreshCw className="h-4 w-4" />
              Recharger la page
            </button>
            <Link
              to="/"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border border-input bg-card px-5 py-3 text-sm font-semibold text-foreground transition-all duration-300 hover:bg-muted hover:-translate-y-0.5 active:translate-y-0"
            >
              <BookOpen className="h-4 w-4" />
              Index des docs
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}