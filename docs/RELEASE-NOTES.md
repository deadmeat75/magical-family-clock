# Magical Family Clock 0.4.0 — Living World

Turn the castle face into a miniature animated world, with framed destinations and a population you can arrange in the visual editor.

- **Fitted location panels:** ornate names and large graphics stay inside their actual frames. Choose cracked glass, metal, parchment, wood, colors, uploaded graphics/backgrounds and an adjustable opening. A single button repairs old free-position label layouts. Pirata One lettering is embedded.
- **Moving landscape:** actual cloud regions drift, foliage sways, lake reflections ripple and waterfalls flow with spray. Warm window lights and fireflies appear at dusk/night.
- **Seventeen creature/prop choices:** birds, owls, broom riders, dragons, phoenixes, fairies, lake serpents, merfolk, boats, lanterns, cottages, mushrooms, crystals, unicorns and custom images. Place up to 32 with individual size, tint, motion, layering and time/season/weather filters.
- **A placement map:** drag markers or use the keyboard, duplicate/reorder inhabitants and preview an encounter immediately. Surfacing creatures disappear beneath their waterline; sky visitors can pass behind the castle.
- **A live moon and night sky:** read an existing Home Assistant phase sensor, use local calculation or inspect manual phases. Twinkling stars and occasional meteors add night motion, with tower/cloud occlusion.
- **Clear controls:** inline help, starter populations, detail levels, independent nature switches and a visible still world when reduced motion or pause is enabled.

Reusable people/clocks, dimensional hands with fitted/rotated engraving, meshing gears, weather, images, dynamic labels, optional hand readings, effects, bezel and face cycling remain included. Existing version-1 configurations and the separate original clock element remain supported.

## Install or update with HACS

1. Open **HACS → Magical Family Clock** and download/update to **0.4.0**.
2. Reload the Home Assistant frontend. Hard-refresh if the older editor remains.
3. Open **Locations → Fit all names and graphics inside panels** to reset old free-position labels. Open **Living world** to build your population and select a moon sensor.
4. Finish with Home Assistant's **Save** action.

For first installation, add `https://github.com/deadmeat75/magical-family-clock` through **HACS → Custom repositories**, category **Dashboard**, then select **Magical Family Clock (HACS)** in the card picker. HACS manages the resource; the card type stays `custom:magical-family-clock-card`.

[Detailed Living World guide](https://github.com/deadmeat75/magical-family-clock/blob/v0.4.0/docs/WORLD-GUIDE.md) · [Installation/user guide](https://github.com/deadmeat75/magical-family-clock/blob/v0.4.0/docs/USER-GUIDE.md) · [Animation recording](https://github.com/deadmeat75/magical-family-clock/raw/refs/tags/v0.4.0/docs/living-world-preview.mp4)

## Verification and scope

Passed **51 unit/packaging checks and 44 Chromium browser checks**, including independent rendered-pixel changes for landscape motion, star/meteor visibility, fitted panels, live moon updates, creature placement and the existing hand/gear/editor regression checks. Isolated Home Assistant **2026.10.2** verified native moon selection, live phase changes, world/panel controls, saved-clock storage and dashboard reload with **zero frontend exceptions**. No user's live installation was changed.

The world combines illustrated scenery and layered SVG animation. Photo-aligned landscape motion uses the bundled castle composition; custom scenes support inhabitants and general overlays. Source images are 1254 pixels. Account/card/image limits and device performance still apply. Authenticated HACS installation/update remains unverified; default-store approval is not claimed. See [current publication/HACS status](https://github.com/deadmeat75/magical-family-clock/blob/main/docs/PUBLISHING-STATUS.md) for artifact verification and repository metadata tasks.
