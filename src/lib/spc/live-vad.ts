/** Détection d'activité vocale native (Web Audio) avec plancher de bruit adaptatif. */
export type VadEvents = { onLevel: (level: number, voice: boolean) => void };

export type Vad = { stop: () => void; setStrict: (strict: boolean) => void };

export async function startVad({ onLevel }: VadEvents): Promise<Vad> {
  const stream = await navigator.mediaDevices.getUserMedia({
    audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true },
  });
  const Ctx =
    window.AudioContext ??
    (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
  const ctx = new Ctx();
  const src = ctx.createMediaStreamSource(stream);
  // Bande vocale : coupe les grondements (moteurs, vent) et les sifflements aigus.
  const hp = ctx.createBiquadFilter();
  hp.type = "highpass";
  hp.frequency.value = 200;
  const lp = ctx.createBiquadFilter();
  lp.type = "lowpass";
  lp.frequency.value = 3400;
  const analyser = ctx.createAnalyser();
  analyser.fftSize = 1024;
  src.connect(hp).connect(lp).connect(analyser);

  const buf = new Float32Array(analyser.fftSize);
  let floor = 0.01;
  let strict = false;
  let voiceFrames = 0;
  let raf = 0;

  const tick = () => {
    analyser.getFloatTimeDomainData(buf);
    let sum = 0;
    for (let i = 0; i < buf.length; i++) sum += buf[i]! * buf[i]!;
    const rms = Math.sqrt(sum / buf.length);
    const ratio = strict ? 4 : 2.6;
    const loud = rms > Math.max(floor * ratio, 0.012);
    // Le plancher suit lentement le bruit ambiant (seulement hors parole).
    if (!loud) floor = floor * 0.97 + rms * 0.03;
    else floor = floor * 0.999 + rms * 0.001;
    voiceFrames = loud ? Math.min(voiceFrames + 1, 30) : Math.max(voiceFrames - 2, 0);
    // ~8 trames (~130 ms) consécutives : une vraie voix, pas un claquement.
    onLevel(Math.min(1, rms / Math.max(floor * 8, 0.05)), voiceFrames >= 8);
    raf = requestAnimationFrame(tick);
  };
  tick();

  return {
    setStrict: (s) => (strict = s),
    stop: () => {
      cancelAnimationFrame(raf);
      stream.getTracks().forEach((t) => t.stop());
      void ctx.close();
    },
  };
}
