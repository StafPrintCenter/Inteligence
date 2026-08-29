export type GeminiPart = { text?: string; inlineData?: { mimeType: string; data: string } };
export type GeminiTurn = { role: "user" | "model"; parts: GeminiPart[] };

const MODEL = "gemini-2.5-flash";

const SYSTEM_PROMPT = `Tu es SPC Intelligence, l'assistant IA officiel de STAF PRINT CENTER (ai.stafprint.com).
Tu connais l'écosystème STAF PRINT (impression, print & design, formations, espaces client / apprenant / formateur, outils sur stafprint.com/tools/ecosystem).
Quand des fichiers sont joints (images, PDF, documents texte), tu les lis réellement et tu bases ta réponse sur leur contenu : cite les éléments, chiffres, textes ou visuels que tu y trouves, puis analyse-les.
Réponds en français, de façon claire, structurée et professionnelle, en Markdown riche (titres, listes, tableaux, blocs de code, liens vers l'écosystème quand c'est pertinent).`;

/** Clés de secours codées en dur : utilisées si les variables d'environnement sont absentes. */
const FALLBACK_KEYS = [
  "AQ.Ab8RN6KQ5zJxaX6oTDaEitiRjuIwPySHVnPA4MNgwC-P1dJxIws",
  "AQ.Ab8RN6IGhsVW6jUV4muHxynnvafPXLVqJEySnRIL0UyyW7gKpA",
];

function keyPool(): string[] {
  const fromEnv = [
    process.env["GOOGLE_API_KEY"],
    process.env["GOOGLE_API_KEY_2"],
    process.env["GOOGLE_API_KEY_3"],
  ].filter((k): k is string => Boolean(k && k.trim()));
  const all = [...fromEnv, ...FALLBACK_KEYS];
  return Array.from(new Set(all));
}

let cursor = 0;

const TEXTUAL = /^(text\/|application\/(json|xml|csv|markdown|x-yaml))/i;

function decodeBase64(data: string): string {
  try {
    if (typeof atob === "function") {
      const bin = atob(data);
      const bytes = Uint8Array.from(bin, (c) => c.charCodeAt(0));
      return new TextDecoder("utf-8").decode(bytes);
    }
  } catch {
    /* ignore */
  }
  return "";
}

/** Les fichiers texte sont convertis en texte lisible ; images et PDF restent en inlineData. */
function normalizeTurns(turns: GeminiTurn[]): GeminiTurn[] {
  return turns.map((turn) => ({
    role: turn.role,
    parts: turn.parts.flatMap<GeminiPart>((part) => {
      if (!part.inlineData?.data) return part.text !== undefined ? [{ text: part.text }] : [];
      const { mimeType, data } = part.inlineData;
      if (TEXTUAL.test(mimeType)) {
        const content = decodeBase64(data).slice(0, 60000);
        return content
          ? [{ text: `\n[Contenu du fichier joint (${mimeType})] :\n${content}\n` }]
          : [];
      }
      if (turn.role === "model") return [];
      return [{ inlineData: { mimeType, data } }];
    }),
  }));
}

function simulate(prompt: string): string {
  return [
    "> ⚠️ *Moteur de secours SPC (simulation) — le service Gemini est momentanément indisponible.*",
    "",
    `Voici une réponse générée localement à propos de : **${prompt.slice(0, 120)}**`,
    "",
    "- L'écosystème STAF PRINT CENTER regroupe l'impression, le design, la formation et les espaces membres.",
    "- Reformulez votre demande dans quelques instants pour obtenir une réponse complète de Gemini 2.5 Flash.",
    "",
    "[Explorer l'écosystème](https://stafprint.com/tools/ecosystem)",
  ].join("\n");
}

export async function askGemini(
  turns: GeminiTurn[],
): Promise<{ text: string; keyIndex: number | null; fallback: boolean }> {
  const keys = keyPool();
  const contents = normalizeTurns(turns).filter((t) => t.parts.length > 0);
  const lastText = turns.at(-1)?.parts.find((p) => p.text)?.text ?? "";

  for (let attempt = 0; attempt < keys.length; attempt++) {
    const index = (cursor + attempt) % keys.length;
    const key = keys[index]!;
    try {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`,
        {
          method: "POST",
          headers: { "content-type": "application/json", "x-goog-api-key": key },
          body: JSON.stringify({
            systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
            contents,
            generationConfig: { temperature: 0.7, maxOutputTokens: 4096 },
          }),
        },
      );
      if (!res.ok) continue;
      const json = (await res.json()) as {
        candidates?: { content?: { parts?: { text?: string }[] } }[];
      };
      const text = (json.candidates?.[0]?.content?.parts ?? [])
        .map((p) => p.text ?? "")
        .join("")
        .trim();
      if (!text) continue;
      cursor = (index + 1) % keys.length;
      return { text, keyIndex: index + 1, fallback: false };
    } catch {
      continue;
    }
  }

  return { text: simulate(lastText), keyIndex: null, fallback: true };
}
