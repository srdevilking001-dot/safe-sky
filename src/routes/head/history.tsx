import { createFileRoute } from "@tanstack/react-router";
import { AppShell, Panel, StatusPill } from "@/components/safesky/shell";
import { formatTime, useSafesky } from "@/lib/safesky";

export const Route = createFileRoute("/head/history")({
  head: () => ({
    meta: [
      { title: "Incident log — SAFESKY" },
      { name: "description", content: "Full incident log of every SOS received by the SAFESKY command unit." },
      { property: "og:title", content: "Incident log — SAFESKY" },
      { property: "og:description", content: "Every SOS received by the command unit." },
    ],
  }),
  component: HeadHistory,
});

function HeadHistory() {
  const state = useSafesky();
  return (
    <AppShell variant="head" title="Incident log">
      {state.alerts.length === 0 ? (
        <Panel>
          <p className="text-sm text-muted-foreground">No incidents logged.</p>
        </Panel>
      ) : (
        <div className="grid gap-3">
          {state.alerts.map((a) => (
            <Panel key={a.id}>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="font-display text-sm">
                  {a.id} · {a.user}
                </p>
                <StatusPill ok={a.status === "resolved"} label={a.status} />
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                {formatTime(a.createdAt)} · {a.address} · {a.lat.toFixed(4)}, {a.lng.toFixed(4)}
              </p>
              <p className="mt-2 text-sm">{a.message}</p>
            </Panel>
          ))}
        </div>
      )}
    </AppShell>
  );
}