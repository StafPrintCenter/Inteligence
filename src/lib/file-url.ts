// src/lib/file-url.ts
export function resolveStorageUrl(url?: string | null): string | null {
  if (!url) return null;
  return url.replace(/^https?:\/\/[^\/]+\/storage\//, "/storage/");
}