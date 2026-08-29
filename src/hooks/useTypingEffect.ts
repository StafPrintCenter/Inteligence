import { useEffect, useRef, useState } from "react";

export function useTypingEffect(
  fullText: string,
  speedMs: number = 20,
  isGenerating: boolean = false,
) {
  const [displayedText, setDisplayedText] = useState(isGenerating ? "" : fullText);
  const indexRef = useRef(0);

  useEffect(() => {
    // Si la génération est terminée ou inactive, afficher tout immédiatement
    if (!isGenerating) {
      setDisplayedText(fullText);
      indexRef.current = fullText.split(" ").length;
      return;
    }

    const words = fullText.split(" ");
    indexRef.current = 0;
    setDisplayedText("");

    const interval = setInterval(() => {
      if (indexRef.current < words.length) {
        indexRef.current++;
        setDisplayedText(words.slice(0, indexRef.current).join(" "));
      } else {
        clearInterval(interval);
      }
    }, speedMs);

    return () => clearInterval(interval);
  }, [fullText, speedMs, isGenerating]);

  return displayedText;
}