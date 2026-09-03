import { createFileRoute } from "@tanstack/react-router";
import { ChatApp } from "@/components/spc/ChatApp";
import { SITE } from "@/data/site";

const PAGE_TITLE = `SPC Intelligence - Assistant IA de ${SITE.name}`;
const PAGE_DESC = `Assistant IA de l'écosystème ${SITE.name} :  chat, analyse et génération.`;

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: PAGE_TITLE },
      { name: "description", content: PAGE_DESC },
      { name: "author", content: SITE.name },
      { property: "og:title", content: PAGE_TITLE },
      { property: "og:description", content: PAGE_DESC },
    ],
  }),
  component: () => <ChatApp />,
});
