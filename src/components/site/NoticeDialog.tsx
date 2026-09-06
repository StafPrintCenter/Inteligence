import { ShieldCheck } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export function NoticeDialog({ open, onAccept }: { open: boolean; onAccept: () => void }) {
  return (
    <Dialog open={open}>
      <DialogContent className="w-[calc(100%-2rem)] max-w-lg mx-auto rounded-xl p-4 sm:p-6 gap-4">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShieldCheck className="size-5 text-primary" /> Avant de discuter
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-3 text-sm text-muted-foreground">
          <p>
            SPC Intelligence est l'assistant IA de STAF PRINT CENTER. Les réponses sont générées
            automatiquement et peuvent contenir des erreurs : vérifiez toute information avant usage
            professionnel.
          </p>
          <ul className="list-disc space-y-1 pl-5">
            <li>Ne partagez aucune donnée sensible ou confidentielle.</li>
            <li>
              Les conversations sont stockées localement dans votre navigateur et liées à votre
              compte.
            </li>
            <li>Visiteurs anonymes : 3 messages par jour, sans envoi de fichiers.</li>
          </ul>
        </div>
        <div>
          <Button className="w-full cursor-pointer" onClick={onAccept}>
            J&apos;accepte les conditions d&apos;utilisation
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
