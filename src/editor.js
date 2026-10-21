import {
  panelEditor,
  slotEditor,
  worldEditor,
  updateWorldMoonSummary,
} from "./editor-world.js";
import { palettes } from "./themes.js";
import { FONTS, HAND_STYLES, MATERIALS } from "./design.js";
import { settingHelp } from "./help.js";
import {
  letteringEditor,
  bezelEditor,
  carouselEditor,
  savedPeopleEditor,
  savePersonAction,
} from "./editor-design.js";
import { uploadImage } from "./images.js";
import { ClockLibrary } from "./library.js";
import { discoveredLocations } from "./data.js";
import { WEATHER } from "./weather.js";
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
  "Living world",
  "Behavior",
  "Presets",
  "Saved clocks",
  "Labels & effects",
  "Bezel",
  "Face cycling",
  "Saved people",
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
    const key = JSON.stringify(config);
    if (key === this._emittedKey || key === JSON.stringify(this.config)) return;
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
    updateWorldMoonSummary.call(this);
  }
  emit() {
    updateWorldMoonSummary.call(this);
    this._emittedKey = JSON.stringify(this.config);
    this.updatePreview();
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
    fn();
    this.emit();
    if (render) {
      this.config = normalize(this.config);
      this.render();
    }
  }
  button(parent, label, fn) {
    const b = node("button", label);
    b.title = label;
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
    if (e.tagName === "INPUT") {
      e.type = type;
      if (type === "number") e.step = "any";
    }
    if (options)
      options.forEach((o) => {
        const pair = Array.isArray(o) ? o : [o, o];
        const opt = node("option", pair[1]);
        opt.value = pair[0];
        e.appendChild(opt);
      });
    if (type === "checkbox") e.checked = !!obj[key];
    else e.value = obj[key] == null ? "" : String(obj[key]);
    if (type === "color" && !obj[key])
      e.value =
        (key === "title_color" || key === "caption_color") &&
        this.config.artwork === "castle"
          ? "#f4dfb1"
          : palettes[this.config.theme]?.[key] ||
            palettes[this.config.theme]?.ink ||
            "#b58b4b";
    e.setAttribute("aria-label", label);
    e.onchange = () => {
      const value =
        type === "checkbox"
          ? e.checked
          : type === "number" || type === "range"
            ? e.value === ""
              ? null
              : Number(e.value)
            : e.value;
      if (value === obj[key]) return;
      this.change(() => (obj[key] = value));
    };
    if (!["checkbox", "select"].includes(type)) e.oninput = e.onchange;
    this.controlHelp(row, e, settingHelp(key, label, type, options));
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
    this.controlHelp(row, e, settingHelp(key, label, "entity"));
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
    this.controlHelp(row, e, settingHelp(key, label, "textarea"));
    e.onchange = () =>
      this.change(() => (obj[key] = e.value.split("\n").filter(Boolean)));
    row.appendChild(e);
    parent.appendChild(row);
  }
  controlHelp(row, control, message) {
    const help = node("small", message);
    help.className = "field-help";
    help.id = "help-" + uid();
    row.appendChild(help);
    control.setAttribute("aria-describedby", help.id);
  }
  disconnectedCallback() {
    cancelAnimationFrame(this._previewFrame);
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
    const open = new Set(
      [...this.shadowRoot.querySelectorAll("details[open]")].map(
        (e) =>
          (e.closest("[data-person],[data-world-id]")?.dataset.person ||
            e.closest("[data-world-id]")?.dataset.worldId ||
            "") +
          "|" +
          e.querySelector("summary")?.textContent,
      ),
    );
    if (this.standalonePreview) {
      this._preview ||= node("magical-family-clock-card");
      if (this._preview.isConnected) this._preview.remove();
    }
    this.shadowRoot.innerHTML =
      "<style>" +
      css +
      `.field-help{grid-column:1/-1;display:block;color:var(--secondary-text-color,#aebdbb);font-size:12px;line-height:1.5;margin-top:-3px;order:3}.preview-shell{position:sticky;top:0;z-index:4;background:var(--card-background-color,#14242a);border:1px solid #a98b5855;border-radius:14px;padding:8px 12px;box-shadow:0 8px 30px #0003}.preview-shell summary{cursor:pointer;font-weight:600}.preview{max-width:310px;max-height:340px;margin:auto}.preview-status{font-size:12px;color:var(--secondary-text-color,#b5c8c9);margin:4px}nav button{font-size:12px;padding:8px 10px}label{border-bottom:1px solid #829aa018;padding-bottom:10px}.actions button:first-child{background:#94713f;color:#fff4d6}@media(max-width:500px){.preview{max-width:220px}label{grid-template-columns:1fr}nav{gap:4px}}` +
      "</style>";
    const root = node("div");
    this.shadowRoot.appendChild(root);
    const c = this.config;
    const quick = node("div");
    quick.className = "actions";
    if (this.tab !== "People")
      this.button(quick, "Add person", () => {
        this.tab = "People";
        this.change(() => {
          c.demo = false;
          c.members.push({ id: uid(), name: "New person" });
        }, true);
      });
    this.button(quick, "Save clock", () => {
      this.tab = "Saved clocks";
      this.render();
    });
    this.button(quick, "Use saved clock", () => {
      this.tab = "Saved clocks";
      this.render();
    });
    root.appendChild(quick);
    if (this.standalonePreview) {
      const previewBox = node("details");
      previewBox.className = "preview-shell";
      previewBox.open = true;
      previewBox.appendChild(node("summary", "Live clock preview"));
      this._preview.className = "preview";
      previewBox.appendChild(this._preview);
      const previewStatus = node("p", "Ready — changes appear as you type.");
      previewStatus.className = "preview-status";
      previewStatus.setAttribute("role", "status");
      previewBox.appendChild(previewStatus);
      if (!this._previewStatusBound) {
        this._preview.addEventListener("clock-render-status", (event) => {
          const status = this.shadowRoot.querySelector(".preview-status");
          if (status) {
            status.textContent =
              event.detail.status === "ready"
                ? "Preview ready."
                : event.detail.message;
            status.classList.toggle("error", event.detail.status === "error");
          }
        });
        this._previewStatusBound = true;
      }
      root.appendChild(previewBox);
    }
    this.note(
      root,
      "Choose a face, add people, and select their location entities. Changes appear in the preview. Use Home Assistant’s Save button to keep dashboard changes.",
    );
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
      this.field(root, "Clock caption (blank to hide)", c, "caption");
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
      this.button(root, "Use saved person", () => {
        this.tab = "Saved people";
        this.render();
      });
      c.members.forEach((m, i) => {
        const box = this.box(root, m.editor_label || m.name || "Unnamed hand");
        box.dataset.person = m.id;
        this.field(box, "Editor label", m, "editor_label");
        const handLabel = this.field(
          box,
          "Hand lettering (blank for none)",
          m,
          "hand_label",
        );
        handLabel.value =
          m.hand_label === undefined ? m.nickname || m.name : m.hand_label;
        this.button(box, "Remove hand lettering", () =>
          this.change(() => {
            m.hand_label = "";
            m.name = "";
            m.nickname = "";
          }, true),
        );
        savePersonAction.call(this, box, m);
        this.field(box, "Lettering position", m, "name_position", "select", [
          ["stem", "Along the stem"],
          ["tip", "At the spoon / pointer tip"],
        ]);
        this.field(
          box,
          "Lettering direction",
          m,
          "name_orientation",
          "select",
          [
            ["parallel", "Parallel to the hand"],
            ["perpendicular", "Perpendicular to the hand"],
          ],
        );
        this.field(
          box,
          "Lettering rotation (degrees)",
          m,
          "name_rotation",
          "number",
        );
        this.field(
          box,
          "Keep lettering upright",
          m,
          "name_upright",
          "checkbox",
        );
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
        this.field(box, "Hand width (0.5–2.5)", m, "width", "number");
        this.field(box, "Hand material", m, "material", "select", MATERIALS);
        this.field(box, "Hand finish", m, "finish", "select", [
          "polished",
          "brushed",
          "aged",
        ]);
        this.field(box, "Hand edge depth", m, "relief", "number");
        this.field(box, "Movement duration (ms)", m, "duration", "number");
        this.field(box, "Hand design", m, "hand_design", "select", HAND_STYLES);
        this.field(box, "Display priority", m, "priority", "number");
        this.field(box, "Show name", m, "show_name", "checkbox");
        this.field(box, "Show portrait", m, "show_portrait", "checkbox");
        this.imageField(box, "Portrait", m, "portrait", true);
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
        this.personData(box, m);
        const advanced = node("details");
        advanced.appendChild(node("summary", "Advanced location matching"));
        box.appendChild(advanced);
        const mappings = this.box(advanced, "Personal state overrides");
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
        const advancedStyle = node("details");
        advancedStyle.appendChild(
          node("summary", "Customize hand and portrait"),
        );
        box.appendChild(advancedStyle);
        [...box.children]
          .filter(
            (e) =>
              e.tagName === "LABEL" &&
              ![
                "Editor label",
                "Hand lettering (blank for none)",
                "Lettering position",
                "Lettering direction",
                "Display name",
                "Nickname",
                "Enabled",
                "Location entity",
              ].includes(e.firstChild?.textContent),
          )
          .forEach((e) => advancedStyle.appendChild(e));
      });
      this.button(root, "Add person", () =>
        this.change(() => {
          c.demo = false;
          c.members.push({ id: uid(), name: "New person" });
        }, true),
      );
      this.note(
        root,
        "Upload a portrait from your device. Images are optimized and saved inside this dashboard configuration. Advanced image links remain available. Optional hand data never changes location tracking.",
      );
    }
    if (this.tab === "Locations") {
      const dynamic = this.field(
        root,
        "Automatically add detected locations",
        c,
        "dynamic_locations",
        "checkbox",
      );
      dynamic.onchange = () =>
        this.change(() => {
          c.dynamic_locations = dynamic.checked;
        }, true);
      this.note(
        root,
        "Automatic locations use available zone names and the current states of selected people. Labels are spaced evenly at runtime. For fixed positions, leave this off and add discovered locations below.",
      );
      const discovered = discoveredLocations(c, this._hass?.states || {});
      if (discovered.length)
        this.button(root, "Add discovered locations", () =>
          this.change(() => {
            const all = [...c.locations, ...discovered];
            all.forEach((l, i) => (l.angle = -90 + (i * 360) / all.length));
            c.locations = all;
          }, true),
        );
      panelEditor.call(this, root);
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
        slotEditor.call(this, box, l);
        this.field(box, "Location label source", l, "label_mode", "select", [
          ["fixed", "Fixed name"],
          ["sensor", "Sensor state or attribute"],
        ]);
        this.selector(box, "Location label entity", l, "label_entity");
        this.field(box, "Location label attribute", l, "label_attribute");
        this.field(box, "Unavailable location label", l, "label_fallback");
        this.field(box, "Location label font", l, "font", "select", [
          ["", "Follow clock font"],
          ...FONTS,
        ]);
        this.field(box, "Location label size", l, "size", "number");
        this.field(box, "Location label opacity", l, "opacity", "number");
        this.field(
          box,
          "Location label horizontal position (%)",
          l,
          "x",
          "number",
        );
        this.field(
          box,
          "Location label vertical position (%)",
          l,
          "y",
          "number",
        );
        this.field(box, "Location label radius", l, "radius", "number");
        this.field(box, "Location label rotation", l, "rotation", "number");
        this.button(box, "Use clock label style", () =>
          this.change(() => {
            l.font = "";
            l.size = null;
            l.color = "";
            l.opacity = 1;
          }, true),
        );
        this.button(box, "Reset location label position", () =>
          this.change(() => {
            l.x = null;
            l.y = null;
            l.radius = 213;
            l.rotation = 0;
          }, true),
        );
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
    if (this.tab === "Living world") worldEditor.call(this, root);
    if (this.tab === "Appearance") {
      const applyCastle = () => {
        this.config = normalize(
          Object.assign({}, c, {
            artwork: "castle",
            theme: "living-magical",
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
          ["castle", "Animated castle — editable labels"],
        ],
      );
      artworkChoice.onchange = () => {
        if (artworkChoice.value === "castle") applyCastle();
        else this.change(() => (c.artwork = "vector"), true);
      };
      this.field(
        root,
        "Weather effect",
        c,
        "weather_effect",
        "select",
        WEATHER,
      );
      this.field(
        root,
        "Weather intensity (0.2–2)",
        c,
        "weather_intensity",
        "number",
      );
      this.field(root, "Animate weather", c, "weather_motion", "checkbox");
      this.note(
        root,
        "Auto follows your weather entity. Rain, snow, fog, wind, ice and lightning work with every season and time. Reduced motion keeps a static atmosphere.",
      );
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
        "The castle uses sharp full-size scenery, independent motion and a scalable frame. Your people, location names and angles are preserved. Season/time lighting offers sixteen combinations. Images preload before fading; a broken image keeps the last scene.",
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
      this.field(root, "Animate castle scenery", c, "scene_motion", "checkbox");
      this.field(
        root,
        "Castle motion intensity",
        c,
        "scene_intensity",
        "number",
      );
      this.field(root, "Decorative motion speed", c, "motion_speed", "number");
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
      const fonts = [
        "Georgia, serif",
        "Palatino, serif",
        "Garamond, serif",
        "Baskerville, serif",
        "Courier New, monospace",
        "Trebuchet MS, sans-serif",
        "Verdana, sans-serif",
        "system-ui, sans-serif",
        "cursive",
      ];
      for (const part of ["name", "location", "caption"]) {
        this.field(root, part + " font", c, part + "_font", "select", fonts);
        this.field(root, part + " text size", c, part + "_size", "number");
      }
      const palette = this.box(root, "Custom colors");
      for (const key of ["paper", "ink", "metal", "rim"])
        this.field(palette, key + " color", c.colors, key, "color");
      this.button(palette, "Restore theme colors", () =>
        this.change(() => (c.colors = {}), true),
      );
      this.field(root, "Typography", c, "font", "select", [
        "Georgia, serif",
        "Palatino, serif",
        "system-ui, sans-serif",
      ]);
      this.imageField(root, "Center illustration", c, "center_image");
      this.imageField(root, "Complete clock face", c, "face_image");
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
        this.imageField(box, key + " background", c.background_images, key),
      );
      const combinations = this.box(
        root,
        "Season, time and weather image override",
      );
      const combo = { season: "winter", time: "night", weather: "snow" };
      this.field(combinations, "Override season", combo, "season", "select", [
        "spring",
        "summer",
        "autumn",
        "winter",
      ]);
      this.field(combinations, "Override time", combo, "time", "select", [
        "dawn",
        "day",
        "dusk",
        "night",
      ]);
      this.field(
        combinations,
        "Override weather",
        combo,
        "weather",
        "select",
        WEATHER.filter((x) => x !== "auto"),
      );
      this.button(combinations, "Configure this combination", () => {
        const key = combo.season + "-" + combo.time + "-" + combo.weather;
        this.imageField(combinations, key, c.background_images, key);
      });
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
    if (this.tab === "General" || this.tab === "Appearance") {
      const advanced = node("details");
      advanced.appendChild(node("summary", "Advanced layout and rendering"));
      root.appendChild(advanced);
      const labels = [
        "Maximum size (pixels)",
        "Aspect ratio (width / height)",
        "Transparent card",
        "Demonstration states",
        "Background mode",
        "Manual background",
        "Seasonal backgrounds",
        "Gear revolution (seconds)",
        "Background opacity (0–1)",
        "Background crossfade (ms)",
        "Decorative detail",
        "Typography",
        "Show extra location labels on custom face",
        "Show title on custom face",
        "Pivot horizontal position (%)",
        "Pivot vertical position (%)",
        "Living Magical hand design",
      ];
      [...root.children]
        .filter(
          (e) =>
            e.tagName === "LABEL" && labels.includes(e.firstChild?.textContent),
        )
        .forEach((e) => advanced.appendChild(e));
    }
    if (this.tab === "Labels & effects") letteringEditor.call(this, root);
    if (this.tab === "Bezel") bezelEditor.call(this, root);
    if (this.tab === "Face cycling") carouselEditor.call(this, root);
    if (this.tab === "Saved people") savedPeopleEditor.call(this, root);
    if (this.tab === "Presets") this.presets(root);
    if (this.tab === "Saved clocks") this.savedClocks(root);
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
    [...this.shadowRoot.querySelectorAll("details")].forEach((e) => {
      const key =
        (e.closest("[data-person],[data-world-id]")?.dataset.person ||
          e.closest("[data-world-id]")?.dataset.worldId ||
          "") +
        "|" +
        e.querySelector("summary")?.textContent;
      if (open.has(key)) e.open = true;
    });
    this.updatePreview();
  }
  imageField(parent, label, obj, key, portrait = false) {
    const box = this.box(parent, label);
    this.note(
      box,
      "PNG, JPEG or WebP, up to 10 MB. Stored with your clock; no image hosting needed.",
    );
    const file = node("input");
    file.type = "file";
    file.accept = "image/png,image/jpeg,image/webp";
    file.setAttribute("aria-label", "Upload " + label);
    this.controlHelp(
      box,
      file,
      "Select a PNG, JPEG or WebP file from your device, up to 10 MB. It is optimized and stored with this clock; no external image host is needed.",
    );
    box.appendChild(file);
    const status = node("p");
    status.setAttribute("role", "status");
    box.appendChild(status);
    file.onchange = async () => {
      file.disabled = true;
      status.textContent = "Optimizing image…";
      try {
        const data = await uploadImage(file.files[0], portrait);
        if (
          new TextEncoder().encode(JSON.stringify(this.config)).length +
            data.length -
            (obj[key]?.length || 0) >
          2500000
        )
          throw Error(
            "This clock is too large. Remove or reduce another uploaded image first.",
          );
        this.change(() => (obj[key] = data), true);
      } catch (error) {
        status.textContent = error.message;
        status.className = "error";
        file.disabled = false;
      }
    };
    if (obj[key]) {
      const preview = node("img");
      preview.src = obj[key];
      preview.alt = label + " preview";
      box.appendChild(preview);
      this.button(box, "Remove " + label, () =>
        this.change(() => (obj[key] = ""), true),
      );
    }
    const advanced = node("details");
    advanced.appendChild(node("summary", "Use an image URL or /local/ path"));
    box.appendChild(advanced);
    this.field(advanced, label + " URL", obj, key);
  }
  personData(parent, m) {
    const details = node("details");
    details.appendChild(
      node("summary", "Optional hand information and location rules"),
    );
    parent.appendChild(details);
    this.note(
      details,
      "Read another entity or an attribute of this person’s location entity. Missing readings are hidden. Up to four readings fit on a hand.",
    );
    m.metrics.forEach((metric, i) => {
      const box = this.box(details, "Reading " + (i + 1));
      this.selector(
        box,
        "Reading entity (blank uses location entity)",
        metric,
        "entity",
      );
      this.field(
        box,
        "Reading attribute (blank uses state)",
        metric,
        "attribute",
      );
      this.field(box, "Reading label", metric, "label");
      this.field(box, "Unit (blank hides unit)", metric, "unit");
      this.field(box, "Decimal places (0–3)", metric, "decimals", "number");
      this.field(box, "Reading placement", metric, "placement", "select", [
        "below",
        "above",
        "beside",
      ]);
      this.button(box, "Remove reading", () =>
        this.change(() => m.metrics.splice(i, 1), true),
      );
    });
    if (m.metrics.length < 4)
      this.button(details, "Add hand information", () =>
        this.change(
          () =>
            m.metrics.push({
              label: "",
              entity: "",
              attribute: "",
              unit: "",
              decimals: "",
            }),
          true,
        ),
      );
    this.note(
      details,
      "Location rules run in order after the travelling override and before ordinary state matching. For example, speed above 5 can point to Travelling; a room sensor equal to Kitchen can point to Kitchen.",
    );
    m.rules.forEach((rule, i) => {
      const box = this.box(details, "Location rule " + (i + 1));
      this.selector(
        box,
        "Rule entity (blank uses location entity)",
        rule,
        "entity",
      );
      this.field(box, "Rule attribute", rule, "attribute");
      this.field(box, "Comparison", rule, "operator", "select", [
        "equals",
        "above",
        "below",
        "contains",
      ]);
      this.field(box, "Compare with", rule, "value");
      this.field(
        box,
        "Point to location",
        rule,
        "location",
        "select",
        this.config.locations.map((l) => [l.id, l.name]),
      );
      this.button(box, "Remove rule", () =>
        this.change(() => m.rules.splice(i, 1), true),
      );
    });
    this.button(details, "Add location rule", () =>
      this.change(
        () =>
          m.rules.push({
            operator: "equals",
            value: "",
            location: this.config.locations[0]?.id || "",
          }),
        true,
      ),
    );
  }
  savedClocks(root) {
    this.note(
      root,
      "Your complete clocks are stored in your Home Assistant account and available on other dashboards and devices signed in as you. Loading creates an independent copy. Images and household details are included. Save the dashboard after loading.",
    );
    const library = new ClockLibrary(this._hass);
    const name = node("input");
    name.setAttribute("aria-label", "Saved clock name");
    name.placeholder = "For example: Hallway family clock";
    this.controlHelp(
      root,
      name,
      "Name for the complete clock in your Home Assistant account library. It does not alter the title drawn on the clock.",
    );
    root.appendChild(name);
    const status = node("p");
    status.setAttribute("role", "status");
    root.appendChild(status);
    const list = node("div");
    root.appendChild(list);
    const run = async (action) => {
      try {
        status.textContent = "Working…";
        await action();
        status.textContent = "Saved.";
        await refresh();
      } catch (error) {
        status.textContent =
          error.message ||
          "Home Assistant could not save the library. Try again.";
        status.className = "error";
      }
    };
    const refresh = async () => {
      const clocks = await library.read();
      list.textContent = "";
      if (!clocks.length)
        this.note(
          list,
          "No saved clocks yet. Enter a name and choose Save as new clock.",
        );
      clocks.forEach((clock) => {
        const box = this.box(list, clock.name);
        this.button(box, "Preview saved clock", () => {
          const preview = node("magical-family-clock-card");
          preview.setConfig(clock.config);
          preview.hass = this._hass;
          box.appendChild(preview);
        });
        this.button(box, "Load independent copy", () => {
          this.config = normalize({
            ...clone(clock.config),
            instance_id: uid(),
          });
          this.emit();
          this.tab = "General";
          this.render();
        });
        this.button(box, "Duplicate saved clock", () =>
          run(() => library.save(clock.name + " copy", clock.config)),
        );
        const rename = node("input");
        rename.value = clock.name;
        rename.setAttribute("aria-label", "Rename " + clock.name);
        this.controlHelp(
          box,
          rename,
          "New name for this saved library entry. It does not rename dashboard cards already loaded from it.",
        );
        box.appendChild(rename);
        this.button(box, "Rename clock", () =>
          run(() => library.rename(clock.id, rename.value)),
        );
        this.button(box, "Delete saved clock", () => {
          if (
            window.confirm(
              "Delete saved clock “" +
                clock.name +
                "”? Existing dashboard copies are kept.",
            )
          )
            run(() => library.remove(clock.id));
        });
      });
    };
    this.button(root, "Save as new clock", () =>
      run(() => library.save(name.value, this.config)),
    );
    this.button(root, "Refresh saved clocks", () => run(async () => {}));
    refresh().catch((error) => {
      status.textContent = error.message;
      status.className = "error";
    });
  }
  previewEncounter(id) {
    if (this.standalonePreview && this._preview?.isConnected)
      return this._preview.previewWorldEncounter(id);
    // Home Assistant owns the visible preview. Search the nearest composed
    // ancestor first, so another dashboard card is never preferred to the
    // sibling preview inside its editing dialog.
    const find = (root) => {
      if (root === this) return null;
      if (root.localName === "magical-family-clock-card") return root;
      if (root.shadowRoot) {
        const found = find(root.shadowRoot);
        if (found) return found;
      }
      for (const child of root.children || []) {
        const found = find(child);
        if (found) return found;
      }
      return null;
    };
    let scope = this.parentNode;
    while (scope) {
      const preview = find(scope);
      if (preview) return preview.previewWorldEncounter(id);
      scope = scope.parentNode || scope.host;
    }
    return false;
  }
  updatePreview() {
    cancelAnimationFrame(this._previewFrame);
    this._previewFrame = requestAnimationFrame(() => {
      const p = this.standalonePreview ? this._preview : null;
      if (!p?.setConfig) return;
      try {
        p.setConfig(this.config);
        p.hass = this._hass;
        const message = this.shadowRoot.querySelector(".preview-status");
        if (message && !message.classList.contains("error"))
          message.textContent = "Preview updated.";
      } catch (e) {
        const message = this.shadowRoot.querySelector(".preview-status");
        if (message) {
          message.textContent = e.message;
          message.classList.add("error");
        }
      }
    });
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
    this.controlHelp(
      root,
      text,
      "Paste a full exported clock configuration to restore it with Import configuration. Personal backups contain sensor IDs and images; review before sharing.",
    );
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
    this.controlHelp(
      presetBox,
      name,
      "Name for an appearance-only preset stored in this browser. Use Saved clocks for a full reusable clock across devices.",
    );
    presetBox.appendChild(name);
    const picker = node("select");
    picker.setAttribute("aria-label", "Saved appearance preset");
    this.controlHelp(
      presetBox,
      picker,
      "Choose an appearance preset previously saved in this browser, then choose Load appearance preset. People and sensors remain unchanged.",
    );
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
