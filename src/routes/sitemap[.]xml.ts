import { createFileRoute } from "@tanstack/react-router";
import type { } from "@tanstack/react-start";

// 1. Sécurisation de l'URL de base
const RAW_URL = import.meta.env.VITE_AI_URL;
const BASE_URL = RAW_URL.replace(/\/$/, "");

// Date du jour pour les entités dépourvues de date ISO
const TODAY = new Date().toISOString().split("T")[0];

interface SitemapEntry {
  path: string;
  lastmod?: string;
  changefreq?: "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never";
  priority?: string;
}

// Fonction utilitaire pour formater une date ISO au format YYYY-MM-DD
const formatDate = (dateStr?: string | null): string => {
  if (!dateStr) return TODAY;
  try {
    const parsed = new Date(dateStr);
    return isNaN(parsed.getTime()) ? TODAY : parsed.toISOString().split("T")[0];
  } catch {
    return TODAY;
  }
};

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async () => {
        // 2. Pages statiques de base
        const entries: SitemapEntry[] = [
          { path: "/", lastmod: TODAY, changefreq: "weekly", priority: "1.0" },
          { path: "/login", lastmod: TODAY, changefreq: "weekly", priority: "0.8" },
        ];

        const urls = entries.map((e) =>
          [
            `  <url>`,
            `    <loc>${BASE_URL}${e.path}</loc>`,
            e.changefreq ? `    <changefreq>${e.changefreq}</changefreq>` : null,
            e.priority ? `    <priority>${e.priority}</priority>` : null,
            `  </url>`,
          ]
            .filter(Boolean)
            .join("\n"),
        );

        const xml = [
          `<?xml version="1.0" encoding="UTF-8"?>`,
          `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`,
          ...urls,
          `</urlset>`,
        ].join("\n");

        return new Response(xml, {
          headers: {
            "Content-Type": "application/xml",
            "Cache-Control": "public, max-age=3600",
          },
        });
      },
    },
  },
});
