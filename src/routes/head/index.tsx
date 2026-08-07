import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef } from "react";
import { toast } from "sonner";
import { AppShell, Panel, StatusPill } from "@/components/safesky/shell";
import { LiveMap } from "@/components/safesky/live-map";
import { Button } from "@/components/ui/button";
import { formatTime, setState, useSafesky } from "@/lib/safesky";
import { useEmergencySiren } from "@/lib/siren";
import { BellRing, Phone, Radio, VolumeX, MapPin } from "lucide-react";

export const Route = createFileRoute("/head/")({
  head: () => ({
    meta: [
      { title: "Command centre — SAFESKY" },
      { name: "description", content: "Receive SOS alerts, sound the emergency buzzer and coordinate drone response." },
      { property: "og:title", content: "Command centre — SAFESKY" },
      { property: "og:description", content: "Receive SOS alerts and coordinate drone response." },
    ],
  }),
  component: CommandCentre,
});

function CommandCentre() {
  const state = useSafesky();
  const siren = useEmergencySiren();
  const lastSeen = useRef<string | null>(null);
  const active = state.alerts.filter((a) => a.status !== "resolved");
  const latest = state.alerts[0];

  useEffect(() => {
    if (!latest) return;
    if (lastSeen.current === null) {
      lastSeen.current = latest.id;
      return;
    }
    if (latest.id !== lastSeen.current) {
      lastSeen.current = latest.id;
      toast.error(`Incoming SOS from ${latest.user}`);
      siren.start();
    }
  }, [latest?.id]);

  return (
    <AppShell variant="head" title="Command centre">
      <Panel
        className={siren.active ? "border-danger/60 bg-danger/10" : undefined}
        title="Emergency buzzer"
        icon={BellRing}
        action={<StatusPill ok={!siren.active} label={siren.active ? "Sounding" : "Silent"} />}
      >
        <div className="flex flex-wrap items-center gap-3">
          <p className="mr-auto text-sm text-muted-foreground">
            {siren.active
              ? `Buzzer + voice announcement running · ${Math.floor(siren.remaining / 60)}:${String(
                  siren.remaining % 60,
                ).padStart(2, "0")} left`
              : "Automatically sounds for 5 minutes when a new SOS arrives."}
          </p>
          <Button variant="secondary" className="h-10" onClick={siren.start} disabled={siren.active}>
            Test buzzer
          </Button>
          <Button variant="destructive" className="h-10" onClick={siren.stop}>
            <VolumeX className="mr-1 size-4" /> Switch off sound
          </Button>
        </div>
      </Panel>

      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <div className="grid gap-3 lg:col-span-2">
          <Panel title={`Incoming alerts (${active.length} active)`} icon={Radio}>
            {state.alerts.length === 0 ? (
              <p className="text-xs text-muted-foreground">
                No alerts received. Trigger an SOS in the user app to see it arrive here live.
              </p>
            ) : (
              <ul className="space-y-2">
                {state.alerts.map((a) => (
                  <li key={a.id} className="rounded-xl border border-border p-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="font-display text-sm">
                        {a.user} · {a.id}
                      </p>
                      <StatusPill ok={a.status === "resolved"} label={a.status} />
                    </div>
                    <p className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
                      <MapPin className="size-3.5" /> {a.address} · {a.lat.toFixed(4)}, {a.lng.toFixed(4)}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">{formatTime(a.createdAt)}</p>
                    <p className="mt-2 text-sm">{a.message}</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <Button asChild size="sm" variant="secondary" className="h-8 text-xs">
                        <a href={`tel:${a.phone.replace(/\s/g, "")}`}>
                          <Phone className="mr-1 size-3.5" /> Call victim
                        </a>
                      </Button>
                      <Button
                        size="sm"
                        variant="secondary"
                        className="h-8 text-xs"
                        onClick={() =>
                          setState((s) => ({
                            alerts: s.alerts.map((x) =>
                              x.id === a.id ? { ...x, status: "responding" } : x,
                            ),
                          }))
                        }
                      >
                        Dispatch drone
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 text-xs"
                        onClick={() => {
                          siren.stop();
                          setState((s) => ({
                            alerts: s.alerts.map((x) => (x.id === a.id ? { ...x, status: "resolved" } : x)),
                          }));
                        }}
                      >
                        Mark resolved
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </Panel>
        </div>

        <div className="grid gap-4">
          <Panel title="Victim location">
            {latest ? (
              <LiveMap lat={latest.lat} lng={latest.lng} zoom={17} label={latest.user} height={230} />
            ) : (
              <p className="text-xs text-muted-foreground">Awaiting an alert.</p>
            )}
          </Panel>
          <Panel title="Fleet status">
            <StatusPill ok={state.settings.droneConnected} label={state.settings.droneConnected ? "Drone online" : "Not connected"} />
            <p className="mt-2 text-[11px] text-muted-foreground">
              Pair a drone from the Drone dashboard to enable telemetry and camera feeds.
            </p>
          </Panel>
        </div>
      </div>
    </AppShell>
  );
}