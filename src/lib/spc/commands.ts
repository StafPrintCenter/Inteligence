export type SpcCommand = {
  trigger: "/" | "@";
  key: string;
  label: string;
  description: string;
  /** Texte inséré dans le composer à la place du token. */
  insert: string;
};

export const SPC_COMMANDS: SpcCommand[] = [
  {
    trigger: "/",
    key: "image",
    label: "/image",
    description: "Générer un visuel (affiche, flyer, bannière)",
    insert: "Génère une image : ",
  },
  {
    trigger: "/",
    key: "document",
    label: "/document",
    description: "Générer un document téléchargeable",
    insert: "Rédige un document structuré : ",
  },
  {
    trigger: "/",
    key: "devis",
    label: "/devis",
    description: "Créer un devis d'impression",
    insert: "Rédige un devis détaillé STAF PRINT pour : ",
  },
  {
    trigger: "/",
    key: "resume",
    label: "/resume",
    description: "Résumer le fichier ou le texte fourni",
    insert: "Résume de façon structurée : ",
  },
  {
    trigger: "/",
    key: "analyse",
    label: "/analyse",
    description: "Analyser en détail les fichiers joints",
    insert: "Analyse en détail les fichiers joints et relève les points clés : ",
  },
  {
    trigger: "/",
    key: "traduire",
    label: "/traduire",
    description: "Traduire un contenu",
    insert: "Traduis le contenu suivant en anglais : ",
  },
  {
    trigger: "@",
    key: "ecosysteme",
    label: "@ecosysteme",
    description: "Contexte : écosystème STAF PRINT CENTER",
    insert: "@ecosysteme (contexte : stafprint.com/tools/ecosystem) ",
  },
  {
    trigger: "@",
    key: "impression",
    label: "@impression",
    description: "Contexte : services d'impression & print",
    insert: "@impression (contexte : services d'impression et print & design) ",
  },
  {
    trigger: "@",
    key: "formation",
    label: "@formation",
    description: "Contexte : formations et espace apprenant",
    insert: "@formation (contexte : catalogue de formations STAF PRINT) ",
  },
  {
    trigger: "@",
    key: "client",
    label: "@client",
    description: "Contexte : espace client",
    insert: "@client (contexte : espace client STAF PRINT) ",
  },
  {
    trigger: "@",
    key: "formateur",
    label: "@formateur",
    description: "Contexte : espace formateur",
    insert: "@formateur (contexte : espace formateur STAF PRINT) ",
  },
];

/** Détecte un token `/xxx` ou `@xxx` en cours de saisie juste avant le curseur. */
export function detectToken(
  value: string,
  caret: number,
): { trigger: "/" | "@"; query: string; start: number } | null {
  const before = value.slice(0, caret);
  const match = /(^|\s)([/@])([\p{L}\p{N}_-]*)$/u.exec(before);
  if (!match) return null;
  return {
    trigger: match[2] as "/" | "@",
    query: (match[3] ?? "").toLowerCase(),
    start: caret - (match[3]?.length ?? 0) - 1,
  };
}
