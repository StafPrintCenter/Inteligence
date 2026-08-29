import { uid } from "./store";
import type { SpcAttachment } from "./types";

const IMAGE_RE = /\b(image|visuel|logo|affiche|flyer|illustration|banni[eè]re|maquette)\b/i;
const DOC_RE = /\b(document|rapport|devis|facture|pdf|contrat|fiche|compte[- ]rendu|note)\b/i;
const ASK_RE = /\b(g[ée]n[èe]re|cr[ée]e|fais|con[çc]ois|produis|r[ée]dige|dessine)\b/i;

export type GenerationRequest = "image" | "document" | null;

export function detectGeneration(prompt: string): GenerationRequest {
  if (!ASK_RE.test(prompt)) return null;
  if (IMAGE_RE.test(prompt)) return "image";
  if (DOC_RE.test(prompt)) return "document";
  return null;
}

const PALETTES = [
  ["#f97316", "#0f172a"],
  ["#fb923c", "#020617"],
  ["#f59e0b", "#1e293b"],
];

export function makeGeneratedImage(prompt: string): SpcAttachment {
  const [a, b] = PALETTES[Math.floor(Math.random() * PALETTES.length)]!;
  const label = prompt.replace(/[<>&]/g, "").slice(0, 46);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="960" height="540">
<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
<stop offset="0%" stop-color="${b}"/><stop offset="100%" stop-color="${a}"/></linearGradient></defs>
<rect width="960" height="540" fill="url(#g)"/>
<circle cx="820" cy="120" r="140" fill="#ffffff" opacity="0.08"/>
<circle cx="140" cy="470" r="180" fill="#ffffff" opacity="0.06"/>
<text x="60" y="250" fill="#ffffff" font-family="sans-serif" font-size="46" font-weight="700">SPC Intelligence</text>
<text x="60" y="310" fill="#ffffff" font-family="sans-serif" font-size="26" opacity="0.85">${label}</text>
<text x="60" y="480" fill="#ffffff" font-family="sans-serif" font-size="20" opacity="0.6">STAF PRINT CENTER · visuel généré</text>
</svg>`;
  const dataUrl = `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(svg)))}`;
  return {
    id: uid(),
    name: `spc-visuel-${Date.now()}.svg`,
    mimeType: "image/svg+xml",
    size: svg.length,
    dataUrl,
    origin: "generated",
    kind: "image",
  };
}

export function makeGeneratedDocument(prompt: string, content: string): SpcAttachment {
  const md = `# Document SPC Intelligence\n\n**Demande :** ${prompt}\n\n---\n\n${content}\n\n---\n\n*STAF PRINT CENTER — ai.stafprint.com*\n`;
  return {
    id: uid(),
    name: `spc-document-${Date.now()}.md`,
    mimeType: "text/markdown",
    size: md.length,
    dataUrl: `data:text/markdown;charset=utf-8,${encodeURIComponent(md)}`,
    origin: "generated",
    kind: "document",
  };
}
