import { createFileRoute } from "@tanstack/react-router";
import { AppShell, Panel, StatusPill } from "@/components/safesky/shell";
import { formatTime, useSafesky } from "@/lib/safesky";
import { Camera, Video, MapPin } from "lucide-react";

export const Route = createFileRoute("/app/history")({
  head: () => ({
    meta: [
      { title: "Emergency history — SAFESKY" },
      { name: "description", content: "Review past SAFESKY alerts with date, time, location, status and media." },
      { property: "og:title", content: "Emergency history — SAFESKY" },
      { property: "og:description", content: "Past alerts with location, status and recorded media." },
    ],
  }),
  component: HistoryScreen,
});

function HistoryScreen() {
  const state = useSafesky();
  return (
    <AppShell title="Emergency history">
      {state.alerts.length === 0 ? (
        <Panel>
          <p className="text-sm text-muted-foreground">No emergencies recorded yet.</p>
        </Panel>
      ) : (
        <div className="grid gap-3">
          {state.alerts.map((a) => (
            <Panel key={a.id}>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="font-display text-sm">{a.id}</p>
                <StatusPill ok={a.status === "resolved"} label={a.status} />
              </div>
              <p className="mt-2 text-xs text-muted-foreground">{formatTime(a.createdAt)}</p>
              <p className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
                <MapPin className="size-3.5" /> {a.address} ({a.lat.toFixed(4)}, {a.lng.toFixed(4)})
              </p>
              <p className="mt-2 text-sm">{a.message}</p>
              <div className="mt-3 flex gap-2">
                <span className="flex items-center gap-1 rounded-lg border border-border px-2 py-1 text-[11px] text-muted-foreground">
                  <Camera className="size-3.5" /> {a.media.filter((m) => m.type === "photo").length} photos
                </span>
                <span className="flex items-center gap-1 rounded-lg border border-border px-2 py-1 text-[11px] text-muted-foreground">
                  <Video className="size-3.5" /> {a.media.filter((m) => m.type === "video").length} clips
                </span>
              </div>
            </Panel>
          ))}
        </div>
      )}
    </AppShell>
  );
}