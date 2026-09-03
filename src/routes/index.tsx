import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";

import { AvatarPicker, avatarBg, useAvatar } from "@/components/AvatarPicker";
import { CampusMap } from "@/components/CampusMap";
import { FloorPlan } from "@/components/FloorPlan";
import { BUILDINGS, LECTURERS, PERSONAS, type Building, type PersonaId } from "@/data/campus";
import {
  allRooms,
  nearestBuilding,
  projectToMap,
  routeBetweenBuildings,
  routeBetweenRooms,
} from "@/lib/wayfinding";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Ampersand Way · Covenant University Campus Wayfinder" },
      {
        name: "description",
        content:
          "Find any building, office or lecture room at Covenant University. Live GPS, walking routes with fresher-friendly times, room-to-room indoor navigation and lecturer availability.",
      },
      { property: "og:title", content: "Ampersand Way · Covenant University Campus Wayfinder" },
      {
        property: "og:description",
        content:
          "Campus map, indoor room-to-room directions and live lecturer availability for Covenant University freshers.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

const STATUS_STYLES = {
  in: { dot: "bg-accent", label: "IN", text: "text-accent" },
  out: { dot: "bg-ink/30", label: "OUT", text: "text-muted-foreground" },
  meeting: { dot: "bg-warm", label: "BUSY", text: "text-warm" },
} as const;

function Index() {
  const { avatar, save } = useAvatar();
  const [showAvatar, setShowAvatar] = useState(false);
  const [mode, setMode] = useState<"outdoor" | "indoor">("outdoor");
  const [query, setQuery] = useState("");
  const [persona, setPersona] = useState<PersonaId>("fresher");

  const [position, setPosition] = useState({ x: 26, y: 44 });
  const [gpsLive, setGpsLive] = useState(false);

  const [destinationId, setDestinationId] = useState<string | null>("caf1");
  const [indoorBuildingId, setIndoorBuildingId] = useState("cst");
  const [floorId, setFloorId] = useState("cst-1");
  const [fromRoomId, setFromRoomId] = useState<string | null>("cst-1-214");
  const [toRoomId, setToRoomId] = useState<string | null>("cst-2-301");
  const [picking, setPicking] = useState<"from" | "to">("to");

  useEffect(() => {
    if (!("geolocation" in navigator)) return;
    const watcher = navigator.geolocation.watchPosition(
      (pos) => {
        const p = projectToMap(pos.coords.latitude, pos.coords.longitude);
        setPosition({ x: p.x, y: p.y });
        setGpsLive(true);
      },
      () => setGpsLive(false),
      { enableHighAccuracy: true, maximumAge: 15000 },
    );
    return () => navigator.geolocation.clearWatch(watcher);
  }, []);

  const origin = useMemo(() => nearestBuilding(position.x, position.y), [position]);
  const destination = BUILDINGS.find((b) => b.id === destinationId) ?? null;
  const outdoorRoute = useMemo(
    () => (destination ? routeBetweenBuildings(origin, destination) : null),
    [origin, destination],
  );

  const indoorBuilding = BUILDINGS.find((b) => b.id === indoorBuildingId)!;
  const floor = indoorBuilding.floors.find((f) => f.id === floorId) ?? indoorBuilding.floors[0]!;
  const indoorLegs = useMemo(
    () =>
      fromRoomId && toRoomId ? routeBetweenRooms(indoorBuilding, fromRoomId, toRoomId) : [],
    [indoorBuilding, fromRoomId, toRoomId],
  );
  const indoorMinutes = indoorLegs.reduce((t, l) => t + l.minutes[persona], 0);
  const indoorMetres = indoorLegs.reduce((t, l) => t + l.metres, 0);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    const rooms = allRooms()
      .filter(
        ({ room, building }) =>
          room.name.toLowerCase().includes(q) || building.name.toLowerCase().includes(q),
      )
      .slice(0, 6);
    const staff = LECTURERS.filter(
      (l) => l.name.toLowerCase().includes(q) || l.department.toLowerCase().includes(q),
    ).slice(0, 4);
    return [
      ...staff.map((l) => ({ kind: "lecturer" as const, lecturer: l })),
      ...rooms.map((r) => ({ kind: "room" as const, ...r })),
    ];
  }, [query]);

  const openIndoor = (buildingId: string, roomId: string) => {
    const building = BUILDINGS.find((b) => b.id === buildingId);
    if (!building) return;
    const targetFloor = building.floors.find((f) => f.rooms.some((r) => r.id === roomId));
    setIndoorBuildingId(buildingId);
    setFloorId(targetFloor?.id ?? building.floors[0]!.id);
    setToRoomId(roomId);
    const entrance = building.floors[0]!.rooms.find((r) => r.kind === "entrance");
    setFromRoomId((current) =>
      current && building.floors.some((f) => f.rooms.some((r) => r.id === current))
        ? current
        : (entrance?.id ?? building.floors[0]!.rooms[0]!.id),
    );
    setMode("indoor");
    setQuery("");
  };

  const selectBuilding = (building: Building) => {
    setDestinationId(building.id);
    setQuery("");
  };

  const availableCount = LECTURERS.filter((l) => l.status === "in").length;

  return (
    <div className="flex min-h-screen justify-center bg-canvas font-sans text-ink">
      <main className="relative w-full max-w-[430px] overflow-hidden bg-[radial-gradient(120%_100%_at_100%_0%,var(--accent-soft),var(--canvas))]">
        <div className="pointer-events-none absolute -left-24 -top-10 size-72 -rotate-12 rounded-3xl border border-panel/40 bg-cool/10 backdrop-blur-md" />
        <div className="pointer-events-none absolute -right-28 top-40 size-64 rotate-12 rounded-3xl border border-panel/40 bg-accent/10 backdrop-blur-md" />

        <header className="relative z-10 flex items-center justify-between px-4 pb-3 pt-5">
          <div className="flex items-center gap-2">
            <div className="grid size-9 place-items-center rounded-xl bg-ink font-display text-sm font-bold text-primary-foreground">
              CU
            </div>
            <div>
              <h1 className="font-display text-sm font-bold leading-none tracking-tight">
                Ampersand Way
              </h1>
              <p className="mt-1 font-mono text-[10px] text-muted-foreground">
                Covenant Univ. · Ogun State
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="rounded-full border border-line bg-panel/70 px-2 py-1 font-mono text-[10px] text-muted-foreground">
              {gpsLive ? "GPS live" : "GPS off"}
            </span>
            <button
              onClick={() => setShowAvatar(true)}
              aria-label="Customise avatar"
              className={`grid size-9 place-items-center rounded-full text-base ring-2 ring-panel ${avatarBg[avatar.colour]}`}
            >
              {avatar.face}
            </button>
          </div>
        </header>

        <div className="relative z-20 px-4">
          <div className="flex items-center gap-2 rounded-2xl border border-line bg-panel/80 px-4 py-3 shadow-sm backdrop-blur-md">
            <span aria-hidden className="text-sm text-muted-foreground">
              ⌕
            </span>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search buildings, offices, lecturers…"
              className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            />
          </div>

          {results.length > 0 && (
            <ul className="animate-rise absolute inset-x-4 z-30 mt-2 max-h-72 overflow-auto rounded-2xl border border-line bg-panel p-1 shadow-lg">
              {results.map((r) =>
                r.kind === "lecturer" ? (
                  <li key={r.lecturer.id}>
                    <button
                      onClick={() => openIndoor(r.lecturer.buildingId, r.lecturer.roomId)}
                      className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left hover:bg-canvas"
                    >
                      <span
                        className={`size-2 rounded-full ${STATUS_STYLES[r.lecturer.status].dot}`}
                      />
                      <span className="min-w-0">
                        <span className="block truncate text-sm font-semibold">
                          {r.lecturer.name}
                        </span>
                        <span className="block font-mono text-[10px] text-muted-foreground">
                          {r.lecturer.note}
                        </span>
                      </span>
                    </button>
                  </li>
                ) : (
                  <li key={r.room.id}>
                    <button
                      onClick={() => openIndoor(r.building.id, r.room.id)}
                      className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left hover:bg-canvas"
                    >
                      <span className="min-w-0">
                        <span className="block truncate text-sm font-semibold">{r.room.name}</span>
                        <span className="block font-mono text-[10px] text-muted-foreground">
                          {r.building.short} · {r.floor.label}
                        </span>
                      </span>
                    </button>
                  </li>
                ),
              )}
            </ul>
          )}
        </div>

        <div className="relative z-10 mx-4 mt-3 flex gap-1 rounded-full border border-line bg-panel/70 p-1">
          {(["outdoor", "indoor"] as const).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`flex-1 rounded-full py-2 text-center text-xs font-semibold capitalize transition-colors ${
                mode === m ? "bg-ink text-primary-foreground" : "text-muted-foreground"
              }`}
            >
              {m}
            </button>
          ))}
        </div>

        <section className="relative z-0 mx-4 mt-3">
          {mode === "outdoor" ? (
            <div className="relative">
              <CampusMap
                avatar={avatar}
                position={position}
                route={outdoorRoute}
                origin={origin}
                destination={destination}
                onSelectBuilding={selectBuilding}
              />
              {outdoorRoute && destination && (
                <div className="animate-rise absolute inset-x-3 bottom-3 rounded-2xl border border-line bg-panel/90 p-3 shadow-sm backdrop-blur-md">
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-display text-sm font-bold tracking-tight">
                      {origin.short} → {destination.short}
                    </p>
                    <span className="rounded-full bg-accent-soft px-2 py-0.5 font-mono text-[10px] text-accent">
                      {outdoorRoute.minutes[persona]} min
                    </span>
                  </div>
                  <div className="mt-2 flex gap-2">
                    {PERSONAS.map((p) => (
                      <button
                        key={p.id}
                        onClick={() => setPersona(p.id)}
                        className={`rounded-lg px-2 py-1 text-[11px] transition-colors ${
                          persona === p.id
                            ? "bg-ink text-primary-foreground"
                            : "bg-canvas text-muted-foreground"
                        }`}
                      >
                        {p.label} · {outdoorRoute.minutes[p.id]} min
                      </button>
                    ))}
                  </div>
                  <p className="mt-2 font-mono text-[10px] text-muted-foreground">
                    {outdoorRoute.metres} m · walking
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="relative">
              <FloorPlan
                building={indoorBuilding}
                floor={floor}
                legs={indoorLegs}
                fromRoomId={fromRoomId}
                toRoomId={toRoomId}
                onSelectRoom={(roomId) => {
                  if (picking === "from") setFromRoomId(roomId);
                  else setToRoomId(roomId);
                }}
              />
              <div className="absolute left-3 top-3 flex flex-col gap-1 rounded-2xl border border-line bg-panel/85 p-1 backdrop-blur-md">
                {[...indoorBuilding.floors].reverse().map((f) => (
                  <button
                    key={f.id}
                    onClick={() => setFloorId(f.id)}
                    className={`rounded-lg px-2 py-1 font-mono text-[10px] transition-colors ${
                      f.id === floor.id ? "bg-ink text-primary-foreground" : "text-muted-foreground"
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </section>

        {mode === "indoor" && (
          <section className="relative z-10 mx-4 mt-3 rounded-2xl border border-line bg-panel p-3">
            <div className="flex items-center justify-between">
              <select
                value={indoorBuildingId}
                onChange={(e) => {
                  const b = BUILDINGS.find((x) => x.id === e.target.value)!;
                  setIndoorBuildingId(b.id);
                  setFloorId(b.floors[0]!.id);
                  setFromRoomId(b.floors[0]!.rooms[0]!.id);
                  setToRoomId(b.floors[0]!.rooms[1]?.id ?? null);
                }}
                className="rounded-xl border border-line bg-canvas px-2 py-1.5 text-xs font-semibold outline-none"
              >
                {BUILDINGS.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </select>
              <span className="font-mono text-[10px] text-muted-foreground">
                {indoorMetres} m · {indoorMinutes} min
              </span>
            </div>

            <div className="mt-3 flex gap-2">
              {(["from", "to"] as const).map((slot) => {
                const roomId = slot === "from" ? fromRoomId : toRoomId;
                const name =
                  indoorBuilding.floors
                    .flatMap((f) => f.rooms)
                    .find((r) => r.id === roomId)?.name ?? "Tap a room";
                return (
                  <button
                    key={slot}
                    onClick={() => setPicking(slot)}
                    className={`flex-1 rounded-xl border px-3 py-2 text-left transition-colors ${
                      picking === slot ? "border-accent bg-accent-soft" : "border-line bg-canvas"
                    }`}
                  >
                    <span className="block font-mono text-[9px] uppercase text-muted-foreground">
                      {slot === "from" ? "Start room" : "Destination room"}
                    </span>
                    <span className="block truncate text-xs font-semibold">{name}</span>
                  </button>
                );
              })}
            </div>

            <ol className="mt-3 space-y-2">
              {indoorLegs.flatMap((leg, legIndex) =>
                leg.steps.map((step) => (
                  <li key={`${legIndex}-${step.index}`} className="flex gap-2.5">
                    <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-ink font-mono text-[10px] text-primary-foreground">
                      {step.index}
                    </span>
                    <p className="text-[13px] leading-snug text-muted-foreground">{step.text}</p>
                  </li>
                )),
              )}
            </ol>
          </section>
        )}

        {mode === "outdoor" && outdoorRoute && (
          <section className="relative z-10 mx-4 mt-3 rounded-2xl border border-line bg-panel p-3">
            <p className="font-display text-sm font-bold tracking-tight">Walking directions</p>
            <ol className="mt-2 space-y-2">
              {outdoorRoute.steps.map((step) => (
                <li key={step.index} className="flex gap-2.5">
                  <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-ink font-mono text-[10px] text-primary-foreground">
                    {step.index}
                  </span>
                  <p className="text-[13px] leading-snug text-muted-foreground">{step.text}</p>
                </li>
              ))}
            </ol>
            {destination && (
              <button
                onClick={() => openIndoor(destination.id, destination.floors[0]!.rooms[0]!.id)}
                className="mt-3 w-full rounded-xl bg-accent py-2.5 text-xs font-semibold text-accent-foreground"
              >
                Continue indoors in {destination.short}
              </button>
            )}
          </section>
        )}

        <section className="relative z-20 mx-3 mb-4 mt-3 rounded-t-3xl border border-b-0 border-line bg-panel p-4 shadow-[0_-8px_30px_-12px_oklch(0.25_0.04_250/0.25)]">
          <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-ink/15" />
          <div className="flex items-center justify-between">
            <h2 className="font-display text-sm font-bold tracking-tight">
              Lecturers · office status
            </h2>
            <span className="font-mono text-[10px] text-muted-foreground">
              {availableCount} / {LECTURERS.length} in
            </span>
          </div>
          <ul className="mt-3 space-y-2">
            {LECTURERS.map((lecturer) => {
              const style = STATUS_STYLES[lecturer.status];
              return (
                <li key={lecturer.id}>
                  <button
                    onClick={() => openIndoor(lecturer.buildingId, lecturer.roomId)}
                    className="flex w-full items-center gap-3 rounded-xl border border-line bg-panel px-3 py-2 text-left"
                  >
                    <span className="grid size-8 place-items-center rounded-full bg-accent-soft font-display text-xs font-bold text-accent">
                      {lecturer.initials}
                    </span>
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-semibold leading-tight">
                        {lecturer.name}
                      </span>
                      <span className="block font-mono text-[10px] text-muted-foreground">
                        {lecturer.note}
                      </span>
                    </span>
                    <span
                      className={`ml-auto flex items-center gap-1 font-mono text-[10px] ${style.text}`}
                    >
                      <span className={`size-2 rounded-full ${style.dot}`} />
                      {style.label}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </section>
      </main>

      {showAvatar && (
        <AvatarPicker avatar={avatar} onChange={save} onClose={() => setShowAvatar(false)} />
      )}
    </div>
  );
}
