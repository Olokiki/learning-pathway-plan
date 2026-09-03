// Campus data for Covenant University (Ota, Ogun State).
// Coordinates are normalised percentages (0-100) over the illustrated map image,
// plus real lat/lng so live GPS can be projected onto the illustration.

export const MAP_BOUNDS = {
  north: 6.6805,
  south: 6.6645,
  west: 3.1525,
  east: 3.1705,
};

export type Category = "academic" | "worship" | "food" | "residence" | "sport" | "admin";

export interface RoomNode {
  id: string;
  name: string;
  x: number; // % on floor plan
  y: number;
  kind: "room" | "office" | "hall" | "lab" | "stairs" | "lift" | "entrance" | "amenity";
}

export interface Floor {
  id: string;
  level: number;
  label: string;
  rooms: RoomNode[];
  /** corridor waypoints */
  nodes: { id: string; x: number; y: number }[];
  /** undirected edges between node/room ids */
  edges: [string, string][];
  /** outline rectangles drawn as the plan shell: [x, y, w, h] */
  shell: [number, number, number, number][];
}

export interface Building {
  id: string;
  name: string;
  short: string;
  category: Category;
  x: number; // % on campus illustration
  y: number;
  lat: number;
  lng: number;
  hours: string;
  blurb: string;
  floors: Floor[];
}

const corridorFloor = (
  id: string,
  level: number,
  label: string,
  rooms: RoomNode[],
): Floor => {
  const nodes = [
    { id: `${id}-c1`, x: 18, y: 50 },
    { id: `${id}-c2`, x: 38, y: 50 },
    { id: `${id}-c3`, x: 58, y: 50 },
    { id: `${id}-c4`, x: 78, y: 50 },
  ];
  const edges: [string, string][] = [
    [`${id}-c1`, `${id}-c2`],
    [`${id}-c2`, `${id}-c3`],
    [`${id}-c3`, `${id}-c4`],
  ];
  // attach each room to its nearest corridor node
  for (const room of rooms) {
    let best = nodes[0];
    let bestDist = Infinity;
    for (const n of nodes) {
      const d = Math.hypot(n.x - room.x, n.y - room.y);
      if (d < bestDist) {
        bestDist = d;
        best = n;
      }
    }
    edges.push([room.id, best.id]);
  }
  return {
    id,
    level,
    label,
    rooms,
    nodes,
    edges,
    shell: [
      [10, 18, 80, 64],
      [14, 44, 72, 12],
    ],
  };
};

const room = (
  id: string,
  name: string,
  x: number,
  y: number,
  kind: RoomNode["kind"] = "room",
): RoomNode => ({ id, name, x, y, kind });

export const BUILDINGS: Building[] = [
  {
    id: "cst",
    name: "College of Science & Technology",
    short: "CST",
    category: "academic",
    x: 26,
    y: 44,
    lat: 6.6731,
    lng: 3.1583,
    hours: "7:00 – 21:00",
    blurb: "Computer Science, Engineering and Physical Sciences departments.",
    floors: [
      corridorFloor("cst-g", 0, "G", [
        room("cst-g-ent", "Main Entrance", 50, 84, "entrance"),
        room("cst-g-101", "Lecture Room 101", 20, 28),
        room("cst-g-102", "Lecture Room 102", 38, 28),
        room("cst-g-lab1", "Computer Lab 1", 60, 28, "lab"),
        room("cst-g-stairs", "Stairs / Lift", 80, 72, "stairs"),
        room("cst-g-cafe", "Kiosk", 22, 72, "amenity"),
      ]),
      corridorFloor("cst-1", 1, "L1", [
        room("cst-1-201", "Lecture Room 201", 20, 28),
        room("cst-1-214", "Office 214 · Dr. Ada Eze", 40, 28, "office"),
        room("cst-1-216", "Office 216 · Mr. N. Bello", 58, 28, "office"),
        room("cst-1-lab3", "CST Lab 3", 60, 74, "lab"),
        room("cst-1-stairs", "Stairs / Lift", 80, 72, "stairs"),
      ]),
      corridorFloor("cst-2", 2, "L2", [
        room("cst-2-301", "Lecture Theatre A", 24, 28, "hall"),
        room("cst-2-302", "Project Room", 44, 28),
        room("cst-2-310", "Office 310 · Prof. K. Olowookere", 62, 28, "office"),
        room("cst-2-stairs", "Stairs / Lift", 80, 72, "stairs"),
      ]),
    ],
  },
  {
    id: "chapel",
    name: "Chapel (Covenant Chapel)",
    short: "Chapel",
    category: "worship",
    x: 50,
    y: 44,
    lat: 6.6725,
    lng: 3.1611,
    hours: "Always open",
    blurb: "Central chapel and auditorium for services and convocations.",
    floors: [
      corridorFloor("chapel-g", 0, "G", [
        room("chapel-g-ent", "Main Entrance", 50, 84, "entrance"),
        room("chapel-g-main", "Main Auditorium", 34, 28, "hall"),
        room("chapel-g-gallery", "Gallery Stairs", 80, 72, "stairs"),
        room("chapel-g-office", "Chaplaincy Office", 62, 28, "office"),
      ]),
    ],
  },
  {
    id: "caf1",
    name: "Cafeteria 1",
    short: "Caf 1",
    category: "food",
    x: 62,
    y: 62,
    lat: 6.6712,
    lng: 3.1628,
    hours: "6:30 – 21:30",
    blurb: "Main student cafeteria with multiple food vendors.",
    floors: [
      corridorFloor("caf1-g", 0, "G", [
        room("caf1-g-ent", "Entrance", 50, 84, "entrance"),
        room("caf1-g-a", "Vendor Row A", 26, 28, "amenity"),
        room("caf1-g-b", "Vendor Row B", 48, 28, "amenity"),
        room("caf1-g-seat", "Seating Hall", 70, 72, "hall"),
      ]),
    ],
  },
  {
    id: "hebron",
    name: "Hebron Startup Lab",
    short: "Hebron",
    category: "academic",
    x: 74,
    y: 32,
    lat: 6.6748,
    lng: 3.1651,
    hours: "8:00 – 20:00",
    blurb: "Innovation hub and student startup incubator.",
    floors: [
      corridorFloor("heb-g", 0, "G", [
        room("heb-g-ent", "Entrance", 50, 84, "entrance"),
        room("heb-g-open", "Open Workspace", 30, 28),
        room("heb-g-pod", "Meeting Pod 2", 54, 28),
        room("heb-g-studio", "Media Studio", 74, 72, "lab"),
      ]),
    ],
  },
  {
    id: "lt",
    name: "Lecture Theatre Complex",
    short: "LT",
    category: "academic",
    x: 40,
    y: 76,
    lat: 6.6692,
    lng: 3.1601,
    hours: "7:00 – 20:00",
    blurb: "Large lecture theatres used for general and college-wide courses.",
    floors: [
      corridorFloor("lt-g", 0, "G", [
        room("lt-g-ent", "Entrance", 50, 84, "entrance"),
        room("lt-g-a", "Theatre A", 26, 28, "hall"),
        room("lt-g-b", "Theatre B", 50, 28, "hall"),
        room("lt-g-c", "Theatre C", 74, 28, "hall"),
      ]),
    ],
  },
  {
    id: "library",
    name: "Centre for Learning Resources",
    short: "CLR",
    category: "academic",
    x: 20,
    y: 66,
    lat: 6.6702,
    lng: 3.1566,
    hours: "8:00 – 22:00",
    blurb: "The university library and reading rooms.",
    floors: [
      corridorFloor("clr-g", 0, "G", [
        room("clr-g-ent", "Entrance", 50, 84, "entrance"),
        room("clr-g-desk", "Circulation Desk", 30, 28),
        room("clr-g-read", "Reading Room 1", 56, 28, "hall"),
        room("clr-g-stairs", "Stairs", 80, 72, "stairs"),
      ]),
    ],
  },
  {
    id: "sport",
    name: "Sports Complex",
    short: "Sports",
    category: "sport",
    x: 76,
    y: 14,
    lat: 6.6772,
    lng: 3.1659,
    hours: "6:00 – 19:00",
    blurb: "Football pitch, athletics track and courts.",
    floors: [
      corridorFloor("sp-g", 0, "G", [
        room("sp-g-ent", "Gate", 50, 84, "entrance"),
        room("sp-g-track", "Athletics Track", 34, 28, "amenity"),
        room("sp-g-gym", "Gym", 66, 28, "amenity"),
      ]),
    ],
  },
  {
    id: "admin",
    name: "Senate / Administrative Building",
    short: "Senate",
    category: "admin",
    x: 48,
    y: 12,
    lat: 6.6784,
    lng: 3.1607,
    hours: "8:00 – 17:00",
    blurb: "Registry, bursary and student affairs offices.",
    floors: [
      corridorFloor("adm-g", 0, "G", [
        room("adm-g-ent", "Entrance", 50, 84, "entrance"),
        room("adm-g-reg", "Registry", 28, 28, "office"),
        room("adm-g-bur", "Bursary", 52, 28, "office"),
        room("adm-g-sa", "Student Affairs", 76, 28, "office"),
      ]),
    ],
  },
];

/** Outdoor walkway graph laid over the illustration. */
export const OUTDOOR_NODES: { id: string; x: number; y: number }[] = [
  { id: "w-north", x: 48, y: 24 },
  { id: "w-centre", x: 50, y: 52 },
  { id: "w-west", x: 26, y: 54 },
  { id: "w-southwest", x: 24, y: 70 },
  { id: "w-south", x: 46, y: 70 },
  { id: "w-east", x: 66, y: 52 },
  { id: "w-northeast", x: 70, y: 26 },
];

export const OUTDOOR_EDGES: [string, string][] = [
  ["w-north", "w-centre"],
  ["w-centre", "w-west"],
  ["w-west", "w-southwest"],
  ["w-southwest", "w-south"],
  ["w-south", "w-centre"],
  ["w-centre", "w-east"],
  ["w-east", "w-northeast"],
  ["w-northeast", "w-north"],
  ["w-east", "w-south"],
];

export interface Lecturer {
  id: string;
  name: string;
  initials: string;
  department: string;
  buildingId: string;
  roomId: string;
  status: "in" | "out" | "meeting";
  note: string;
}

export const LECTURERS: Lecturer[] = [
  {
    id: "ada",
    name: "Dr. Ada Eze",
    initials: "DA",
    department: "Computer Science",
    buildingId: "cst",
    roomId: "cst-1-214",
    status: "in",
    note: "Office 214 · CST L1",
  },
  {
    id: "kola",
    name: "Prof. K. Olowookere",
    initials: "KO",
    department: "Electrical Engineering",
    buildingId: "cst",
    roomId: "cst-2-310",
    status: "out",
    note: "Office 310 · CST L2",
  },
  {
    id: "bello",
    name: "Mr. N. Bello",
    initials: "NB",
    department: "Software Engineering",
    buildingId: "cst",
    roomId: "cst-1-216",
    status: "in",
    note: "Office 216 · CST L1",
  },
  {
    id: "chika",
    name: "Dr. Chika Nwosu",
    initials: "CN",
    department: "Data Systems",
    buildingId: "hebron",
    roomId: "heb-g-pod",
    status: "meeting",
    note: "Meeting Pod 2 · Hebron",
  },
  {
    id: "tunde",
    name: "Dr. T. Alabi",
    initials: "TA",
    department: "Student Affairs",
    buildingId: "admin",
    roomId: "adm-g-sa",
    status: "in",
    note: "Student Affairs · Senate",
  },
];

export const PERSONAS = [
  { id: "fresher", label: "Fresher", factor: 1.35 },
  { id: "local", label: "Local", factor: 1 },
  { id: "late", label: "Running late", factor: 0.72 },
] as const;

export type PersonaId = (typeof PERSONAS)[number]["id"];

/** Rough metres represented by 1% of the illustrated map. */
export const METRES_PER_PERCENT = 14;
/** Rough metres per 1% of a floor plan. */
export const METRES_PER_PERCENT_INDOOR = 0.9;
/** Comfortable walking speed, metres per minute. */
export const WALK_SPEED = 78;
