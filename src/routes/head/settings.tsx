import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { AppShell, Panel } from "@/components/safesky/shell";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { LANGUAGES, setState, useSafesky } from "@/lib/safesky";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LogOut } from "lucide-react";

export const Route = createFileRoute("/head/settings")({
  head: () => ({
    meta: [
      { title: "Command settings — SAFESKY" },
      { name: "description", content: "Configure alert sounds, notifications and language for the SAFESKY command unit." },
      { property: "og:title", content: "Command settings — SAFESKY" },
      { property: "og:description", content: "Alert sound, notification and language settings." },
    ],
  }),
  component: HeadSettings,
});

function HeadSettings() {
  const state = useSafesky();
  const navigate = useNavigate();

  return (
    <AppShell variant="head" title="Settings">
      <div className="grid gap-4 lg:grid-cols-2">
        <Panel title="Alerting">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm">Notifications</p>
              <p className="text-xs text-muted-foreground">Buzzer and spoken announcement on new SOS</p>
            </div>
            <Switch
              checked={state.settings.notifications}
              onCheckedChange={(v) => state.update((s) => ({ settings: { ...s.settings, notifications: v } }))}
            />
          </div>
          <div className="mt-4 flex items-center justify-between gap-3">
            <div>
              <p className="text-sm">Drone auto-connect</p>
              <p className="text-xs text-muted-foreground">Scan nearby Wi-Fi for drone telemetry</p>
            </div>
            <Switch
              checked={state.settings.droneConnected}
              onCheckedChange={(v) => state.update((s) => ({ settings: { ...s.settings, droneConnected: v } }))}
            />
          </div>
        </Panel>

        <Panel title="Language & session">
          <Select
            value={state.settings.language}
            onValueChange={(v) => state.update((s) => ({ settings: { ...s.settings, language: v } }))}
          >
            <SelectTrigger className="h-11 w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {LANGUAGES.map((l) => (
                <SelectItem key={l.code} value={l.code}>
                  {l.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            variant="destructive"
            className="mt-5 h-11 w-full"
            onClick={() => {
              setState({ authed: false });
              toast.info("Command session closed");
              navigate({ to: "/login" });
            }}
          >
            <LogOut className="mr-1 size-4" /> Log out
          </Button>
        </Panel>
      </div>
    </AppShell>
  );
}