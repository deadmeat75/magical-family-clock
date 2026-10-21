import { FONTS, MATERIALS, HAND_STYLES, handName } from "./design.js";
import { PeopleLibrary, addProfile } from "./library.js";
import { clone, uid, normalize } from "./engine.js";
const node = (tag, text) => {
  const e = document.createElement(tag);
  if (text !== undefined) e.textContent = text;
  return e;
};
export function letteringEditor(root) {
  const c = this.config;
  this.note(
    root,
    "Move each text layer independently. These controls work on every bundled face, including the castle. Clearing text removes it; 0 opacity hides it.",
  );
  for (const kind of ["title", "caption"]) {
    const box = this.box(
      root,
      kind === "title" ? "Main title" : "Small caption",
    );
    this.field(
      box,
      kind === "title" ? "Title" : "Clock caption (blank to hide)",
      c,
      kind,
    );
    this.field(
      box,
      kind + " horizontal position (%)",
      c,
      kind + "_x",
      "number",
    );
    this.field(box, kind + " vertical position (%)", c, kind + "_y", "number");
    this.field(box, kind + " font", c, kind + "_font", "select", FONTS);
    this.field(box, kind + " text size", c, kind + "_size", "number");
    this.field(box, kind + " color", c, kind + "_color", "color");
    this.field(box, kind + " opacity", c, kind + "_opacity", "number");
    this.button(box, "Use theme " + kind + " color", () =>
      this.change(() => (c[kind + "_color"] = ""), true),
    );
    this.button(box, "Reset " + kind + " position", () =>
      this.change(() => {
        c[kind + "_x"] = 50;
        c[kind + "_y"] = null;
      }, true),
    );
    this.button(box, "Remove " + kind, () =>
      this.change(() => (c[kind] = ""), true),
    );
  }
  const effects = this.box(root, "Choose visual effects");
  this.note(
    effects,
    "Each component has its own effects. Use values from 0 to 1. Raster illustrations keep their own painted texture; editable vector surfaces respond to material and wear controls.",
  );
  for (const target of ["face", "frame", "hands", "portraits", "bezel"]) {
    const details = node("details");
    details.appendChild(node("summary", target + " effects"));
    effects.appendChild(details);
    for (const key of [
      "shadow",
      "bevel",
      "reflection",
      "glare",
      "patina",
      "wear",
    ])
      this.field(details, target + " " + key, c.effects[target], key, "number");
    this.button(details, "Clear " + target + " effects", () =>
      this.change(
        () =>
          Object.keys(c.effects[target]).forEach(
            (k) => (c.effects[target][k] = 0),
          ),
        true,
      ),
    );
  }
}
export function bezelEditor(root) {
  const b = this.config.bezel;
  this.note(
    root,
    "The bezel is an extra ring outside the face. Add independent data readouts without changing where hands point. Time and date follow Home Assistant’s timezone.",
  );
  this.field(root, "Show information bezel", b, "enabled", "checkbox");
  this.field(root, "Bezel width (18–70)", b, "width", "number");
  this.field(root, "Bezel material", b, "material", "select", MATERIALS);
  this.field(root, "Bezel custom color", b, "color", "color");
  b.items.forEach((item, i) => {
    const box = this.box(root, item.label || "Readout " + (i + 1));
    const kind = this.field(box, "Readout type", item, "kind", "select", [
      "sensor",
      "time",
      "date",
      "text",
    ]);
    kind.onchange = () => this.change(() => (item.kind = kind.value), true);
    if (item.kind === "sensor") {
      this.selector(box, "Readout entity", item, "entity");
      this.field(box, "Readout attribute", item, "attribute");
      this.field(box, "Readout unit", item, "unit");
      this.field(box, "Readout decimals", item, "decimals", "number");
      this.field(box, "Unavailable readout text", item, "fallback");
    }
    if (item.kind === "text")
      this.field(box, "Fixed readout text", item, "text");
    if (item.kind === "time")
      this.field(box, "Show seconds", item, "seconds", "checkbox");
    this.field(box, "Readout label", item, "label");
    this.field(box, "Readout symbol", item, "icon");
    this.field(box, "Readout angle", item, "angle", "number");
    this.field(box, "Readout font", item, "font", "select", FONTS);
    this.field(box, "Readout size", item, "size", "number");
    this.field(box, "Readout color", item, "color", "color");
    this.field(box, "Readout opacity", item, "opacity", "number");
    this.button(box, "Remove bezel readout", () =>
      this.change(() => b.items.splice(i, 1), true),
    );
  });
  if (b.items.length < 16)
    this.button(root, "Add bezel readout", () =>
      this.change(() => {
        b.enabled = true;
        b.items.push({
          id: uid(),
          kind: "sensor",
          label: "",
          angle: -90 + b.items.length * 45,
          size: 11,
          unit: "",
          fallback: "—",
        });
      }, true),
    );
  this.button(root, "Add time and date examples", () =>
    this.change(() => {
      b.enabled = true;
      b.items.push(
        { id: uid(), kind: "time", angle: -90, size: 12, seconds: true },
        { id: uid(), kind: "date", angle: 90, size: 12 },
      );
      b.items = b.items.slice(0, 16);
    }, true),
  );
}
export function carouselEditor(root) {
  const c = this.config,
    v = c.carousel;
  if (!c.instance_id) {
    c.instance_id = uid();
    this.emit();
  }
  this.note(
    root,
    "Select presentation templates to cycle with swipe, arrow buttons or keyboard arrows. Every template uses this clock’s same people, sensors, destinations and bezel data. Template overrides control face artwork and hand shape; your custom label positions and text styles remain unless explicitly overridden.",
  );
  this.field(root, "Enable face switching", v, "enabled", "checkbox");
  this.field(
    root,
    "Remember last face on this browser",
    v,
    "remember",
    "checkbox",
  );
  this.field(root, "Automatically cycle faces", v, "auto", "checkbox");
  this.field(root, "Seconds between faces", v, "interval", "number");
  this.field(root, "Face transition (ms)", v, "transition", "number");
  v.templates.forEach((t, i) => {
    const box = this.box(root, t.label || "Face " + (i + 1));
    this.field(box, "Template name", t, "label");
    this.field(box, "Template theme", t, "theme", "select", [
      "enchanted-spoons",
      "brass-clockwork",
      "living-magical",
      "whimsical-workshop",
    ]);
    this.field(box, "Template artwork", t, "artwork", "select", [
      ["vector", "Editable face"],
      ["castle", "Animated castle"],
    ]);
    this.field(
      box,
      "Template hand shape",
      t,
      "hand_design",
      "select",
      HAND_STYLES.filter((x) => x !== "theme"),
    );
    this.button(box, "Move template earlier", () =>
      this.change(() => {
        if (i > 0)
          [v.templates[i - 1], v.templates[i]] = [
            v.templates[i],
            v.templates[i - 1],
          ];
      }, true),
    );
    this.button(box, "Remove template", () =>
      this.change(() => v.templates.splice(i, 1), true),
    );
  });
  this.button(root, "Add current face as template", () =>
    this.change(() => {
      v.enabled = true;
      v.templates.push({
        id: uid(),
        label: "Face " + (v.templates.length + 1),
        theme: c.theme,
        artwork: c.artwork,
        hand_design: c.hand_design,
        face_image: c.face_image,
      });
    }, true),
  );
  this.button(root, "Use curated face collection", () =>
    this.change(() => {
      v.enabled = true;
      v.templates = [
        {
          id: uid(),
          label: "The Clockmaker",
          theme: "brass-clockwork",
          artwork: "vector",
          face_image: "",
          hand_design: "cathedral",
        },
        {
          id: uid(),
          label: "Castle by the Lake",
          theme: "living-magical",
          artwork: "castle",
          face_image: "",
          hand_design: "filigree",
        },
        {
          id: uid(),
          label: "The Workshop",
          theme: "whimsical-workshop",
          artwork: "vector",
          face_image: "",
          hand_design: "spoon",
        },
        {
          id: uid(),
          label: "Parchment & Silver",
          theme: "enchanted-spoons",
          artwork: "vector",
          face_image: "",
          hand_design: "skeleton",
        },
      ];
    }, true),
  );
}
export function savedPeopleEditor(root) {
  this.note(
    root,
    "Configure sensors once and reuse a person on other clocks. Profiles include tracking sensors, portraits, hand appearance, readings and rules. Adding a profile creates an independent hand; changing a copy does not change other clocks. Profiles are stored in your Home Assistant account.",
  );
  const library = new PeopleLibrary(this._hass),
    list = node("div"),
    status = node("p");
  status.setAttribute("role", "status");
  root.appendChild(status);
  root.appendChild(list);
  const run = async (action) => {
    try {
      status.textContent = "Working…";
      await action();
      await refresh();
      status.textContent = "Saved.";
    } catch (e) {
      status.textContent = e.message;
      status.className = "error";
    }
  };
  const refresh = async () => {
    const people = await library.read();
    list.textContent = "";
    if (!people.length)
      this.note(
        list,
        "No saved people yet. In People, enter an Editor label and choose Save person profile.",
      );
    people.forEach((profile) => {
      const box = this.box(list, profile.name);
      this.note(
        box,
        "Hand lettering: " +
          (handName(profile.member) || "(none)") +
          ". Sensor: " +
          (profile.member.entity || "(not selected)"),
      );
      this.button(box, "Add person to this clock", () => {
        try {
          this.config = addProfile(this.config, profile);
          this.emit();
          this.tab = "People";
          this.render();
        } catch (e) {
          status.textContent = e.message;
        }
      });
      const rename = node("input");
      rename.value = profile.name;
      rename.setAttribute("aria-label", "Rename person " + profile.name);
      this.controlHelp(
        box,
        rename,
        "New name for this saved person profile. Existing hands on dashboards remain independent copies.",
      );
      box.appendChild(rename);
      this.button(box, "Rename saved person", () =>
        run(() => library.rename(profile.id, rename.value)),
      );
      this.button(box, "Duplicate saved person", () =>
        run(() =>
          library.save(
            profile.name + " copy",
            profile.member,
            profile.destinations,
          ),
        ),
      );
      this.button(box, "Delete saved person", () => {
        if (
          window.confirm(
            "Delete this saved profile? Existing clock hands are kept.",
          )
        )
          run(() => library.remove(profile.id));
      });
    });
  };
  this.button(root, "Refresh saved people", () => run(async () => {}));
  refresh().catch((e) => {
    status.textContent = e.message;
    status.className = "error";
  });
}
export function savePersonAction(parent, member) {
  const status = node("p");
  status.setAttribute("role", "status");
  parent.appendChild(status);
  const save = async (update) => {
    try {
      const entry = await new PeopleLibrary(this._hass).save(
        member.editor_label || member.name,
        member,
        this.config.locations,
        update ? member.saved_profile_id : "",
      );
      this.change(() => (member.saved_profile_id = entry.id));
      status.textContent =
        "Profile saved to your Home Assistant account. Add it from Saved people on another clock.";
    } catch (e) {
      status.textContent = e.message;
      status.className = "error";
    }
  };
  this.button(parent, "Save person profile", () => save(false));
  if (member.saved_profile_id)
    this.button(parent, "Update saved person profile", () => save(true));
}
