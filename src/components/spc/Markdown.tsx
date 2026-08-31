import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { CodeBlock } from "@/components/spc/CodeBlock";

export function Markdown({ children }: { children: string }) {
  return (
    <div className="text-[0.95rem] leading-relaxed">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: (p) => <h1 className="mt-4 mb-2 text-xl font-bold" {...p} />,
          h2: (p) => <h2 className="mt-4 mb-2 text-lg font-semibold" {...p} />,
          h3: (p) => <h3 className="mt-3 mb-1.5 font-semibold" {...p} />,
          p: (p) => <p className="my-2" {...p} />,
          ul: (p) => <ul className="my-2 list-disc space-y-1 pl-5" {...p} />,
          ol: (p) => <ol className="my-2 list-decimal space-y-1 pl-5" {...p} />,
          a: (p) => (
            <a
              className="font-medium text-primary underline underline-offset-2"
              target="_blank"
              rel="noreferrer"
              {...p}
            />
          ),
          blockquote: (p) => (
            <blockquote
              className="my-3 border-l-2 border-primary bg-muted/60 px-3 py-2 text-muted-foreground italic"
              {...p}
            />
          ),
          code: ({ className, children, ...rest }) =>
            className?.includes("language-") ? (
              <code className={className} {...rest}>
                {children}
              </code>
            ) : (
              <code
                className="rounded bg-secondary px-1.5 py-0.5 font-mono text-[0.82rem]"
                {...rest}
              >
                {children}
              </code>
            ),
          pre: ({ children }) => {
            const child = Array.isArray(children) ? children[0] : children;
            const props = (child as { props?: { className?: string; children?: unknown } })?.props;
            const language = /language-([\w-]+)/.exec(props?.className ?? "")?.[1] ?? "text";
            const code = String(props?.children ?? "").replace(/\n$/, "");
            return <CodeBlock code={code} language={language} />;
          },
          table: (p) => (
            <div className="spc-scroll my-3 overflow-x-auto rounded-lg border border-border">
              <table className="w-full text-left text-sm" {...p} />
            </div>
          ),
          th: (p) => <th className="bg-muted px-3 py-2 font-semibold" {...p} />,
          td: (p) => <td className="border-t border-border px-3 py-2" {...p} />,
        }}
      >
        {children}
      </ReactMarkdown>
    </div>
  );
}
