# Validation and known limits

## Version 0.3.0 — Design Studio

The release candidate passed **44 unit/packaging checks and 37 Chromium browser checks**. See [Design Studio acceptance evidence](DESIGN-STUDIO-ACCEPTANCE.json), the [Design Studio guide](DESIGN-STUDIO.md), and [publication status](PUBLISHING-STATUS.md) for the verified release artifact and remote workflow results. [Version 0.2.0 notes](NEXT-VERSION.md) preserve the previous release's evidence.

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

A disposable Home Assistant **2026.10.2** instance verified native entity selection, live state movement, independent clocks, uploaded-image persistence, saved-clock account storage, saved people and independent profile additions, completely blank lettering, title positioning, bezel, template switching and dashboard save/reload. These checks observed **zero frontend exceptions**. Results are recorded in [baseline evidence](HA-ACCEPTANCE.json), [0.2.0 evidence](NEXT-ACCEPTANCE.json) and [Design Studio evidence](DESIGN-STUDIO-ACCEPTANCE.json).

The user's live Home Assistant installation, original clock resource, dashboards, helpers and automations were not changed. Saved account entries and dashboards mentioned in acceptance evidence belong only to the isolated instance.

## HACS and publication scope

The manifest names the root self-contained `magical-family-clock.js`; the tag-triggered release workflow checks package/tag equality, builds/tests and attaches that file. Publication is confirmed separately by inspecting the stable release and comparing its downloaded asset's SHA-256 against the local bundle. See [publication status](PUBLISHING-STATUS.md).

HACS **2.0.5** was installed in the isolated instance and its setup form loaded. Authenticated GitHub-connected custom-repository installation/update remains unverified. Inclusion in the HACS default store is not claimed. The previous remote HACS validation passed six of eight checks; missing repository About description and topics were the only failed checks. The integration can push code and read GitHub APIs, but metadata writes return **HTTP 403: Resource not accessible by integration**. Current release validation results are recorded in publication status without suppressing checks.

Install/update using HACS as a **Dashboard** custom repository. Do not replace the separate original resource. WebKit and physical older-iPad testing were removed from release acceptance at the user's request; compatibility remains unverified.

## Practical limits

- Images are embedded optimized PNG/JPEG/WebP uploads or accessible URLs. The card does not resolve protected `media-source://` links, write image files into Home Assistant storage, or provide a companion media integration.
- Each optimized image is limited to two million encoded characters, a card to 2.5 MB, and an account library to 3 MB/30 entries. Dashboard transport limits also apply. Full backups and account libraries contain household details and images.
- Clock/person profiles belong to the signed-in Home Assistant account. Added copies are independent; updates do not propagate to existing clocks. Concurrent library writes use Home Assistant's last-write-wins store.
- A finite dial can become crowded. The input cap of 250 people/locations is not a readability or performance guarantee at that size. Narrow/cutout hands may need shorter names or increased width; lettering with no usable surface is hidden.
- Castle sources are 1254 pixels, with SVG frame/text/hands. This improves detail over the earlier roughly 314-pixel tiles but does not provide unlimited raster resolution. Seasonal and time grading retain the same subject; only winter has a separate snowy source.
- Sensor labels/readouts use existing state data. Rules use reported units, and dynamic destination discovery may redistribute angles. Display-label changes remain independent of matching rules.
- Long bezel readings or nearby positions may overlap; shorten them, reduce font size or spread them around the ring.
- The card offers fullscreen within a dashboard, without installing a dedicated panel. Fonts depend on availability on the viewing device.
