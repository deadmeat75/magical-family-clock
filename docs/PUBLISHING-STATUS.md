# Publication status

**0.4.2 iOS rendering correction is tested and being published.** [Compatibility details](IOS-COMPATIBILITY.md) · [Acceptance evidence](IOS-ACCEPTANCE.json). The verified published stable release below remains 0.4.1 until publication verification is completed.

**[v0.4.1 — Crafted Living World](https://github.com/deadmeat75/magical-family-clock/releases/tag/v0.4.1) is published and verified as the latest stable release.** It is neither a draft nor a prerelease. Visual review is complete: 135 approved, six omitted, and no pending decisions. F01, F03 and C13–C16 are excluded as requested.

The self-contained `magical-family-clock.js` release asset was independently downloaded and matches the tested bundle byte for byte (**25,741,644 bytes**).

SHA-256: `066d423379e85e5dc7694c838d257951eb93ac3516e1315dc55e4601fa0d2284`

Release commit: `a140cec53d00a6ba4c7a1a13c3dff28c1dd642ef`.

- [Release workflow passed](https://github.com/deadmeat75/magical-family-clock/actions/runs/39910832782): deterministic build, package version, 63 unit/packaging checks, 80 Chromium browser checks and asset publication.
- [Main test/package workflow passed](https://github.com/deadmeat75/magical-family-clock/actions/runs/39910426705).
- [Tag test/package workflow](https://github.com/deadmeat75/magical-family-clock/actions/runs/39910832765) repeats the same checks independently.
- [HACS validation: 6/8 checks passed](https://github.com/deadmeat75/magical-family-clock/actions/runs/39910832812). Only repository description and topics failed; no checks were suppressed.

The installed production bundle passed isolated Home Assistant 2026.10.2 acceptance: native moon selection and live phase updates, saved clocks and dashboard reload, approved artwork, and the actual editor with one right-hand preview and live encounter actions. There were zero frontend exceptions. [Acceptance evidence](RELEASE-ACCEPTANCE.json). The user's live installation was not changed, and the temporary test instance was stopped afterward.

An initial CI run caught an immediate assertion before the asynchronous native fullscreen transition completed. The test now waits for fullscreen before verifying continuing motion. The premature release workflow was cancelled before publication, and the unpublished tag was replaced with the passing commit. The production bundle was unchanged by that test correction.

[Detailed installation guide](USER-GUIDE.md) · [Living World controls and placement guide](WORLD-GUIDE.md) · [Day preview](living-world-day.png) · [Night preview](living-world-night.png) · [Animation recording](living-world-preview.mp4).

## Install or update through HACS

Open **HACS → Magical Family Clock** and download/update to **0.4.1**, then reload the Home Assistant frontend. For first installation add `https://github.com/deadmeat75/magical-family-clock` through **Custom repositories**, category **Dashboard**. HACS manages the resource. Enabling prereleases is unnecessary.

For narrow hands, open **People → Customize hand and portrait → Use a readable parchment name**. For older free-position castle labels, use **Locations → Fit all names and graphics inside panels**. Open **Living world** to choose inhabitants and a moon sensor, then finish with Home Assistant's **Save** action.

The [v0.4.0 release](https://github.com/deadmeat75/magical-family-clock/releases/tag/v0.4.0) remains available for rollback.

## Repository metadata and validation

The [v0.4.1 HACS run](https://github.com/deadmeat75/magical-family-clock/actions/runs/39910832812) passed **6/8 checks**; the only failed checks were missing repository About description and topics. GitHub reads confirm those are absent. A previous release-preparation attempt to set the description returned **HTTP 403: Resource not accessible by integration**. This integration permission limit is separate from successful release publication.

The repository owner can edit **About** on GitHub and set:

- Description: `A customizable Home Assistant family-location clock card with visual setup, animated hands, and seasonal artwork.`
- Topics: `home-assistant`, `hacs`, `lovelace-custom-card`, `home-assistant-custom-card`

Then run **Actions → HACS validation → Run workflow** on `main`. Checks remain enabled. Authenticated HACS installation/update remains unverified; default-store approval is not claimed. The user's live Home Assistant installation remains unchanged.
