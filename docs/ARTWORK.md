# Layered castle artwork

`src/assets/castle-frame.png` is a generated transparent derivative of the clock-face reference supplied by the user. The interior castle scene, center hub and exterior background were removed by the image tool. It preserves the recognizable stained-glass segments, six labels/icons and gold rings, but it is **not a lossless or pixel-identical extraction**. The user’s original image and source files were not altered.

`src/assets/castle-scenes.png` is a newly generated 4×4 atlas. Rows are spring, summer, autumn, winter; columns are dawn, day, dusk, night. All sixteen tiles share a similar castle/lake composition with season and lighting variations. Some small compositional differences remain between generated scenes; they are not claimed to be identical geometry.

The two PNG assets are 1254×1254. Atlas cropping happens through SVG viewports, so the original generated files remain intact. The transparent opening is checked before use. Both assets are embedded into the self-contained JavaScript release bundle, requiring no external image host or additional HACS asset paths.

In **Appearance**, choose **Use layered castle artwork**. It applies the six reference locations with a pivot at 50% horizontally and 47% vertically, and preserves people/colors. Use manual season/time controls to review every scene. Editing location labels or angles switches back to the customizable vector dial, because this frame has six baked-in labels.

Incoming artwork preloads before switching. Two scene layers crossfade below one fixed frame. A failed custom scene keeps the previous scene and hands. Requests for obsolete scene changes are ignored; disconnecting invalidates pending work. The frame and hand elements do not rebuild for a scene change.

Automatic season selection respects Home Assistant’s timezone and the configured hemisphere. Dawn/dusk cover ±30 minutes of known solar events; recent events are retained across next-event timestamp rollover. SunCalc provides a local-coordinate fallback after a fresh reload; its computed times can differ slightly from Home Assistant’s astronomy. Missing events/location fall back to a stable scene. Manual controls always take precedence. Generic vector backgrounds retain their separate weather selection.

Custom castle images can be configured with `background_images` keys such as `winter-night` or `spring-dawn`, using existing local paths or HTTPS image URLs. A complete opaque `face_image` remains supported as a static face and covers the dynamic layers.

Source files and project artwork are distributed with the repository license. The bundled SunCalc implementation has its own BSD-2-Clause notice, included in the compiled bundle and `SUNCALC-LICENSE.txt`. The supplied unchanged legacy JavaScript/HTML attachments remain outside this public checkout.

## Version 0.2.0 material faces

`src/assets/aged-brass-dial.png` and `src/assets/whimsical-workshop-dial.png` are original AI-generated, unlettered dial assets created for this build. They are not extractions from the supplied film/prop references. The brass dial uses aged brushed brass, recessed gearwork, wear and verdigris. The handmade dial combines wood, copper patches, brass fasteners, ivory/parchment panels and botanical decoration. Both preserve a transparent exterior and remain separate from editable SVG names, locations, titles and captions. Runtime hand geometry and lettering remain vector artwork.

The generated source files are included directly without cropping or altering the user's references. They are embedded in the compiled JavaScript bundle for offline operation. They increase the initial resource size; browser caching avoids repeated downloads, but very slow devices/connections may take longer on the first load. Surface colors in raster artwork do not follow vector palette overrides. Brass illustration gears are part of the artwork; the separately animated gear overlay is subtle.
