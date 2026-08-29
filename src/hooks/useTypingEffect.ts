import { useEffect, useState } from "react";

export function useTypingEffect(fullText: string, speedMs: number = 18, active: boolean = true) {
  const [displayedText, setDisplayedText] = useState(active ? "" : fullText);

  useEffect(() => {
    if (!active) {
      setDisplayedText(fullText);
      return;
    }

    setDisplayedText("");
    const words = fullText.split(" ");
    let currentIndex = 0;

    const interval = setInterval(() => {
      if (currentIndex < words.length) {
        setDisplayedText((prev) =>
          prev ? `${prev} ${words[currentIndex]}` : words[currentIndex],
        );
        currentIndex++;
      } else {
        clearInterval(interval);
      }
    }, speedMs);

    return () => clearInterval(interval);
  }, [fullText, speedMs, active]);

  return displayedText;
}