import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { AppShell, Panel, StatusPill } from "@/components/safesky/shell";
import { LiveMap } from "@/components/safesky/live-map";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { createAlert, speak, useLiveLocation, useReverseGeocode, useSafesky } from "@/lib/safesky";
import { Ambulance, ShieldAlert, Users, Radio } from "lucide-react";

export const Route = createFileRoute("/app/sos")({
  head: () => ({
    meta: [
      { title: "SOS — SAFESKY" },
      { name: "description", content: "Send a one-tap SOS with live location to contacts and responders." },
      { property: "og:title", content: "SOS — SAFESKY" },
      { property: "og:description", content: "One-tap emergency dispatch with live location." },
    ],
  }),
  component: SosScreen,
});

function SosScreen() {
  const state = useSafesky();
  const { pos } = useLiveLocation();
  const address = useReverseGeocode(pos);
  const [count, setCount] = useState<number | null>(null);
  const [sent, setSent] = useState(false);
  const [message, setMessage] = useState("SOS! I need immediate help. My live location is attached.");

  useEffect(() => {
    if (count === null) return;
    if (count === 0) {
      createAlert({ lat: pos?.lat, lng: pos?.lng, address: address || "Live location attached", message });
      speak("Emergency alert sent to your contacts and the command unit.", state.settings.language);
      toast.error("SOS dispatched to all channels");
      setSent(true);
      setCount(null);
      return;
    }
    const t = setTimeout(() => setCount((c) => (c ?? 1) - 1), 1000);
    return () => clearTimeout(t);
  }, [count, pos, address, message, state.settings.language]);

  const channels = [
    { label: "Police control room", icon: ShieldAlert },
    { label: "Ambulance dispatch", icon: Ambulance },
    { label: "Family contacts", icon: Users },
    { label: "SAFESKY command unit", icon: Radio },
  ];

  return (
    <AppShell title="Emergency SOS">
      <div className="grid gap-4 lg:grid-cols-2">
        <Panel className="flex flex-col items-center gap-5 py-8">
          <button
            onClick={() => (count === null ? setCount(5) : setCount(null))}
            className="animate-sos-pulse grid size-48 place-items-center rounded-full"
            style={{ backgroundImage: "var(--gradient-sos)" }}
          >
            <span className="font-display text-4xl font-bold text-danger-foreground">
              {count ?? "SOS"}
            </span>
          </button>
          <p className="text-xs text-muted-foreground">
            {count !== null ? "Tap again to cancel" : "One tap starts a 5 second countdown"}
          </p>
          <Textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={3}
            className="w-full"
          />
          <Button
            variant="secondary"
            className="h-10 w-full"
            onClick={() => {
              createAlert({ lat: pos?.lat, lng: pos?.lng, address, message });
              setSent(true);
              toast.success("Silent alert sent");
            }}
          >
            Send silent alert
          </Button>
        </Panel>

        <div className="grid gap-4">
          <Panel title="Notification status">
            <ul className="space-y-2">
              {channels.map((c) => (
                <li
                  key={c.label}
                  className="flex items-center justify-between rounded-xl border border-border px-3 py-2"
                >
                  <span className="flex items-center gap-2 text-sm">
                    <c.icon className="size-4 text-danger" /> {c.label}
                  </span>
                  <StatusPill ok={sent} label={sent ? "Notified" : "Standby"} />
                </li>
              ))}
            </ul>
            {sent && (
              <p className="mt-3 text-xs text-success">
                Calls, SMS and push notifications were placed to {state.contacts.length} saved contacts.
              </p>
            )}
          </Panel>

          {pos ? (
            <LiveMap lat={pos.lat} lng={pos.lng} zoom={17} label="Emergency location" height={300} />
          ) : (
            <Panel title="Live GPS">
              <p className="text-xs text-muted-foreground">Acquiring precise location…</p>
            </Panel>
          )}
        </div>
      </div>
    </AppShell>
  );
}