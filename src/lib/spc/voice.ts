import { useCallback, useEffect, useRef, useState } from "react";

/* ---------- Nettoyage du texte avant lecture audio ---------- */
export function cleanForSpeech(text: string): string {
  return text
    .replace(/\[\[(titre|suggestion):[^\]]*\]\]/gi, "")
    .replace(/```[\s\S]*?```/g, " Extrait de code omis. ")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/!\[[^\]]*\]\([^)]*\)/g, "")
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .replace(/https?:\/\/\S+/g, "lien")
    .replace(/^\s{0,3}#{1,6}\s+/gm, "")
    .replace(/^\s*[-*+]\s+/gm, "")
    .replace(/^\s*>\s?/gm, "")
    .replace(/\|/g, " ")
    .replace(/[*_~]{1,3}/g, "")
    .replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/gu, "")
    .replace(/\n{2,}/g, ". ")
    .replace(/\s+/g, " ")
    .trim();
}

/* ---------- Dictée (SpeechRecognition) ---------- */
type Rec = {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  start(): void;
  stop(): void;
  onresult: ((e: { resultIndex: number; results: ArrayLike<{ isFinal: boolean; 0: { transcript: string } }> }) => void) | null;
  onend: (() => void) | null;
  onerror: ((e: { error: string }) => void) | null;
};

function getRecognitionCtor(): (new () => Rec) | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as Record<string, unknown>;
  return (w["SpeechRecognition"] ?? w["webkitSpeechRecognition"] ?? null) as (new () => Rec) | null;
}

export function useSpeechRecognition(onText: (finalText: string, interim: string) => void) {
  const [supported, setSupported] = useState(false);
  const [listening, setListening] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const recRef = useRef<Rec | null>(null);
  const cb = useRef(onText);
  cb.current = onText;

  useEffect(() => setSupported(!!getRecognitionCtor()), []);
  useEffect(() => () => recRef.current?.stop(), []);

  const start = useCallback(() => {
    const Ctor = getRecognitionCtor();
    if (!Ctor) return;
    const rec = new Ctor();
    rec.lang = "fr-FR";
    rec.continuous = true;
    rec.interimResults = true;
    let finals = "";
    rec.onresult = (e) => {
      let interim = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const r = e.results[i];
        if (!r) continue;
        if (r.isFinal) finals += r[0].transcript;
        else interim += r[0].transcript;
      }
      cb.current(finals, interim);
    };
    rec.onerror = (e) => {
      setError(
        e.error === "not-allowed" || e.error === "service-not-allowed"
          ? "Accès au micro refusé."
          : e.error === "no-speech"
            ? null
            : "La dictée a rencontré un problème.",
      );
    };
    rec.onend = () => {
      setListening(false);
      recRef.current = null;
    };
    recRef.current = rec;
    setError(null);
    try {
      rec.start();
      setListening(true);
    } catch {
      setListening(false);
    }
  }, []);

  const stop = useCallback(() => recRef.current?.stop(), []);
  return { supported, listening, error, start, stop };
}

/* ---------- Lecture (speechSynthesis) : une seule lecture à la fois ---------- */
let currentId: string | null = null;
const listeners = new Set<() => void>();
const notify = () => listeners.forEach((l) => l());

export function stopSpeaking() {
  if (typeof window === "undefined" || !window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  currentId = null;
  notify();
}

export function useSpeechSynthesis(id: string) {
  const [supported, setSupported] = useState(false);
  const [speaking, setSpeaking] = useState(false);

  useEffect(() => {
    setSupported(typeof window !== "undefined" && "speechSynthesis" in window);
    const l = () => setSpeaking(currentId === id);
    listeners.add(l);
    return () => {
      listeners.delete(l);
    };
  }, [id]);

  const speak = useCallback(
    (text: string) => {
      const synth = window.speechSynthesis;
      synth.cancel();
      const clean = cleanForSpeech(text);
      if (!clean) return;
      const u = new SpeechSynthesisUtterance(clean);
      u.lang = "fr-FR";
      const voice = synth.getVoices().find((v) => v.lang.toLowerCase().startsWith("fr"));
      if (voice) u.voice = voice;
      u.onend = u.onerror = () => {
        if (currentId === id) {
          currentId = null;
          notify();
        }
      };
      currentId = id;
      notify();
      synth.speak(u);
    },
    [id],
  );

  return { supported, speaking, speak, stop: stopSpeaking };
}
