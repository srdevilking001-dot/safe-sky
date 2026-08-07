import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { AppShell, Panel } from "@/components/safesky/shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useSafesky } from "@/lib/safesky";
import { Logo } from "@/components/safesky/brand";
import { Trash2, UserPlus } from "lucide-react";

export const Route = createFileRoute("/app/profile")({
  head: () => ({
    meta: [
      { title: "Profile — SAFESKY" },
      { name: "description", content: "Manage your SAFESKY profile, blood group and emergency contacts." },
      { property: "og:title", content: "Profile — SAFESKY" },
      { property: "og:description", content: "Manage profile details and emergency contacts." },
    ],
  }),
  component: ProfileScreen,
});

function ProfileScreen() {
  const state = useSafesky();
  const [contact, setContact] = useState({ name: "", phone: "", relation: "Family" });

  const field = (key: "name" | "email" | "phone" | "bloodGroup", label: string) => (
    <div className="space-y-2">
      <Label>{label}</Label>
      <Input
        value={state.profile[key]}
        onChange={(e) => state.update((s) => ({ profile: { ...s.profile, [key]: e.target.value } }))}
        className="h-11"
      />
    </div>
  );

  return (
    <AppShell title="Profile">
      <div className="grid gap-4 lg:grid-cols-2">
        <Panel>
          <div className="flex items-center gap-4">
            <div className="grid size-16 place-items-center rounded-full bg-secondary">
              <Logo size={40} />
            </div>
            <div>
              <p className="font-display text-lg">{state.profile.name}</p>
              <p className="text-xs text-muted-foreground">{state.profile.email}</p>
            </div>
          </div>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            {field("name", "Full name")}
            {field("email", "Email")}
            {field("phone", "Phone")}
            {field("bloodGroup", "Blood group")}
          </div>
          <Button className="mt-4 h-11 w-full" onClick={() => toast.success("Profile saved")}>
            Save profile
          </Button>
        </Panel>

        <Panel title="Emergency contacts">
          <ul className="space-y-2">
            {state.contacts.map((c) => (
              <li key={c.id} className="flex items-center justify-between rounded-xl border border-border px-3 py-2">
                <div>
                  <p className="text-sm">{c.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {c.phone} · {c.relation}
                  </p>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => state.update((s) => ({ contacts: s.contacts.filter((x) => x.id !== c.id) }))}
                >
                  <Trash2 className="size-4 text-danger" />
                </Button>
              </li>
            ))}
          </ul>
          <div className="mt-4 grid gap-2 sm:grid-cols-3">
            <Input
              placeholder="Name"
              value={contact.name}
              onChange={(e) => setContact({ ...contact, name: e.target.value })}
            />
            <Input
              placeholder="Phone"
              value={contact.phone}
              onChange={(e) => setContact({ ...contact, phone: e.target.value })}
            />
            <Input
              placeholder="Relation"
              value={contact.relation}
              onChange={(e) => setContact({ ...contact, relation: e.target.value })}
            />
          </div>
          <Button
            variant="secondary"
            className="mt-2 h-10 w-full"
            onClick={() => {
              if (!contact.name || !contact.phone) {
                toast.error("Add a name and phone number.");
                return;
              }
              state.update((s) => ({
                contacts: [...s.contacts, { id: `c${Date.now()}`, ...contact }],
              }));
              setContact({ name: "", phone: "", relation: "Family" });
              toast.success("Contact added — they'll be alerted automatically");
            }}
          >
            <UserPlus className="mr-1 size-4" /> Add contact
          </Button>
        </Panel>
      </div>
    </AppShell>
  );
}