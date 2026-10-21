import { sceneFor } from "./scenes.js";
import { sceneSource, imageGrade } from "./artwork.js";
import { FONTS } from "./design.js";
import {
  CREATURES,
  MOON_PHASES,
  moonReading,
  worldObject,
  worldPreset,
} from "./world-config.js";
import { LOCATION_GRAPHICS, PANEL_TEXTURES } from "./panels.js";
import { uid, clone } from "./engine.js";
import { WEATHER } from "./weather.js";
const node = (tag, text) => {
  const e = document.createElement(tag);
  if (text !== undefined) e.textContent = text;
  return e;
};
function field(editor, parent, label, obj, key, type = "text", options, help) {
  const control = editor.field(parent, label, obj, key, type, options);
  if (help)
    control.parentElement.querySelector(".field-help").textContent = help;
  return control;
}
export function panelEditor(root) {
  const c = this.config,
    p = c.location_panels,
    box = this.box(root, "Location panel design");
  this.note(
    box,
    "Each destination gets a fitted frame, graphic and name. Panels follow destination angles and the raised castle opening. Changes here preserve all tracking rules.",
  );
  field(
    this,
    box,
    "Show framed location panels",
    p,
    "enabled",
    "checkbox",
    null,
    "Use individual textured destination panels on the castle. Turning this off restores plain location labels.",
  );
  field(
    this,
    box,
    "Use panels on other faces too",
    p,
    "on_all_faces",
    "checkbox",
    null,
    "Apply these destination panels to the editable non-castle faces as well. Custom complete-face uploads keep their own artwork.",
  );
  field(
    this,
    box,
    "Default panel texture",
    p,
    "texture",
    "select",
    PANEL_TEXTURES,
    "Choose cracked stained glass, hammered metal, parchment, wood grain or a plain surface. Each location can override this choice.",
  );
  field(
    this,
    box,
    "Panel lettering font",
    p,
    "font",
    "select",
    FONTS,
    "Pirata One is an included ornate font and needs no font service. Other choices use fonts installed on the viewing device.",
  );
  field(
    this,
    box,
    "Panel name maximum size",
    p,
    "font_size",
    "number",
    null,
    "Maximum name size in SVG units, from 8 to 38. Automatic panel layout shrinks long names to fit their actual frame. Start at 25.",
  );
  field(
    this,
    box,
    "Castle opening radius",
    p,
    "inner_radius",
    "number",
    null,
    "Opening radius from 155 to 205 SVG units. A smaller opening gives location panels more room for large graphics and names. Start at 180.",
  );
  field(
    this,
    box,
    "Panel frame color",
    p,
    "frame_color",
    "color",
    null,
    "Choose the brass outline color around destination panels. The outer clock rim keeps its own material.",
  );
  this.button(box, "Fit all names and graphics inside panels", () =>
    this.change(() => {
      c.show_location_labels = true;
      c.locations.forEach((l) => {
        l.x = null;
        l.y = null;
        l.rotation = 0;
        l.slot.name_offset = 0;
      });
    }, true),
  );
}
export function slotEditor(parent, location) {
  const s = location.slot,
    details = node("details");
  details.appendChild(node("summary", "Panel artwork and layout"));
  parent.appendChild(details);
  this.note(
    details,
    "Override this location only. Automatic placement fits the name and graphic into its frame. The existing x/y controls are an optional free-position override.",
  );
  field(
    this,
    details,
    "Location graphic",
    s,
    "graphic",
    "select",
    LOCATION_GRAPHICS,
    "Auto chooses a house, briefcase, school, compass or another symbol from the destination name. Choose Custom to upload your own large graphic.",
  );
  field(
    this,
    details,
    "Panel layout",
    s,
    "layout",
    "select",
    [
      ["name-above", "Name above graphic"],
      ["name-below", "Name below graphic"],
      ["name-only", "Name only"],
      ["graphic-only", "Graphic only"],
    ],
    "Choose which content appears and its order. Automatic sizing accounts for the available radial space in this panel.",
  );
  field(
    this,
    details,
    "Graphic maximum size",
    s,
    "graphic_size",
    "number",
    null,
    "Maximum graphic size, 10–62 SVG units. The graphic is reduced automatically to keep it within the frame.",
  );
  field(
    this,
    details,
    "Graphic color",
    s,
    "graphic_color",
    "color",
    null,
    "Color of the built-in embossed symbol. Uploaded graphics preserve their own image colors.",
  );
  field(
    this,
    details,
    "Graphic horizontal offset",
    s,
    "graphic_x",
    "number",
    null,
    "Move the graphic left or right in SVG units, from -30 to 30. Content is clipped to this destination frame. Start at 0.",
  );
  field(
    this,
    details,
    "Graphic vertical offset",
    s,
    "graphic_y",
    "number",
    null,
    "Move the graphic up or down in SVG units, from -25 to 25. Start at 0 to use automatic placement.",
  );
  field(
    this,
    details,
    "Name radial offset",
    s,
    "name_offset",
    "number",
    null,
    "Move the name toward or away from the center, from -24 to 24 SVG units. Start at 0; excessive offsets can clip the name.",
  );
  field(
    this,
    details,
    "This panel texture",
    s,
    "texture",
    "select",
    ["inherit", ...PANEL_TEXTURES],
    "Inherit follows Default panel texture. Select another material to give this destination a different surface.",
  );
  field(
    this,
    details,
    "This panel background color",
    s,
    "background",
    "color",
    null,
    "Tint this individual destination. Texture, shading and the metallic border remain visible.",
  );
  this.imageField(details, "Location graphic image", s, "image");
  this.imageField(details, "Panel background image", s, "background_image");
  this.note(
    details,
    "Choose Custom in Location graphic to use the uploaded graphic. A background image fills only this panel and is clipped to its frame.",
  );
}
function placementMap(editor, parent) {
  const c = editor.config,
    ns = "http://www.w3.org/2000/svg",
    scene = sceneFor(
      c,
      editor._hass?.states || {},
      new Date(),
      editor._hass?.config || {},
    ),
    map = document.createElementNS(ns, "svg");
  map.setAttribute("viewBox", "108 90 384 384");
  map.setAttribute("aria-label", "World placement map");
  map.style.cssText =
    "max-width:430px;border-radius:12px;background:#10202a;touch-action:none";
  const image = document.createElementNS(ns, "image");
  for (const [key, value] of Object.entries({
    href: sceneSource(scene),
    x: 108,
    y: 90,
    width: 384,
    height: 384,
  }))
    image.setAttribute(key, value);
  image.style.filter = imageGrade(scene);
  map.appendChild(image);
  const outline = document.createElementNS(ns, "circle");
  for (const [key, value] of Object.entries({
    cx: 300,
    cy: 282,
    r: c.location_panels.inner_radius,
    fill: "none",
    stroke: "#f3cf7a",
    "stroke-width": 2,
  }))
    outline.setAttribute(key, value);
  map.appendChild(outline);
  for (const o of c.world.objects) {
    const g = document.createElementNS(ns, "g"),
      circle = document.createElementNS(ns, "circle"),
      label = document.createElementNS(ns, "text");
    g.dataset.worldMarker = o.id;
    circle.setAttribute("r", "5");
    circle.setAttribute("fill", o.color);
    circle.setAttribute("stroke-width", "1.8");
    circle.setAttribute("tabindex", "0");
    circle.setAttribute("role", "button");
    circle.setAttribute("aria-label", "Place " + o.name);
    circle.style.cursor = "grab";
    label.textContent = o.name.slice(0, 20);
    label.setAttribute("x", "8");
    label.setAttribute("y", "-7");
    label.style.cssText =
      "font:10px system-ui;fill:#fff5df;paint-order:stroke;stroke:#10202a;stroke-width:2px;pointer-events:none";
    g.append(circle, label);
    map.appendChild(g);
    const draw = () => {
      g.setAttribute(
        "transform",
        `translate(${108 + o.x * 3.84} ${90 + o.y * 3.84})`,
      );
      circle.setAttribute(
        "stroke",
        Math.hypot(108 + o.x * 3.84 - 300, 90 + o.y * 3.84 - 282) >
          c.location_panels.inner_radius
          ? "#ff8b78"
          : "#fff0b0",
      );
    };
    draw();
    const update = (x, y) => {
      editor.change(() => {
        o.x = Math.max(0, Math.min(100, Math.round(x * 10) / 10));
        o.y = Math.max(0, Math.min(100, Math.round(y * 10) / 10));
      });
      draw();
      const controls = [...parent.querySelectorAll("[data-world-id]")].find(
        (e) => e.dataset.worldId === o.id,
      );
      if (controls)
        for (const [key, label] of [
          ["x", "Inhabitant horizontal position (%)"],
          ["y", "Inhabitant vertical position (%)"],
        ]) {
          const input = [...controls.querySelectorAll("input")].find(
            (e) => e.getAttribute("aria-label") === label,
          );
          if (input) input.value = o[key];
        }
    };
    let dragging = false;
    circle.onpointerdown = (e) => {
      e.preventDefault();
      dragging = true;
      circle.setPointerCapture(e.pointerId);
      editor.previewEncounter(o.id);
    };
    circle.onpointermove = (e) => {
      if (!dragging) return;
      const point = new DOMPoint(e.clientX, e.clientY).matrixTransform(
        map.getScreenCTM().inverse(),
      );
      update((point.x - 108) / 3.84, (point.y - 90) / 3.84);
    };
    circle.onpointerup = (e) => {
      if (!dragging) return;
      dragging = false;
      circle.releasePointerCapture(e.pointerId);
    };
    circle.onpointercancel = () => (dragging = false);
    circle.onkeydown = (e) => {
      const delta = e.shiftKey ? 5 : 1,
        moves = {
          ArrowLeft: [-delta, 0],
          ArrowRight: [delta, 0],
          ArrowUp: [0, -delta],
          ArrowDown: [0, delta],
        };
      if (!moves[e.key]) return;
      e.preventDefault();
      editor.previewEncounter(o.id);
      update(o.x + moves[e.key][0], o.y + moves[e.key][1]);
    };
  }
  parent.appendChild(map);
  editor.note(
    parent,
    "Drag a marker to place its inhabitant. Arrow keys move 1%; Shift + arrow moves 5%. The gold circle marks the visible opening; red outlines flag positions outside it. Markers include inactive inhabitants.",
  );
}
export function worldEditor(root) {
  const c = this.config,
    w = c.world,
    moon = w.moon;
  this.note(
    root,
    "Build a miniature world inside the castle opening. Inhabitants, landscape motion and the night sky are independent controls. Positions are percentages of the scene image: 0/0 is its top-left; the circular frame clips the corners. Save the dashboard to keep your world.",
  );
  if (c.artwork !== "castle" || c.face_image)
    this.button(root, "Use the animated castle for this world", () =>
      this.change(() => {
        c.artwork = "castle";
        c.theme = "living-magical";
        c.face_image = "";
        c.show_location_labels = true;
      }, true),
    );
  if (
    c.reduced_motion ||
    window.matchMedia?.("(prefers-reduced-motion: reduce)").matches
  )
    this.note(
      root,
      "Animation is currently paused by Reduced motion. Check General → Reduced motion and the viewing device’s accessibility preference to see motion. Props and the moon remain visible.",
    );
  const nature = this.box(root, "Landscape and sky");
  field(
    this,
    nature,
    "Show clock title and caption",
    c,
    "show_branding",
    "checkbox",
    null,
    "Hide these overlay labels to give the miniature world the full opening. Your title and caption text remain saved and can be shown again.",
  );
  field(
    this,
    nature,
    "Show miniature world",
    w,
    "enabled",
    "checkbox",
    null,
    "Enable living-world layers on the castle. Turning this off keeps the base castle scene and tracking hands.",
  );
  field(
    this,
    nature,
    "Animate castle scenery",
    c,
    "scene_motion",
    "checkbox",
    null,
    "Pause or resume landscape and creature animations together. Paused mode keeps a still, visible world. Weather has a separate animation switch.",
  );
  for (const [key, label, help] of [
    [
      "clouds",
      "Moving clouds",
      "Cloud layers drift continuously at different wind speeds. The bundled sky replaces its stationary clouds; uploaded scenes retain their own sky beneath the overlay.",
    ],
    [
      "trees",
      "Swaying trees",
      "Gently sway foliage regions in the bundled castle landscape. Light detail mode omits these photo layers.",
    ],
    [
      "water",
      "Rippling lake",
      "Gently distort the lake reflections with continuous small waves. The shoreline stays fixed; no broad image bands slide back and forth.",
    ],
    [
      "waterfalls",
      "Running waterfalls",
      "Animate downward flowing threads and fine spray at the bundled falls. Spray stays close to the impact points, without solid glowing discs.",
    ],
    [
      "fireflies",
      "Evening fireflies",
      "Show gently drifting fireflies around the shore at dusk and night. Turn these off independently of stars and other inhabitants.",
    ],
    [
      "windows",
      "Warm castle window lights",
      "Illuminate the actual warm window regions at dusk and night, with a gentle flicker. Landscape motion can pause these lights with the rest of the scene.",
    ],
    [
      "stars",
      "Twinkling stars",
      "Show a varied star field at dawn, dusk and night. Castle silhouettes mask the stars so they appear behind the towers.",
    ],
    [
      "shooting_stars",
      "Occasional shooting stars",
      "Show two brief meteor paths on different recurring cycles in the night sky. Reduced motion hides meteors.",
    ],
  ])
    field(this, nature, label, w, key, "checkbox", null, help);
  field(
    this,
    nature,
    "World detail",
    w,
    "quality",
    "select",
    [
      ["rich", "Rich"],
      ["balanced", "Balanced"],
      ["light", "Light"],
    ],
    "Rich keeps the most foliage/stars and paints landscape motion at 24 fps. Balanced uses fewer foliage layers and 18 fps. Light uses lower resolution, fewer stars, no moving foliage, and 12 fps.",
  );
  field(
    this,
    nature,
    "Scene time",
    c,
    "period_override",
    "select",
    ["auto", "dawn", "day", "dusk", "night"],
    "Choose a time to inspect your world, or Auto to follow Home Assistant sun data and local solar calculations. This also controls night-only inhabitants.",
  );
  const lunar = this.box(root, "Moon phase");
  field(
    this,
    lunar,
    "Show the moon",
    moon,
    "enabled",
    "checkbox",
    null,
    "Draw the moon during dawn, dusk and night, with the actual illuminated portion rather than a fixed crescent.",
  );
  field(
    this,
    lunar,
    "Moon phase source",
    moon,
    "source",
    "select",
    [
      ["auto", "Auto: existing moon sensor, then calculation"],
      ["entity", "Selected Home Assistant sensor"],
      ["calculated", "Local astronomical calculation"],
      ["manual", "Manual phase preview"],
    ],
    "Auto looks for an existing moon-phase sensor. You can choose a sensor explicitly, calculate locally without a network service, or select a phase to preview.",
  );
  this.selector(lunar, "Moon phase entity", moon, "entity", ["sensor"]);
  lunar
    .querySelector("ha-selector")
    ?.parentElement.querySelector(".field-help")
    ?.replaceChildren(
      document.createTextNode(
        "Choose your existing Moon integration sensor or another phase sensor. The card does not create a sensor or request a new integration.",
      ),
    );
  field(
    this,
    lunar,
    "Moon phase attribute",
    moon,
    "attribute",
    "text",
    null,
    "Leave blank to read the sensor state. Enter an exact attribute key only when the phase is stored in an attribute.",
  );
  field(
    this,
    lunar,
    "Moon sensor value format",
    moon,
    "format",
    "select",
    [
      ["named", "Named phase (Home Assistant Moon)"],
      ["cycle", "Cycle fraction: 0–1"],
      ["cycle-percent", "Cycle percent: 0–100"],
      ["age-days", "Moon age: 0–29.53059 days"],
    ],
    "Named supports the eight Home Assistant phase names. Cycle is 0 at new moon and 0.5 at full. Illuminated percentage alone cannot identify waxing versus waning and is not treated as a cycle.",
  );
  field(
    this,
    lunar,
    "Unavailable moon sensor",
    moon,
    "fallback",
    "select",
    [
      ["calculated", "Use local astronomical calculation"],
      ["hide", "Hide the moon"],
    ],
    "When an explicitly selected sensor is missing or unavailable, calculate the phase locally or hide the moon. The editor reports when calculation is being used.",
  );
  field(
    this,
    lunar,
    "Manual moon phase",
    moon,
    "manual",
    "select",
    MOON_PHASES,
    "Used only with Manual phase preview. Switch back to Auto or Selected sensor for a live moon phase.",
  );
  for (const [key, label] of [
    ["x", "Moon horizontal position (%)"],
    ["y", "Moon vertical position (%)"],
    ["size", "Moon radius"],
  ])
    field(
      this,
      lunar,
      label,
      moon,
      key,
      "number",
      null,
      key === "size"
        ? "Moon radius from 6 to 32 SVG units. The night sky and frame still clip the scene."
        : "Position within the scene image, from 0 to 100 percent. The moon is kept inside the frame and masked behind the towers; the default places it in open sky.",
    );
  const reading = moonReading(w, this._hass?.states || {});
  this.note(
    lunar,
    `Current moon: ${reading.label.replace(/_/g, " ")}. Source: ${reading.source || "none"}${reading.fallback ? " (selected sensor unavailable; calculated fallback)" : ""}.`,
  );
  lunar.lastElementChild.classList.add("moon-summary");
  const residents = this.box(root, "Creatures and props");
  this.note(
    residents,
    "Add up to 32 inhabitants. Flying encounters and surfacing creatures have quiet intervals between appearances. Use Preview encounter now to view an active moment. Filters determine which scene combinations include each inhabitant.",
  );
  this.button(residents, "Add a quiet lakeside population", () =>
    this.change(() => (w.objects = worldPreset("quiet")), true),
  );
  this.button(residents, "Add an enchanted-world population", () =>
    this.change(() => (w.objects = worldPreset("enchanted")), true),
  );
  this.button(residents, "Remove all inhabitants", () =>
    this.change(() => (w.objects = []), true),
  );
  placementMap(this, residents);
  const draft = (this._worldDraft ||= { kind: "dragon" });
  const picker = field(
    this,
    residents,
    "Creature or prop to add",
    draft,
    "kind",
    "select",
    CREATURES,
    "Choose a built-in inhabitant or a custom image prop, then choose Add selected inhabitant. Starter populations replace the current inhabitant list.",
  );
  picker.onchange = () => (draft.kind = picker.value);
  const add = this.button(residents, "Add selected inhabitant", () =>
    this.change(() => {
      if (w.objects.length < 32) w.objects.push(worldObject(draft.kind, uid()));
    }, true),
  );
  add.disabled = w.objects.length >= 32;
  w.objects.forEach((o, i) => {
    const box = this.box(residents, o.name);
    box.dataset.worldId = o.id;
    field(
      this,
      box,
      "Inhabitant name",
      o,
      "name",
      "text",
      null,
      "Private name for finding this creature or prop in the editor. It is also its accessible description; no floating name is drawn in the scene.",
    );
    field(
      this,
      box,
      "Show this inhabitant",
      o,
      "enabled",
      "checkbox",
      null,
      "Temporarily hide this inhabitant without deleting its position, movement and scene filters.",
    );
    field(
      this,
      box,
      "Inhabitant color",
      o,
      "color",
      "color",
      null,
      "Tint the built-in creature’s body, cloth or prop. Small details retain their shading. Uploaded custom images keep their original colors.",
    );
    for (const [key, label, help] of [
      [
        "x",
        "Inhabitant horizontal position (%)",
        "Horizontal center of the inhabitant or its travel route, from 0 to 100 percent of the scene image.",
      ],
      [
        "y",
        "Inhabitant vertical position (%)",
        "Vertical center or waterline. Open sky is around 10–30%; the lake is around 72–90%. The circular opening clips corners.",
      ],
      [
        "scale",
        "Inhabitant scale",
        "Size multiplier from 0.25 to 3. Start at 1, then inspect at your normal dashboard size.",
      ],
      [
        "interval",
        "Movement cycle (seconds)",
        "Full repeat cycle, including the quiet time between flying or surfacing appearances. Valid range 8–240 seconds.",
      ],
      [
        "span",
        "Travel span (%)",
        "Requested flying-route width as a percentage of the scene image. Routes extend beyond the frame when needed so visitors enter and leave naturally.",
      ],
    ])
      field(this, box, label, o, key, "number", null, help);
    field(
      this,
      box,
      "Inhabitant movement",
      o,
      "motion",
      "select",
      [
        ["fly", "Fly past, then rest"],
        ["surface", "Surface, linger, then submerge"],
        ["drift", "Drift back and forth"],
        ["bob", "Gently bob"],
        ["still", "Still prop"],
      ],
      "Flying creatures cross their chosen route. Surfacing clips the figure below its chosen waterline. Drift, bob and still keep a prop visible continuously.",
    );
    field(
      this,
      box,
      "Facing direction",
      o,
      "facing",
      "select",
      ["right", "left"],
      "Face left or right. Flying encounters travel in that direction; drifting props still move gently back and forth.",
    );
    field(
      this,
      box,
      "Pass behind the castle",
      o,
      "behind_castle",
      "checkbox",
      null,
      "Mask this inhabitant behind the tower silhouette while it crosses the sky. Turn off for a foreground visitor or a route outside the default sky region.",
    );
    field(
      this,
      box,
      "Visible at time",
      o,
      "period",
      "select",
      ["any", "dawn", "day", "dusk", "night"],
      "Any includes all times. Other values render the inhabitant only when the current scene time matches. Night props therefore stay absent during daytime.",
    );
    field(
      this,
      box,
      "Visible in season",
      o,
      "season",
      "select",
      ["any", "spring", "summer", "autumn", "winter"],
      "Choose Any or restrict this inhabitant to one season, independently of its time and weather filters.",
    );
    field(
      this,
      box,
      "Visible in weather",
      o,
      "weather",
      "select",
      ["any", ...WEATHER.filter((k) => k !== "auto")],
      "Choose Any or a weather effect. Time, season and weather filters must all match for the inhabitant to appear.",
    );
    if (o.kind === "custom")
      this.imageField(box, "Custom inhabitant image", o, "image");
    const status = node("p");
    status.setAttribute("role", "status");
    box.appendChild(status);
    this.button(box, "Preview encounter now", () => {
      const played = this.previewEncounter(o.id);
      status.textContent = played
        ? "Showing an active moment."
        : "Enable the world and animation, choose a matching scene/time, and keep this route inside the opening.";
    });
    this.button(box, "Duplicate inhabitant", () =>
      this.change(() => {
        if (w.objects.length < 32)
          w.objects.splice(i + 1, 0, {
            ...clone(o),
            id: uid(),
            name: o.name + " copy",
          });
      }, true),
    );
    this.button(box, "Move inhabitant forward", () =>
      this.change(() => {
        if (i < w.objects.length - 1)
          [w.objects[i], w.objects[i + 1]] = [w.objects[i + 1], w.objects[i]];
      }, true),
    );
    this.button(box, "Remove inhabitant", () =>
      this.change(() => w.objects.splice(i, 1), true),
    );
    const controls = node("details");
    controls.appendChild(node("summary", "Edit inhabitant settings"));
    controls.open = i === 0;
    for (const child of [...box.children])
      if (!["LEGEND", "BUTTON", "P"].includes(child.tagName))
        controls.appendChild(child);
    box.insertBefore(controls, box.children[1] || null);
  });
  root.insertBefore(residents, nature);
  for (const [box, title] of [
    [nature, "Landscape and motion controls"],
    [lunar, "Moon sensor and night sky"],
  ]) {
    const details = node("details");
    details.appendChild(node("summary", title));
    root.insertBefore(details, box);
    details.appendChild(box);
  }
}

export function updateWorldMoonSummary() {
  const target = this.shadowRoot.querySelector(".moon-summary");
  if (!target || !this.config?.world) return;
  const reading = moonReading(this.config.world, this._hass?.states || {});
  target.textContent = `Current moon: ${reading.label.replace(/_/g, " ")}. Source: ${reading.source || "none"}${reading.fallback ? " (selected sensor unavailable; calculated fallback)" : ""}.`;
}
