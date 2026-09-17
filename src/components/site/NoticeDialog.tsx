import { useState } from "react";
import { ShieldCheck, BarChart2, AlertCircle, Lock, HardDrive } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { updateGaConsent } from "@/components/site/CookieConsent";
import { SITE, SITE_LINK } from "@/data/site";

export function NoticeDialog({ open, onAccept }: { open: boolean; onAccept: () => void }) {
  const [analyticsEnabled, setAnalyticsEnabled] = useState(true);

  const handleAccept = () => {
    updateGaConsent(analyticsEnabled ? "accepted" : "declined");
    onAccept();
  };

  return (
    <Dialog open={open}>
      <DialogContent className="w-[calc(100%-2rem)] max-w-lg mx-auto rounded-2xl p-5 sm:p-6 gap-4">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <span className="flex size-9 items-center justify-center rounded-xl bg-primary/15 text-primary">
              <ShieldCheck className="size-5" />
            </span>
            Avant de discuter
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-3 text-sm">
          <p className="text-muted-foreground">
            {SITE.name} met à votre disposition l'assistant {SITE.tool}. Prenez connaissance des règles d'utilisation avant de commencer.
          </p>

          <ul className="space-y-2 text-xs sm:text-sm">
            <li className="flex gap-2.5 rounded-xl border border-border bg-secondary/40 p-3">
              <AlertCircle className="mt-0.5 size-4 shrink-0 text-primary" />
              <span>
                <strong>Génération IA :</strong> Les réponses sont générées automatiquement et peuvent contenir des erreurs. Vérifiez toute information stratégique.
              </span>
            </li>

            <li className="flex gap-2.5 rounded-xl border border-border bg-secondary/40 p-3">
              <Lock className="mt-0.5 size-4 shrink-0 text-primary" />
              <span>
                <strong>Confidentialité :</strong> Ne partagez aucun mot de passe, donnée bancaire ou document strictement confidentiel.
              </span>
            </li>

            <li className="flex gap-2.5 rounded-xl border border-border bg-secondary/40 p-3">
              <HardDrive className="mt-0.5 size-4 shrink-0 text-primary" />
              <span>
                <strong>Stockage local :</strong> Vos conversations sont conservées dans votre navigateur. Visiteurs anonymes : limite de 3 messages par jour.
              </span>
            </li>
          </ul>

          {/* Option Analytics intégrée */}
          <div className="rounded-xl border border-border bg-secondary/20 p-3.5">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <BarChart2 className="size-4 shrink-0 text-primary" />
                <div>
                  <p className="text-sm font-semibold leading-none text-foreground">
                    Google Analytics
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Mesure anonyme d'audience pour améliorer l'assistant.
                  </p>
                </div>
              </div>
              <label className="relative inline-flex cursor-pointer items-center shrink-0">
                <input
                  type="checkbox"
                  checked={analyticsEnabled}
                  onChange={(e) => setAnalyticsEnabled(e.target.checked)}
                  className="peer sr-only"
                />
                <div className="peer h-5 w-9 rounded-full bg-border after:absolute after:left-0.5 after:top-0.5 after:h-4 after:w-4 after:rounded-full after:bg-white after:transition-all after:content-[''] peer-checked:bg-primary peer-checked:after:translate-x-full peer-focus:outline-none"></div>
              </label>
            </div>
          </div>

          <p className="text-xs text-muted-foreground pt-1">
            En continuant, vous acceptez nos conditions d'utilisation. En savoir plus dans nos{" "}
            <a
              href={`${SITE_LINK.landingUrl}/legal/mentions#cookies`}
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-primary"
            >
              mentions légales
            </a>.
          </p>
        </div>

        <Button className="w-full cursor-pointer mt-1" onClick={handleAccept}>
          J&apos;accepte et je commence
        </Button>
      </DialogContent>
    </Dialog>
  );
}