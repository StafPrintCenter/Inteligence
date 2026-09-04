import { Sparkles } from "lucide-react";
import { useMemo } from "react";

import { SpcLogo } from "@/components/spc/SpcLogo";

const SUGGESTIONS = [
  "Présente-moi l'écosystème STAF PRINT CENTER",
  "Quels services d'impression proposez-vous ?",
  "Rédige un devis type pour 500 flyers A5",
  "Comment fonctionne l'espace apprenant ?",
  "Quels sont vos tarifs pour des cartes de visite ?",
  "Quelles formations sont disponibles en ce moment ?",
  "Explique-moi la différence entre CMJN et RVB",
  "Prépare un cahier des charges pour une identité visuelle",
  "Comment suivre l'avancement de ma commande ?",
  "Quels formats de fichiers dois-je fournir pour l'impression ?",
  "Crée une page HTML de présentation aux couleurs STAF PRINT",
  "Rédige une fiche produit pour une banderole grand format",
  "Comment fonctionne l'espace formateur ?",
  "Résume la documentation de la plateforme",
  "Propose un planning de formation sur 5 jours",
  "Quels supports publicitaires conseilles-tu pour un lancement ?",
];

/** Salutations dynamiques selon l'heure locale de l'utilisateur. */
function greetings(hour: number): string[] {
  if (hour >= 5 && hour < 12) {
    return [
      "Bonjour {name} 👋 Que puis-je faire pour vous ?",
      "Bonjour {name}, matinée démarrée ?",
      "Belle matinée {name} ! On commence par quoi ?",
      "Bonjour {name}, prêt(e) à avancer sur vos projets ?",
    ];
  }
  if (hour >= 12 && hour < 14) {
    return [
      "Bon appétit {name} ! Une question en attendant ?",
      "Bonjour {name}, pause déjeuner productive ?",
      "Bon midi {name}. Que puis-je faire pour vous ?",
    ];
  }
  if (hour >= 14 && hour < 18) {
    return [
      "Bon après-midi {name} ! Que puis-je faire pour vous ?",
      "Bon après-midi {name}, on continue sur vos projets ?",
      "Ravi de vous revoir {name}. Par quoi commençons-nous ?",
    ];
  }
  if (hour >= 18 && hour < 23) {
    return [
      "Bonsoir {name} 👋 Que puis-je faire pour vous ?",
      "Bonsoir {name}, une dernière tâche avant de clôturer ?",
      "Bonsoir {name}, on finalise quelque chose ensemble ?",
    ];
  }
  return [
    "Il se fait tard, {name}, on continue ?",
    "Bonne nuit {name}… ou séance créative nocturne ?",
    "Encore debout {name} ? Je reste à vos côtés.",
    "La nuit porte conseil, {name}. Que préparons-nous ?",
  ];
}

const ANON_NAMES = [
  "ami(e)",
  "curieux(se)",
  "compagnon(ne)",
  "explorateur(rice)",
  "aventurier(ère)",
  "créatif(ve)",
  "innovateur(rice)",
  "penseur(se)",
  "collaborateur(rice)",
  "visionnaire",
];

function pick<T>(list: T[]): T {
  return list[Math.floor(Math.random() * list.length)]!;
}

function shuffle<T>(list: T[]): T[] {
  const copy = [...list];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j]!, copy[i]!];
  }
  return copy;
}

export function WelcomeScreen({
  onPick,
  userName,
}: {
  onPick: (prompt: string) => void;
  userName?: string | null;
}) {
  // Tirage effectué une seule fois par montage, côté client (évite tout écart d'hydratation).
  const greeting = useMemo(() => {
    const name = userName?.trim() || pick(ANON_NAMES);
    return pick(greetings(new Date().getHours())).replace("{name}", name);
  }, [userName]);

  const suggestions = useMemo(() => shuffle(SUGGESTIONS).slice(0, 4), []);

  return (
    <div className="py-12 text-center">
      <SpcLogo className="mx-auto h-14 w-auto" />
      <h1 className="mt-4 text-2xl font-bold">{greeting}</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Je suis SPC Intelligence, l'assistant IA de l'écosystème STAF PRINT CENTER.
      </p>
      <div className="mt-6 grid gap-2 sm:grid-cols-2">
        {suggestions.map((s) => (
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
