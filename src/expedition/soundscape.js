const BASE = import.meta.env.BASE_URL;
const ROOT = `${BASE}expedition/audio/`;
const AMBIENT = {
  mountain: "mountain",
  forest: "forest",
  grassland: "grass",
  desert: "desert",
  ocean: "ocean",
  cave: "cave",
  volcano: "volcano",
  town: "town",
};
const EFFECTS = {
  intro: `${BASE}audio/here-we-go-again.mp3`,
  shout: `${ROOT}npc-shout.mp3`,
  greet: `${ROOT}npc-greeting-male.mp3`,
  greetFemale: `${ROOT}npc-greeting-female.mp3`,
  laugh: `${ROOT}npc-laugh.mp3`,
  portal: `${ROOT}cave-transition.mp3`,
  discover: `${ROOT}npc-greeting-female.mp3`,
};
export function createSoundscape() {
  let enabled = false,
    disposed = false,
    current = "mountain",
    active = null,
    fade = 0,
    lastStep = 0;
  const tracks = new Map(),
    effects = new Map();
  const getTrack = (key) => {
    if (!tracks.has(key)) {
      const a = new Audio(`${ROOT}ambient-${AMBIENT[key] || "mountain"}.mp3`);
      a.loop = true;
      a.preload = "none";
      a.volume = 0;
      tracks.set(key, a);
    }
    return tracks.get(key);
  };
  const stopFade = () => {
    cancelAnimationFrame(fade);
    fade = 0;
  };
  const transition = () => {
    if (!enabled || disposed) return;
    const next = getTrack(current);
    if (next === active) return;
    stopFade();
    const old = active;
    active = next;
    next.volume = 0;
    next.play().catch(() => {});
    const start = performance.now(),
      oldVolume = old?.volume || 0;
    const tick = (now) => {
      if (disposed || !enabled) return;
      const t = Math.max(0, Math.min(1, (now - start) / 1400));
      next.volume = 0.28 * t;
      if (old) old.volume = oldVolume * (1 - t);
      if (t < 1) fade = requestAnimationFrame(tick);
      else {
        if (old) old.pause();
        tracks.forEach((a) => {
          if (a !== next) a.pause();
        });
      }
    };
    fade = requestAnimationFrame(tick);
  };
  const effect = (name) => {
    if (!enabled || disposed) return;
    const url = EFFECTS[name] || `${ROOT}${name}.mp3`;
    let a = effects.get(url);
    if (!a) {
      a = new Audio(url);
      a.preload = "none";
      effects.set(url, a);
    }
    a.volume = name === "shout" ? 0.38 : name === "intro" ? 0.55 : 0.35;
    a.currentTime = 0;
    a.play().catch(() => {});
  };
  const hidden = () => {
    if (document.hidden) {
      stopFade();
      tracks.forEach((a) => a.pause());
      effects.forEach((a) => a.pause());
    } else if (enabled) {
      active = null;
      transition();
    }
  };
  document.addEventListener("visibilitychange", hidden);
  return {
    async enable() {
      if (disposed) return false;
      enabled = true;
      const a = getTrack(current);
      try {
        a.volume = 0.28;
        await a.play();
        if (disposed || !enabled) {
          a.pause();
          return false;
        }
        active = a;
        return true;
      } catch {
        enabled = false;
        return false;
      }
    },
    disable() {
      enabled = false;
      stopFade();
      tracks.forEach((a) => a.pause());
      effects.forEach((a) => a.pause());
      active = null;
    },
    terrain(key) {
      current = key;
      transition();
    },
    effect,
    step() {
      const now = performance.now();
      if (now - lastStep < 400) return;
      lastStep = now;
      effect(
        current === "forest"
          ? "footstep-leaves01"
          : current === "ocean"
            ? "footstep-wood01"
            : current === "cave" || current === "town"
              ? "footstep-stone01"
              : "footstep-gravel",
      );
    },
    dispose() {
      disposed = true;
      enabled = false;
      stopFade();
      document.removeEventListener("visibilitychange", hidden);
      for (const a of [...tracks.values(), ...effects.values()]) {
        a.pause();
        a.removeAttribute("src");
        a.load();
      }
      tracks.clear();
      effects.clear();
    },
  };
}
