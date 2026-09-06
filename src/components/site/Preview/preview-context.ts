import { createContext, useContext } from "react";

export type PreviewKind = "html" | "image" | "pdf" | "markdown" | "text";

export type PreviewItem = {
  kind: PreviewKind;
  title: string;
  /** Contenu textuel (html, markdown, texte, code). */
  content?: string;
  /** URL ou data-URL (image, pdf). */
  url?: string;
  /** Langage d'origine pour l'export. */
  language?: string;
};

type PreviewApi = { open: (item: PreviewItem) => void; close: () => void };

export const PreviewContext = createContext<PreviewApi | null>(null);

export function usePreview(): PreviewApi {
  return (
    useContext(PreviewContext) ?? {
      open: () => undefined,
      close: () => undefined,
    }
  );
}
