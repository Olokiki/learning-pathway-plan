export interface PathNode {
  id: string;
  x: number;
  y: number;
  type: "intersection" | "entrance" | "walkway";
  buildingId?: string;
}

export type PathEdge = [string, string];

export const PATH_NODES: PathNode[] = [
  // Main campus walkway intersections
  {
    id: "p-north",
    x: 48,
    y: 24,
    type: "intersection",
  },
  {
    id: "p-north-east",
    x: 70,
    y: 26,
    type: "intersection",
  },
  {
    id: "p-east",
    x: 66,
    y: 52,
    type: "intersection",
  },
  {
    id: "p-south-east",
    x: 60,
    y: 64,
    type: "intersection",
  },
  {
    id: "p-south",
    x: 46,
    y: 70,
    type: "intersection",
  },
  {
    id: "p-south-west",
    x: 24,
    y: 70,
    type: "intersection",
  },
  {
    id: "p-west",
    x: 26,
    y: 54,
    type: "intersection",
  },
  {
    id: "p-centre",
    x: 50,
    y: 52,
    type: "intersection",
  },

  // Building access points
  {
    id: "entrance-cst",
    x: 26,
    y: 44,
    type: "entrance",
    buildingId: "cst",
  },
  {
    id: "entrance-chapel",
    x: 50,
    y: 44,
    type: "entrance",
    buildingId: "chapel",
  },
  {
    id: "entrance-caf1",
    x: 62,
    y: 62,
    type: "entrance",
    buildingId: "caf1",
  },
  {
    id: "entrance-hebron",
    x: 74,
    y: 32,
    type: "entrance",
    buildingId: "hebron",
  },
  {
    id: "entrance-lt",
    x: 40,
    y: 76,
    type: "entrance",
    buildingId: "lt",
  },
  {
    id: "entrance-library",
    x: 20,
    y: 66,
    type: "entrance",
    buildingId: "library",
  },
  {
    id: "entrance-sport",
    x: 76,
    y: 14,
    type: "entrance",
    buildingId: "sport",
  },
  {
    id: "entrance-admin",
    x: 48,
    y: 12,
    type: "entrance",
    buildingId: "admin",
  },
];

export const PATH_EDGES: PathEdge[] = [
  // Main campus circulation
  ["p-north", "p-north-east"],
  ["p-north", "p-centre"],
  ["p-north-east", "p-east"],
  ["p-east", "p-south-east"],
  ["p-south-east", "p-south"],
  ["p-south", "p-south-west"],
  ["p-south-west", "p-west"],
  ["p-west", "p-centre"],
  ["p-centre", "p-south"],
  ["p-centre", "p-east"],

  // Building entrances
  ["entrance-cst", "p-west"],
  ["entrance-cst", "p-centre"],

  ["entrance-chapel", "p-centre"],

  ["entrance-caf1", "p-east"],
  ["entrance-caf1", "p-south-east"],

  ["entrance-hebron", "p-north-east"],
  ["entrance-hebron", "p-east"],

  ["entrance-lt", "p-south"],
  ["entrance-lt", "p-south-west"],

  ["entrance-library", "p-west"],
  ["entrance-library", "p-south-west"],

  ["entrance-sport", "p-north-east"],
  ["entrance-sport", "p-north"],

  ["entrance-admin", "p-north"],
];