import { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { SpcMobLogo } from "@/components/site";
import { Button } from "@/components/ui/button";
import { FacebookIcon, InstagramIcon, LinkedinIcon, XIcon, WhatsAppIcon } from "@/components/site/icons";
import { SITE, SITE_LINK } from "@/data/site";

interface CguLayoutProps {
  children: ReactNode;
}

export function CguLayout({ children }: CguLayoutProps) {
  const landingBase = SITE_LINK.landingUrl.replace(/\/$/, "");

  const socialLinks = [
    { label: "LinkedIn", href: SITE.socials.linkedin, Icon: LinkedinIcon },
    { label: "Facebook", href: SITE.socials.facebook, Icon: FacebookIcon },
    { label: "Instagram", href: SITE.socials.instagram, Icon: InstagramIcon },
    { label: "X", href: SITE.socials.x, Icon: XIcon },
    { label: "WhatsApp", href: SITE.whatsappLink, Icon: WhatsAppIcon },
  ];

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
      <footer className="border-t border-border/70">
        <div className="mx-auto flex min-h-16 w-full max-w-6xl flex-col items-center justify-between gap-4 px-6 py-4 sm:flex-row sm:py-3">
          {/* Copyright */}
          <p className="text-center text-xs text-muted-foreground sm:text-left">
            © {new Date().getFullYear()} {SITE.tool} · Tous droits réservés.
            <span className="mx-1.5 hidden text-muted-foreground/50 sm:inline">|</span>

            <a
              href={SITE_LINK.landingUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-1 block font-medium underline underline-offset-4 transition-colors hover:text-primary sm:mt-0 sm:inline"
            >
              {SITE.name}
            </a>
          </p>

          {/* Liens de navigation & Réseaux sociaux */}
          <div className="flex flex-col items-center gap-3 sm:flex-row sm:gap-4">
            {/* Liens légaux */}
            <nav
              aria-label="Liens légaux"
              className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-xs text-muted-foreground"
            >
              <a
                href={`${SITE_LINK.docsUrl}/docs/brief/parcours-de-qualification`}
                target="_blank"
                rel="noopener noreferrer"
                className="underline underline-offset-4 transition-colors hover:text-primary"
              >
                Lire la Documentation
              </a>

              <span className="text-muted-foreground/50">·</span>

              <a
                href={`${landingBase}/legal/privacy`}
                target="_blank"
                rel="noopener noreferrer"
                className="underline underline-offset-4 transition-colors hover:text-primary"
              >
                Confidentialité
              </a>

              <span className="text-muted-foreground/50">·</span>

              <Link
                to="/cgu"
                className="underline underline-offset-4 transition-colors hover:text-primary"
              >
                Conditions Générales d'Utilisation
              </Link>
            </nav>

            <span className="hidden text-muted-foreground/30 sm:inline">|</span>

            {/* Réseaux sociaux */}
            <div className="flex items-center gap-2">
              {socialLinks.map(({ label, href, Icon }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-primary"
                >
                  <Icon className="size-4" />
                </a>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}