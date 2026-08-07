import logo from "@/assets/safesky-logo.png";
import { cn } from "@/lib/utils";

export function Logo({ className, size = 40 }: { className?: string; size?: number }) {
  return (
    <img
      src={logo}
      alt="SAFESKY logo"
      width={size}
      height={size}
      className={cn("object-contain drop-shadow-[0_0_20px_rgba(220,40,60,0.35)]", className)}
    />
  );
}

export function Wordmark({ compact = false }: { compact?: boolean }) {
  return (
    <div className="flex items-center gap-2">
      <Logo size={compact ? 30 : 38} />
      <div className="leading-none">
        <p className="font-display text-lg font-bold tracking-[0.22em] text-gradient">SAFESKY</p>
        {!compact && (
          <p className="mt-1 text-[10px] uppercase tracking-[0.28em] text-muted-foreground">
            AI Emergency Response Drone
          </p>
        )}
      </div>
    </div>
  );
}

export function DroneAnimation({ size = 200 }: { size?: number }) {
  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <div className="absolute inset-0 rounded-full border border-primary/25" />
      <div className="absolute inset-6 rounded-full border border-primary/15" />
      <div className="animate-radar absolute inset-0 rounded-full bg-[conic-gradient(from_0deg,transparent_0deg,color-mix(in_oklab,var(--primary)_40%,transparent)_40deg,transparent_60deg)]" />
      <Logo size={size * 0.55} className="animate-drone-float relative z-10" />
    </div>
  );
}