import { Link, useRouterState } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Wordmark } from "./brand";
import {
  Home,
  Siren,
  Map,
  Bot,
  History,
  User,
  Settings,
  Radar,
  Camera,
  BellRing,
} from "lucide-react";

const USER_NAV = [
  { to: "/app", label: "Home", icon: Home },
  { to: "/app/sos", label: "SOS", icon: Siren },
  { to: "/app/map", label: "Map", icon: Map },
  { to: "/app/ai", label: "AI", icon: Bot },
  { to: "/app/history", label: "History", icon: History },
  { to: "/app/profile", label: "Profile", icon: User },
  { to: "/app/settings", label: "Settings", icon: Settings },
];

const HEAD_NAV = [
  { to: "/head", label: "Alerts", icon: BellRing },
  { to: "/head/drone", label: "Drone", icon: Radar },
  { to: "/head/camera", label: "Camera", icon: Camera },
  { to: "/head/map", label: "Map", icon: Map },
  { to: "/head/history", label: "History", icon: History },
  { to: "/head/settings", label: "Settings", icon: Settings },
];

export function AppShell({
  children,
  variant = "user",
  title,
}: {
  children: ReactNode;
  variant?: "user" | "head";
  title: string;
}) {
  const nav = variant === "head" ? HEAD_NAV : USER_NAV;
  const path = useRouterState({ select: (s) => s.location.pathname });

  return (
    <div className="bg-night min-h-screen text-foreground">
      <div className="mx-auto flex min-h-screen w-full max-w-7xl">
        <aside className="glass sticky top-0 hidden h-screen w-64 shrink-0 flex-col gap-1 p-5 lg:flex">
          <Wordmark />
          <p className="mt-6 mb-2 text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
            {variant === "head" ? "Command centre" : "Personal safety"}
          </p>
          {nav.map((item) => {
            const active = path === item.to;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors",
                  active
                    ? "bg-primary/15 text-foreground glow"
                    : "text-muted-foreground hover:bg-secondary/60 hover:text-foreground",
                )}
              >
                <item.icon className="size-4" />
                {item.label}
              </Link>
            );
          })}
          <div className="mt-auto rounded-xl border border-border p-3 text-xs text-muted-foreground">
            {variant === "head" ? (
              <Link to="/app">Switch to user app →</Link>
            ) : (
              <Link to="/head">Open command app →</Link>
            )}
          </div>
        </aside>

        <main className="flex w-full flex-1 flex-col pb-24 lg:pb-6">
          <header className="glass sticky top-0 z-30 flex items-center justify-between gap-3 px-4 py-3 lg:px-6">
            <div className="lg:hidden">
              <Wordmark compact />
            </div>
            <h1 className="font-display hidden text-lg font-semibold tracking-wide lg:block">{title}</h1>
            <span
              className={cn(
                "rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em]",
                variant === "head"
                  ? "bg-danger/15 text-danger"
                  : "bg-primary/15 text-primary-foreground/80",
              )}
            >
              {variant === "head" ? "Head unit" : "User"}
            </span>
          </header>
          <div className="flex-1 px-4 py-5 lg:px-6">
            <h1 className="font-display mb-4 text-2xl font-semibold tracking-tight lg:hidden">{title}</h1>
            {children}
          </div>
        </main>
      </div>

      <nav className="glass fixed inset-x-0 bottom-0 z-40 flex items-center justify-between gap-1 px-2 py-2 lg:hidden">
        {nav.slice(0, 5).map((item) => {
          const active = path === item.to;
          return (
            <Link
              key={item.to}
              to={item.to}
              className={cn(
                "flex flex-1 flex-col items-center gap-1 rounded-lg py-1.5 text-[10px] transition-colors",
                active ? "text-foreground" : "text-muted-foreground",
              )}
            >
              <item.icon className={cn("size-5", active && "text-danger")} />
              {item.label}
            </Link>
          );
        })}
        <Link
          to={variant === "head" ? "/head/settings" : "/app/settings"}
          className="flex flex-1 flex-col items-center gap-1 py-1.5 text-[10px] text-muted-foreground"
        >
          <Settings className="size-5" />
          More
        </Link>
      </nav>
    </div>
  );
}

export function Panel({
  title,
  icon: Icon,
  action,
  children,
  className,
}: {
  title?: string;
  icon?: React.ComponentType<{ className?: string }>;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("glass rounded-2xl p-4", className)}>
      {title && (
        <div className="mb-3 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            {Icon && <Icon className="size-4 text-primary" />}
            <h2 className="text-sm font-semibold tracking-wide">{title}</h2>
          </div>
          {action}
        </div>
      )}
      {children}
    </section>
  );
}

export function StatusPill({ ok, label }: { ok: boolean; label: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider",
        ok ? "bg-success/15 text-success" : "bg-muted text-muted-foreground",
      )}
    >
      <span className={cn("size-1.5 rounded-full", ok ? "bg-success" : "bg-muted-foreground")} />
      {label}
    </span>
  );
}