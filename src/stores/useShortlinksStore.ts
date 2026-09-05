import { type APIShortlink, type ShortlinkCategory } from "@/data/shortlinks";
import { resolveApiUrl } from "@/lib/api-url";

type ShortlinkResponse = { data: APIShortlink };

/**
 * Vérifie si un lien court existe déjà pour cette URL longue.
 * Retourne null si aucun lien court n'existe encore (404).
 */
export async function resolveShortlink(longUrl: string): Promise<APIShortlink | null> {
  const params = new URLSearchParams({ long_url: longUrl });
  const url = resolveApiUrl(`/api/public/shortlinks/resolve?${params.toString()}`);
  const response = await fetch(url);
  if (response.status === 404) return null;
  if (!response.ok) {
    throw new Error("Erreur lors de la résolution du lien court");
  }
  const json: ShortlinkResponse = await response.json();
  return json.data;
}

/**
 * Crée un lien court pour cette URL longue. Le backend gère lui-même la déduplication
 */
export async function createShortlink(longUrl: string, category?: ShortlinkCategory): Promise<APIShortlink> {
  const formData = new FormData();
  formData.append("long_url", longUrl);
  if (category) {
    formData.append("category", category);
  }

  const url = resolveApiUrl(`/api/public/shortlinks/create`);
  const response = await fetch(url, {
    method: "POST",
    body: formData,
  });
  if (!response.ok) {
    throw new Error("Erreur lors de la création du lien court");
  }
  const json: ShortlinkResponse = await response.json();
  return json.data;
}


/**
 * Rédiriger vers un lien court
 */
export async function fetchShortlinkByAlias(alias: string): Promise<APIShortlink | null> {
  const url = resolveApiUrl(`/api/public/shortlinks/${alias}`);
  const response = await fetch(url);
  if (response.status === 404) return null;
  if (!response.ok) {
    throw new Error("Erreur lors de la récupération du lien court");
  }
  const json: ShortlinkResponse = await response.json();
  return json.data;
}