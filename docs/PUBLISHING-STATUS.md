# Publication status

Published release: [Magical Family Clock v0.2.0](https://github.com/deadmeat75/magical-family-clock/releases/tag/v0.2.0).

This is a normal release, not a draft or prerelease, so HACS can offer it without enabling prereleases. The self-contained `magical-family-clock.js` release asset was independently downloaded and matches the tested local bundle byte for byte.

SHA-256: `a6064f84d485287d14a99a6197567a2193e38495fc3d5931684d1d726782b12c`

Release commit: `c357bd0`.

- [Release workflow passed](https://github.com/deadmeat75/magical-family-clock/actions/runs/39553823176).
- [Tag test/package workflow passed](https://github.com/deadmeat75/magical-family-clock/actions/runs/39553823178).
- [Main test/package workflow passed](https://github.com/deadmeat75/magical-family-clock/actions/runs/39553823149).
- [HACS validation: 6/8 checks passed](https://github.com/deadmeat75/magical-family-clock/actions/runs/39553823154). Check annotations confirm the only failed validations are missing repository topics and description. No checks were disabled.

## Install or update through HACS

In HACS, open Magical Family Clock and download/update to **0.2.0**, then reload the Home Assistant frontend. For a first installation, add `https://github.com/deadmeat75/magical-family-clock` through **Custom repositories**, category **Dashboard**, then download the card. See the [detailed guide](USER-GUIDE.md). Do not upload a JavaScript resource manually or replace the separate original clock resource.

## Repository owner housekeeping

On the GitHub repository page, edit **About** using its gear button:

- Description: `A customizable Home Assistant family-location clock card with visual setup, animated hands, and seasonal artwork.`
- Topics: `home-assistant`, `hacs`, `lovelace-custom-card`, `home-assistant-custom-card`

Save, then run **Actions → HACS validation → Run workflow** on `main`. The session can push code and read GitHub APIs, but attempts to update description/topics returned HTTP 403. These metadata settings remain unchanged.

Real Home Assistant 2026.10.2 GUI upload, saved-clock account storage, dashboard persistence, native selectors and state movement passed in an isolated instance. Local checks passed 31 unit/packaging tests and 22 Chromium browser tests. Authenticated HACS installation/update in the user's installation remains unverified; public HACS default-store approval is not claimed. No user's live Home Assistant installation was changed. The prior v0.1.0-rc.1 release remains available.
