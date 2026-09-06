/** Décode le contenu textuel d'une data-URL (base64 ou encodée en URI). */
export function decodeDataUrlText(dataUrl: string): string {
  try {
    const [meta = "", payload = ""] = [
      dataUrl.slice(0, dataUrl.indexOf(",")),
      dataUrl.slice(dataUrl.indexOf(",") + 1),
    ];
    if (!dataUrl.startsWith("data:")) return "";
    return meta.includes(";base64")
      ? new TextDecoder().decode(Uint8Array.from(atob(payload), (c) => c.charCodeAt(0)))
      : decodeURIComponent(payload);
  } catch {
    return "";
  }
}
