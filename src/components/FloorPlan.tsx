import type { Building, Floor } from "@/data/campus";
import type { IndoorRoute } from "@/lib/wayfinding";

interface Props {
  building: Building;
  floor: Floor;
  legs: IndoorRoute[];
  fromRoomId: string | null;
  toRoomId: string | null;
  onSelectRoom: (roomId: string) => void;
}

export function FloorPlan({ building, floor, legs, fromRoomId, toRoomId, onSelectRoom }: Props) {
  const leg = legs.find((l) => l.floorId === floor.id);
  const d = leg?.path.length
    ? leg.path.map((p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(" ")
    : null;

  return (
    <div className="relative aspect-[4/5] w-full overflow-hidden rounded-3xl border border-line bg-panel">
      <svg viewBox="0 0 100 100" className="absolute inset-0 h-full w-full" preserveAspectRatio="none">
        {floor.shell.map(([x, y, w, h], i) => (
          <rect
            key={i}
            x={x}
            y={y}
            width={w}
            height={h}
            rx={1.5}
            fill={i === 0 ? "var(--canvas)" : "var(--accent-soft)"}
            stroke="var(--ink)"
            strokeOpacity={0.14}
            strokeWidth={0.4}
            vectorEffect="non-scaling-stroke"
          />
        ))}
        {floor.edges.map(([a, b], i) => {
          const find = (id: string) =>
            floor.nodes.find((n) => n.id === id) ?? floor.rooms.find((r) => r.id === id);
          const p1 = find(a);
          const p2 = find(b);
          if (!p1 || !p2) return null;
          return (
            <line
              key={i}
              x1={p1.x}
              y1={p1.y}
              x2={p2.x}
              y2={p2.y}
              stroke="var(--ink)"
              strokeOpacity={0.08}
              strokeWidth={0.6}
              vectorEffect="non-scaling-stroke"
            />
          );
        })}
        {d && (
          <path
            key={d}
            d={d}
            fill="none"
            stroke="var(--accent)"
            strokeWidth={2.4}
            strokeLinecap="round"
            strokeLinejoin="round"
            vectorEffect="non-scaling-stroke"
            className="animate-draw-route"
          />
        )}
      </svg>

      {floor.rooms.map((r) => {
        const isFrom = r.id === fromRoomId;
        const isTo = r.id === toRoomId;
        return (
          <button
            key={r.id}
            onClick={() => onSelectRoom(r.id)}
            style={{ left: `${r.x}%`, top: `${r.y}%` }}
            className="absolute w-24 -translate-x-1/2 -translate-y-1/2"
          >
            <span
              className={`block truncate rounded-lg border px-1.5 py-1 text-[10px] font-medium transition-colors ${
                isTo
                  ? "border-accent bg-accent text-accent-foreground"
                  : isFrom
                    ? "border-ink bg-ink text-primary-foreground"
                    : "border-line bg-panel text-ink"
              }`}
            >
              {r.name}
            </span>
          </button>
        );
      })}

      <span className="absolute right-3 top-3 rounded-lg border border-line bg-panel/90 px-2 py-1 font-mono text-[10px] text-muted-foreground">
        {building.short} · {floor.label}
      </span>
    </div>
  );
}
