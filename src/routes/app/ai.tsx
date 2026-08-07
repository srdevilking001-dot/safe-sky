import { createFileRoute } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { AppShell, Panel } from "@/components/safesky/shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LANGUAGES, speak, useLiveLocation, useReverseGeocode, useSafesky } from "@/lib/safesky";
import { isVoiceSupported } from "@/lib/voice";
import { Bot, Mic, Send, Volume2 } from "lucide-react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/app/ai")({
  head: () => ({
    meta: [
      { title: "AI assistant — SAFESKY" },
      { name: "description", content: "Get live emergency advice and incident analysis from the SAFESKY AI assistant." },
      { property: "og:title", content: "AI assistant — SAFESKY" },
      { property: "og:description", content: "Live emergency advice and incident analysis." },
    ],
  }),
  component: Assistant,
});

type Msg = { role: "user" | "ai"; text: string };

function advise(input: string, context: string): string {
  const q = input.toLowerCase();
  if (/follow|stalk|behind me/.test(q))
    return `Stay in a lit, public area and keep moving toward people. I am tracking ${context}. Tap SOS — your contacts and the command unit will receive your live location, and a drone can be dispatched.`;
  if (/hurt|bleed|injur|pain/.test(q))
    return "Apply firm pressure to the wound with clean cloth, keep the person warm and lying down, and do not give food or water. Ambulance dispatch is one tap away on the SOS screen.";
  if (/fire|smoke/.test(q))
    return "Move low under smoke, exit immediately and do not use lifts. Once outside, send an SOS so responders get your exact coordinates.";
  if (/lost|child|missing/.test(q))
    return "Share the last known location and a recent photo through Emergency History. I will flag the incident to the command unit for aerial search support.";
  if (/safe|status|analysis/.test(q))
    return `Incident analysis: no active threat signals detected near ${context}. Risk level low. Keep voice activation armed while travelling after dark.`;
  return `I'm with you. Describe what is happening — threat, injury, fire or someone missing — and I will give step-by-step guidance. Your location context: ${context}.`;
}

function Assistant() {
  const state = useSafesky();
  const { pos } = useLiveLocation();
  const address = useReverseGeocode(pos);
  const [messages, setMessages] = useState<Msg[]>([
    { role: "ai", text: "SAFESKY AI is online. Tell me what's happening and I'll guide you." },
  ]);
  const [input, setInput] = useState("");
  const [listening, setListening] = useState(false);
  const recRef = useRef<{ stop: () => void } | null>(null);

  const send = (text: string) => {
    const clean = text.trim();
    if (!clean) return;
    const context = address || (pos ? `${pos.lat.toFixed(3)}, ${pos.lng.toFixed(3)}` : "your area");
    const reply = advise(clean, context);
    setMessages((m) => [...m, { role: "user", text: clean }, { role: "ai", text: reply }]);
    setInput("");
    speak(reply, state.settings.language);
  };

  const listen = () => {
    const w = window as unknown as { SpeechRecognition?: new () => never; webkitSpeechRecognition?: new () => never };
    const Ctor = (w.SpeechRecognition ?? w.webkitSpeechRecognition) as unknown as
      | (new () => {
          lang: string;
          interimResults: boolean;
          start: () => void;
          stop: () => void;
          onresult: ((e: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null;
          onend: (() => void) | null;
        })
      | undefined;
    if (!Ctor) return;
    const rec = new Ctor();
    rec.lang = state.settings.language;
    rec.interimResults = false;
    rec.onresult = (e) => send(e.results[e.results.length - 1]?.[0]?.transcript ?? "");
    rec.onend = () => setListening(false);
    recRef.current = rec;
    rec.start();
    setListening(true);
  };

  return (
    <AppShell title="AI assistant">
      <Panel className="flex h-[70vh] flex-col">
        <div className="mb-3 flex items-center justify-between">
          <span className="flex items-center gap-2 text-sm">
            <Bot className="size-4 text-primary" /> Live emergency advisor
          </span>
          <span className="text-[11px] text-muted-foreground">
            {LANGUAGES.find((l) => l.code === state.settings.language)?.label}
          </span>
        </div>
        <div className="flex-1 space-y-3 overflow-y-auto pr-1">
          {messages.map((m, i) => (
            <div
              key={i}
              className={cn(
                "max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm",
                m.role === "user"
                  ? "ml-auto bg-primary/20"
                  : "border border-border bg-secondary/50",
              )}
            >
              {m.text}
              {m.role === "ai" && (
                <button
                  onClick={() => speak(m.text, state.settings.language)}
                  className="mt-1.5 flex items-center gap-1 text-[10px] text-muted-foreground"
                >
                  <Volume2 className="size-3" /> Speak
                </button>
              )}
            </div>
          ))}
        </div>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            send(input);
          }}
          className="mt-3 flex gap-2"
        >
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Describe the situation…"
            className="h-11"
          />
          <Button
            type="button"
            variant={listening ? "destructive" : "secondary"}
            className="h-11"
            disabled={!isVoiceSupported()}
            onClick={listen}
          >
            <Mic className="size-4" />
          </Button>
          <Button type="submit" className="h-11">
            <Send className="size-4" />
          </Button>
        </form>
      </Panel>
    </AppShell>
  );
}