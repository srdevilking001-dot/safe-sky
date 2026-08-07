import { ExternalLink, Layers, Route as RouteIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

export function LiveMap({
  lat,
  lng,
  zoom = 16,
  label = "Current location",
  height = 320,
}: {
  lat: number;
  lng: number;
  zoom?: number;
  label?: string;
  height?: number;
}) {
  const d = 0.006 * (17 - Math.min(zoom, 16) + 1);
  const bbox = `${lng - d},${lat - d},${lng + d},${lat + d}`;
  const src = `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${lat},${lng}`;

  return (
    <div className="overflow-hidden rounded-2xl border border-border">
      <iframe
        title={label}
        src={src}
        style={{ height }}
        loading="lazy"
        className="w-full border-0 grayscale-[0.25] contrast-110"
      />
      <div className="flex flex-wrap items-center gap-2 bg-surface/70 p-2.5">
        <span className="mr-auto text-[11px] text-muted-foreground">
          {label} · {lat.toFixed(5)}, {lng.toFixed(5)}
        </span>
        <Button asChild size="sm" variant="secondary" className="h-8 text-xs">
          <a
            href={`https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=${lat},${lng}`}
            target="_blank"
            rel="noreferrer"
          >
            <Layers className="mr-1 size-3.5" /> Street / 3D view
          </a>
        </Button>
        <Button asChild size="sm" variant="secondary" className="h-8 text-xs">
          <a
            href={`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&travelmode=driving`}
            target="_blank"
            rel="noreferrer"
          >
            <RouteIcon className="mr-1 size-3.5" /> Route to emergency
          </a>
        </Button>
        <Button asChild size="sm" variant="ghost" className="h-8 text-xs">
          <a href={`https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}#map=18/${lat}/${lng}`} target="_blank" rel="noreferrer">
            <ExternalLink className="size-3.5" />
          </a>
        </Button>
      </div>
    </div>
  );
}