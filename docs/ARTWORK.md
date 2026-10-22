# Clock artwork and animation

## Unreleased round 3 visual review

[Current examples](visual-review/REVIEW-ROUND-3.md) are held for individual approval. `panel-solid-wood-r4.png` is original generated solid-wood material artwork with irregular grain and pores, mapped once across the dial with rounded profile lighting. It replaces only the proposed P04 wood surface; approved hammered metal and parchment assets are unchanged. `astronomical-pictures.png` is a browser-rendered atlas of crops from existing generated sky, seasonal landscape, mountain and antique sun artwork. Four physical image carriers rotate behind fixed apertures; these illustrations do not introduce external assets or runtime services.

The F01 revision 6 lettering remains an independently editable SVG placement proposal. Window lighting is restricted to identified source panes and runs 25% slower than revision 4. Frost uses fine needle geometry revealed by a continuous inward mask. None of these pending visual revisions constitutes a release.

## Version 0.4.1: continuous landscape and creature motion

Clouds are softly keyed from two tower-free regions of the bundled source into a reusable transparent texture. Two decks move continuously at different wind speeds over a separate sky gradient, so a stationary cloud photograph does not remain underneath. A detailed shared silhouette protects mountains/towers and places the moon, stars and background visitors in the same depth layer. Custom scenes retain their own sky beneath the general cloud overlay.

The lake uses fine scanline displacement with smoothly varying wave phase and perspective-scaled amplitude, rather than translating broad rectangular image bands. Its shoreline clip stays fixed. Waterfalls use small downward flow threads and fine ballistic impact droplets; solid spray ellipses and moving copies of rocks have been removed. These layers use Canvas 2D in the SVG scene, with cached source textures, bounded resolution/frame rates and explicit pause/cleanup on reduced motion, visibility and card removal. WebGL and external services are unnecessary.

Flying inhabitants follow sampled curved routes that enter/exit beyond the opening. Their opacity remains constant: the repeat jump occurs outside the clipped scene. Surfacing figures descend fully below their configured waterline, without opacity cuts. Wing motion uses flap/glide cadence, with species-specific timing, gentle tail/cloth motion and quieter drifting props. Live moon/weather refreshes preserve encounter progress and landscape time.

Location sectors retain editable procedural glass/metal/parchment/wood textures, directional shading, metallic frames and fitted names/graphics. Pirata One is embedded under the [SIL Open Font License](PIRATA-ONE-OFL.txt), also included in the bundle. Other font choices use the viewing device.

See the [Living World guide](WORLD-GUIDE.md) and [normal-speed recording](living-world-preview.mp4). Screenshots/video use the production bundle, fictional people and simulated sensors. Inhabitants are illustrated SVG animation, not a free-roaming 3D simulation.

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
