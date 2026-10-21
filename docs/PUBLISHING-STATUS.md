# Publication status

**0.4.0 — Living World is prepared for publication.** Local acceptance passed 51 unit/packaging and 44 Chromium browser checks; isolated Home Assistant verified live moon updates and saved worlds. The production screenshots/video and [detailed guide](WORLD-GUIDE.md) are included. Remote workflow and release-download verification will be recorded here after publication.

## Previous stable release

Published stable release: [Magical Family Clock v0.3.0 — Design Studio](https://github.com/deadmeat75/magical-family-clock/releases/tag/v0.3.0). It is the latest release, with draft and prerelease flags both false, so enabling prereleases is unnecessary.

The self-contained `magical-family-clock.js` asset was independently downloaded and matches the tested bundle byte for byte (**16,875,052 bytes**).

SHA-256: `563532b706b62372265e3a35b4bae941dd897dc1492c24eba376e534761b04af`

Release commit: `f3eb48fda93adc030c66308b770e962443e05b17`.

- [Release workflow passed](https://github.com/deadmeat75/magical-family-clock/actions/runs/39653239797).
- [Tag test/package workflow passed](https://github.com/deadmeat75/magical-family-clock/actions/runs/39653239837).
- [Main test/package workflow passed](https://github.com/deadmeat75/magical-family-clock/actions/runs/39653011254).
- [HACS validation: 6/8 checks passed](https://github.com/deadmeat75/magical-family-clock/actions/runs/39653239887). Its annotations confirm that only repository description and topics failed. No checks were suppressed.

The [0.2.0 release](https://github.com/deadmeat75/magical-family-clock/releases/tag/v0.2.0) remains available for rollback.

The new package includes reusable people, dimensional hands and fitted/rotated lettering, meshing gears, animated higher-resolution castle scenes, editable text, a configurable bezel, effects, face cycling, preview fixes and the [detailed guide](DESIGN-STUDIO.md). The release passed 44 unit/packaging checks and 37 Chromium browser checks. Isolated Home Assistant 2026.10.2 checks passed with zero frontend exceptions; see [acceptance evidence](DESIGN-STUDIO-ACCEPTANCE.json).

## Install or update through HACS

Open **HACS → Magical Family Clock** and download/update to **0.3.0**, then reload the Home Assistant frontend. For first installation add `https://github.com/deadmeat75/magical-family-clock` through **Custom repositories**, category **Dashboard**. See the [installation guide](USER-GUIDE.md). HACS manages the resource; do not replace the separate original clock JavaScript.

## Repository metadata and validation

The v0.3.0 HACS run passed **6/8 checks**; the only failed checks were missing repository About description and topics. GitHub reads confirm those are still absent. A release-preparation attempt to set the description returned **HTTP 403: Resource not accessible by integration**. This is a repository integration permission limit, separate from release publication.

The repository owner can edit **About** on GitHub and set:

- Description: `A customizable Home Assistant family-location clock card with visual setup, animated hands, and seasonal artwork.`
- Topics: `home-assistant`, `hacs`, `lovelace-custom-card`, `home-assistant-custom-card`

Then run **Actions → HACS validation → Run workflow** on `main`. Checks remain enabled. Authenticated HACS installation/update remains unverified; default-store approval is not claimed. The user's live Home Assistant installation remains unchanged.
