import { BUILDINGS, LECTURERS } from "./campus";

export type LocationType =
  | "building"
  | "room"
  | "office"
  | "hall"
  | "lab"
  | "facility"
  | "entrance"
  | "outdoor";

export interface Location {
  id: string;
  name: string;
  type: LocationType;

  buildingId?: string;
  floorId?: string;

  x?: number;
  y?: number;

  lat?: number;
  lng?: number;

  searchable?: string[];
}

export const LOCATIONS: Location[] = [
  ...BUILDINGS.map((building) => ({
    id: building.id,
    name: building.name,
    type: "building" as const,
    x: building.x,
    y: building.y,
    lat: building.lat,
    lng: building.lng,
    searchable: [
      building.name,
      building.short,
      building.category,
    ],
  })),

  ...BUILDINGS.flatMap((building) =>
    building.floors.flatMap((floor) =>
      floor.rooms.map((room) => ({
        id: room.id,
        name: room.name,
        type: room.kind as LocationType,
        buildingId: building.id,
        floorId: floor.id,
        x: room.x,
        y: room.y,
        searchable: [
          room.name,
          building.name,
          building.short,
          floor.label,
        ],
      })),
    ),
  ),

  ...LECTURERS.map((lecturer) => ({
    id: `lecturer-${lecturer.id}`,
    name: lecturer.name,
    type: "office" as const,
    buildingId: lecturer.buildingId,
    searchable: [
      lecturer.name,
      lecturer.department,
      lecturer.note,
    ],
  })),
];