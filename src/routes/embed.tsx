import { createFileRoute } from "@tanstack/react-router";

import { EmbedChat } from "@/components/spc/EmbedChat";

export const Route = createFileRoute("/embed")({
  validateSearch: (s: Record<string, unknown>) => ({
    app: typeof s["app"] === "string" ? s["app"].slice(0, 60) : "ecosysteme",
  }),
  head: () => ({
    meta: [
      { title: "SPC Intelligence — Widget" },
      { name: "description", content: "Volet de discussion SPC Intelligence intégré à l'écosystème STAF PRINT CENTER." },
      { property: "og:title", content: "SPC Intelligence — Widget" },
      { property: "og:description", content: "Assistant IA STAF PRINT CENTER intégrable." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: EmbedPage,
});

function EmbedPage() {
  const { app } = Route.useSearch();
  return <EmbedChat app={app} />;
}
