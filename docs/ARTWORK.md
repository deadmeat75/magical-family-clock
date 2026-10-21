# Clock artwork and animation

## Version 0.4.0: Living World layers

The castle now uses feathered, independently moving regions of the same full-size illustration for clouds, foliage, lake reflections and waterfalls. Shared SVG image references avoid embedding a copy of the raster source for each moving patch. Stream/spray details and warm-window extraction add motion while preserving the castle's composition. Night uses coordinated grading of the same source, with illuminated windows, a separate phase-correct moon and tower-masked sky; it is not a separately painted night base plate.

Sixteen original shaded SVG inhabitant/prop types and a custom-image choice provide articulated wings, cloth, tails, glow and smoke where appropriate. Travel direction follows facing, surfacing figures are clipped at a waterline, and tower masks provide a background layer. These are illustrated animation layers rather than simulated 3D creatures. Uploaded custom props move as complete images. Clouds can pass over moon/star layers. All decorative motion uses pausable browser animations and honors reduced motion and visibility.

Location sectors use editable SVG paths with procedural cracked-glass, hammered-metal, parchment or wood patterns, directional shading, brass edges and embossed symbols. Actual rendered names and graphics are fitted to their sector paths. Explicit free-position labels remain an intentional override. Pirata One, an unmodified bundled font by Rodrigo Fuenzalida and Nicolas Massi, is embedded under the [SIL Open Font License](PIRATA-ONE-OFL.txt), also retained in the compiled bundle. Other font choices use the viewing device.

See the [Living World guide](WORLD-GUIDE.md) and [animation recording](living-world-preview.mp4). The recording uses the production bundle with fictional people and simulated sensors.

## Version 0.3.0: high-resolution animated castle

The current renderer embeds `src/assets/castle-day-hd.png` and `castle-winter-hd.png`, each a full **1254×1254** original generated scene based on the earlier castle/lake composition. The older 4×4 sheet provided only about 314 pixels per scene. The new renderer uses coordinated time/season grading and separate moving clouds, water, window lights, seasonal detail and evening fireflies. Winter uses its own snowy source; the other seasons retain the same castle geometry with grading and animated detail.

The frame is original scalable SVG with separate editable location labels, title and caption. The frame, hands, lettering and motion overlays remain sharp as vectors; the central illustrated scene retains its native raster-resolution limit. Editing location labels or angles preserves the castle frame.

In **Appearance**, choose **Use layered castle artwork**. The action applies six reference destinations and a 50% horizontal/47% vertical pivot while preserving people/colors. Manual season/time controls preview the sixteen combinations. Weather is a separate layer, and custom uploaded combination backgrounds remain supported. An opaque complete-face upload covers the underlying scene and may contain its own painted-in text.

Incoming images preload before switching; two scene layers crossfade below the frame. Obsolete loads are ignored, failed custom scenes keep the previous scene, and Retry images recovers after connectivity returns. The frame and hands persist during scene changes.

Automatic selection uses Home Assistant's timezone and hemisphere. Dawn/dusk cover ±30 minutes of solar events, with retained events across timestamp rollover and a SunCalc local-coordinate fallback after reload. Calculated times can differ slightly from Home Assistant's astronomy. Missing events/location use a stable fallback; manual controls take precedence.

## Dimensional faces and hands

`aged-brass-dial.png` and `whimsical-workshop-dial.png` are original generated unlettered artwork introduced in 0.2.0. The brass surface includes aged metal, wear and verdigris. The handmade surface combines wood, copper patches, brass fasteners, ivory/parchment panels and botanical detail. Runtime names, locations, titles and captions remain separate editable SVG.

The Clockwork face now has a visible connected vector mechanism with 40/24/40/24 teeth, common module and 20-degree involute profiles. Neighboring wheels counter-rotate at tooth-count-derived ratios; initial phases align teeth with gaps and animations share a timeline. Static illustrated details remain part of their source image; the moving mechanism is rendered separately.

Hands combine vector silhouettes, material gradients, texture, bevel, wear and reflection. Engraving fits the actual solid shape, respects cutouts and clips to the material. Spoon-tip lettering uses an inscribed area within its bowl. Reduced motion pauses decorative layers while data continues updating.

## Earlier reference derivatives

`castle-frame.png` is the older generated transparent derivative of the user-supplied face reference, with six baked-in labels/icons. It is not a lossless or pixel-identical extraction. `castle-scenes.png` is the earlier generated 4×4 season/time atlas. These source files remain for provenance but are not imported by the current renderer. Original user attachments were not edited and remain outside the public checkout.

## Packaging and licenses

Artwork is embedded into the self-contained JavaScript release bundle, with no additional HACS asset paths, external image host or runtime service required. The bundle is larger on first load; browser caching avoids repeated downloads. Raster surface colors do not follow vector palette overrides, and glare/reflection controls cannot remove marks painted into a raster source.

Project source and generated artwork use the repository license. SunCalc is BSD-2-Clause, with its notice in the compiled bundle and [license file](SUNCALC-LICENSE.txt). See the [Design Studio guide](DESIGN-STUDIO.md) for appearance controls and [validation](VALIDATION.md) for tested behavior and limits.
