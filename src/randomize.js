import { clone, THEMES } from "./engine.js";
import { CREATURES, worldObject } from "./world-config.js";

// This function changes presentation on a copy. The saved clock and every
// people/location/sensor field remain intact, including live moon/bezel sources.
export function randomAppearance(current, random = Math.random) {
  const next = clone(current);
  const pick = (values) =>
    values[
      Math.min(
        values.length - 1,
        Math.floor(Math.max(0, random()) * values.length),
      )
    ];
  next.theme = pick(THEMES.filter((theme) => theme !== current.theme));
  next.artwork = random() < 0.75 ? "castle" : "vector";
  next.face_image = "";
  next.period_override = pick(
    ["dawn", "day", "dusk", "night"].filter(
      (p) => p !== current.period_override,
    ),
  );
  next.season_override = pick(["spring", "summer", "autumn", "winter"]);
  next.weather_effect = pick([
    "clear",
    "clouds",
    "light-rain",
    "rain",
    "snow",
    "wind",
    "fog",
    "ice",
  ]);
  next.colors = pick([
    { paper: "#152d39", ink: "#f5dca0", metal: "#c9aa62", rim: "#293f43" },
    { paper: "#e4d2ae", ink: "#493622", metal: "#be914d", rim: "#665037" },
    { paper: "#292a27", ink: "#f2d596", metal: "#c18a43", rim: "#9b6734" },
    { paper: "#ded4c3", ink: "#282c38", metal: "#bbc3ce", rim: "#485260" },
  ]);
  next.brass_age = random();
  next.world.enabled = true;
  const kinds = CREATURES.map(([kind]) => kind).filter(
    (kind) => kind !== "custom",
  );
  next.world.objects = Array.from(
    { length: 1 + Math.floor(random() * 3) },
    (_, i) => {
      const kind = pick(kinds),
        object = worldObject(kind, "random-visitor-" + i);
      kinds.splice(kinds.indexOf(kind), 1);
      object.facing = random() < 0.5 ? "left" : "right";
      object.period = "any";
      object.interval = 35 + Math.floor(random() * 40);
      // Keep water dwellers, foreground pixies and planted hooves in their
      // registered environments; only aerial visitors vary their altitude.
      if (object.motion === "fly" && kind !== "fairy")
        object.y = 12 + random() * 16;
      return object;
    },
  );
  return next;
}
