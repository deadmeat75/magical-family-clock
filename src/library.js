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
