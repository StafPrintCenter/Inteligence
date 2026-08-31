import type { SpcAttachment } from "./types";

const TEXTUAL = /^(text\/|application\/(json|xml|csv|markdown|x-yaml))/i;

export function isTextual(mimeType: string, name: string) {
  return TEXTUAL.test(mimeType) || /\.(txt|md|csv|json|xml|ya?ml|log)$/i.test(name);
}

function dataUrlToBytes(dataUrl: string): Uint8Array {
  const base64 = dataUrl.split(",")[1] ?? "";
  const bin = atob(base64);
  return Uint8Array.from(bin, (c) => c.charCodeAt(0));
}

export function decodeText(dataUrl: string): string {
  try {
    return new TextDecoder("utf-8").decode(dataUrlToBytes(dataUrl));
  } catch {
    return "";
  }
}

async function extractPdf(dataUrl: string): Promise<string> {
  const pdfjs = await import("pdfjs-dist");
  const worker = await import("pdfjs-dist/build/pdf.worker.mjs?url");
  pdfjs.GlobalWorkerOptions.workerSrc = worker.default;
  const doc = await pdfjs.getDocument({ data: dataUrlToBytes(dataUrl) }).promise;
  const pages: string[] = [];
  const max = Math.min(doc.numPages, 30);
  for (let i = 1; i <= max; i++) {
    const page = await doc.getPage(i);
    const content = await page.getTextContent();
    const text = content.items
      .map((item) => ("str" in item ? item.str : ""))
      .join(" ")
      .replace(/\s+/g, " ")
      .trim();
    pages.push(`--- Page ${i} ---\n${text}`);
  }
  return pages.join("\n\n").slice(0, 120000);
}

/** Extrait le texte réellement lisible par l'IA pour un fichier joint. */
export async function extractAttachmentText(att: SpcAttachment): Promise<{
  text: string;
  status: "ok" | "empty" | "visual" | "error";
}> {
  try {
    if (isTextual(att.mimeType, att.name)) {
      const text = decodeText(att.dataUrl).slice(0, 120000);
      return { text, status: text.trim() ? "ok" : "empty" };
    }
    if (att.mimeType === "application/pdf" || /\.pdf$/i.test(att.name)) {
      const text = await extractPdf(att.dataUrl);
      return { text, status: text.trim() ? "ok" : "empty" };
    }
    if (att.mimeType.startsWith("image/")) return { text: "", status: "visual" };
    return { text: "", status: "error" };
  } catch {
    return { text: "", status: "error" };
  }
}
