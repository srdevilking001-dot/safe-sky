import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { AppShell, Panel, StatusPill } from "@/components/safesky/shell";
import { Button } from "@/components/ui/button";
import { useSafesky } from "@/lib/safesky";
import { BatteryCharging, Gauge, Mountain, Radar, Satellite, Video, Wifi } from "lucide-react";

export const Route = createFileRoute("/head/drone")({
  head: () => ({
    meta: [
      { title: "Drone dashboard — SAFESKY" },
      { name: "description", content: "Monitor drone battery, GPS, camera, mission, speed, altitude and telemetry." },
      { property: "og:title", content: "Drone dashboard — SAFESKY" },
      { property: "og:description", content: "Live drone telemetry for emergency response." },
    ],
  }),
  component: DroneDashboard,
});

function DroneDashboard() {
  const state = useSafesky();
  const connected = state.settings.droneConnected;
  const [scanning, setScanning] = useState(false);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    if (!connected) return;
    const t = setInterval(() => setTick((x) => x + 1), 1500);
    return () => clearInterval(t);
  }, [connected]);

  const jitter = (base: number, spread: number) => (base + Math.sin(tick / 2) * spread).toFixed(1);

  const metrics = [
    { label: "Battery", icon: BatteryCharging, value: connected ? `${Math.max(41, 78 - tick * 0.2).toFixed(0)}%` : null },
    { label: "GPS signal", icon: Satellite, value: connected ? `${12 + (tick % 3)} sats · strong` : null },
    { label: "Camera", icon: Video, value: connected ? "Streaming 1080p" : null },
    { label: "Mission", icon: Radar, value: connected ? "Patrol · sector 4" : null },
    { label: "Speed", icon: Gauge, value: connected ? `${jitter(24, 4)} km/h` : null },
    { label: "Altitude", icon: Mountain, value: connected ? `${jitter(85, 6)} m` : null },
  ];

  const scan = () => {
    setScanning(true);
    setTimeout(() => {
      setScanning(false);
      state.update((s) => ({ settings: { ...s.settings, droneConnected: true } }));
      toast.success("SAFESKY-01 found on local Wi-Fi and linked");
    }, 2200);
  };

  return (
    <AppShell variant="head" title="Drone dashboard">
      <Panel
        title="Link status"
        icon={Wifi}
        action={<StatusPill ok={connected} label={connected ? "Connected" : "Not connected"} />}
      >
        <div className="flex flex-wrap items-center gap-3">
          <p className="mr-auto text-xs text-muted-foreground">
            {connected
              ? "SAFESKY-01 linked over local Wi-Fi telemetry bridge."
              : "Switch on scanning to auto-detect drones broadcasting on nearby Wi-Fi signals."}
          </p>
          {connected ? (
            <Button
              variant="destructive"
              className="h-10"
              onClick={() => state.update((s) => ({ settings: { ...s.settings, droneConnected: false } }))}
            >
              Disconnect
            </Button>
          ) : (
            <Button className="h-10" onClick={scan} disabled={scanning}>
              {scanning ? "Scanning Wi-Fi…" : "Scan & connect"}
            </Button>
          )}
        </div>
      </Panel>

      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {metrics.map((m) => (
          <Panel key={m.label} title={m.label} icon={m.icon}>
            {m.value ? (
              <p className="font-display text-2xl">{m.value}</p>
            ) : (
              <StatusPill ok={false} label="Not connected" />
            )}
          </Panel>
        ))}
      </div>

      <Panel title="Live telemetry" className="mt-4">
        {connected ? (
          <pre className="max-h-56 overflow-auto rounded-xl bg-background/60 p-3 text-[11px] text-success">
{Array.from({ length: 8 }).map((_, i) =>
  `t+${(tick - i) * 1.5}s  alt=${jitter(85, 6)}m  spd=${jitter(24, 4)}km/h  hdg=${(120 + i * 3) % 360}°  link=98%\n`,
).join("")}
          </pre>
        ) : (
          <StatusPill ok={false} label="Not connected" />
        )}
      </Panel>
    </AppShell>
  );
}