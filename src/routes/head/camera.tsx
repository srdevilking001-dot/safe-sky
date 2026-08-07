import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { AppShell, Panel, StatusPill } from "@/components/safesky/shell";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useSafesky } from "@/lib/safesky";
import { Camera, Circle, Video } from "lucide-react";

export const Route = createFileRoute("/head/camera")({
  head: () => ({
    meta: [
      { title: "Live camera — SAFESKY" },
      { name: "description", content: "Watch the drone video stream, capture stills and record incident footage." },
      { property: "og:title", content: "Live camera — SAFESKY" },
      { property: "og:description", content: "Drone video stream, stills and incident recording." },
    ],
  }),
  component: LiveCamera,
});

function LiveCamera() {
  const state = useSafesky();
  const connected = state.settings.droneConnected;
  const [recording, setRecording] = useState(false);
  const [shots, setShots] = useState(0);

  if (!connected) {
    return (
      <AppShell variant="head" title="Live camera">
        <Panel>
          <StatusPill ok={false} label="Not connected" />
          <p className="mt-2 text-xs text-muted-foreground">
            Connect a drone from the Drone dashboard to open the video feed.
          </p>
        </Panel>
      </AppShell>
    );
  }

  return (
    <AppShell variant="head" title="Live camera">
      <Tabs defaultValue="stream">
        <TabsList className="w-full">
          <TabsTrigger value="stream" className="flex-1">
            Stream
          </TabsTrigger>
          <TabsTrigger value="photo" className="flex-1">
            Capture
          </TabsTrigger>
          <TabsTrigger value="record" className="flex-1">
            Record
          </TabsTrigger>
        </TabsList>

        <TabsContent value="stream" className="mt-4">
          <Panel>
            <div className="relative aspect-video overflow-hidden rounded-xl border border-border bg-background/70">
              <div className="animate-scan absolute inset-x-0 h-1/4 bg-primary/10" />
              <div className="absolute inset-0 grid place-items-center text-xs text-muted-foreground">
                SAFESKY-01 · 1080p · 30fps
              </div>
              <span className="absolute left-3 top-3 flex items-center gap-1.5 rounded-full bg-danger/20 px-2 py-1 text-[10px] text-danger">
                <Circle className="size-2 fill-current" /> LIVE
              </span>
            </div>
          </Panel>
        </TabsContent>

        <TabsContent value="photo" className="mt-4">
          <Panel title="Capture image" icon={Camera}>
            <Button
              className="h-12 w-full"
              onClick={() => {
                setShots((s) => s + 1);
                toast.success("Still captured and attached to incident");
              }}
            >
              Capture image
            </Button>
            <p className="mt-2 text-xs text-muted-foreground">{shots} stills captured this session.</p>
          </Panel>
        </TabsContent>

        <TabsContent value="record" className="mt-4">
          <Panel title="Record video" icon={Video}>
            <Button
              variant={recording ? "destructive" : "default"}
              className="h-12 w-full"
              onClick={() => {
                setRecording((r) => !r);
                toast[recording ? "success" : "info"](recording ? "Recording saved" : "Recording started");
              }}
            >
              {recording ? "Stop recording" : "Start recording"}
            </Button>
          </Panel>
        </TabsContent>
      </Tabs>
    </AppShell>
  );
}