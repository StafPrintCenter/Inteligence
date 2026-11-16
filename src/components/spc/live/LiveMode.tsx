import { Mic, MicOff, X } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

import { SpcMobLogo } from "@/components/site";
import { Button } from "@/components/ui/button";
import { stripSuggestions } from "@/lib/spc/actions";
import { startVad, type Vad } from "@/lib/spc/live-vad";
import type { SpcMessage } from "@/lib/spc/types";
import { cleanForSpeech } from "@/lib/spc/voice";
import { cn } from "@/lib/utils";

type Phase = "listening" | "hearing" | "thinking" | "speaking" | "muted" | "error";

type Rec = {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  start(): void;
  stop(): void;
  abort(): void;
  onresult: ((e: { resultIndex: number; results: ArrayLike<{ isFinal: boolean; 0: { transcript: string } }> }) => void) | null;
  onend: (() => void) | null;
  onerror: ((e: { error: string }) => void) | null;
};

const SILENCE_MS = 1300;
const BARGE_MS = 300;

const LABEL: Record<Phase, string> = {
  listening: "Je vous écoute…",
  hearing: "Je vous entends…",
  thinking: "SPC Intelligence réfléchit…",
  speaking: "SPC Intelligence parle — parlez pour l'interrompre",
  muted: "Micro coupé",
  error: "Micro indisponible",
};

export function LiveMode({
  messages,
  loading,
  onSend,
  onClose,
}: {
  messages: SpcMessage[];
  loading: boolean;
  onSend: (text: string) => void;
  onClose: () => void;
}) {
  const [phase, setPhase] = useState<Phase>("listening");
  const [level, setLevel] = useState(0);
  const [transcript, setTranscript] = useState("");
  const [caption, setCaption] = useState("");
  const [error, setError] = useState<string | null>(null);

  const phaseRef = useRef<Phase>("listening");
  const finals = useRef("");
  const interim = useRef("");
  const lastVoice = useRef(0);
  const voiceSince = useRef(0);
  const recRef = useRef<Rec | null>(null);
  const vadRef = useRef<Vad | null>(null);
  const alive = useRef(true);
  const sendRef = useRef(onSend);
  sendRef.current = onSend;
  const lastSpokenId = useRef<string | null>(messages.at(-1)?.id ?? null);

  const set = useCallback((p: Phase) => {
    phaseRef.current = p;
    setPhase(p);
    vadRef.current?.setStrict(p === "speaking");
  }, []);

  const resetTranscript = () => {
    finals.current = "";
    interim.current = "";
    setTranscript("");
  };

  const flush = useCallback(() => {
    const text = (finals.current + " " + interim.current).trim();
    resetTranscript();
    // Validation sémantique : au moins 2 caractères réels, sinon c'était du bruit.
    if (text.replace(/[^\p{L}\p{N}]/gu, "").length < 2) {
      set("listening");
      return;
    }
    set("thinking");
    setCaption("");
    sendRef.current(text);
  }, [set]);

  /* Démarrage micro + reconnaissance */
  useEffect(() => {
    alive.current = true;
    const w = window as unknown as Record<string, unknown>;
    const Ctor = (w["SpeechRecognition"] ?? w["webkitSpeechRecognition"]) as (new () => Rec) | undefined;
    if (!Ctor) {
      setError("Votre navigateur ne propose pas la reconnaissance vocale. Essayez Chrome ou Edge.");
      set("error");
      return;
    }

    const startRec = () => {
      if (!alive.current) return;
      const rec = new Ctor();
      rec.lang = "fr-FR";
      rec.continuous = true;
      rec.interimResults = true;
      rec.onresult = (e) => {
        const p = phaseRef.current;
        // Pendant que l'IA parle ou réfléchit, on ignore (évite d'entendre sa propre voix).
        if (p === "speaking" || p === "thinking" || p === "muted") return;
        let it = "";
        for (let i = e.resultIndex; i < e.results.length; i++) {
          const r = e.results[i];
          if (!r) continue;
          if (r.isFinal) finals.current += " " + r[0].transcript;
          else it += r[0].transcript;
        }
        interim.current = it;
        setTranscript((finals.current + " " + it).trim());
        lastVoice.current = performance.now();
        if (p === "listening") set("hearing");
      };
      rec.onerror = (e) => {
        if (e.error === "not-allowed" || e.error === "service-not-allowed") {
          setError("Accès au micro refusé.");
          set("error");
        }
      };
      rec.onend = () => {
        recRef.current = null;
        if (alive.current && phaseRef.current !== "error") setTimeout(startRec, 150);
      };
      recRef.current = rec;
      try {
        rec.start();
      } catch {
        /* déjà démarrée */
      }
    };

    startVad({
      onLevel: (lv, voice) => {
        setLevel(lv);
        const now = performance.now();
        const p = phaseRef.current;
        if (voice) {
          lastVoice.current = now;
          if (!voiceSince.current) voiceSince.current = now;
          // Barge-in : l'utilisateur coupe la parole à l'IA.
          if (p === "speaking" && now - voiceSince.current > BARGE_MS) {
            window.speechSynthesis.cancel();
            resetTranscript();
            set("hearing");
          }
        } else {
          voiceSince.current = 0;
        }
        if (p === "hearing" && now - lastVoice.current > SILENCE_MS) flush();
      },
    })
      .then((v) => {
        if (!alive.current) return v.stop();
        vadRef.current = v;
        startRec();
      })
      .catch(() => {
        setError("Accès au micro refusé.");
        set("error");
      });

    return () => {
      alive.current = false;
      recRef.current?.abort();
      vadRef.current?.stop();
      window.speechSynthesis.cancel();
    };
  }, [flush, set]);

  /* Lecture automatique de la nouvelle réponse */
  useEffect(() => {
    if (loading) return;
    const last = messages.at(-1);
    if (!last || last.role !== "assistant" || last.id === lastSpokenId.current) {
      if (!loading && phaseRef.current === "thinking") set("listening");
      return;
    }
    lastSpokenId.current = last.id;
    const text = cleanForSpeech(stripSuggestions(last.content));
    setCaption(text);
    if (!text || phaseRef.current === "muted") {
      if (phaseRef.current !== "muted") set("listening");
      return;
    }
    const synth = window.speechSynthesis;
    synth.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = "fr-FR";
    const voice = synth.getVoices().find((v) => v.lang.toLowerCase().startsWith("fr"));
    if (voice) u.voice = voice;
    u.onend = u.onerror = () => {
      if (phaseRef.current === "speaking") set("listening");
    };
    set("speaking");
    synth.speak(u);
  }, [messages, loading, set]);

  const toggleMute = () => {
    if (phaseRef.current === "muted") {
      set("listening");
    } else {
      window.speechSynthesis.cancel();
      resetTranscript();
      set("muted");
    }
  };

  const active = phase === "hearing" || phase === "speaking";
  const scale = 1 + (phase === "hearing" || phase === "speaking" ? level * 0.35 : 0);

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-background text-foreground">
      <header className="flex items-center gap-3 px-4 py-3">
        < SpcMobLogo className="size-7" />
        <div className="flex-1">
          <p className="text-sm font-semibold">SPC Live</p>
          <p className="text-xs text-muted-foreground">Conversation vocale</p>
        </div>
        <Button size="icon" variant="ghost" aria-label="Quitter le mode Live" onClick={onClose}>
          <X className="size-5" />
        </Button>
      </header>

      <div className="flex flex-1 flex-col items-center justify-center gap-10 px-6">
        <p className="min-h-16 max-w-2xl text-center text-xl font-medium sm:text-2xl">
          {transcript || (phase === "error" ? error : "")}
        </p>

        <div className="relative flex size-56 items-center justify-center">
          <span
            className={cn(
              "absolute inset-0 rounded-full bg-primary/15 transition-transform duration-100",
              phase === "listening" && "animate-pulse",
            )}
            style={{ transform: `scale(${scale * 1.15})` }}
          />
          <span
            className="absolute inset-6 rounded-full bg-primary/25 transition-transform duration-100"
            style={{ transform: `scale(${scale})` }}
          />
          <span
            className={cn(
              "relative size-28 rounded-full bg-linear-to-br from-primary to-primary/60 shadow-lg",
              phase === "thinking" && "animate-spin border-4 border-dashed border-primary-foreground/40",
              phase === "muted" && "opacity-40",
              active && "shadow-primary/40",
            )}
          />
        </div>

        <p className="text-sm text-muted-foreground" aria-live="polite">
          {LABEL[phase]}
        </p>

        <p className="spc-scroll max-h-40 max-w-2xl overflow-y-auto text-center text-sm text-muted-foreground">
          {caption}
        </p>
      </div>

      <footer className="flex items-center justify-center gap-4 pb-10">
        <Button
          size="icon"
          variant={phase === "muted" ? "destructive" : "secondary"}
          className="size-16 rounded-full"
          aria-label={phase === "muted" ? "Réactiver le micro" : "Couper le micro"}
          onClick={toggleMute}
          disabled={phase === "error"}
        >
          {phase === "muted" ? <MicOff className="size-6" /> : <Mic className="size-6" />}
        </Button>
        <Button variant="outline" className="rounded-full" onClick={onClose}>
          Terminer
        </Button>
      </footer>
    </div>
  );
}
