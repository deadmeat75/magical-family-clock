import { clone, normalize, uid } from "./engine.js";
const KEY = "magical_family_clock_library";
let queue = Promise.resolve();
export class ClockLibrary {
  constructor(hass) {
    this.hass = hass;
  }
  async read() {
    if (!this.hass?.callWS)
      throw Error(
        "Open this editor in Home Assistant to use your saved clocks.",
      );
    const result = await this.hass.callWS({
      type: "frontend/get_user_data",
      key: KEY,
    });
    const value = result?.value;
    if (!value) return [];
    if (value.version !== 1 || !Array.isArray(value.clocks))
      throw Error("The saved clock library has an unsupported format.");
    return clone(value.clocks);
  }
  mutate(action) {
    const task = queue
      .catch(() => {})
      .then(async () => {
        const clocks = await this.read();
        const result = action(clocks);
        const value = { version: 1, clocks };
        if (
          clocks.length > 30 ||
          new TextEncoder().encode(JSON.stringify(value)).length > 3000000
        )
          throw Error(
            "Library full. Export or remove a saved clock before adding more.",
          );
        await this.hass.callWS({
          type: "frontend/set_user_data",
          key: KEY,
          value,
        });
        return result;
      });
    queue = task;
    return task;
  }
  save(name, config) {
    if (!name.trim()) return Promise.reject(Error("Enter a clock name."));
    return this.mutate((clocks) => {
      const clock = {
        id: uid(),
        name: name.trim().slice(0, 100),
        config: normalize(config),
        updated: new Date().toISOString(),
      };
      clocks.push(clock);
      return clone(clock);
    });
  }
  rename(id, name) {
    if (!name.trim()) return Promise.reject(Error("Enter a clock name."));
    return this.mutate((clocks) => {
      const item = clocks.find((c) => c.id === id);
      if (!item) throw Error("Clock no longer exists. Refresh the library.");
      item.name = name.trim().slice(0, 100);
    });
  }
  remove(id) {
    return this.mutate((clocks) => {
      const i = clocks.findIndex((c) => c.id === id);
      if (i >= 0) clocks.splice(i, 1);
    });
  }
}

export class PeopleLibrary extends ClockLibrary {
  async read() {
    if (!this.hass?.callWS)
      throw Error("Open this editor in Home Assistant to use saved people.");
    const { value } = await this.hass.callWS({
      type: "frontend/get_user_data",
      key: "magical_family_clock_people",
    });
    if (!value) return [];
    if (value.version !== 1 || !Array.isArray(value.people))
      throw Error("The saved people library has an unsupported format.");
    return clone(value.people);
  }
  mutate(action) {
    const task = queue
      .catch(() => {})
      .then(async () => {
        const people = await this.read(),
          result = action(people),
          value = { version: 1, people };
        if (
          people.length > 100 ||
          new TextEncoder().encode(JSON.stringify(value)).length > 3000000
        )
          throw Error(
            "People library full. Remove a saved profile or use smaller portraits.",
          );
        await this.hass.callWS({
          type: "frontend/set_user_data",
          key: "magical_family_clock_people",
          value,
        });
        return result;
      });
    queue = task;
    return task;
  }
  save(name, member, locations = [], existingId = "") {
    if (!name.trim())
      return Promise.reject(Error("Enter an editor label for this person."));
    const normalized = normalize({ members: [member] }).members[0];
    return this.mutate((people) => {
      const needed = new Set([
        ...Object.values(normalized.overrides),
        ...normalized.rules.map((r) => r.location),
      ]);
      const entry = {
        id: existingId || uid(),
        name: name.trim().slice(0, 100),
        member: normalized,
        destinations: locations.filter((l) => needed.has(l.id)),
        updated: new Date().toISOString(),
      };
      const i = people.findIndex((p) => p.id === entry.id);
      if (i >= 0) people[i] = entry;
      else people.push(entry);
      return clone(entry);
    });
  }
}
export function addProfile(config, profile) {
  const out = clone(config),
    member = clone(profile.member),
    mapping = new Map();
  for (const l of profile.destinations || []) {
    let dest = out.locations.find(
      (x) => x.id === l.id || x.name.toLowerCase() === l.name.toLowerCase(),
    );
    if (!dest) {
      dest = { ...clone(l), id: uid() };
      out.locations.push(dest);
    }
    mapping.set(l.id, dest.id);
  }
  member.id = uid();
  member.saved_profile_id = profile.id;
  member.rules = (member.rules || []).map((r) => ({
    ...r,
    location: mapping.get(r.location) || r.location,
  }));
  member.overrides = Object.fromEntries(
    Object.entries(member.overrides || {}).map(([state, id]) => [
      state,
      mapping.get(id) || id,
    ]),
  );
  out.members.push(member);
  out.demo = false;
  return normalize(out);
}
