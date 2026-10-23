# Changelog

## 0.4.4 — Smoother scenery and Randomize

- Add Randomize opposite Fullscreen. Shuffle supported faces, colors, season, time, weather and one to three visitors without changing saved people, locations, tracking sensors, moon sources or bezel data. Changes are temporary; reloading restores the saved design.
- Remove duplicate WebKit frame pre-decoding, wait for the native SVG image load, and avoid repainting busy frame surfaces. Keep bounded buffers and image URL cleanup.
- Prepare tree patches and mobile water pixels once instead of rescaling full-resolution imagery for every animation strip. Preserve the HD base image and circular clipping.
- Use stable frame deadlines with mobile targets of 30 fps (Rich/Balanced) or 20 fps (Light), preserving motion preferences, foreground recovery and offscreen pauses. Actual physical-device smoothness still needs confirmation.

## 0.4.3 — Motion recovery and natural flight

- Re-arm scenery animation on foreground/page restoration and recover lost frame callbacks without resetting elapsed scene time. Respect card and device motion preferences and keep offscreen/background cards paused.
- Add Living world → Check animation with separate explanations for card/device pauses, disabled scenery, and a stalled scene. Show the installed version and verify changing scenery frames, not just the animation clock.
- Give flying creatures identity-specific climbs, descents, gentle speed variation and banking. Preserve offscreen encounter boundaries and keep ground/water inhabitants on their existing routes.
- Extend production Chromium/WebKit regression coverage for lost callbacks, automatic recovery, pause explanations and changing displayed scenery pixels. Physical iOS companion-app freeze resolution still needs confirmation; the user reports that reloading cleared the oversized overlays.

## 0.4.2 — iPhone and iPad rendering correction

- Replace WebKit canvas-in-SVG foreign objects with native SVG image surfaces so moving water, foreground foliage and clouds obey the face transform and circular clipping. Keep live motion in expanded view and after rotation.
- Remove the fog displacement-filter path that can composite outside its bounds on WebKit; retain drifting transparent fog.
- Share bundled image URLs instead of repeating base64 artwork throughout the DOM. Encode registered scenery as binary blobs, reduce decoded-source caches, prepare foliage/window sources lazily, and release temporary frame URLs and canvases on teardown.
- Add production-bundle phone/tablet WebKit regression checks for actual rendered clipping, rotation/expansion, motion pause and repeated dashboard remounts. Physical iOS Home Assistant testing remains unverified.
- Pin the meteor visibility test to a known visible encounter. Run normal push CI on main and PRs, cancel superseded runs, and keep Chromium/WebKit checks in the release gate.

## 0.4.1 — Crafted Living World

- Integrate the 135 approved visual examples; omit F01/F03 and C13–C16 as requested. Preserve approved source/review bytes and record runtime-asset provenance.
- Render twelve realistic hand silhouettes from registered pivot/matte data, with material detail, finish controls, physical name attachments and adjustable lettering. Add polished-to-antique brass age.
- Install thirteen metalwork symbols, natural panel textures and crafted bezels with approved curved text placement and editable readout colors.
- Install all twelve painted inhabitants, independently animated source parts, natural route boundaries, foreground pixies, waterline clipping and a grounded idle unicorn.
- Improve cloud advection, foliage, water, waterfall spray, independent lamp flicker, foreground fireflies, meteor variation, weather and sky-matching lunar shadows.
- Transfer approved seasonal/time palettes onto the registered HD composition rather than shifting moving layers between unrelated low-resolution crops.
- Retain one Home Assistant preview and continuous fullscreen motion. Preserve live scene/encounter progress through sensor refreshes.
- Package optimized, native-resolution runtime derivatives in the self-contained HACS bundle. Expand guides and acceptance evidence.

## 0.4.0 — Living World

- Fit destination names and large graphics inside individual raised-center panels, with textured glass, metal, parchment and wood, per-panel images/colors and embedded ornate Pirata One lettering.
- Add one-action repair of old free-position labels and adjustable castle-opening size while preserving destination matching rules.
- Animate actual cloud, foliage, lake-reflection and waterfall regions, with flowing streams/spray, warm window lights and evening fireflies.
- Add seventeen selectable creature/prop types, independent movement, scale, color, layer order and time/season/weather filters; surface lake inhabitants beneath a waterline and mask flying visitors behind towers.
- Add a draggable, keyboard-accessible placement map and encounter previews that remain useful while editing.
- Draw the actual lunar phase from an existing Home Assistant sensor or local calculation, with explicit formats/fallback and live source feedback.
- Add twinkling stars and occasional shooting stars; keep a visible still world when animation is paused or reduced motion is requested.
- Add detail levels, inline instructions, a detailed Living World guide, production screenshots/video and isolated Home Assistant acceptance evidence.

## 0.3.0 — Design Studio

- Save reusable people profiles in Home Assistant account storage, with independent additions to clocks and destination remapping.
- Preserve completely blank hand lettering; add dimensional materials, new silhouettes, finishes and relief controls.
- Fit engraving to actual hand surfaces; add stem/tip placement, parallel/perpendicular lettering, independent rotation and upright controls.
- Add independently animated mechanical gears and castle scenery, higher-resolution sources and a scalable editable frame.
- Rebuild the visible mechanism with meshed involute teeth, correct contact directions, tooth-count speed ratios and synchronized phase.
- Add movable independent title/caption layers and fixed or sensor-driven per-location label styles.
- Add a configurable sensor/time/date/text information bezel and per-component visual effects.
- Add swipe, click, keyboard and optional automatic template cycling without changing household data.
- Fix stale preview/image requests, retain open editor groups and add inline guidance throughout.
- Expand documentation, automated coverage, previews and real Home Assistant acceptance checks.

## 0.2.0

- Add visual image uploads, complete saved clocks, richer material faces and typography.
- Add animated weather combinations, dynamic destinations, sensor rules and optional hand readings.
- Expand the visual editor, HACS installation instructions and detailed user guide.

## 0.1.0-rc.1 — release candidate

- Add shared state mapping, travelling, unknown fallback, aliases, zone matching and personal overrides.
- Add three original SVG themes, portrait hands, collision offsets, dynamic skies, fullscreen, reduced motion and independent clocks.
- Add visual editor, guided setup, location dial, privacy-safe exports, cloning and browser-local appearance presets.
- Add compiled ES2018/Safari 12 targeted bundle, HACS manifest, simulated development fixture, tests and release workflows.
- Inspect supplied legacy source and verify its checksum; preserve reference copies outside the public checkout.
- Use the distinct `magical-family-clock-card` element so the new card can coexist with the existing installation.
- Add verified curved and pointed hand geometry, along-hand upright lettering, separate legacy layouts/pivots, and optional complete-face image loading with fallback.

Added a generated transparent castle-frame derivative and sixteen seasonal/time scenes with preloading and crossfades. Verified real Home Assistant 2026.10.2 dashboard persistence, reload, live state movement and native selector loading. Installed HACS 2.0.5 in the isolated test instance; authenticated custom-repository install/update remains pending. WebKit and older-iPad testing are outside release acceptance.
