import { Sparkles } from "lucide-react";

import { SpcLogo } from "@/components/spc/SpcLogo";

const SUGGESTIONS = [
  "Présente-moi l'écosystème STAF PRINT CENTER",
  "Quels services d'impression proposez-vous ?",
  "Rédige un devis type pour 500 flyers A5",
  "Comment fonctionne l'espace apprenant ?",
];

export function WelcomeScreen({ onPick }: { onPick: (prompt: string) => void }) {
  return (
    <div className="py-12 text-center">
      <SpcLogo className="mx-auto h-14 w-auto" />
      <h1 className="mt-4 text-2xl font-bold">Bonjour, je suis SPC Intelligence</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        L'assistant IA de l'écosystème STAF PRINT CENTER.
      </p>
      <div className="mt-6 grid gap-2 sm:grid-cols-2">
        {SUGGESTIONS.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => onPick(s)}
            className="rounded-xl border border-border bg-card p-3 text-left text-sm transition-colors hover:border-primary cursor-pointer"
          >
            <Sparkles className="mb-1 size-4 text-primary" />
            {s}
          </button>
        ))}
      </div>
    </div>
  );
}
