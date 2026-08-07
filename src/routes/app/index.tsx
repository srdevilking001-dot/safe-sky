import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { AppShell, Panel, StatusPill } from "@/components/safesky/shell";
import { LiveMap } from "@/components/safesky/live-map";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import {
  createAlert,
  formatTime,
  speak,
  useLiveLocation,
  useReverseGeocode,
  useSafesky,
  useWeather,
} from "@/lib/safesky";
import { useVoiceListener } from "@/lib/voice";
import {
  CloudSun,
  MapPin,
  Mic,
  Phone,
  ShieldCheck,
  Siren,
  Video,
  MessageSquare,
  Bot,
  Users,
} from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/app/")({
  head: () => ({
    meta: [
      { title: "Safety dashboard — SAFESKY" },
      { name: "description", content: "Live GPS, weather, AI safety status and one-tap SOS in SAFESKY." },
      { property: "og:title", content: "Safety dashboard — SAFESKY" },
      { property: "og:description", content: "Live GPS, weather, AI safety status and one-tap SOS." },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const state = useSafesky();
  const navigate = useNavigate();
  const { pos, error } = useLiveLocation();
  const weather = useWeather(pos);
  const address = useReverseGeocode(pos);
  const [heard, setHeard] = useState("");

  const trigger = () => {
    speak("SAFESKY emergency activated. Alerting your contacts now.", state.settings.language);
    createAlert({ lat: pos?.lat, lng: pos?.lng, address: address || "Live location attached" });
    toast.error("Voice code detected — SOS dispatched");
    navigate({ to: "/app/sos" });
  };

  const { listening, supported } = useVoiceListener({
    enabled: state.settings.voiceActivation,
    lang: state.settings.language,
    phrase: state.settings.voiceCode,
    onTrigger: trigger,
    onTranscript: setHeard,
  });

  const safetyScore = weather && weather.code >= 61 ? 72 : 91;

  return (
    <AppShell title={`Hello, ${state.profile.name.split(" ")[0]}`}>
      <div className="grid gap-4 lg:grid-cols-3">
        <Panel className="lg:col-span-2 flex flex-col items-center gap-4 py-8">
          <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Emergency SOS</p>
          <Link
            to="/app/sos"
            className="animate-sos-pulse grid size-44 place-items-center rounded-full text-center sm:size-52"
            style={{ backgroundImage: "var(--gradient-sos)" }}
          >
            <span className="font-display text-3xl font-bold tracking-[0.2em] text-danger-foreground">
              SOS
            </span>
          </Link>
          <p className="max-w-xs text-center text-xs text-muted-foreground">
            Tap to start a 5-second countdown. Alerts, calls and messages go to your contacts and the
            command unit automatically.
          </p>
        </Panel>

        <div className="grid gap-4">
          <Panel title="Live GPS location" icon={MapPin}>
            {pos ? (
              <>
                <p className="text-sm font-medium">{address || "Resolving address…"}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {pos.lat.toFixed(5)}, {pos.lng.toFixed(5)} · ±{Math.round(pos.accuracy)}m
                </p>
              </>
            ) : (
              <p className="text-xs text-muted-foreground">{error ?? "Acquiring satellite fix…"}</p>
            )}
          </Panel>

          <Panel title="Weather" icon={CloudSun}>
            {weather ? (
              <div className="flex items-end justify-between">
                <p className="font-display text-3xl">{weather.temp}°C</p>
                <div className="text-right text-xs text-muted-foreground">
                  <p>{weather.label}</p>
                  <p>Wind {weather.wind} km/h</p>
                </div>
              </div>
            ) : (
              <p className="text-xs text-muted-foreground">Waiting for location…</p>
            )}
          </Panel>

          <Panel title="AI safety status" icon={ShieldCheck}>
            <div className="flex items-center justify-between">
              <p className="font-display text-3xl">{safetyScore}%</p>
              <StatusPill ok={safetyScore > 80} label={safetyScore > 80 ? "Safe zone" : "Stay alert"} />
            </div>
            <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-muted">
              <div className="h-full rounded-full bg-success" style={{ width: `${safetyScore}%` }} />
            </div>
          </Panel>
        </div>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <Panel title="Voice activation" icon={Mic} className="lg:col-span-2">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm">Always-on listening for your secret code</p>
              <p className="mt-1 text-xs text-muted-foreground">
                {supported
                  ? listening
                    ? "Listening in the background…"
                    : "Turn on to grant microphone access"
                  : "Voice recognition is not supported in this browser"}
              </p>
            </div>
            <Switch
              checked={state.settings.voiceActivation}
              onCheckedChange={(v) => {
                state.update((s) => ({ settings: { ...s.settings, voiceActivation: v } }));
                toast[v ? "success" : "info"](v ? "Voice activation armed" : "Voice activation off");
              }}
            />
          </div>
          <div className="mt-3 flex flex-col gap-2 sm:flex-row">
            <Input
              value={state.settings.voiceCode}
              onChange={(e) =>
                state.update((s) => ({ settings: { ...s.settings, voiceCode: e.target.value } }))
              }
              placeholder="Activation phrase"
              className="h-10"
            />
            <Button variant="secondary" className="h-10" onClick={trigger}>
              Test trigger
            </Button>
          </div>
          {heard && <p className="mt-2 text-[11px] text-muted-foreground">Heard: “{heard}”</p>}
        </Panel>

        <Panel title="Quick actions">
          <div className="grid grid-cols-2 gap-2">
            {[
              { label: "Call police", icon: Phone, href: "tel:112" },
              { label: "Ambulance", icon: Siren, href: "tel:108" },
              { label: "Fake call", icon: Video, action: () => toast.info("Fake call starting in 5s…") },
              { label: "Share status", icon: MessageSquare, action: () => toast.success("Status shared with contacts") },
            ].map((a) =>
              a.href ? (
                <a
                  key={a.label}
                  href={a.href}
                  className="flex flex-col items-center gap-2 rounded-xl border border-border p-3 text-xs hover:bg-secondary/60"
                >
                  <a.icon className="size-4 text-danger" />
                  {a.label}
                </a>
              ) : (
                <button
                  key={a.label}
                  onClick={a.action}
                  className="flex flex-col items-center gap-2 rounded-xl border border-border p-3 text-xs hover:bg-secondary/60"
                >
                  <a.icon className="size-4 text-primary" />
                  {a.label}
                </button>
              ),
            )}
          </div>
          <Button asChild variant="outline" className="mt-3 h-10 w-full">
            <Link to="/app/ai">
              <Bot className="mr-1 size-4" /> Ask AI assistant
            </Link>
          </Button>
        </Panel>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <Panel title="Emergency contacts" icon={Users}>
          <ul className="space-y-2">
            {state.contacts.map((c) => (
              <li
                key={c.id}
                className="flex items-center justify-between rounded-xl border border-border px-3 py-2"
              >
                <div>
                  <p className="text-sm">{c.name}</p>
                  <p className="text-xs text-muted-foreground">{c.phone}</p>
                </div>
                <Button asChild size="sm" variant="secondary" className="h-8">
                  <a href={`tel:${c.phone.replace(/\s/g, "")}`}>
                    <Phone className="size-3.5" />
                  </a>
                </Button>
              </li>
            ))}
          </ul>
          <Button asChild variant="ghost" className="mt-2 h-9 w-full text-xs">
            <Link to="/app/profile">Manage contacts</Link>
          </Button>
        </Panel>

        <Panel title="Recent alerts">
          {state.alerts.length === 0 ? (
            <p className="text-xs text-muted-foreground">No alerts yet. You're safe.</p>
          ) : (
            <ul className="space-y-2">
              {state.alerts.slice(0, 4).map((a) => (
                <li key={a.id} className="rounded-xl border border-border px-3 py-2">
                  <div className="flex items-center justify-between">
                    <p className="text-sm">{a.id}</p>
                    <StatusPill ok={a.status === "resolved"} label={a.status} />
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {formatTime(a.createdAt)} · {a.address}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>

      {pos && (
        <div className="mt-4">
          <LiveMap lat={pos.lat} lng={pos.lng} label="You are here" height={280} />
        </div>
      )}
    </AppShell>
  );
}