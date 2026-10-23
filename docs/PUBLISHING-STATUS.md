# Publication status

**0.4.1 is the validated release candidate; publication is in progress.** Visual review is complete (135 approved, six omitted), and the user authorized proceeding. [Current release acceptance](RELEASE-ACCEPTANCE.json). Published stable remains v0.4.0 until release verification below is updated.

Published stable release: [Magical Family Clock v0.4.0 — Living World](https://github.com/deadmeat75/magical-family-clock/releases/tag/v0.4.0). It is the latest release, with draft and prerelease flags both false. Enabling prereleases is unnecessary.

The self-contained `magical-family-clock.js` release asset was independently downloaded and matches the tested bundle byte for byte (**17,013,181 bytes**).

SHA-256: `d72e97148b1b6c1a153f792358b45a56dc9844bcc088275c4af2ccb3995dd8cc`

Release commit: `86bf2c4028e8e7a137d2e4328f6293bc6eed7bd3`.

- [Release workflow passed](https://github.com/deadmeat75/magical-family-clock/actions/runs/39674658905).
- [Tag test/package workflow passed](https://github.com/deadmeat75/magical-family-clock/actions/runs/39674658371).
- [Main test/package workflow passed](https://github.com/deadmeat75/magical-family-clock/actions/runs/39674428442).
- [HACS validation: 6/8 checks passed](https://github.com/deadmeat75/magical-family-clock/actions/runs/39674658554). Its annotations confirm that only repository description and topics failed. No checks were suppressed.

The release passed **51 unit/packaging checks and 44 Chromium browser checks**, locally and in the release workflows. Isolated Home Assistant 2026.10.2 verified native moon selection, live phase updates, world/panel controls, saved-clock storage and dashboard reload with zero frontend exceptions. See [acceptance evidence](WORLD-ACCEPTANCE.json).

Living World includes fitted textured destination panels, large graphics, embedded ornate lettering, moving clouds/trees/lake/waterfalls, window lights/fireflies, configurable inhabitants and a sensor-driven moon with a twinkling night sky. The [detailed guide](WORLD-GUIDE.md) includes the placement map, all new controls and troubleshooting. [Day preview](living-world-day.png) · [Night preview](living-world-night.png) · [Animation recording](living-world-preview.mp4).

The [v0.3.0 release](https://github.com/deadmeat75/magical-family-clock/releases/tag/v0.3.0) remains available for rollback, with its [historical acceptance evidence](DESIGN-STUDIO-ACCEPTANCE.json).

## Install or update through HACS

Open **HACS → Magical Family Clock** and download/update to **0.4.0**, then reload the Home Assistant frontend. For first installation add `https://github.com/deadmeat75/magical-family-clock` through **Custom repositories**, category **Dashboard**. See the [installation guide](USER-GUIDE.md). HACS manages the resource.

For an existing customized castle, open **Locations → Fit all names and graphics inside panels** to remove old free-position label overrides. Open **Living world** to add inhabitants and choose a moon sensor, then finish with Home Assistant's **Save** action.

## Repository metadata and validation

The v0.4.0 HACS run passed **6/8 checks**; the only failed checks were missing repository About description and topics. GitHub reads confirm those are absent. A previous release-preparation attempt to set the description returned **HTTP 403: Resource not accessible by integration**. This integration permission limit is separate from successful release publication.

The repository owner can edit **About** on GitHub and set:

- Description: `A customizable Home Assistant family-location clock card with visual setup, animated hands, and seasonal artwork.`
- Topics: `home-assistant`, `hacs`, `lovelace-custom-card`, `home-assistant-custom-card`

Then run **Actions → HACS validation → Run workflow** on `main`. Checks remain enabled. Authenticated HACS installation/update remains unverified; default-store approval is not claimed. The user's live Home Assistant installation remains unchanged.
