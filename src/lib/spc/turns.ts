import type { GeminiTurn } from "@/lib/spc/gemini.server";
import type { SpcMessage } from "@/lib/spc/types";

/** Convertit l'historique local en tours Gemini (texte + fichiers envoyés). */
export function toTurns(messages: SpcMessage[]): GeminiTurn[] {
  return messages.slice(-12).map((m) => ({
    role: m.role === "user" ? ("user" as const) : ("model" as const),
    parts: [
      { text: m.content },
      ...(m.role === "user"
        ? (m.attachments ?? [])
          .filter((a) => a.origin === "uploaded")
          .flatMap((a) => [
            ...(a.extractedText?.trim()
              ? [
                {
                  text: `\n[Texte extrait du fichier « ${a.name} » (${a.mimeType})] :\n${a.extractedText.slice(0, 120000)}\n`,
                },
              ]
              : []),
            ...(a.mimeType.startsWith("image/") || a.mimeType === "application/pdf"
              ? [{ inlineData: { mimeType: a.mimeType, data: a.dataUrl.split(",")[1] ?? "" } }]
              : []),
          ])
        : []),
    ],
  }));
}
