import { Check, Copy, Download } from "lucide-react";
import { useEffect, useState } from "react";

const EXT: Record<string, string> = {
  javascript: "js",
  typescript: "ts",
  tsx: "tsx",
  jsx: "jsx",
  python: "py",
  bash: "sh",
  shell: "sh",
  json: "json",
  html: "html",
  css: "css",
  sql: "sql",
  markdown: "md",
  yaml: "yml",
  php: "php",
};

export function CodeBlock({ code, language }: { code: string; language: string }) {
  const [html, setHtml] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const { codeToHtml } = await import("shiki");
        const dark = document.documentElement.classList.contains("dark");
        const out = await codeToHtml(code, {
          lang: language || "text",
          theme: dark ? "github-dark-default" : "github-light",
        });
        if (!cancelled) setHtml(out);
      } catch {
        if (!cancelled) setHtml(null);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [code, language]);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      /* ignore */
    }
  };

  const download = () => {
    const ext = EXT[language] ?? "txt";
    const url = URL.createObjectURL(new Blob([code], { type: "text/plain;charset=utf-8" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = `spc-snippet-${Date.now()}.${ext}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="my-3 overflow-hidden rounded-xl border border-border bg-secondary">
      <div className="flex items-center justify-between border-b border-border px-3 py-1.5">
        <span className="font-mono text-[0.7rem] tracking-wide text-muted-foreground uppercase">
          {language || "code"}
        </span>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => void copy()}
            aria-label="Copier le code"
            title="Copier le code"
            className="inline-flex items-center gap-1 rounded-md px-1.5 py-1 text-xs text-muted-foreground hover:bg-accent hover:text-accent-foreground "
          >
            {copied ? <Check className="size-3.5 text-primary" /> : <Copy className="size-3.5" />}
            {copied ? "Copié" : "Copier"}
          </button>
          <button
            type="button"
            onClick={download}
            aria-label="Télécharger le code"
            title="Télécharger le code"
            className="inline-flex items-center gap-1 rounded-md px-1.5 py-1 text-xs text-muted-foreground hover:bg-accent hover:text-accent-foreground cursor-pointer"
          >
            <Download className="size-3.5" />
          </button>
        </div>
      </div>
      {html ? (
        <div
          className="spc-scroll spc-code overflow-x-auto p-3 text-[0.82rem]"
          dangerouslySetInnerHTML={{ __html: html }}
        />
      ) : (
        <pre className="spc-scroll overflow-x-auto p-3 font-mono text-[0.82rem]">
          <code>{code}</code>
        </pre>
      )}
    </div>
  );
}
