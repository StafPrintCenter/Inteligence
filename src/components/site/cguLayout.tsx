import { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { SpcMobLogo } from "@/components/site";
import { Button } from "@/components/ui/button";
import { SITE } from "@/data/site";

interface CguLayoutProps {
  children: ReactNode;
}

export function CguLayout({ children }: CguLayoutProps) {
  return (
    <div className="min-h-dvh bg-background text-foreground">
      {/* En-tête de navigation */}
      <header className="sticky top-0 z-20 border-b border-border/60 bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-3 sm:px-6">
          <Link to="/" className="flex items-center gap-2.5 transition hover:opacity-90">
            <SpcMobLogo className="size-8" />
            <div className="text-left">
              <p className="text-sm font-bold leading-tight tracking-tight">{SITE.tool}</p>
              <p className="text-xs text-muted-foreground">ai.stafprint.com</p>
            </div>
          </Link>

          <Button asChild variant="ghost" size="sm" className="gap-2">
            <Link to="/">
              <ArrowLeft className="size-4" />
              <span>Retour au chat</span>
            </Link>
          </Button>
        </div>
      </header>

      {/* Contenu principal transmis via children */}
      <main className="mx-auto max-w-4xl px-4 py-10 sm:px-6 sm:py-14">
        {children}
      </main>

      {/* Pied de page */}
      <footer className="border-t border-border/60 py-6 text-center text-xs text-muted-foreground">
        <p>© 2026 {SITE.name} · Tous droits réservés · Porto-Novo, Bénin.</p>
      </footer>
    </div>
  );
}