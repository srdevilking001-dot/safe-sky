import { useEffect, useRef, useState } from "react";

type Recognition = {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  start: () => void;
  stop: () => void;
  onresult: ((e: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null;
  onend: (() => void) | null;
  onerror: (() => void) | null;
};

function getRecognition(): Recognition | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as { SpeechRecognition?: new () => Recognition; webkitSpeechRecognition?: new () => Recognition };
  const Ctor = w.SpeechRecognition ?? w.webkitSpeechRecognition;
  return Ctor ? new Ctor() : null;
}

export function isVoiceSupported() {
  const w = typeof window === "undefined" ? undefined : (window as unknown as Record<string, unknown>);
  return Boolean(w && (w["SpeechRecognition"] || w["webkitSpeechRecognition"]));
}

/** Always-on listener that fires when the spoken activation code is heard. */
export function useVoiceListener({
  enabled,
  lang,
  phrase,
  onTrigger,
  onTranscript,
}: {
  enabled: boolean;
  lang: string;
  phrase: string;
  onTrigger: () => void;
  onTranscript?: (text: string) => void;
}) {
  const [listening, setListening] = useState(false);
  const triggerRef = useRef(onTrigger);
  const transcriptRef = useRef(onTranscript);
  triggerRef.current = onTrigger;
  transcriptRef.current = onTranscript;

  useEffect(() => {
    if (!enabled) {
      setListening(false);
      return;
    }
    const rec = getRecognition();
    if (!rec) return;
    let stopped = false;
    rec.lang = lang;
    rec.continuous = true;
    rec.interimResults = true;
    rec.onresult = (e) => {
      const last = e.results[e.results.length - 1];
      const text = last?.[0]?.transcript?.toLowerCase().trim() ?? "";
      if (!text) return;
      transcriptRef.current?.(text);
      if (phrase && text.includes(phrase.toLowerCase())) triggerRef.current();
    };
    rec.onend = () => {
      if (!stopped) {
        try {
          rec.start();
        } catch {
          /* restart race */
        }
      }
    };
    rec.onerror = () => undefined;
    try {
      rec.start();
      setListening(true);
    } catch {
      setListening(false);
    }
    return () => {
      stopped = true;
      setListening(false);
      try {
        rec.stop();
      } catch {
        /* noop */
      }
    };
  }, [enabled, lang, phrase]);

  return { listening, supported: isVoiceSupported() };
}