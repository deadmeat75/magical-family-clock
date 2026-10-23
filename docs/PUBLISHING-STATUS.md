# Publication status

**[v0.4.3 — Motion recovery and natural flight](https://github.com/deadmeat75/magical-family-clock/releases/tag/v0.4.3) is published and verified as the latest stable release.** It is neither a draft nor a prerelease. Adds foreground/lost-callback recovery, a beginner-friendly animation check and individual curved creature routes. Keeps the 0.4.2 native SVG clipping correction.

The user confirmed that reloading cleared the misplaced iOS overlays, but still reports no motion with iOS Reduce Motion off. The recovery and diagnostics pass automated checks; the physical-device cause and resolution remain unconfirmed. [Troubleshooting and update guide](IOS-COMPATIBILITY.md) · [Acceptance record](IOS-MOTION-RECOVERY.json).

The self-contained `magical-family-clock.js` release asset was independently downloaded and matches the tested bundle byte for byte (**25,747,040 bytes**).

SHA-256: `23fa6f006600a747cc2d6accdb596ce690f95508639302400123b094921f6076`

Release commit: `95a7608ca5d6b90363b85cde82e4feafc91a1a6f`.

- [Full main CI passed](https://github.com/deadmeat75/magical-family-clock/actions/runs/40015639279): deterministic build, **64 unit/packaging and 95 browser checks** (85 Chromium, five phone WebKit and five tablet WebKit). The same 95 browser checks passed locally.
- [Verified publication passed](https://github.com/deadmeat75/magical-family-clock/actions/runs/40016548913): required successful full CI for the exact tagged commit, rebuilt/tested the package and checked the compiled bundle was unchanged before publishing.
- The redundant standard tag-release run was cancelled in favor of that verified publication workflow. Required browser checks passed in full CI; they were not skipped.

The installed Home Assistant 2026.10.2 WebKit dashboard passed surface, motion and live-moon updates with six hands, six inhabitants and zero frontend exceptions. Its Chromium native editor passed single-preview, live-update, encounter-preview and animation-check actions. These were isolated test instances; the user's installation was unchanged and physical iOS companion-app acceptance remains pending. The temporary instance was stopped afterward.

The 135 approved visual decisions and six omissions are preserved. No approved artwork was modified; F01, F03 and C13–C16 remain excluded.

## Install or update through HACS

Open **HACS → Magical Family Clock → Download/update → 0.4.3**, reload the frontend and fully close/reopen the iOS app. If **Living world** still shows an older installed version or lacks **Check animation**, reset the companion frontend cache. Keep your existing clocks, people and sensor configuration.

If the clock is still motionless, open **Living world → Check animation** with the preview visible. It distinguishes the card's Reduced motion setting from the device preference, scenery disabled, and a scene that is not advancing. Report its exact result if the problem persists. A running result with a still image is useful evidence too.

For first installation add `https://github.com/deadmeat75/magical-family-clock` under **HACS → Custom repositories**, category **Dashboard**. HACS manages the resource. No prerelease setting or manual file installation is needed.

[Detailed user guide](USER-GUIDE.md) · [Living World guide](WORLD-GUIDE.md). The original 0.4.2 clipping-fix evidence remains in [its acceptance record](IOS-ACCEPTANCE.json).

## Repository metadata and validation

The [v0.4.3 HACS run](https://github.com/deadmeat75/magical-family-clock/actions/runs/40016546404) also passed **6/8 checks**. Its annotations identify the same missing repository description and topics; there are no new package-validation failures. Those owner-level fields still need to be set.

The [v0.4.2 HACS run](https://github.com/deadmeat75/magical-family-clock/actions/runs/40005708598) passed **6/8 checks**; the only failed checks were missing repository About description and topics. GitHub reads confirm those are absent. A previous release-preparation attempt to set the description returned **HTTP 403: Resource not accessible by integration**. This integration permission limit is separate from successful release publication.

The repository owner can edit **About** on GitHub and set:

- Description: `A customizable Home Assistant family-location clock card with visual setup, animated hands, and seasonal artwork.`
- Topics: `home-assistant`, `hacs`, `lovelace-custom-card`, `home-assistant-custom-card`

Then run **Actions → HACS validation → Run workflow** on `main`. Checks remain enabled. Authenticated HACS installation/update remains unverified; default-store approval is not claimed. The user's live Home Assistant installation remains unchanged.
