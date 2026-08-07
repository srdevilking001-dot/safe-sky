import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { AppShell, Panel } from "@/components/safesky/shell";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { LANGUAGES, setState, useSafesky } from "@/lib/safesky";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { LogOut } from "lucide-react";

export const Route = createFileRoute("/app/settings")({
  head: () => ({
    meta: [
      { title: "Settings — SAFESKY" },
      { name: "description", content: "Control notifications, language, privacy and voice activation in SAFESKY." },
      { property: "og:title", content: "Settings — SAFESKY" },
      { property: "og:description", content: "Notifications, language, privacy and voice activation." },
    ],
  }),
  component: SettingsScreen,
});

function SettingsScreen() {
  const state = useSafesky();
  const navigate = useNavigate();

  const toggles = [
    { key: "notifications" as const, label: "Push notifications", desc: "Alerts, responder updates and drone events" },
    { key: "voiceActivation" as const, label: "Voice activation", desc: "Listen for your secret phrase in the background" },
    { key: "privacyShareLocation" as const, label: "Share live location", desc: "Contacts and command unit see your position during an SOS" },
  ];

  return (
    <AppShell title="Settings">
      <div className="grid gap-4 lg:grid-cols-2">
        <Panel title="Preferences">
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm">Dark mode</p>
                <p className="text-xs text-muted-foreground">SAFESKY is optimised for night operations</p>
              </div>
              <Switch checked disabled />
            </div>
            {toggles.map((t) => (
              <div key={t.key} className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm">{t.label}</p>
                  <p className="text-xs text-muted-foreground">{t.desc}</p>
                </div>
                <Switch
                  checked={state.settings[t.key]}
                  onCheckedChange={(v) => state.update((s) => ({ settings: { ...s.settings, [t.key]: v } }))}
                />
              </div>
            ))}
          </div>
        </Panel>

        <Panel title="Language & privacy">
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
          <p className="mt-3 text-xs text-muted-foreground">
            Voice input and spoken AI replies follow this language. Location data is encrypted and only
            shared during an active emergency.
          </p>
          <Button
            variant="destructive"
            className="mt-5 h-11 w-full"
            onClick={() => {
              setState({ authed: false });
              toast.info("Signed out");
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