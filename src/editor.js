import {
  defaults,
  normalize,
  clone,
  uid,
  THEMES,
  demo,
  exportConfig,
  importConfig,
  legacyLayout,
} from "./engine.js";
const css = `:host{display:block;color:var(--primary-text-color,#e8e4d7);font:14px system-ui}*{box-sizing:border-box}nav{display:flex;flex-wrap:wrap;gap:5px;margin:12px 0}button,input,select,textarea{font:inherit}button{cursor:pointer;padding:9px 12px;border:1px solid #82704c;border-radius:8px;background:var(--secondary-background-color,#273736);color:inherit}button.active{background:#856e40;color:#fff}h3{font:22px Georgia;margin:20px 0 12px}fieldset{border:1px solid #7e704c66;border-radius:12px;padding:14px;margin:14px 0}legend{font-weight:600}label{display:grid;grid-template-columns:minmax(130px,1fr) minmax(100px,1.5fr);align-items:center;gap:10px;margin:10px 0}input,select,textarea{width:100%;padding:9px;border:1px solid #82704c77;border-radius:6px;background:var(--card-background-color,#182a2b);color:inherit}input[type=checkbox]{width:22px;height:22px}input[type=color]{height:36px}textarea{min-height:100px}.actions{display:flex;gap:6px;flex-wrap:wrap;margin:12px 0}.note{opacity:.75;line-height:1.5}svg{width:100%;max-width:350px;display:block;margin:auto;touch-action:none}svg text{fill:currentColor;font:12px system-ui;pointer-events:none}svg circle[data-location]{cursor:grab}.error{color:#ffb9a4;white-space:pre-wrap}img{width:80px;height:80px;object-fit:cover;border-radius:50%}details{margin:12px 0}ha-selector{display:block;min-width:0}button:focus-visible,input:focus-visible{outline:3px solid #d9b671}.preview{max-width:400px;margin:auto}`;
const sections = [
  "General",
  "People",
  "Locations",
  "Appearance",
  "Behavior",
  "Presets",
];
const node = (tag, text) => {
  const e = document.createElement(tag);
  if (text !== undefined) e.textContent = text;
  return e;
};
export class ClockEditor extends HTMLElement {
  async connectedCallback() {
    // Home Assistant loads selector components lazily. Its built-in entities
    // editor imports ha-form, which registers ha-selector and its lazy loader.
    if (
      !customElements.get("ha-selector") &&
      typeof window.loadCardHelpers === "function"
    ) {
      try {
        const helpers = await window.loadCardHelpers();
        const card = helpers.createCardElement({
          type: "entities",
          entities: [],
        });
        if (card.constructor.getConfigElement)
          await card.constructor.getConfigElement();
        if (this.isConnected) this.render();
      } catch (error) {
        const message = node(
          "p",
          "Home Assistant could not load entity selectors. Reload the dashboard and try again.",
        );
        message.className = "error";
        this.shadowRoot.appendChild(message);
      }
    }
  }
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this.tab = "General";
    this.wizard = false;
  }
  setConfig(config) {
    this.config = normalize(config);
    this.render();
  }
  set hass(hass) {
    this._hass = hass;
    this.shadowRoot
      .querySelectorAll("ha-selector")
      .forEach((e) => (e.hass = hass));
    const preview = this.shadowRoot.querySelector("magical-family-clock-card");
    if (preview) preview.hass = hass;
  }
  emit() {
    this.dispatchEvent(
      new CustomEvent("config-changed", {
        detail: { config: clone(this.config) },
        bubbles: true,
        composed: true,
      }),
    );
    this.updatePreview();
  }
  change(fn, render = false) {
    const previousLocations = JSON.stringify(this.config.locations);
    fn();
    if (
      this.config.artwork === "castle" &&
      previousLocations !== JSON.stringify(this.config.locations)
    )
      this.config.artwork = "vector";
    this.emit();
    if (render) {
      this.config = normalize(this.config);
      this.render();
    }
  }
  button(parent, label, fn) {
    const b = node("button", label);
    b.type = "button";
    b.onclick = fn;
    parent.appendChild(b);
    return b;
  }
  field(parent, label, obj, key, type = "text", options) {
    const row = node("label");
    row.appendChild(node("span", label));
    const e = node(
      type === "select" ? "select" : type === "textarea" ? "textarea" : "input",
    );
    if (e.tagName === "INPUT") e.type = type;
    if (options)
      options.forEach((o) => {
        const pair = Array.isArray(o) ? o : [o, o];
        const opt = node("option", pair[1]);
        opt.value = pair[0];
        e.appendChild(opt);
      });
    if (type === "checkbox") e.checked = !!obj[key];
    else e.value = obj[key] == null ? "" : String(obj[key]);
    e.setAttribute("aria-label", label);
    e.onchange = () =>
      this.change(() => {
        obj[key] =
          type === "checkbox"
            ? e.checked
            : type === "number" || type === "range"
              ? Number(e.value)
              : e.value;
      });
    row.appendChild(e);
    parent.appendChild(row);
    return e;
  }
  selector(parent, label, obj, key, domains) {
    const row = node("label");
    row.appendChild(node("span", label));
    const e = node("ha-selector");
    e.hass = this._hass;
    e.selector = { entity: domains ? { domain: domains } : {} };
    e.value = obj[key] || "";
    e.setAttribute("aria-label", label);
    e.addEventListener("value-changed", (ev) => {
      if (ev.detail && ev.detail.value !== obj[key])
        this.change(() => (obj[key] = ev.detail.value || ""));
    });
    row.appendChild(e);
    parent.appendChild(row);
    if (!customElements.get("ha-selector")) {
      const help = node(
        "span",
        "Entity selector becomes available inside Home Assistant.",
      );
      help.className = "note";
      parent.appendChild(help);
    }
    return e;
  }
  list(parent, label, obj, key) {
    const row = node("label");
    row.appendChild(node("span", label));
    const e = node("textarea");
    e.value = (obj[key] || []).join("\n");
    e.setAttribute("aria-label", label);
    e.placeholder = "One exact state per line";
    e.onchange = () =>
      this.change(() => (obj[key] = e.value.split("\n").filter(Boolean)));
    row.appendChild(e);
    parent.appendChild(row);
  }
  box(parent, title) {
    const box = node("fieldset");
    box.appendChild(node("legend", title));
    parent.appendChild(box);
    return box;
  }
  note(parent, text) {
    const p = node("p", text);
    p.className = "note";
    parent.appendChild(p);
  }
  render() {
    if (!this.config) return;
    this.shadowRoot.innerHTML = "<style>" + css + "</style>";
    const root = node("div");
    this.shadowRoot.appendChild(root);
    const c = this.config;
    if (!c.members.length && !this.wizard) {
      this.note(
        root,
        "Start with your own household or explore a fictional demonstration. No helpers or template sensors are required.",
      );
      this.button(root, "Guided setup", () => {
        this.wizard = true;
        this.tab = "General";
        this.render();
      });
      this.button(root, "Try demonstration", () => {
        this.config = demo();
        this.emit();
        this.render();
      });
    }
    const nav = node("nav");
    nav.setAttribute("aria-label", "Editor sections");
    sections.forEach((s) => {
      const b = this.button(nav, s, () => {
        this.tab = s;
        this.render();
      });
      b.classList.toggle("active", s === this.tab);
    });
    root.appendChild(nav);
    root.appendChild(node("h3", this.tab));
    if (this.tab === "General") {
      this.field(root, "Title", c, "title");
      this.field(root, "Clock theme", c, "theme", "select", THEMES);
      for (const [variant, label] of [
        ["ha", "Use supplied Home Assistant layout"],
        ["standalone", "Use supplied standalone layout"],
      ]) {
        this.button(root, label, () => {
          const preset = legacyLayout(variant);
          this.config = normalize(
            Object.assign({}, c, {
              theme: preset.theme,
              locations: preset.locations,
              separation: preset.separation,
              hand_design: preset.hand_design,
              pivot_x: preset.pivot_x,
              pivot_y: preset.pivot_y,
              face_image: preset.face_image,
              show_location_labels: false,
              show_branding: false,
              unknown_location: preset.unknown_location,
            }),
          );
          this.emit();
          this.render();
        });
      }
      this.note(
        root,
        "Reference layouts keep your people and colors. They read the existing /local/magical-clock/clock-face.png image without changing it. Choose a curved or pointed hand per person, and disable portraits for the original silhouette.",
      );
      this.field(root, "Maximum size (pixels)", c, "size", "number");
      this.field(
        root,
        "Aspect ratio (width / height)",
        c,
        "aspect_ratio",
        "number",
      );
      this.field(root, "Reduced motion", c, "reduced_motion", "checkbox");
      this.field(root, "Transparent card", c, "transparent", "checkbox");
      this.field(root, "Demonstration states", c, "demo", "checkbox");
      this.note(
        root,
        "Disable demonstration states before choosing real household entities. Fullscreen uses the browser API with an in-page fallback.",
      );
    }
    if (this.tab === "People") {
      c.members.forEach((m, i) => {
        const box = this.box(root, m.name);
        this.field(box, "Display name", m, "name");
        this.field(box, "Nickname", m, "nickname");
        this.field(box, "Enabled", m, "enabled", "checkbox");
        this.selector(box, "Location entity", m, "entity", [
          "person",
          "device_tracker",
          "sensor",
        ]);
        this.selector(
          box,
          "Travelling entity (optional)",
          m,
          "travelling_entity",
          ["binary_sensor", "sensor"],
        );
        this.field(box, "State attribute (optional)", m, "attribute");
        this.field(box, "Hand color", m, "color", "color");
        this.field(box, "Text color", m, "text_color", "color");
        this.field(box, "Length (0.5–1.1)", m, "length", "number");
        this.field(box, "Spoon material", m, "material", "select", [
          "color",
          "brass",
          "copper",
          "silver",
        ]);
        this.field(box, "Movement duration (ms)", m, "duration", "number");
        this.field(box, "Hand design", m, "hand_design", "select", [
          "theme",
          "spoon",
          "classic",
          "legacy-curved",
          "standalone-pointed",
        ]);
        this.field(box, "Display priority", m, "priority", "number");
        this.field(box, "Show name", m, "show_name", "checkbox");
        this.field(box, "Show portrait", m, "show_portrait", "checkbox");
        this.field(box, "Portrait URL or /local/ path", m, "portrait");
        if (m.portrait) {
          const img = node("img");
          img.src = m.portrait;
          img.alt = "Portrait preview";
          box.appendChild(img);
        }
        this.field(box, "Portrait shape", m, "portrait_shape", "select", [
          "oval",
          "circle",
        ]);
        this.field(box, "Portrait frame", m, "portrait_frame", "select", [
          "brass",
          "none",
        ]);
        this.field(box, "Portrait zoom (1–4)", m, "portrait_zoom", "number");
        this.field(
          box,
          "Portrait horizontal position (0–100)",
          m,
          "portrait_x",
          "number",
        );
        this.field(
          box,
          "Portrait vertical position (0–100)",
          m,
          "portrait_y",
          "number",
        );
        this.field(box, "Portrait rotation", m, "portrait_rotation", "number");
        this.field(box, "Head size (0.6–1.5)", m, "head_size", "number");
        const mappings = this.box(box, "Personal state overrides");
        Object.keys(m.overrides || {}).forEach((state) => {
          const row = node("div");
          row.appendChild(
            node(
              "span",
              state +
                " → " +
                ((c.locations.find((l) => l.id === m.overrides[state]) || {})
                  .name || "Missing location"),
            ),
          );
          this.button(row, "Remove mapping", () =>
            this.change(() => delete m.overrides[state], true),
          );
          mappings.appendChild(row);
        });
        const mapping = {
          state: "",
          location: c.locations.length ? c.locations[0].id : "",
        };
        this.field(mappings, "Actual entity state", mapping, "state");
        this.field(
          mappings,
          "Display as location",
          mapping,
          "location",
          "select",
          c.locations.map((l) => [l.id, l.name]),
        );
        this.button(mappings, "Add personal mapping", () => {
          if (mapping.state)
            this.change(
              () => (m.overrides[mapping.state] = mapping.location),
              true,
            );
        });

        const actions = node("div");
        actions.className = "actions";
        this.button(actions, "Move up", () =>
          this.change(() => {
            if (i > 0)
              [c.members[i - 1], c.members[i]] = [
                c.members[i],
                c.members[i - 1],
              ];
          }, true),
        );
        this.button(actions, "Move down", () =>
          this.change(() => {
            if (i < c.members.length - 1)
              [c.members[i + 1], c.members[i]] = [
                c.members[i],
                c.members[i + 1],
              ];
          }, true),
        );
        this.button(actions, "Remove person", () =>
          this.change(() => c.members.splice(i, 1), true),
        );
        box.appendChild(actions);
      });
      this.button(root, "Add person", () =>
        this.change(() => {
          c.demo = false;
          c.members.push({ id: uid(), name: "New person" });
        }, true),
      );
      this.note(
        root,
        "Portraits stay on your chosen host. Use an existing Home Assistant /local/ image or an accessible image URL. This card does not upload files or resolve protected media-source URLs.",
      );
    }
    if (this.tab === "Locations") {
      this.dial(root);
      this.button(root, "Space locations evenly", () =>
        this.change(
          () =>
            c.locations.forEach(
              (l, i) => (l.angle = -90 + (i * 360) / c.locations.length),
            ),
          true,
        ),
      );
      c.locations.forEach((l, i) => {
        const box = this.box(root, l.name);
        this.field(box, "Location name", l, "name");
        this.field(box, "Angle in degrees", l, "angle", "number");
        this.list(box, "Matching states", l, "states");
        this.list(box, "Additional aliases", l, "aliases");
        this.selector(box, "Home Assistant zone (optional)", l, "zone", [
          "zone",
        ]);
        this.field(box, "Label color", l, "color", "color");
        this.field(box, "Match priority", l, "priority", "number");
        this.note(
          box,
          "ID: " +
            l.id +
            ". Zone matching uses the zone friendly name. To match a literal zone ID, add it explicitly to matching states.",
        );
        this.button(box, "Remove location", () =>
          this.change(() => c.locations.splice(i, 1), true),
        );
      });
      this.button(root, "Add location", () =>
        this.change(
          () =>
            c.locations.push({
              id: uid(),
              name: "New location",
              angle: 0,
              states: [],
              aliases: [],
            }),
          true,
        ),
      );
      this.field(
        root,
        "Case-insensitive matching",
        c,
        "case_insensitive",
        "checkbox",
      );
    }
    if (this.tab === "Appearance") {
      const applyCastle = () => {
        const preset = legacyLayout();
        this.config = normalize(
          Object.assign({}, c, {
            artwork: "castle",
            theme: "living-magical",
            locations: preset.locations,
            separation: preset.separation,
            pivot_x: 50,
            pivot_y: 47,
            face_image: "",
            hand_design: "legacy-curved",
          }),
        );
        this.emit();
        this.render();
      };
      this.button(root, "Use layered castle artwork", applyCastle);
      const artworkChoice = this.field(
        root,
        "Clock artwork",
        c,
        "artwork",
        "select",
        [
          ["vector", "Customizable dial"],
          ["castle", "Castle glass — six locations"],
        ],
      );
      artworkChoice.onchange = () => {
        if (artworkChoice.value === "castle") applyCastle();
        else this.change(() => (c.artwork = "vector"), true);
      };
      this.field(root, "Scene season", c, "season_override", "select", [
        "auto",
        "spring",
        "summer",
        "autumn",
        "winter",
      ]);
      this.field(root, "Scene time", c, "period_override", "select", [
        "auto",
        "dawn",
        "day",
        "dusk",
        "night",
      ]);
      this.note(
        root,
        "Castle glass uses a separate transparent frame and 16 seasonal scenes. Editing location labels or angles switches to the customizable dial. Scene images preload before fading; a broken image keeps the last scene.",
      );

      this.field(root, "Background mode", c, "background_mode", "select", [
        "auto",
        "manual",
      ]);
      this.field(root, "Manual background", c, "background", "select", [
        "day",
        "night",
        "sunrise",
        "sunset",
        "spring",
        "summer",
        "autumn",
        "winter",
        "rain",
      ]);
      this.field(root, "Seasonal backgrounds", c, "seasonal", "checkbox");
      this.field(root, "Hemisphere", c, "hemisphere", "select", [
        ["north", "Northern"],
        ["south", "Southern"],
      ]);
      this.selector(root, "Sun entity", c, "sun_entity", ["sun"]);
      this.selector(root, "Weather entity (optional)", c, "weather_entity", [
        "weather",
      ]);
      this.field(root, "Brightness (0.15–1.5)", c, "brightness", "number");
      this.field(root, "Animate gears", c, "gears", "checkbox");
      this.field(root, "Gear revolution (seconds)", c, "gear_speed", "number");
      this.field(
        root,
        "Background opacity (0–1)",
        c,
        "background_opacity",
        "number",
      );
      this.field(
        root,
        "Background crossfade (ms)",
        c,
        "background_transition",
        "number",
      );
      this.field(root, "Decorative detail", c, "detail", "select", [
        "rich",
        "minimal",
      ]);
      this.field(root, "Typography", c, "font", "select", [
        "Georgia, serif",
        "Palatino, serif",
        "system-ui, sans-serif",
      ]);
      this.field(root, "Center illustration URL", c, "center_image");
      this.field(root, "Complete clock-face image URL", c, "face_image");
      this.field(
        root,
        "Show extra location labels on custom face",
        c,
        "show_location_labels",
        "checkbox",
      );
      this.field(
        root,
        "Show title on custom face",
        c,
        "show_branding",
        "checkbox",
      );
      this.field(root, "Pivot horizontal position (%)", c, "pivot_x", "number");
      this.field(root, "Pivot vertical position (%)", c, "pivot_y", "number");
      this.field(
        root,
        "Living Magical hand design",
        c,
        "hand_design",
        "select",
        ["legacy-curved", "standalone-pointed", "classic", "spoon"],
      );
      this.note(
        root,
        "A complete clock-face image includes its landscape and frame; automatic skies cannot show through an opaque image. Use layered castle artwork for changing scenes beneath a separate frame. A failed complete-face image load keeps the bundled face visible.",
      );
      const box = this.box(root, "Custom backgrounds");
      [
        "day",
        "night",
        "sunrise",
        "sunset",
        "spring",
        "summer",
        "autumn",
        "winter",
        "rain",
      ].forEach((key) =>
        this.field(box, key + " image URL", c.background_images, key),
      );
      this.note(
        root,
        "Automatic mode prioritizes weather, night, sunrise/sunset, then the season. Bundled vector landscapes require no internet.",
      );
    }
    if (this.tab === "Behavior") {
      this.field(root, "Movement duration (ms)", c, "duration", "number");
      this.field(root, "Hand separation (degrees)", c, "separation", "number");
      this.field(root, "Collision arrangement", c, "collision", "select", [
        "fan",
        "stack",
      ]);
      const choices = [
        ["", "No matching location"],
        ...c.locations.map((l) => [l.id, l.name]),
      ];
      this.field(
        root,
        "Unknown state location",
        c,
        "unknown_location",
        "select",
        choices,
      );
      this.field(
        root,
        "Travelling location",
        c,
        "travelling_location",
        "select",
        choices,
      );
      this.note(
        root,
        "Missing or unexpected entity states use the selected unknown location. Hands use shortest-path rotation. Reduced motion also follows your device preference. At very large household sizes, reduce portrait size or use separate clocks for readability.",
      );
    }
    if (this.tab === "Presets") this.presets(root);
    if (this.wizard) {
      const index = sections.indexOf(this.tab);
      this.note(
        root,
        "Setup " +
          (index + 1) +
          " of " +
          sections.length +
          ". Changes appear in Home Assistant’s live preview; finish with the dashboard Save button.",
      );
      this.button(
        root,
        index === sections.length - 1 ? "Finish setup" : "Next",
        () => {
          if (index === sections.length - 1) this.wizard = false;
          else this.tab = sections[index + 1];
          this.render();
        },
      );
    }
    const details = node("details");
    details.appendChild(node("summary", "Local live preview"));
    const preview = node("magical-family-clock-card");
    preview.className = "preview";
    details.appendChild(preview);
    root.appendChild(details);
    this.updatePreview();
  }
  updatePreview() {
    const p = this.shadowRoot.querySelector("magical-family-clock-card");
    if (p && p.setConfig) {
      p.setConfig(this.config);
      p.hass = this._hass;
    }
  }
  dial(parent) {
    const ns = "http://www.w3.org/2000/svg";
    const dial = document.createElementNS(ns, "svg");
    dial.setAttribute("viewBox", "0 0 300 300");
    dial.setAttribute("aria-label", "Drag locations around the clock");
    const circle = document.createElementNS(ns, "circle");
    Object.entries({
      cx: 150,
      cy: 150,
      r: 115,
      fill: "none",
      stroke: "#b99d60",
    }).forEach(([k, v]) => circle.setAttribute(k, v));
    dial.appendChild(circle);
    this.config.locations.forEach((l) => {
      const a = (l.angle * Math.PI) / 180;
      const dot = document.createElementNS(ns, "circle");
      Object.entries({
        cx: 150 + Math.cos(a) * 115,
        cy: 150 + Math.sin(a) * 115,
        r: 9,
        fill: "#d0b375",
        "data-location": l.id,
        tabindex: 0,
        role: "slider",
        "aria-label": l.name,
        "aria-valuemin": -360,
        "aria-valuemax": 360,
        "aria-valuenow": l.angle,
      }).forEach(([k, v]) => dot.setAttribute(k, v));
      const label = document.createElementNS(ns, "text");
      label.textContent = l.name;
      label.setAttribute("x", 150 + Math.cos(a) * 90);
      label.setAttribute("y", 150 + Math.sin(a) * 90);
      label.setAttribute("text-anchor", "middle");
      dial.appendChild(label);
      dial.appendChild(dot);
      dot.onpointerdown = (e) => {
        dot.setPointerCapture(e.pointerId);
      };
      dot.onpointermove = (e) => {
        if (!dot.hasPointerCapture(e.pointerId)) return;
        const rect = dial.getBoundingClientRect();
        l.angle = Math.round(
          (Math.atan2(
            e.clientY - rect.top - rect.height / 2,
            e.clientX - rect.left - rect.width / 2,
          ) *
            180) /
            Math.PI,
        );
        const a = (l.angle * Math.PI) / 180;
        dot.setAttribute("cx", 150 + Math.cos(a) * 115);
        dot.setAttribute("cy", 150 + Math.sin(a) * 115);
        label.setAttribute("x", 150 + Math.cos(a) * 90);
        label.setAttribute("y", 150 + Math.sin(a) * 90);
        this.emit();
      };
      dot.onpointerup = (e) => {
        dot.releasePointerCapture(e.pointerId);
        this.render();
      };
      dot.onkeydown = (e) => {
        if (["ArrowLeft", "ArrowRight"].includes(e.key)) {
          e.preventDefault();
          this.change(() => (l.angle += e.key === "ArrowRight" ? 1 : -1), true);
        }
      };
    });
    parent.appendChild(dial);
    const angles = this.config.locations.map((l) => l.angle);
    if (
      angles.some((a, i) =>
        angles.some(
          (b, j) => i !== j && Math.abs(((a - b + 540) % 360) - 180) < 15,
        ),
      )
    )
      this.note(
        parent,
        "Some labels are close together. Drag them apart or distribute locations evenly.",
      );
  }
  presets(root) {
    const c = this.config;
    const options = { personal: false };
    this.field(
      root,
      "Include personal details in export",
      options,
      "personal",
      "checkbox",
    );
    const text = node("textarea");
    text.setAttribute("aria-label", "Configuration JSON");
    text.placeholder = "Paste exported JSON here to import";
    root.appendChild(text);
    const error = node("p");
    error.className = "error";
    error.setAttribute("role", "alert");
    root.appendChild(error);
    this.button(root, "Export configuration", () => {
      text.value = JSON.stringify(exportConfig(c, options.personal), null, 2);
    });
    this.button(root, "Import configuration", () => {
      try {
        this.config = importConfig(text.value);
        this.emit();
        this.render();
      } catch (e) {
        error.textContent = e.message;
      }
    });
    this.button(root, "Download JSON", () => {
      const blob = new Blob(
        [JSON.stringify(exportConfig(c, options.personal), null, 2)],
        { type: "application/json" },
      );
      const url = URL.createObjectURL(blob);
      const a = node("a");
      a.href = url;
      a.download = "magical-family-clock.json";
      a.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    });
    this.button(root, "Clone full configuration", () => {
      text.value = JSON.stringify(clone(c), null, 2);
      error.textContent =
        "Full clone includes personal data. Copy into another card using Import configuration.";
    });
    this.button(root, "Reset to defaults", () => {
      if (window.confirm("Reset this clock?")) {
        this.config = normalize(defaults());
        this.emit();
        this.render();
      }
    });
    const presetBox = this.box(root, "Appearance presets on this browser");
    const name = node("input");
    name.setAttribute("aria-label", "Preset name");
    name.placeholder = "Preset name";
    presetBox.appendChild(name);
    const picker = node("select");
    picker.setAttribute("aria-label", "Saved appearance preset");
    presetBox.appendChild(picker);
    const read = () => {
      try {
        return JSON.parse(
          localStorage.getItem("magical-family-clock-presets") || "{}",
        );
      } catch (e) {
        return {};
      }
    };
    const refresh = () => {
      while (picker.firstChild) picker.removeChild(picker.firstChild);
      Object.keys(read()).forEach((k) => {
        const opt = node("option", k);
        opt.value = k;
        picker.appendChild(opt);
      });
    };
    refresh();
    this.button(presetBox, "Save appearance preset", () => {
      try {
        if (!name.value.trim()) throw Error("Enter a preset name.");
        const saved = read();
        saved[name.value.trim()] = {
          theme: c.theme,
          brightness: c.brightness,
          gears: c.gears,
          gear_speed: c.gear_speed,
          background_mode: c.background_mode,
          background: c.background,
          seasonal: c.seasonal,
        };
        localStorage.setItem(
          "magical-family-clock-presets",
          JSON.stringify(saved),
        );
        refresh();
      } catch (e) {
        error.textContent = e.message;
      }
    });
    this.button(presetBox, "Load appearance preset", () => {
      const preset = read()[picker.value];
      if (preset) {
        this.config = normalize(Object.assign({}, this.config, preset));
        this.emit();
        this.render();
      }
    });
    this.button(presetBox, "Delete appearance preset", () => {
      try {
        const saved = read();
        delete saved[picker.value];
        localStorage.setItem(
          "magical-family-clock-presets",
          JSON.stringify(saved),
        );
        refresh();
      } catch (e) {
        error.textContent = e.message;
      }
    });
    this.note(
      root,
      "Default exports remove names, entity IDs, image references, zone mappings, and location names. Full exports and clones contain personal details. Review before sharing. Use Home Assistant’s Duplicate card action for a second independent clock. Appearance presets save only visual settings in this browser, with no people or entity IDs.",
    );
  }
}
if (!customElements.get("magical-family-clock-card-editor"))
  customElements.define("magical-family-clock-card-editor", ClockEditor);
