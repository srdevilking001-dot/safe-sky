import { createFileRoute } from "@tanstack/react-router";
import { AppShell, Panel, StatusPill } from "@/components/safesky/shell";
import { LiveMap } from "@/components/safesky/live-map";
import { useLiveLocation, useReverseGeocode, useSafesky } from "@/lib/safesky";
import { MapPin, Siren, Radar } from "lucide-react";

export const Route = createFileRoute("/app/map")({
  head: () => ({
    meta: [
      { title: "Live map — SAFESKY" },
      { name: "description", content: "Track your live position, emergency markers and response routes." },
      { property: "og:title", content: "Live map — SAFESKY" },
      { property: "og:description", content: "Live position, emergency markers and response routes." },
    ],
  }),
  component: LiveMapScreen,
});

function LiveMapScreen() {
  const { pos, error } = useLiveLocation();
  const address = useReverseGeocode(pos);
  const state = useSafesky();
  const latest = state.alerts[0];

  return (
    <AppShell title="Live map">
      {pos ? (
        <LiveMap lat={pos.lat} lng={pos.lng} zoom={17} label="Your live position" height={420} />
      ) : (
        <Panel>
          <p className="text-xs text-muted-foreground">{error ?? "Locating you…"}</p>
        </Panel>
      )}

      <div className="mt-4 grid gap-4 sm:grid-cols-3">
        <Panel title="You" icon={MapPin}>
          <p className="text-xs text-muted-foreground">{address || "Resolving…"}</p>
        </Panel>
        <Panel title="Emergency marker" icon={Siren}>
          <p className="text-xs text-muted-foreground">
            {latest ? `${latest.id} · ${latest.address}` : "No active emergency"}
          </p>
        </Panel>
        <Panel title="Drone" icon={Radar}>
          <StatusPill ok={false} label="Not connected" />
          <p className="mt-2 text-[11px] text-muted-foreground">
            Drone tracking is controlled from the command app.
          </p>
        </Panel>
      </div>
      <p className="mt-3 text-[11px] text-muted-foreground">
        The blue route line opens in Google Maps navigation from the map toolbar.
      </p>
    </AppShell>
  );
}