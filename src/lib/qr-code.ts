/**
 * Construit l'URL de l'image QR code d'un lien court.
 * Cette route est une route WEB Laravel (pas /api/...), servie sur la même
 * origine que le backend - elle renvoie directement un PNG.
 */
export function buildQrCodeUrl(alias: string): string {
  const origin = import.meta.env.VITE_API_ORIGIN;
  return `${origin}/r/${alias}/qr`;
}