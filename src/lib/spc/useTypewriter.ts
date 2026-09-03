import { useEffect, useState } from "react";

/**
 * Affiche un texte mot par mot pendant la génération.
 * Renvoie le texte partiel tant que l'animation est active.
 */
export function useTypewriter(text: string, active: boolean, onDone?: () => void) {
  const [shown, setShown] = useState(active ? "" : text);

  useEffect(() => {
    if (!active) {
      setShown(text);
      return;
    }
    const words = text.split(/(\s+)/);
    let i = 0;
    setShown("");
    const step = Math.max(1, Math.round(words.length / 220));
    const timer = window.setInterval(() => {
      i += step * 2; // les séparateurs comptent aussi
      setShown(words.slice(0, i).join(""));
      if (i >= words.length) {
        window.clearInterval(timer);
        setShown(text);
        onDone?.();
      }
    }, 28);
    return () => window.clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text, active]);

  return shown;
}
