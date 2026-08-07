import { createFileRoute } from "@tanstack/react-router";
import { AppShell, Panel, StatusPill } from "@/components/safesky/shell";
import { LiveMap } from "@/components/safesky/live-map";
import { useLiveLocation, useSafesky } from "@/lib/safesky";

export const Route = createFileRoute("/head/map")({
  head: () => ({
    meta: [
      { title: "Response map — SAFESKY" },
      { name: "description", content: "See victim markers, unit position and drone location on the response map." },
      { property: "og:title", content: "Response map — SAFESKY" },
      { property: "og:description", content: "Victim markers, unit position and drone location." },
    ],
  }),
  component: HeadMap,
});

function HeadMap() {
  const state = useSafesky();
  const { pos } = useLiveLocation();
  const target = state.alerts[0] ?? (pos ? { lat: pos.lat, lng: pos.lng, address: "Unit position", user: "Command unit" } : null);

  return (
    <AppShell variant="head" title="Response map">
      {target ? (
        <LiveMap lat={target.lat} lng={target.lng} zoom={17} label={target.user} height={440} />
      ) : (
        <Panel>
          <p className="text-xs text-muted-foreground">Waiting for a position fix or an incoming alert.</p>
        </Panel>
      )}
      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        <Panel title="Active incidents">
          <p className="font-display text-2xl">{state.alerts.filter((a) => a.status !== "resolved").length}</p>
        </Panel>
        <Panel title="Drone link">
          <StatusPill ok={state.settings.droneConnected} label={state.settings.droneConnected ? "Airborne" : "Not connected"} />
        </Panel>
        <Panel title="Route">
          <p className="text-xs text-muted-foreground">Blue navigation route opens from the map toolbar.</p>
        </Panel>
      </div>
    </AppShell>
  );
}