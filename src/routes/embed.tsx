import { createFileRoute } from "@tanstack/react-router";
import { EmbedChat } from "@/components/spc/EmbedChat";
import { SITE } from "@/data/site";

const PAGE_TITLE = `Widget - ${SITE.tool} | ${SITE.name}`;
const PAGE_DESC = `Volet de discussion ${SITE.tool} intégré à l'écosystème ${SITE.name}.`;

export const Route = createFileRoute("/embed")({
  validateSearch: (s: Record<string, unknown>) => ({
    app: typeof s["app"] === "string" ? s["app"].slice(0, 60) : "ecosysteme",
  }),
  head: () => ({
    meta: [
      { title: PAGE_TITLE },
      { name: "description", content: PAGE_DESC },
      { property: "og:title", content: PAGE_TITLE },
      { property: "og:description", content: PAGE_DESC },
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
