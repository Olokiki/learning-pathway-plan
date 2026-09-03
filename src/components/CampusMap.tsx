import campusMap from "@/assets/campus-map.jpg";
import { BUILDINGS, type Building } from "@/data/campus";
import type { Route } from "@/lib/wayfinding";
import { avatarBg, type AvatarConfig } from "./AvatarPicker";

interface Props {
  avatar: AvatarConfig;
  position: { x: number; y: number };
  route: Route | null;
  origin: Building;
  destination: Building | null;
  onSelectBuilding: (building: Building) => void;
}

export function CampusMap({
  avatar,
  position,
  route,
  origin,
  destination,
  onSelectBuilding,
}: Props) {
  const routeD = route?.path.length
    ? route.path
        .map((p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(1)} ${p.y.toFixed(1)}`)
        .join(" ")
    : null;

  return (
    <div className="relative w-full overflow-hidden rounded-3xl border border-line bg-canvas">
      <img
        src={campusMap}
        alt="Illustrated map of Covenant University campus"
        width={1024}
        height={1280}
        className="block w-full"
      />

      <svg
        className="pointer-events-none absolute inset-0 h-full w-full"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        aria-hidden
      >
        {routeD && (
          <path
            key={routeD}
            d={routeD}
            fill="none"
            stroke="var(--accent)"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            vectorEffect="non-scaling-stroke"
            className="animate-draw-route"
          />
        )}
      </svg>

      {BUILDINGS.map((building) => {
        const isOrigin = building.id === origin.id;
        const isDestination = building.id === destination?.id;
        return (
          <button
            key={building.id}
            onClick={() => onSelectBuilding(building)}
            style={{ left: `${building.x}%`, top: `${building.y}%` }}
            className="absolute -translate-x-1/2 -translate-y-1/2"
          >
            <span
              className={`block whitespace-nowrap rounded-md border px-1.5 py-0.5 font-mono text-[9px] tracking-wide backdrop-blur-sm transition-colors ${
                isDestination
                  ? "border-accent bg-accent text-accent-foreground"
                  : isOrigin
                    ? "border-ink bg-ink text-primary-foreground"
                    : "border-line bg-panel/90 text-ink"
              }`}
            >
              {building.short.toUpperCase()}
            </span>
          </button>
        );
      })}

      {route?.steps.map((step) => (
        <span
          key={step.index}
          style={{ left: `${step.point.x}%`, top: `${step.point.y}%` }}
          className="pointer-events-none absolute grid size-5 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-ink font-mono text-[10px] text-primary-foreground ring-2 ring-panel"
        >
          {step.index}
        </span>
      ))}

      <div
        style={{ left: `${position.x}%`, top: `${position.y}%` }}
        className="pointer-events-none absolute -translate-x-1/2 -translate-y-1/2"
      >
        <div className="animate-bob relative">
          <div
            className={`grid size-9 place-items-center rounded-full text-base shadow-md ring-3 ring-panel ${avatarBg[avatar.colour]}`}
          >
            {avatar.face}
          </div>
        </div>
        <span className="absolute left-1/2 top-10 -translate-x-1/2 whitespace-nowrap rounded-full border border-line bg-panel/90 px-2 py-0.5 font-mono text-[9px] text-ink">
          {avatar.name} · {origin.short}
        </span>
      </div>
    </div>
  );
}
