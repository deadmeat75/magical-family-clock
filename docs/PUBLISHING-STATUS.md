# Publication status

**[v0.4.4 — Smoother scenery and Randomize](https://github.com/deadmeat75/magical-family-clock/releases/tag/v0.4.4) is published and verified as the latest stable release.** It is neither a draft nor a prerelease.

Randomize appears at the lower left, opposite Fullscreen. It temporarily shuffles supported faces, palettes, season/time/weather and one to three visitors, preserving saved people, locations, tracking sensors, live moon and bezel sources. Reload restores the saved design. [Detailed guide](RANDOMIZE.md).

WebKit scenery now avoids duplicate image decoding and busy-frame redraws, prepares small tree/water textures once, and uses stable frame deadlines. It preserves native SVG clipping, the HD base image and motion preferences. The user reports iOS animation is working but choppy; physical-device smoothness after this update is still unverified. [Compatibility guide](IOS-COMPATIBILITY.md) · [Acceptance](SMOOTH-MOTION-ACCEPTANCE.json).

The release asset was independently downloaded and matches the tested bundle byte for byte (**25,749,953 bytes**).

SHA-256: `fae868a64daf392487a48732776eeda8c73d9c19300bcb97d88cbbe8efb82719`

Release commit: `810beba5b4e6677a528d82e36c2f5714383816f9`.

- [Full main CI passed](https://github.com/deadmeat75/magical-family-clock/actions/runs/40032792354): deterministic build, **69 unit/packaging and 98 browser checks** (86 Chromium, six phone WebKit and six tablet WebKit). The same 98 browser checks passed locally.
- [Verified publication passed](https://github.com/deadmeat75/magical-family-clock/actions/runs/40040711887): required successful full CI for the exact tagged commit, rebuilt/tested the package and checked the compiled bundle was unchanged before publishing. The redundant standard tag-release job was cancelled; required browser checks were not skipped.
- The earlier documentation-commit animation test false failure was corrected by keeping its preview in view before testing motion. All checks remain enabled.

Installed Home Assistant 2026.10.2 passed WebKit surface, motion, live-moon, Randomize household preservation and reload-restoration checks with zero frontend exceptions. Its served bundle hash matched the tested asset. The user's installation was unchanged; the isolated test instance was stopped afterward.

A fixed four-second desktop software-WebKit sample improved from 2 to 19.5 published scenery fps, with median publication gaps falling from 453 to 50 ms. These are development measurements, not physical-device performance promises.

All 135 approved visual decisions and six omissions remain intact. No approved artwork changed; F01, F03 and C13–C16 remain excluded.

## Install or update through HACS

Open **HACS → Magical Family Clock → Download/update → 0.4.4**, reload Home Assistant and fully close/reopen the iOS app. No manual file copying, clock reconstruction or people/sensor reset is required. If the installed version remains old, reset the companion frontend cache.

Click **Randomize** at the lower left to explore a temporary design. For a busy iOS clock, try **Living world → World detail → Balanced**, then Light if needed. If animation stops completely, use **Check animation** and report its exact result.

For first installation add `https://github.com/deadmeat75/magical-family-clock` under **HACS → Custom repositories**, category **Dashboard**. Prereleases are unnecessary. [Full user guide](USER-GUIDE.md) · [Randomize guide](RANDOMIZE.md).

## Repository metadata and validation

The [v0.4.4 HACS run](https://github.com/deadmeat75/magical-family-clock/actions/runs/40040712020) passed **6/8 checks**. Its annotations identify only missing repository description and topics. Owner-level metadata permissions remain required; no new package-validation failure is reported.

The [v0.4.3 HACS run](https://github.com/deadmeat75/magical-family-clock/actions/runs/40016546404) also passed **6/8 checks**. Its annotations identify the same missing repository description and topics; there are no new package-validation failures. Those owner-level fields still need to be set.

The [v0.4.2 HACS run](https://github.com/deadmeat75/magical-family-clock/actions/runs/40005708598) passed **6/8 checks**; the only failed checks were missing repository About description and topics. GitHub reads confirm those are absent. A previous release-preparation attempt to set the description returned **HTTP 403: Resource not accessible by integration**. This integration permission limit is separate from successful release publication.

The repository owner can edit **About** on GitHub and set:

- Description: `A customizable Home Assistant family-location clock card with visual setup, animated hands, and seasonal artwork.`
- Topics: `home-assistant`, `hacs`, `lovelace-custom-card`, `home-assistant-custom-card`

Then run **Actions → HACS validation → Run workflow** on `main`. Checks remain enabled. Authenticated HACS installation/update remains unverified; default-store approval is not claimed. The user's live Home Assistant installation remains unchanged.
