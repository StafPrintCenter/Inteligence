import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Outlet, createRootRouteWithContext, HeadContent, Scripts } from "@tanstack/react-router";
import { type ReactNode } from "react";
import { Toaster } from "sonner";
import appCss from "../styles.css?url";
import { PreviewProvider } from "@/components/site";
import { SITE, SITE_LINK } from "@/data/site";
import logo from "@/assets/logos.json";
import { NotFoundComponent, ErrorComponent } from "@/components/errors";

const PAGE_TITLE = `SPC Intelligence | Assistant IA, Chatbot & Support Intelligent - ${SITE.name}`;
const PAGE_DESC = `Assistant virtuel intelligent de ${SITE.name} : assistance instantanée, analyse de documents et génération de contenu pour vos projets d'impression et web.`;

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1, maximum-scale=5" },
      { name: "robots", content: "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" },
      { title: PAGE_TITLE },
      { name: "description", content: PAGE_DESC },
      { name: "author", content: `${SITE.manager}` },

      /* Open Graph / Facebook / WhatsApp */
      { property: "og:title", content: PAGE_TITLE },
      { property: "og:description", content: PAGE_DESC },
      { property: "og:type", content: "website" },
      { property: "og:site_name", content: `SPC Intelligence - ${SITE.name}` },
      { property: "og:image", content: `${logo.meta}` },
      { property: "og:image:width", content: "1200" },
      { property: "og:image:height", content: "630" },
      { property: "og:image:alt", content: `SPC Intelligence - Assistant IA de ${SITE.name}` },
      { property: "og:url", content: `${SITE_LINK.aiUrl}` },
      { property: "og:locale", content: "fr_BJ" },

      /* Twitter / X */
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:image", content: `${logo.meta}` },
      { name: "twitter:title", content: PAGE_TITLE },
      { name: "twitter:description", content: PAGE_DESC },
      { name: "twitter:site", content: "@StafPrintCenter" },

      /* Google Verification */
      { name: "google-site-verification", content: "OdKxHpVkBSxk0mj4vD4OTmZPdVi5pWzyCu4QPIMHy9A" },
    ],
    links: [
      { rel: "canonical", href: `${SITE_LINK.aiUrl}` },
      { rel: "stylesheet", href: appCss },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Inter:wght@300;400;500;600;700&display=swap" },
      { rel: "icon", href: "/favicon.ico", type: "image/x-icon" },
      { rel: "sitemap", type: "application/xml", href: "/sitemap.xml" },
    ],
    scripts: [
      /* 1. Schéma SoftwareApplication pour le Chatbot IA */
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "SoftwareApplication",
          "@id": `${SITE_LINK.aiUrl}/#software`,
          url: SITE_LINK.aiUrl,
          name: `SPC Intelligence`,
          applicationCategory: "BusinessApplication",
          operatingSystem: "All",
          description: PAGE_DESC,
          inLanguage: "fr-BJ",
          publisher: {
            "@type": "Organization",
            name: SITE.name,
            logo: { "@type": "ImageObject", url: `${logo.meta}` }
          }
        }),
      }
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="fr">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  return (
    <QueryClientProvider client={queryClient}>
      <PreviewProvider>
        {/* Required: nested routes render here. Removing <Outlet /> breaks all child routes. */}
        <Outlet />
      </PreviewProvider>
      <Toaster richColors position="top-center" closeButton />
    </QueryClientProvider>
  );
}
