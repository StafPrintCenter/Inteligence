import { Link } from "@tanstack/react-router";
import { Home, ArrowLeft, Terminal } from "lucide-react";

export function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-6 md:p-12 select-none">
      <div className="grid w-full max-w-4xl gap-8 items-center md:grid-cols-12 md:gap-16">

        {/* Colonne Gauche : Terminal Sombre / Console d'erreur */}
        <div className="md:col-span-5 flex flex-col items-center justify-center relative min-h-60 md:min-h-75">
          <div className="relative w-full max-w-xs rounded-2xl border border-slate-800 bg-black p-4 shadow-2xl font-mono text-xs text-slate-200">
            {/* Header de la fenêtre Terminal */}
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800">
              <div className="flex gap-1.5">
                <span className="w-3 h-3 rounded-full bg-rose-500/90 inline-block" />
                <span className="w-3 h-3 rounded-full bg-amber-500/90 inline-block" />
                <span className="w-3 h-3 rounded-full bg-emerald-500/90 inline-block" />
              </div>
              <span className="text-[10px] text-slate-500">docs_query.ts</span>
            </div>

            {/* Contenu de la console */}
            <div className="space-y-1.5">
              <p className="text-slate-500">// Recherche dans la base documentaire</p>
              <p>
                <span className="text-purple-400">const</span> doc ={" "}
                <span className="text-blue-400">await</span> docs.
                <span className="text-amber-300">rechercher</span>(chemin);
              </p>
              <p className="text-rose-400 pt-1">❌ Erreur : BRANCHE_DOC_INTROUVABLE</p>
              <p className="text-slate-400 pl-3 border-l border-rose-500/40">
                Aucun guide ne correspond à l'adresse renseignée.
              </p>
              <div className="flex items-center gap-1 text-emerald-400 pt-2">
                <span>&gt;</span>
                <span className="animate-pulse">_</span>
              </div>
            </div>
          </div>

          {/* Badge sous la console */}
          <span className="absolute -bottom-3 px-3 py-1 text-[11px] font-mono font-bold tracking-widest text-destructive bg-destructive/10 border border-destructive/20 rounded-full">
            BRANCHE_MANQUANTE
          </span>
        </div>

        {/* Colonne Droite : Explications & Navigation */}
        <div className="md:col-span-7 text-center md:text-left flex flex-col justify-center">
          <div className="inline-flex mx-auto md:mx-0 items-center gap-1.5 px-3 py-1 text-xs font-medium text-muted-foreground bg-muted border border-border/60 rounded-full w-fit">
            <Terminal size={12} className="text-primary" />
            Route hors index
          </div>

          <h1 className="mt-4 font-display text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
            Branche introuvable.
          </h1>

          <p className="mt-4 text-base text-muted-foreground leading-relaxed max-w-lg">
            La rubrique, la référence ou le guide demandé n'existe pas dans le sommaire actuel. Le fichier a peut-être été déplacé ou renommé.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center gap-3 justify-center md:justify-start">
            <Link
              to="/"
              className="inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-md transition hover:opacity-90 active:scale-95 cursor-pointer"
            >
              <Home size={16} />
              Sommaire principal
            </Link>

            <button
              onClick={() => window.history.back()}
              className="inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-full border border-border bg-card px-6 py-3 text-sm font-semibold text-foreground transition hover:bg-muted active:scale-95 cursor-pointer"
            >
              <ArrowLeft size={16} />
              Page précédente
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}