import { useCallback, useEffect, useRef, useState } from "react";

/** Loud two-tone buzzer + spoken "Emergency alert" announcements, max 5 minutes. */
export function useEmergencySiren() {
  const [active, setActive] = useState(false);
  const [remaining, setRemaining] = useState(0);
  const ctxRef = useRef<AudioContext | null>(null);
  const nodesRef = useRef<{ osc: OscillatorNode; gain: GainNode } | null>(null);
  const timersRef = useRef<ReturnType<typeof setInterval>[]>([]);

  const stop = useCallback(() => {
    timersRef.current.forEach(clearInterval);
    timersRef.current = [];
    if (nodesRef.current) {
      try {
        nodesRef.current.osc.stop();
      } catch {
        /* already stopped */
      }
      nodesRef.current = null;
    }
    if (typeof window !== "undefined" && "speechSynthesis" in window) window.speechSynthesis.cancel();
    void ctxRef.current?.close();
    ctxRef.current = null;
    setActive(false);
    setRemaining(0);
  }, []);

  const start = useCallback(() => {
    if (typeof window === "undefined" || active) return;
    const Ctx = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    const ctx = new Ctx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "square";
    osc.frequency.value = 880;
    gain.gain.value = 0.22;
    osc.connect(gain).connect(ctx.destination);
    osc.start();
    ctxRef.current = ctx;
    nodesRef.current = { osc, gain };

    let high = true;
    timersRef.current.push(
      setInterval(() => {
        high = !high;
        osc.frequency.setValueAtTime(high ? 880 : 560, ctx.currentTime);
      }, 500),
    );

    let spoken = 0;
    const announce = () => {
      if (!("speechSynthesis" in window)) return;
      const u = new SpeechSynthesisUtterance("Emergency alert");
      u.rate = 1;
      u.volume = 1;
      window.speechSynthesis.speak(u);
      spoken += 1;
    };
    announce();
    timersRef.current.push(
      setInterval(() => {
        if (spoken >= 5) return;
        announce();
      }, 2500),
    );

    setActive(true);
    setRemaining(300);
    timersRef.current.push(
      setInterval(() => {
        setRemaining((r) => {
          if (r <= 1) {
            stop();
            return 0;
          }
          return r - 1;
        });
      }, 1000),
    );
  }, [active, stop]);

  useEffect(() => stop, [stop]);

  return { active, remaining, start, stop };
}