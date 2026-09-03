import { Download, ExternalLink, X } from "lucide-react";
import { useCallback, useMemo, useState, type ReactNode } from "react";

import { Markdown } from "@/components/spc/Markdown";
import { PreviewContext, type PreviewItem } from "@/components/spc/preview-context";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";

const KIND_LABEL: Record<PreviewItem["kind"], string> = {
  html: "Rendu web",
  image: "Image",
  pdf: "Document PDF",
  markdown: "Markdown",
  text: "Texte",
};

const EXT: Record<string, string> = {
  javascript: "js",
  typescript: "ts",
  html: "html",
  css: "css",
  markdown: "md",
};

function buildHtmlDoc(item: PreviewItem): string {
  const code = item.content ?? "";
  const lang = (item.language ?? "html").toLowerCase();
  if (lang === "css") {
    return `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><style>${code}</style></head><body>
<h1>Titre de démonstration</h1>
<p>Paragraphe de démonstration pour prévisualiser le style CSS.</p>
<button>Bouton</button>
</body></html>`;
  }
  if (lang === "js" || lang === "javascript") {
    return `<!doctype html><html><head><meta charset="utf-8"><style>body{font-family:system-ui,sans-serif;padding:12px}</style></head><body>
<div id="app"></div><pre id="console" style="white-space:pre-wrap"></pre>
<script>
(function(){const out=document.getElementById('console');const log=(...a)=>{out.textContent+=a.map(v=>{try{return typeof v==='string'?v:JSON.stringify(v)}catch(e){return String(v)}}).join(' ')+'\\n'};console.log=log;console.error=log;console.warn=log;
try{${code}\n}catch(e){log('Erreur : '+e.message)}})();
<\/script></body></html>`;
  }
  return /<html[\s>]/i.test(code)
    ? code
    : `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head><body>${code}</body></html>`;
}

function PreviewBody({ item }: { item: PreviewItem }) {
  if (item.kind === "html") {
    return (
      <iframe
        title={`Aperçu — ${item.title}`}
        sandbox="allow-scripts"
        srcDoc={buildHtmlDoc(item)}
        className="h-full w-full bg-white"
      />
    );
  }
  if (item.kind === "image") {
    return (
      <div className="grid h-full place-items-center overflow-auto bg-secondary/40 p-4">
        <img src={item.url} alt={item.title} className="max-h-full max-w-full object-contain" />
      </div>
    );
  }
  if (item.kind === "pdf") {
    return (
      <object data={item.url} type="application/pdf" className="h-full w-full">
        <div className="grid h-full place-items-center p-6 text-center text-sm text-muted-foreground">
          <div className="space-y-3">
            <p>Ce PDF ne peut pas être affiché ici.</p>
            <Button asChild size="sm">
              <a href={item.url} target="_blank" rel="noreferrer">
                <ExternalLink className="size-4" /> Ouvrir le PDF
              </a>
            </Button>
          </div>
        </div>
      </object>
    );
  }
  if (item.kind === "markdown") {
    return (
      <div className="spc-scroll h-full overflow-y-auto p-5">
        <Markdown>{item.content ?? ""}</Markdown>
      </div>
    );
  }
  return (
    <pre className="spc-scroll h-full overflow-auto p-5 text-xs whitespace-pre-wrap">
      {item.content}
    </pre>
  );
}

/** Panneau de prévisualisation multi-support (rendu web, image, PDF, markdown, texte). */
export function PreviewProvider({ children }: { children: ReactNode }) {
  const [item, setItem] = useState<PreviewItem | null>(null);

  const api = useMemo(
    () => ({ open: (next: PreviewItem) => setItem(next), close: () => setItem(null) }),
    [],
  );

  const download = useCallback(() => {
    if (!item) return;
    const href =
      item.url ??
      URL.createObjectURL(new Blob([item.content ?? ""], { type: "text/plain;charset=utf-8" }));
    const a = document.createElement("a");
    a.href = href;
    a.download = item.url
      ? item.title
      : `${item.title.replace(/\W+/g, "-").toLowerCase()}.${EXT[item.language ?? ""] ?? "txt"}`;
    a.click();
    if (!item.url) URL.revokeObjectURL(href);
  }, [item]);

  return (
    <PreviewContext.Provider value={api}>
      {children}
      <Sheet open={Boolean(item)} onOpenChange={(o) => !o && setItem(null)}>
        <SheetContent
          side="right"
          className="flex w-full flex-col gap-0 p-0 sm:max-w-xl lg:max-w-2xl [&>button]:hidden"
        >
          <SheetHeader className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2 border-b border-border p-3">
            <div className="min-w-0">
              <SheetTitle className="truncate text-sm">{item?.title}</SheetTitle>
              <p className="text-xs text-primary">{item ? KIND_LABEL[item.kind] : ""}</p>
            </div>
            <div className="flex shrink-0 items-center gap-1">
              <Button size="icon" variant="ghost" aria-label="Télécharger" onClick={download}>
                <Download className="size-4" />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                aria-label="Fermer l'aperçu"
                onClick={() => setItem(null)}
              >
                <X className="size-4" />
              </Button>
            </div>
          </SheetHeader>
          <div className="min-h-0 flex-1">{item && <PreviewBody item={item} />}</div>
        </SheetContent>
      </Sheet>
    </PreviewContext.Provider>
  );
}
