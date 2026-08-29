import { GoogleGenAI } from "@google/genai";

export type GeminiPart = { text?: string; inlineData?: { mimeType: string; data: string } };
export type GeminiTurn = { role: "user" | "model"; parts: GeminiPart[] };

const MODEL = "gemini-3.6-flash";

const SYSTEM_PROMPT = `Tu es SPC Intelligence, l'assistant IA officiel de STAF PRINT CENTER (ai.stafprint.com).
Tu connais l'écosystème STAF PRINT (impression, print & design, formations, espaces client / apprenant / formateur, outils sur stafprint.com/tools/ecosystem).
Quand des fichiers sont joints (images, PDF, documents texte), tu les lis réellement et tu bases ta réponse sur leur contenu : cite les éléments, chiffres, textes ou visuels que tu y trouves, puis analyse-les.
Réponds en français, de façon claire, structurée et professionnelle, en Markdown riche (titres, listes, tableaux, blocs de code, liens vers l'écosystème quand c'est pertinent).`;

const FALLBACK_KEYS = [
  "AQ.Ab8RN6IGhsVW6jUV4muHxynnvafPXLVqJEySnRIL0UyyW7gKpA",
  "AQ.Ab8RN6JGjjCsq0GWN1u4nmtHqX06ADxTMM23h3lLk4CqrSCU6g",
  "AQ.Ab8RN6I4bu3f-Ah0ycFUEo90y5MBqv7z6XylIv4ZwT-_t-aovA"
];

function keyPool(): string[] {
  const fromEnv = [
    process.env["GOOGLE_API_KEY"],
    process.env["GOOGLE_API_KEY_2"],
    process.env["GOOGLE_API_KEY_3"],
    process.env["GOOGLE_API_KEY_4"],
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

function normalizeTurns(turns: GeminiTurn[]): GeminiTurn[] {
  return turns.map((turn) => ({
    role: turn.role,
    parts: turn.parts.flatMap<GeminiPart>((part) => {
      if (!part.inlineData?.data) {
        return part.text !== undefined && part.text.trim() !== "" ? [{ text: part.text }] : [];
      }
      const { mimeType, data } = part.inlineData;
      const cleanData = data.includes(",") ? data.split(",")[1]! : data;

      if (TEXTUAL.test(mimeType)) {
        const content = decodeBase64(cleanData).slice(0, 60000);
        return content
          ? [{ text: `\n[Contenu du fichier joint (${mimeType})] :\n${content}\n` }]
          : [];
      }
      if (turn.role === "model") return [];
      return [{ inlineData: { mimeType, data: cleanData } }];
    }),
  }));
}

/**
 * Génère un message de réponse simulée adapté au type d'erreur rencontré,
 * sans jamais exposer de clés API, jetons ou secrets système.
 */
function simulate(prompt: string, lastErrorStatus?: string | number): string {
  const safePrompt = prompt.slice(0, 120).replace(/\b(AIzaSy|AQ\.)[A-Za-z0-9_-]+\b/g, "[CLE_MASQUEE]");

  let causeExplanation = "Le service de génération de texte subit une interruption temporaire.";

  if (lastErrorStatus) {
    const statusStr = String(lastErrorStatus);
    if (statusStr.includes("429")) {
      causeExplanation = "Le quota maximal de requêtes autorisées a été atteint pour le moment.";
    } else if (statusStr.includes("401") || statusStr.includes("403")) {
      causeExplanation = "Une difficulté d'authentification temporaire empêche de joindre le moteur principal.";
    } else if (statusStr.includes("503") || statusStr.includes("500")) {
      causeExplanation = "Les serveurs du modèle Gemini connaissent une forte affluence en ce moment.";
    }
  }

  return [
    "> ⚠️ **Moteur de secours SPC Intelligence**",
    "",
    `*Note : ${causeExplanation}*`,
    "",
    `Nous avons bien pris en compte votre demande relative à : **${safePrompt}**`,
    "",
    "**Ressources utiles :**",
    "- Vous pouvez réitérer votre requête dans quelques instants.",
    "- Consultez l'ensemble de nos services sur notre plateforme.",
    "",
    "[Découvrir l'écosystème STAF PRINT](https://stafprint.com/tools/ecosystem)",
  ].join("\n");
}

export async function askGemini(
  turns: GeminiTurn[],
): Promise<{ text: string; keyIndex: number | null; fallback: boolean }> {
  const keys = keyPool();
  const contents = normalizeTurns(turns).filter((t) => t.parts.length > 0);
  const lastText = turns.at(-1)?.parts.find((p) => p.text)?.text ?? "";
  let lastStatus: string | number | undefined;

  for (let attempt = 0; attempt < keys.length; attempt++) {
    const index = (cursor + attempt) % keys.length;
    const apiKey = keys[index]!;

    try {
      const ai = new GoogleGenAI({ apiKey });

      const response = await ai.models.generateContent({
        model: MODEL,
        contents,
        config: {
          systemInstruction: SYSTEM_PROMPT,
          temperature: 0.7,
          maxOutputTokens: 4096,
        },
      });

      const text = response.text?.trim();
      if (!text) continue;

      cursor = (index + 1) % keys.length;
      return { text, keyIndex: index + 1, fallback: false };
    } catch (err: any) {
      lastStatus = err?.status || err?.code || "UNKNOWN";

      // Journalisation côté serveur : on masque tout motif ressemblant à une clé API
      const rawMessage = err?.message || JSON.stringify(err);
      const sanitizedMessage = rawMessage.replace(/\b(AIzaSy|AQ\.)[A-Za-z0-9_-]+\b/g, "[REDACTED_KEY]");

      console.error(`[Gemini API Error] Key index ${index} failed with status ${lastStatus}:`, sanitizedMessage);
      continue;
    }
  }

  return { text: simulate(lastText, lastStatus), keyIndex: null, fallback: true };
}