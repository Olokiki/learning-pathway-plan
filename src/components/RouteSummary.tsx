import type { PersonaId } from "@/data/campus";
import type { Route } from "@/lib/wayfinding";

interface RouteSummaryProps {
  destinationName: string;
  originName: string;
  route: Route | null;
  persona: PersonaId;
  onStart?: () => void;
}

const formatDistance = (metres: number) => {
  if (metres < 1000) {
    return `${metres} m`;
  }

  return `${(metres / 1000).toFixed(1)} km`;
};

export function RouteSummary({
  destinationName,
  originName,
  route,
  persona,
  onStart,
}: RouteSummaryProps) {
  if (!route || route.path.length === 0) {
    return null;
  }

  return (
    <section className="rounded-2xl border border-line bg-panel/90 p-4 shadow-sm backdrop-blur-md">
      <div className="mb-3">
        <p className="font-mono text-[10px] uppercase tracking-wide text-muted-foreground">
          Route to
        </p>

        <h2 className="mt-1 text-base font-bold">
          {destinationName}
        </h2>

        <p className="mt-1 text-xs text-muted-foreground">
          From {originName}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div className="rounded-xl bg-canvas px-3 py-2">
          <p className="font-mono text-[10px] text-muted-foreground">
            WALK
          </p>

          <p className="mt-1 text-sm font-semibold">
            {route.minutes[persona]} min
          </p>
        </div>

        <div className="rounded-xl bg-canvas px-3 py-2">
          <p className="font-mono text-[10px] text-muted-foreground">
            DISTANCE
          </p>

          <p className="mt-1 text-sm font-semibold">
            {formatDistance(route.metres)}
          </p>
        </div>
      </div>

      {onStart && (
        <button
          type="button"
          onClick={onStart}
          className="mt-3 w-full rounded-xl bg-ink px-4 py-3 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
        >
          Start navigation
        </button>
      )}
    </section>
  );
}