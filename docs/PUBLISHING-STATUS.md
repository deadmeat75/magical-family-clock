# Publication status

**Version 0.3.0 — Design Studio is being prepared for publication.** The last verified stable release is [v0.2.0](https://github.com/deadmeat75/magical-family-clock/releases/tag/v0.2.0). This file will record the new release/workflow URLs and downloaded-asset checksum after publication is verified.

The new package includes reusable people, dimensional hands and fitted/rotated lettering, meshing gears, animated higher-resolution castle scenes, editable text, a configurable bezel, effects, face cycling, preview fixes and the [detailed guide](DESIGN-STUDIO.md). Its release candidate passed 44 unit/packaging checks and 37 Chromium browser checks. Isolated Home Assistant 2026.10.2 checks passed with zero frontend exceptions; see [acceptance evidence](DESIGN-STUDIO-ACCEPTANCE.json).

## Install or update through HACS

When v0.3.0 is published, open **HACS → Magical Family Clock** and download/update to **0.3.0**, then reload the Home Assistant frontend. For first installation add `https://github.com/deadmeat75/magical-family-clock` through **Custom repositories**, category **Dashboard**. See the [installation guide](USER-GUIDE.md). HACS manages the resource; do not replace the separate original clock JavaScript.

## Repository metadata and validation

The previous HACS run passed **6/8 checks**; the only failed checks were missing repository About description and topics. GitHub reads confirm those are still absent. A release-preparation attempt to set the description returned **HTTP 403: Resource not accessible by integration**. This is a repository integration permission limit, separate from release publication.

The repository owner can edit **About** on GitHub and set:

- Description: `A customizable Home Assistant family-location clock card with visual setup, animated hands, and seasonal artwork.`
- Topics: `home-assistant`, `hacs`, `lovelace-custom-card`, `home-assistant-custom-card`

Then run **Actions → HACS validation → Run workflow** on `main`. Checks remain enabled. Authenticated HACS installation/update remains unverified; default-store approval is not claimed. The user's live Home Assistant installation remains unchanged.
