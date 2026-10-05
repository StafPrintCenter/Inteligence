export type SpcAction = { kind: "whatsapp" | "mail" | "phone" | "link"; label: string; href: string };
export type SpcSuggestion = { label: string; prompt: string };

const SUGGESTION_RE = /\[\[suggestion:\s*([^|\]]+?)\s*\|\s*([^\]]+?)\s*\]\]/gi;

/** Retire les marqueurs de suggestion (y compris un marqueur incomplet en fin de frappe). */
export function stripSuggestions(text: string): string {
  return text
    .replace(SUGGESTION_RE, "")
    .replace(/\[\[[^\]]*$/, "")
    .replace(/\n{3,}/g, "\n\n")
    .trimEnd();
}

export function extractSuggestions(text: string): SpcSuggestion[] {
  const out: SpcSuggestion[] = [];
  for (const m of text.matchAll(SUGGESTION_RE)) {
    out.push({ label: m[1]!.trim(), prompt: m[2]!.trim() });
  }
  return out.slice(0, 4);
}

/** Détecte les contacts (WhatsApp, e-mail, téléphone, pages SPC) pour en faire des boutons d'action. */
export function extractActions(text: string): SpcAction[] {
  const actions: SpcAction[] = [];
  const seen = new Set<string>();
  const push = (a: SpcAction) => {
    if (seen.has(a.href)) return;
    seen.add(a.href);
    actions.push(a);
  };

  for (const m of text.matchAll(/https?:\/\/(?:wa\.me|api\.whatsapp\.com)\/[^\s)\]"'>]+/gi)) {
    push({ kind: "whatsapp", label: "Discuter sur WhatsApp", href: m[0] });
  }
  if (!actions.some((a) => a.kind === "whatsapp") && /whatsapp|01\s?60\s?30\s?06\s?07/i.test(text)) {
    push({ kind: "whatsapp", label: "Discuter sur WhatsApp", href: "https://wa.me/2290160300607" });
  }
  for (const m of text.matchAll(/(?:mailto:)?([A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,})/gi)) {
    push({ kind: "mail", label: `Écrire à ${m[1]}`, href: `mailto:${m[1]}` });
  }
  for (const m of text.matchAll(/tel:(\+?[0-9]{8,15})/gi)) {
    push({ kind: "phone", label: `Appeler ${m[1]}`, href: `tel:${m[1]}` });
  }
  for (const m of text.matchAll(/https:\/\/(?:www\.|docs\.)?stafprint\.com[^\s)\]"'>]*/gi)) {
    if (actions.filter((a) => a.kind === "link").length >= 2) break;
    const url = m[0].replace(/[.,;]+$/, "");
    const host = new URL(url).hostname.startsWith("docs") ? "Voir la documentation" : "Ouvrir sur stafprint.com";
    push({ kind: "link", label: host, href: url });
  }
  return actions.slice(0, 6);
}

const TITLE_RE = /\[\[titre:\s*([^\]]+?)\s*\]\]\s*/i;

/** Extrait le titre de conversation proposé par l'IA et le retire du texte. */
export function extractTitle(text: string): { title: string | null; text: string } {
  const m = TITLE_RE.exec(text);
  if (!m) return { title: null, text };
  return { title: m[1]!.replace(/["«»]/g, "").trim().slice(0, 60) || null, text: text.replace(TITLE_RE, "").trim() };
}
