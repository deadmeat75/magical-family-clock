# Publication status

**[v0.4.2 — iPhone and iPad rendering correction](https://github.com/deadmeat75/magical-family-clock/releases/tag/v0.4.2) is published and verified as the latest stable release.** It is neither a draft nor a prerelease. The WebKit oversized-water/foreground and fog failure was reproduced and corrected. [Compatibility and update instructions](IOS-COMPATIBILITY.md) · [Acceptance evidence](IOS-ACCEPTANCE.json).

The self-contained `magical-family-clock.js` release asset was independently downloaded and matches the tested bundle byte for byte (**25,743,684 bytes**). GitHub's asset digest agrees.

SHA-256: `7bb074aeaf70a66931f3efaeb50c06f47ace6ab20e7318382ae725c45641c261`

Release commit: `7d62df59ff268c0f71a5956c37c6a6e90f1152d4`.

- [Full main CI passed](https://github.com/deadmeat75/magical-family-clock/actions/runs/40004796647): deterministic build, 63 unit/packaging checks and 89 browser checks (83 Chromium, three phone WebKit and three tablet WebKit).
- [Verified publication passed](https://github.com/deadmeat75/magical-family-clock/actions/runs/40008118519): the recovery workflow required that successful full CI run for the exact tagged commit and the correct CI workflow ID, rebuilt/tested the package, checked the compiled bundle was unchanged, then published the asset.
- [Standard release job](https://github.com/deadmeat75/magical-family-clock/actions/runs/40005708608) was cancelled after repeated browser-dependency installation stalled. The recovery path reused the already successful exact-commit browser checks, rather than asserting that the stalled job passed.
- [HACS validation: 6/8 checks passed](https://github.com/deadmeat75/magical-family-clock/actions/runs/40005708598). Only repository description and topics failed; those checks remain enabled.

Isolated Home Assistant 2026.10.2 acceptance passed in Chromium for selectors, saved clocks and dashboard reload. Its installed dashboard also passed WebKit surface, movement and live moon updates with six hands, six inhabitants and zero frontend exceptions. Mobile production regressions exercise clipping, rotation, expanded-view motion/pause and repeated dashboard remounts with temporary-image cleanup. Physical iPhone/iPad companion-app acceptance remains unverified; the user's live installation was not changed. The temporary test instance was stopped afterward.

The 135 approved visual decisions and six omissions are preserved. F01, F03 and C13–C16 remain excluded. This maintenance release changes rendering and memory handling, preserving approved artwork and clock configuration.

## Install or update through HACS

Open **HACS → Magical Family Clock** and download/update to **0.4.2**, then reload the frontend and fully close/reopen the iOS companion app. If old rectangles remain, use the companion app's **Settings → Companion app → Debugging → Reset frontend cache**, then reopen it. Menu wording can vary by app version. No clock or people reset is required.

For first installation add `https://github.com/deadmeat75/magical-family-clock` through **Custom repositories**, category **Dashboard**. HACS manages the resource; enabling prereleases is unnecessary.

[Detailed user guide](USER-GUIDE.md) · [Living World guide](WORLD-GUIDE.md) · [WebKit phone example](ios-webkit-phone.png) · [WebKit tablet example](ios-webkit-tablet.png).

The [v0.4.1 release](https://github.com/deadmeat75/magical-family-clock/releases/tag/v0.4.1) remains available historically but contains the reported iOS rendering defect.

## Repository metadata and validation

The [v0.4.2 HACS run](https://github.com/deadmeat75/magical-family-clock/actions/runs/40005708598) passed **6/8 checks**; the only failed checks were missing repository About description and topics. GitHub reads confirm those are absent. A previous release-preparation attempt to set the description returned **HTTP 403: Resource not accessible by integration**. This integration permission limit is separate from successful release publication.

The repository owner can edit **About** on GitHub and set:

- Description: `A customizable Home Assistant family-location clock card with visual setup, animated hands, and seasonal artwork.`
- Topics: `home-assistant`, `hacs`, `lovelace-custom-card`, `home-assistant-custom-card`

Then run **Actions → HACS validation → Run workflow** on `main`. Checks remain enabled. Authenticated HACS installation/update remains unverified; default-store approval is not claimed. The user's live Home Assistant installation remains unchanged.
