# Living World: detailed setup guide

For **Magical Family Clock 0.4.0**. Install or update through **HACS → Magical Family Clock → Download/update → 0.4.0**, then reload the Home Assistant frontend. First installation is covered in the [user guide](USER-GUIDE.md#2-install-with-hacs). [Current publication and HACS validation status](https://github.com/deadmeat75/magical-family-clock/blob/main/docs/PUBLISHING-STATUS.md).

![Living castle with framed destinations and inhabitants](living-world-day.png)

## Create your first living world

1. Open your clock's visual editor. Keep a private full backup under **Presets** before replacing a layout or population you have customized.
2. For a new clock, choose **Appearance → Use layered castle artwork**. This applies the six reference destinations and raised pivot; it replaces the location layout while keeping people and colors. Configure tracking in **People** and **Locations** as usual.
3. For an existing customized clock, open **Living world**. If offered, choose **Use the animated castle for this world**. This selects the layered castle and clears an opaque complete-face image while keeping your destinations and tracking rules.
4. Open **Locations → Location panel design** and choose **Fit all names and graphics inside panels**. This removes old free-position label coordinates/rotation and restores automatic panel fitting. It does not change matching states or destination angles.
5. Open **Living world** and choose **Add a quiet lakeside population** for a swallow and boat, or **Add an enchanted-world population** for six visitors/props. These buttons replace the current inhabitant list; they do not append to it.
6. Use the placement map and **Preview encounter now** to inspect inhabitants. Start with a few, then add more after checking your normal dashboard size.
7. Expand **Landscape and motion controls**. Enable **Show miniature world** and **Animate castle scenery**. Try **Scene time → Day**, then **Night**. Return to **Auto** when finished.
8. Expand **Moon sensor and night sky** and choose your phase source as described below.
9. Finish with Home Assistant's **Save** button, then reload the dashboard to confirm persistence. Saving a library entry is a separate action from saving the dashboard.

To leave more room for the scenery, clear **Show clock title and caption** in the landscape controls. The text remains saved. **Labels & effects** still moves, styles or removes the title and caption independently.

## Design the location panels

Open **Locations → Location panel design**. Each destination gets its own textured sector, metallic frame, large graphic and fitted name. Sectors follow the actual destination angles and the raised castle opening. Hands keep using the same tracking rules.

| Control | Meaning |
| --- | --- |
| Show framed location panels | Use the new panels; off restores plain location labels. Location labels must also be enabled. |
| Use panels on other faces too | Extend panels to editable non-castle faces. Complete-face images retain their own artwork. |
| Default panel texture | Cracked glass, hammered metal, parchment, wood or plain. |
| Panel lettering font | Pirata One is embedded for consistent ornate lettering without an external font service. Other fonts depend on the viewing device. |
| Panel name maximum size | A ceiling of 8–38 SVG units, initially 25. Long names shrink to fit; this does not force small panels to display large text. |
| Castle opening radius | 155–205 SVG units, initially 180. Smaller makes wider panels and a smaller visible landscape. |
| Panel frame color | Outline tint for the sectors; the outer rim retains its own material. |
| Fit all names and graphics inside panels | Reset free x/y name positions, label rotation and radial offsets, enable labels and fit the content again. |

Expand **Panel artwork and layout** inside an individual location:

- **Location graphic:** Auto chooses a symbol from the destination name. You can explicitly choose a house, briefcase, school, gym weights, compass, globe, hospital, shop, family, garden, bed, magic wand, pin, none or Custom.
- **Panel layout:** name above graphic, name below graphic, name only or graphic only. Names remain horizontally readable; destinations around the sides do not turn their entire layout sideways.
- **Graphic maximum size:** 10–62 SVG units. The renderer reduces the graphic when the frame requires it. **Graphic color** tints built-in symbols; uploaded images keep their own colors.
- **Graphic horizontal/vertical offset:** move the graphic within the panel. Start at zero. Large offsets may leave too little space for usable artwork.
- **Name radial offset:** move the name toward/away from the center. Start at zero for fitting.
- **This panel texture/background color:** override just that destination, leaving the default for other panels.
- **Location graphic image:** upload a PNG/JPEG/WebP, then select **Custom** in Location graphic. Transparent PNGs work well for isolated symbols.
- **Panel background image:** upload a separate texture or illustration that fills this sector and is clipped at its border. This is independent of the graphic.

The existing location font, color, opacity, size and fixed/sensor-driven name settings remain available. A long name may wrap, shrink or end in an ellipsis; its full name remains available as an accessible label. Short display names are easier to read on a tablet.

Explicit **Horizontal/vertical position** values intentionally override automatic name placement. If a migrated clock still has labels across the castle opening, choose **Fit all names and graphics inside panels**. Clearing both per-location coordinates also restores fitting for that location. More destinations or nearly identical angles produce narrower panels; fitting prevents overflow but cannot make arbitrarily small text readable.

## Populate the miniature world

Open **Living world → Creatures and props**. There are **17 choices** and room for **32 inhabitants per clock**:

| Category | Choices |
| --- | --- |
| Sky visitors | Swallow, owl, witch on a broom, wizard on a broom, dragon, phoenix, fairy |
| Lake inhabitants | Lake serpent, mermaid, merman |
| Floating props | Sailing boat, floating lantern |
| Shore props | Enchanted cottage, glowing mushrooms, crystal cluster, unicorn |
| Your artwork | Custom image prop |

Choose **Creature or prop to add**, then **Add selected inhabitant**. Each has its own settings, position and movement; you can add multiple of the same kind. Owls and lanterns initially use a night filter. Starter populations are editable examples, not a separate fixed scene.

### Place inhabitants with the map

The map shows the current scene and a gold circle for the visible opening. Drag a named marker to move its inhabitant, or focus the marker and use arrow keys for 1% steps; **Shift + arrow** moves 5%. Numeric position controls update too. Red outlines flag centers outside the opening. Markers include inhabitants currently hidden by filters so you can still edit them.

Coordinates use the **square scene image**, not the entire clock: 0/0 is the image's top-left and 100/100 its bottom-right. The circular frame clips its corners. Sky routes usually work around 10–30% vertical; the lake is around 72–90%. A creature's full travel path can leave the opening even when its center marker is inside it.

Selecting a marker or choosing **Preview encounter now** brings an active moment into the preview. This changes the preview animation, not the saved configuration. After editing the selected inhabitant, the preview keeps showing an active moment when possible. Filters, tower masking, clipping and reduced motion still apply.

![Living-world editor with a placement map and guided controls](living-world-editor.png)

### Understand an inhabitant's controls

Expand **Edit inhabitant settings**. The first inhabitant starts expanded; other groups can be opened as needed.

| Control | Meaning |
| --- | --- |
| Inhabitant name | Editor/accessibility description. It is not a floating name drawn above the creature. |
| Show this inhabitant | Hide temporarily without deleting settings. |
| Inhabitant color | Tint the built-in body, cloth or prop while retaining shaded details. Custom images retain their original colors. |
| Horizontal/vertical position | Route midpoint, stationary center or surfacing waterline, in scene percentages. |
| Inhabitant scale | 0.25–3 times the base size. Start at 1. Small figures give a stronger sense of a large castle. |
| Movement cycle | Full 8–240 second repeat, including quiet time between flying/surfacing appearances. It is not just time on screen. |
| Travel span | Width of a flying route in scene percentages, centered at the horizontal position. |
| Inhabitant movement | Fly past then rest; surface/linger/submerge; drift back and forth; gently bob; or remain still. |
| Facing direction | Mirror the figure left/right. Flying visitors travel in that direction. Drifting props move back and forth. |
| Pass behind the castle | Hide a sky visitor behind the bundled tower silhouette. Disable for foreground routes or custom scene geometry. |
| Visible at time/in season/in weather | All selected filters must match. Any leaves that filter unrestricted. |

Surfacing creatures disappear below their configured waterline and leave animated rings. Flying figures have articulated wing/cloth details where appropriate. The cottage has chimney smoke, and glowing props have light effects. A custom uploaded prop moves as one image; it does not acquire separately animated limbs.

**Duplicate inhabitant** creates an independent copy with a new ID. **Move inhabitant forward** moves it ahead of the next inhabitant in drawing order; tower masking remains separate. **Remove inhabitant** deletes just that entry. **Remove all inhabitants** keeps the landscape and moon settings.

Try a dragon with a long cycle, a small swallow with a shorter cycle, and a lake serpent at about 65% horizontal/80% vertical. Use a moderate scale and the preview before adding another visitor. Occasional appearances leave time to notice the moving landscape.

## Control landscape motion and performance

Expand **Landscape and motion controls**:

- **Show miniature world** enables the world overlays. Turning it off keeps the base illustration and tracking hands.
- **Animate castle scenery** pauses/resumes the landscape and inhabitants together. A paused world stays visible.
- **Moving clouds**, **Swaying trees**, **Rippling lake** and **Running waterfalls** animate actual regions of the bundled illustration, with feathered edges, moving reflections, stream detail and spray.
- **Warm castle window lights** adds gently changing warm window illumination at dusk/night. **Evening fireflies** is independent of stars and other inhabitants.
- **Twinkling stars** and **Occasional shooting stars** show during dawn/dusk/night. Tower masks place the sky behind the castle; moving clouds can cover the moon/stars. Meteors are brief recurring events, not a permanent trail.
- **World detail → Rich** uses the most foliage, lake bands and stars. **Balanced** reduces foliage layers. **Light** uses fewer water bands/stars and omits moving foliage regions. Use fewer inhabitants too on slower displays.
- **Scene time** previews dawn/day/dusk/night. Auto uses Home Assistant sun data and local solar calculations. Season and weather remain controlled in Appearance and can be combined with inhabitants' filters.

**Appearance → Decorative motion speed** changes decorative motion speed; inhabitant cycle values remain their base settings. Castle motion intensity controls landscape movement strength. Weather has its own animation switch and effects. Tracking hands still respond to entity state changes independently.

**General → Reduced motion**, the viewing device's accessibility preference, and off-screen visibility pause decorative animation. Device reduced motion takes precedence over the animation switch. The world remains a still illustration; shooting stars are hidden. Return the device preference to normal if you want motion.

The photo-aligned trees, lake, waterfalls and windows are designed for the bundled castle composition. Custom combination backgrounds still support the inhabitants, moon and general cloud overlays, but do not gain photo-aligned landscape animation automatically. For custom artwork, position the inhabitants appropriately and turn off tower masking when its silhouette does not match.

## Match the moon to a Home Assistant sensor

![Night scene with illuminated windows, stars and a phase-driven moon](living-world-night.png)

Expand **Moon sensor and night sky**:

1. Enable **Show the moon**. It is drawn at dawn/dusk/night, not during the daytime scene.
2. Choose **Moon phase source → Selected Home Assistant sensor**.
3. Select your existing Moon integration entity using **Moon phase entity**. The card reads the entity; it does not create a sensor or install an integration.
4. Leave **Moon phase attribute** blank for an ordinary Moon sensor. Enter an exact attribute key only when that is where your sensor stores its phase.
5. Choose the value format below. The ordinary Home Assistant Moon integration uses **Named phase**.
6. Read **Current moon** below the controls. It reports the phase/source and whether calculated fallback is being used. Sensor updates change the moon without reloading the background image.
7. Choose **Scene time → Night** temporarily to inspect it, then restore Auto and save the dashboard.

| Format | Accepted values |
| --- | --- |
| Named phase | `new_moon`, `waxing_crescent`, `first_quarter`, `waxing_gibbous`, `full_moon`, `waning_gibbous`, `last_quarter`, `waning_crescent`. `third_quarter` also means last quarter. |
| Cycle fraction | 0–1 around the full lunar cycle; 0 is new, 0.25 first quarter, 0.5 full, 0.75 last quarter. |
| Cycle percent | 0–100 around that same cycle; 50 means full moon. |
| Moon age | Days since new moon, 0–29.53059. |

**Illuminated percentage is not cycle percentage.** A 50%-illuminated moon can be waxing or waning; that number alone cannot select the correct side. Use a named phase or an actual cycle/age sensor.

**Auto** first uses an explicitly retained sensor selection, otherwise looks for an existing recognizable moon-phase sensor, then calculates locally. **Local astronomical calculation** uses the bundled SunCalc library without an external service. **Manual phase preview** uses the selected manual phase until you switch back to a live source.

If an explicitly selected sensor is unavailable or unreadable, **Unavailable moon sensor** chooses local calculation or hides the moon. The current-source message identifies fallback. Position controls use scene percentages, with a radius of 6–32 SVG units. The moon is kept inside the opening and masked behind the castle silhouette; a position behind a tower may conceal it. The illustrated phase is decorative, not a simulation of the moon's exact altitude or local orientation.

## Save, reuse and share

Home Assistant's **Save** stores the panels, population, moon source and existing tracking configuration in the dashboard card. **Saved clocks** stores complete clocks in your signed-in Home Assistant account for independent reuse on another dashboard. **Saved people** remains the place to reuse a person's sensor/hand setup across different clocks. See the [Design Studio guide](DESIGN-STUDIO.md#save-a-person-once-and-reuse-them).

A full private JSON backup includes custom artwork and sensor IDs. The default privacy-safe export removes the moon entity/attribute, custom panel images and all inhabitant entries, along with the existing household details; it uses a calculated moon instead. Review a shared export before posting it.

## Troubleshooting

| Symptom | Action |
| --- | --- |
| New controls are missing | Update to 0.4.0 through HACS and reload the frontend. If the old editor remains, hard-refresh/clear the frontend cache. |
| Landscape is still | Enable world/scenery animation, check General reduced motion and device accessibility preferences, and ensure the clock is visible. Light detail intentionally omits swaying trees. |
| New world is covered | Clear an opaque Complete clock-face image, or use the animated-castle button. Hide title/caption overlays if they cover visitors. |
| Creature is absent | Check Show this inhabitant, all three filters, route position, tower mask and quiet interval. Use Preview encounter now. |
| Preview says no active moment | Select the matching scene/weather, enable world/motion and move the route into the opening. Reduced motion keeps a still world. |
| Lake creature is on land | Move its vertical waterline to the lake and check the opening on the placement map. |
| Names still cross the inner frame | Choose Locations → Fit all names and graphics inside panels to clear free-position overrides. |
| Uploaded graphic is missing | Choose Custom in Location graphic; check the image upload/URL and frame size. Background image is a different field. |
| Moon looks wrong or is absent | Inspect Current moon, source/format, sensor availability and Scene time. A new moon has no lit face. Check tower masking and position. |
| Animation is slow | Choose Balanced/Light, reduce the population, and disable expensive landscape/weather layers. |
| Changes disappear after reload | Finish with Home Assistant's Save action; saving an account-library copy alone does not save the dashboard. |

The world combines high-resolution illustrated scenery with layered SVG animation. It is not a free-roaming 3D game or a physics simulation. The 1254-pixel source retains a raster-resolution limit; frames, names, icons, hands and inhabitants are vectors. See [validation and practical limits](VALIDATION.md) and the [animation recording](living-world-preview.mp4). Screenshots and video use fictional people and simulated sensors.
