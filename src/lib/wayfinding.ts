import {
  BUILDINGS,
  MAP_BOUNDS,
  METRES_PER_PERCENT,
  METRES_PER_PERCENT_INDOOR,
  OUTDOOR_EDGES,
  OUTDOOR_NODES,
  PERSONAS,
  WALK_SPEED,
  type Building,
  type Floor,
  type PersonaId,
  type RoomNode,
} from "@/data/campus";

export interface Point {
  id: string;
  x: number;
  y: number;
}

interface Graph {
  points: Map<string, Point>;
  adjacency: Map<string, string[]>;
}

const buildGraph = (points: Point[], edges: [string, string][]): Graph => {
  const map = new Map(points.map((p) => [p.id, p]));
  const adjacency = new Map<string, string[]>();
  for (const [a, b] of edges) {
    if (!map.has(a) || !map.has(b)) continue;
    adjacency.set(a, [...(adjacency.get(a) ?? []), b]);
    adjacency.set(b, [...(adjacency.get(b) ?? []), a]);
  }
  return { points: map, adjacency };
};

const dist = (a: Point, b: Point) => Math.hypot(a.x - b.x, a.y - b.y);

/** Dijkstra shortest path over a small planar graph. */
const shortestPath = (graph: Graph, fromId: string, toId: string): Point[] => {
  if (!graph.points.has(fromId) || !graph.points.has(toId)) return [];
  const distances = new Map<string, number>([[fromId, 0]]);
  const previous = new Map<string, string>();
  const visited = new Set<string>();
  const queue = new Set(graph.points.keys());

  while (queue.size) {
    let current: string | null = null;
    let best = Infinity;
    for (const id of queue) {
      const d = distances.get(id) ?? Infinity;
      if (d < best) {
        best = d;
        current = id;
      }
    }
    if (current === null || best === Infinity) break;
    queue.delete(current);
    visited.add(current);
    if (current === toId) break;

    for (const neighbour of graph.adjacency.get(current) ?? []) {
      if (visited.has(neighbour)) continue;
      const weight = dist(graph.points.get(current)!, graph.points.get(neighbour)!);
      const candidate = best + weight;
      if (candidate < (distances.get(neighbour) ?? Infinity)) {
        distances.set(neighbour, candidate);
        previous.set(neighbour, current);
      }
    }
  }

  const path: Point[] = [];
  let cursor: string | undefined = toId;
  while (cursor) {
    path.unshift(graph.points.get(cursor)!);
    if (cursor === fromId) break;
    cursor = previous.get(cursor);
  }
  return path.length && path[0]!.id === fromId ? path : [];
};

const pathLength = (path: Point[]) =>
  path.slice(1).reduce((total, point, index) => total + dist(path[index], point), 0);

export interface RouteStep {
  index: number;
  text: string;
  point: Point;
}

export interface Route {
  path: Point[];
  metres: number;
  minutes: Record<PersonaId, number>;
  steps: RouteStep[];
}

const minutesFor = (metres: number): Record<PersonaId, number> =>
  Object.fromEntries(
    PERSONAS.map((p) => [p.id, Math.max(1, Math.round((metres / WALK_SPEED) * p.factor))]),
  ) as Record<PersonaId, number>;

const bearing = (from: Point, to: Point) => {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  if (Math.abs(dx) > Math.abs(dy)) return dx > 0 ? "east" : "west";
  return dy > 0 ? "south" : "north";
};

const turnFrom = (previous: Point, pivot: Point, next: Point) => {
  const a = Math.atan2(pivot.y - previous.y, pivot.x - previous.x);
  const b = Math.atan2(next.y - pivot.y, next.x - pivot.x);
  let delta = ((b - a) * 180) / Math.PI;
  while (delta > 180) delta -= 360;
  while (delta < -180) delta += 360;
  if (Math.abs(delta) < 25) return "Continue straight";
  return delta > 0 ? "Turn right" : "Turn left";
};

/** Outdoor route between two buildings, snapped to the walkway graph. */
export const routeBetweenBuildings = (from: Building, to: Building): Route => {
  const points: Point[] = [
    ...OUTDOOR_NODES,
    { id: `b-${from.id}`, x: from.x, y: from.y },
    { id: `b-${to.id}`, x: to.x, y: to.y },
  ];
  const nearest = (p: Point) =>
    OUTDOOR_NODES.reduce((best, node) =>
      dist(node, p) < dist(best, p) ? node : best,
    );
  const edges: [string, string][] = [
    ...OUTDOOR_EDGES,
    [`b-${from.id}`, nearest({ id: "", x: from.x, y: from.y }).id],
    [`b-${to.id}`, nearest({ id: "", x: to.x, y: to.y }).id],
  ];

  const path = shortestPath(buildGraph(points, edges), `b-${from.id}`, `b-${to.id}`);
  const metres = Math.round(pathLength(path) * METRES_PER_PERCENT);

  const steps: RouteStep[] = [];
  steps.push({
    index: 1,
    text: `Leave ${from.name} heading ${path.length > 1 ? bearing(path[0]!, path[1]) : "out"}`,
    point: path[0]! ?? { id: "start", x: from.x, y: from.y },
  });
  for (let i = 1; i < path.length - 1; i += 1) {
    const legMetres = Math.round(dist(path[i]!, path[i + 1]!) * METRES_PER_PERCENT);
    steps.push({
      index: steps.length + 1,
      text: `${turnFrom(path[i - 1]!, path[i]!, path[i + 1]!)} and walk about ${legMetres} m`,
      point: path[i]!,
    });
  }
  steps.push({
    index: steps.length + 1,
    text: `Arrive at ${to.name}`,
    point: path[path.length - 1]! ?? { id: "end", x: to.x, y: to.y },
  });

  return { path, metres, minutes: minutesFor(metres), steps };
};

export interface IndoorRoute extends Route {
  floorId: string;
  crossesFloors: boolean;
}

const stairsOf = (floor: Floor) => floor.rooms.find((r) => r.kind === "stairs");

/** Room-to-room route inside a building, including stair transitions. */
export const routeBetweenRooms = (
  building: Building,
  fromRoomId: string,
  toRoomId: string,
): IndoorRoute[] => {
  const floorOf = (roomId: string) =>
    building.floors.find((f) => f.rooms.some((r) => r.id === roomId));
  const startFloor = floorOf(fromRoomId);
  const endFloor = floorOf(toRoomId);
  if (!startFloor || !endFloor) return [];

  const legOnFloor = (floor: Floor, aId: string, bId: string): IndoorRoute | null => {
    const points: Point[] = [
      ...floor.nodes,
      ...floor.rooms.map((r) => ({ id: r.id, x: r.x, y: r.y })),
    ];
    const path = shortestPath(buildGraph(points, floor.edges), aId, bId);
    if (!path.length) return null;
    const metres = Math.max(3, Math.round(pathLength(path) * METRES_PER_PERCENT_INDOOR));
    const nameOf = (id: string) => floor.rooms.find((r) => r.id === id)?.name ?? "the corridor";
    const steps: RouteStep[] = [
      {
        index: 1,
        text: `Exit ${nameOf(aId)} into the ${floor.label} corridor`,
        point: path[0]!,
      },
    ];
    for (let i = 1; i < path.length - 1; i += 1) {
      const legMetres = Math.max(
        2,
        Math.round(dist(path[i]!, path[i + 1]!) * METRES_PER_PERCENT_INDOOR),
      );
      steps.push({
        index: steps.length + 1,
        text: `${turnFrom(path[i - 1]!, path[i]!, path[i + 1]!)}, about ${legMetres} m along the corridor`,
        point: path[i]!,
      });
    }
    steps.push({
      index: steps.length + 1,
      text: `Arrive at ${nameOf(bId)}`,
      point: path[path.length - 1]!,
    });
    return {
      path,
      metres,
      minutes: minutesFor(metres * 6),
      steps,
      floorId: floor.id,
      crossesFloors: false,
    };
  };

  if (startFloor.id === endFloor.id) {
    const leg = legOnFloor(startFloor, fromRoomId, toRoomId);
    return leg ? [leg] : [];
  }

  const startStairs = stairsOf(startFloor);
  const endStairs = stairsOf(endFloor);
  if (!startStairs || !endStairs) return [];

  const first = legOnFloor(startFloor, fromRoomId, startStairs.id);
  const second = legOnFloor(endFloor, endStairs.id, toRoomId);
  const legs: IndoorRoute[] = [];
  if (first) {
    const goingUp = endFloor.level > startFloor.level;
    first.steps[first.steps.length - 1] = {
      ...first.steps[first.steps.length - 1]!,
      text: `Take the stairs or lift ${goingUp ? "up" : "down"} to ${endFloor.label}`,
    };
    legs.push({ ...first, crossesFloors: true });
  }
  if (second) legs.push({ ...second, crossesFloors: true });
  return legs;
};

export const allRooms = (): { building: Building; floor: Floor; room: RoomNode }[] =>
  BUILDINGS.flatMap((building) =>
    building.floors.flatMap((floor) => floor.rooms.map((room) => ({ building, floor, room }))),
  );

/** Project real GPS onto the illustrated map, clamped to the campus frame. */
export const projectToMap = (lat: number, lng: number) => {
  const x = ((lng - MAP_BOUNDS.west) / (MAP_BOUNDS.east - MAP_BOUNDS.west)) * 100;
  const y = ((MAP_BOUNDS.north - lat) / (MAP_BOUNDS.north - MAP_BOUNDS.south)) * 100;
  return {
    x: Math.min(97, Math.max(3, x)),
    y: Math.min(97, Math.max(3, y)),
    onCampus: x >= 0 && x <= 100 && y >= 0 && y <= 100,
  };
};

export const nearestBuilding = (x: number, y: number): Building =>
  BUILDINGS.reduce((best, b) =>
    Math.hypot(b.x - x, b.y - y) < Math.hypot(best.x - x, best.y - y) ? b : best,
  );
