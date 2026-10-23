# Validation and known limits

## Version 0.4.3 — Motion recovery and natural flight

64 unit/packaging checks and 95 browser checks pass locally and in exact-commit main CI: 85 Chromium, five WebKit phone and five WebKit tablet. Installed Home Assistant dashboard/editor acceptance and release-download verification are recorded in the current acceptance and publication records.

Adds production tests that deliberately drop frame callbacks, then verify recovery on page restoration, foreground visibility and the automatic watchdog. Intentional pauses remain respected. The animation check distinguishes card/device motion preferences and verifies both time and frame publication. Existing mobile motion coverage now compares actual displayed pixels with CSS animation paused, so changing counters alone cannot pass. Unit coverage checks visible vertical travel, climbs/descents, smooth banking, identity variation and repeatability through sensor refreshes. Offscreen route boundaries remain covered.

[Current acceptance record](IOS-MOTION-RECOVERY.json) · [iOS troubleshooting](IOS-COMPATIBILITY.md). The user's reload cleared oversized overlays, but physical-device no-motion remains unconfirmed; dropped-callback tests are a simulation, not proof of the reported cause.


## Version 0.4.2 — iOS rendering correction

The production bundle passes 63 unit/packaging checks and 89 browser checks: 83 Chromium and six mobile-viewport WebKit checks. New regressions compare rendered pixels outside the central opening, verify rotation and expanded-view animation/pause, and exercise six dashboard remounts with image URL cleanup and compact markup assertions. WebKit reproduction confirmed that correctly reported canvas bounds did not guarantee correct painted clipping. See [iOS compatibility details](IOS-COMPATIBILITY.md).

Physical iPhone/iPad Home Assistant companion-app acceptance remains unverified. Browser automation cannot establish that every device-specific process crash is eliminated.

## Version 0.4.1 — Living World (historical evidence)

The 0.4.1 release candidate passes **63 unit/packaging checks and 80 Chromium browser checks** locally. Remote results are recorded in publication status. The local run included the exact supplied legacy card. New checks verify asset provenance, real hand pivots, omitted selections, painted rigs, grounded idle, brass age and independent bezel text colors. The suite includes the existing Design Studio coverage and living-world and motion-specific regression checks. See [Motion correction acceptance](MOTION-ACCEPTANCE.json) and [0.4.0 Living World acceptance](WORLD-ACCEPTANCE.json), the [detailed guide](WORLD-GUIDE.md), and [current publication status](https://github.com/deadmeat75/magical-family-clock/blob/main/docs/PUBLISHING-STATUS.md) for remote workflow results and release-download verification. [Design Studio evidence](DESIGN-STUDIO-ACCEPTANCE.json) preserves version 0.3.0's acceptance.

Motion-specific checks verify cloud-feature advection by image alignment, constant-opacity flight with fully off-frame repeat boundaries, full waterline submersion, removal of spray discs, preserved time/progress through moon updates and reduced-motion painter pause. Route geometry covers both directions, short spans and large figures.

The added checks inspect actual rendered label/graphic bounds inside panel paths at narrow and wide sizes; independently compare rendered PNGs for cloud, foliage, lake and waterfall movement; verify visible star/meteor changes; test all eight moon phases and numeric formats/fallback; exercise live phase updates without reloading the background; and check creature filters, surfacing previews, facing/travel direction and GUI placement by keyboard/pointer. Reduced motion preserves a still world.

## Local evidence

- Clean-lockfile install and production build; self-contained IIFE parsed as ES2018, with no runtime imports. The checked-in bundle must match a fresh build. The build targets ES2018/Safari 12; physical compatibility is separately unverified.
- State mapping, aliases, zones, attributes, travelling and unknown fallbacks, independent clocks, collision positions and finite input limits.
- Safe image upload/optimization, size guards, URL validation, preview recovery and stale-image request handling.
- Complete-clock and people libraries, independent profile copies, destination remapping, blank names, account storage contracts and privacy-safe export behavior.
- Fixed/sensor-driven location labels, movable title/caption layers, information-bezel readings, formatting and timezones.
- Fitted engraving across twelve hand designs, widths 0.5/1/1.8, stem/tip placement, parallel/perpendicular directions and additional 0/30/90-degree rotations. Tests inspect actual rendered text bounds against the filled hand surface and cutouts, and verify spoon-bowl attachment.
- A connected 40/24/40/24-tooth gear train with common pitch, opposite neighboring directions, tooth-count speed ratios and synchronized tooth/gap phase. Browser checks inspect actual rendered profiles for collisions through a full tooth cycle and verify animation start times/durations/directions.
- Actual castle/gear motion, reduced-motion pause, click/swipe/remembered face switching with retained sensor data, live preview across section changes and image retry recovery.
- Production bundle registration, responsive sizing, frontend selector contract, rapid state changes, fullscreen fallback, text safety and coexistence with the exact supplied original JavaScript in the local run.

Screenshots use fictional people and simulated sensor states. No user source attachment was redistributed; the originals remain outside the public checkout and match their recorded checksums. CI uses a legacy-element stand-in when the private original file is unavailable.

## Isolated Home Assistant evidence

The installed 0.4.1 bundle passed native moon selection, live phase changes, saved-clock storage and dashboard reload in Home Assistant 2026.10.2, with the new hand, symbol and creature artwork present and zero frontend exceptions. The actual HA editor retained one right-hand preview, live edits and the encounter-preview action. [Current release acceptance](RELEASE-ACCEPTANCE.json).

A disposable Home Assistant **2026.10.2** instance verified native entity selection, live state movement, independent clocks, uploaded-image persistence, saved-clock account storage, saved people and independent profile additions, completely blank lettering, title positioning, bezel, template switching and dashboard save/reload. These checks observed **zero frontend exceptions**. Living World acceptance additionally verified native moon entity selection, real state changes from full moon to waning crescent, panel controls, complete-clock library storage and dashboard reload with the new population and sensor settings. It observed zero frontend exceptions; see [Living World evidence](WORLD-ACCEPTANCE.json).

Earlier results are recorded in [baseline evidence](HA-ACCEPTANCE.json), [0.2.0 evidence](NEXT-ACCEPTANCE.json) and [Design Studio evidence](DESIGN-STUDIO-ACCEPTANCE.json).

The user's live Home Assistant installation, original clock resource, dashboards, helpers and automations were not changed. Saved account entries and dashboards mentioned in acceptance evidence belong only to the isolated instance.

## HACS and publication scope

The manifest names the root self-contained `magical-family-clock.js`; the tag-triggered release workflow checks package/tag equality, builds/tests and attaches that file. Publication is confirmed separately by inspecting the stable release and comparing its downloaded asset's SHA-256 against the local bundle. See [publication status](PUBLISHING-STATUS.md).

HACS **2.0.5** was installed in the isolated instance and its setup form loaded. Authenticated GitHub-connected custom-repository installation/update remains unverified. Inclusion in the HACS default store is not claimed. The v0.4.0 remote HACS validation passed six of eight checks; missing repository About description and topics were the only failed checks. The current release result is recorded in publication status. The integration can push code and read GitHub APIs, but metadata writes return **HTTP 403: Resource not accessible by integration**. Current release validation results are recorded in publication status without suppressing checks.

Install/update using HACS as a **Dashboard** custom repository. Do not replace the separate original resource. WebKit and physical older-iPad testing were removed from release acceptance at the user's request; compatibility remains unverified.

## Practical limits

- Images are embedded optimized PNG/JPEG/WebP uploads or accessible URLs. The card does not resolve protected `media-source://` links, write image files into Home Assistant storage, or provide a companion media integration.
- Each optimized image is limited to two million encoded characters, a card to 2.5 MB, and an account library to 3 MB/30 entries. Dashboard transport limits also apply. Full backups and account libraries contain household details and images.
- Clock/person profiles belong to the signed-in Home Assistant account. Added copies are independent; updates do not propagate to existing clocks. Concurrent library writes use Home Assistant's last-write-wins store.
- A finite dial can become crowded. The input cap of 250 people/locations is not a readability or performance guarantee at that size. Narrow/cutout hands may need shorter names or increased width; lettering with no usable surface is hidden.
- Castle sources are 1254 pixels, with SVG frame/text/hands. This improves detail over the earlier roughly 314-pixel tiles but does not provide unlimited raster resolution. Seasonal and time grading retain the same subject; only winter has a separate snowy source.
- Sensor labels/readouts use existing state data. Rules use reported units, and dynamic destination discovery may redistribute angles. Display-label changes remain independent of matching rules.
- Long bezel readings or nearby positions may overlap; shorten them, reduce font size or spread them around the ring.
- The card offers fullscreen within a dashboard, without installing a dedicated panel. Pirata One is embedded; other font choices depend on the viewing device.
- Living worlds have a 32-inhabitant cap. Rich detail and numerous independent animations can be expensive on small devices; Balanced/Light and fewer inhabitants reduce work. Photo-aligned landscape motion targets the bundled castle; custom scenes use general clouds and configurable inhabitants. Decorative SVG motion is not a free-roaming 3D simulation.
- Moon phase is read from an existing sensor or calculated locally; its decorative position/orientation is not a sky-altitude simulation. Illuminated percentage alone cannot distinguish waxing from waning.
