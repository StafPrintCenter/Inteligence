/**
 * Résout une URL d'API relative pour qu'elle fonctionne à la fois côté client (navigateur)
 * et côté serveur (SSR / loaders exécutés sur Node).
 */

export function resolveApiUrl(path: string): string {
  const versionedPath = path.replace(/^\/api\//, "/api/v1/");

  if (typeof window !== "undefined") {
    return versionedPath;
  }

  const apiOrigin = import.meta.env.VITE_API_ORIGIN;
  return `${apiOrigin}${versionedPath}`;
}
