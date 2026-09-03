import { useEffect, useState } from "react";

export interface AvatarConfig {
  name: string;
  colour: "accent" | "cool" | "warm" | "ink";
  face: string;
}

export const DEFAULT_AVATAR: AvatarConfig = { name: "Fresher", colour: "accent", face: "🙂" };

const STORAGE_KEY = "cu-wayfinder-avatar";

export const useAvatar = () => {
  const [avatar, setAvatar] = useState<AvatarConfig>(DEFAULT_AVATAR);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) setAvatar({ ...DEFAULT_AVATAR, ...(JSON.parse(raw) as Partial<AvatarConfig>) });
    } catch {
      /* ignore malformed storage */
    }
  }, []);

  const save = (next: AvatarConfig) => {
    setAvatar(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      /* storage unavailable */
    }
  };

  return { avatar, save };
};

export const avatarBg: Record<AvatarConfig["colour"], string> = {
  accent: "bg-accent",
  cool: "bg-cool",
  warm: "bg-warm",
  ink: "bg-ink",
};

const FACES = ["🙂", "😎", "🤓", "😄", "🫡", "🧕", "👩🏽‍🎓", "👨🏾‍🎓"];
const COLOURS: AvatarConfig["colour"][] = ["accent", "cool", "warm", "ink"];

export function AvatarPicker({
  avatar,
  onChange,
  onClose,
}: {
  avatar: AvatarConfig;
  onChange: (next: AvatarConfig) => void;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-ink/40 px-3 pb-3">
      <div className="animate-rise w-full max-w-[430px] rounded-3xl border border-line bg-panel p-4">
        <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-ink/15" />
        <div className="flex items-center gap-3">
          <div
            className={`grid size-12 place-items-center rounded-full text-2xl ring-4 ring-panel ${avatarBg[avatar.colour]}`}
          >
            {avatar.face}
          </div>
          <div>
            <p className="font-display text-base font-bold tracking-tight">Your campus avatar</p>
            <p className="font-mono text-[10px] text-muted-foreground">
              Shown as your live position marker
            </p>
          </div>
        </div>

        <label className="mt-4 block font-mono text-[10px] uppercase tracking-wide text-muted-foreground">
          Display name
        </label>
        <input
          value={avatar.name}
          onChange={(e) => onChange({ ...avatar, name: e.target.value.slice(0, 18) })}
          className="mt-1 w-full rounded-2xl border border-line bg-canvas px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring"
          placeholder="e.g. Eniola"
        />

        <p className="mt-4 font-mono text-[10px] uppercase tracking-wide text-muted-foreground">
          Face
        </p>
        <div className="mt-2 grid grid-cols-8 gap-1.5">
          {FACES.map((face) => (
            <button
              key={face}
              onClick={() => onChange({ ...avatar, face })}
              className={`grid aspect-square place-items-center rounded-xl border text-lg transition-colors ${
                avatar.face === face ? "border-accent bg-accent-soft" : "border-line bg-canvas"
              }`}
            >
              {face}
            </button>
          ))}
        </div>

        <p className="mt-4 font-mono text-[10px] uppercase tracking-wide text-muted-foreground">
          Marker colour
        </p>
        <div className="mt-2 flex gap-2">
          {COLOURS.map((colour) => (
            <button
              key={colour}
              onClick={() => onChange({ ...avatar, colour })}
              aria-label={colour}
              className={`size-9 rounded-full ring-2 ${avatarBg[colour]} ${
                avatar.colour === colour ? "ring-ink" : "ring-transparent"
              }`}
            />
          ))}
        </div>

        <button
          onClick={onClose}
          className="mt-5 w-full rounded-2xl bg-ink py-3 text-sm font-semibold text-primary-foreground"
        >
          Done
        </button>
      </div>
    </div>
  );
}
