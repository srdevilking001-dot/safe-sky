import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { DroneAnimation } from "@/components/safesky/brand";
import { Button } from "@/components/ui/button";
import { ShieldCheck, Radio } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "SAFESKY — AI Emergency Response Drone" },
      {
        name: "description",
        content:
          "Launch SAFESKY: one-tap SOS, live GPS sharing and AI drone response for women and children.",
      },
      { property: "og:title", content: "SAFESKY — AI Emergency Response Drone" },
      {
        property: "og:description",
        content: "One-tap SOS, live GPS sharing and AI drone response.",
      },
    ],
  }),
  component: Splash,
});

function Splash() {
  const navigate = useNavigate();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setReady(true), 1800);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (!ready) return;
    const t = setTimeout(() => navigate({ to: "/login" }), 2600);
    return () => clearTimeout(t);
  }, [ready, navigate]);

  return (
    <main className="bg-night flex min-h-screen flex-col items-center justify-center gap-8 px-6 text-center">
      <DroneAnimation size={230} />
      <div>
        <h1 className="font-display text-4xl font-bold tracking-[0.3em] text-gradient sm:text-5xl">
          SAFESKY
        </h1>
        <p className="mt-3 text-xs uppercase tracking-[0.35em] text-muted-foreground">
          AI Emergency Response Drone
        </p>
      </div>

      <div
        className={`flex w-full max-w-sm flex-col gap-3 transition-all duration-700 ${
          ready ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0"
        }`}
      >
        <Button asChild size="lg" className="h-12 rounded-xl">
          <Link to="/login">
            <ShieldCheck className="mr-1 size-4" /> Enter user app
          </Link>
        </Button>
        <Button asChild size="lg" variant="outline" className="h-12 rounded-xl">
          <Link to="/head">
            <Radio className="mr-1 size-4" /> Enter command (head) app
          </Link>
        </Button>
      </div>

      <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
        <span className="size-1.5 animate-pulse rounded-full bg-danger" />
        Initialising secure emergency channel…
      </div>
    </main>
  );
}
