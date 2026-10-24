# Publication status

**[v0.4.5 — HACS download compatibility](https://github.com/deadmeat75/magical-family-clock/releases/tag/v0.4.5) is published and verified as the latest stable release.** It is neither a draft nor a prerelease. It has **no attached assets**, so HACS selects the committed JavaScript file at the release tag instead of following GitHub's oversized-header release redirect.

The user's log shows v0.4.4 downloads failing before the JavaScript was fetched. The same `Got more than 8190 bytes when reading` error was reproduced with the default HTTP parser. HACS 2.0.5's unchanged filename/file-selection/download methods successfully selected and downloaded the new raw tagged file using its actual release metadata and unchanged default header limit. [Detailed guide](HACS-DOWNLOAD.md) · [Acceptance](HACS-DOWNLOAD-ACCEPTANCE.json).

Tagged root file: `https://raw.githubusercontent.com/deadmeat75/magical-family-clock/v0.4.5/magical-family-clock.js`.

The live HACS-method download matches the tested bundle byte for byte (**25,750,291 bytes**).

SHA-256: `53e99a1ab3e836c369f8865c44c7e255b5863a5a10c04e2e4cb06e7641acbb58`

Release commit: `491a64a4ccb3d1787375cfe4d46e818d76e9ca99`.

- [Full main CI passed](https://github.com/deadmeat75/magical-family-clock/actions/runs/40044126265): deterministic build, **73 unit/packaging and 98 browser checks** (86 Chromium, six phone WebKit and six tablet WebKit).
- [Verified publication passed](https://github.com/deadmeat75/magical-family-clock/actions/runs/40044742386): required successful full CI for the exact tagged commit, rebuilt/tested the package and verified the committed bundle before publishing a source-only release. The redundant standard release workflow was cancelled; required browser checks were not skipped.
- Historical release assets remain intact. The publisher refuses to alter an existing asset-bearing release automatically.

Randomize, lighter iOS frame publishing, people, locations, live sensors and the installed resource filename/path remain intact. The update also retires stale visibility observers after remounts and keeps elapsed scene time monotonic on resume. The user reports iOS animation works, but physical smoothness after successfully installing the newer renderer is still unverified. No files on the user's Home Assistant/HACS installation were modified. Full authenticated HACS UI installation is not claimed.

All 135 approved visual decisions and six omissions are preserved. F01, F03 and C13–C16 remain excluded.

## Install or update through HACS

Refresh the repository information, open **Download/Redownload**, explicitly select **0.4.5**, and wait for success. Then reload the frontend and fully reopen the iOS app. Confirm **Installed card version: 0.4.5** under **Living world**. Browser cache clearing alone cannot fix a failed download.

Keep saved clocks, people, sensor mappings and the existing dashboard resource. No manual file copying or HACS code patch is required. Source code archives shown by GitHub are expected; there is no attached JavaScript release asset by design. [Full guide](USER-GUIDE.md) · [Download troubleshooting](HACS-DOWNLOAD.md) · [Randomize](RANDOMIZE.md).

## Repository metadata and validation

The [v0.4.5 HACS run](https://github.com/deadmeat75/magical-family-clock/actions/runs/40044742591) passed **6/8 checks**; only repository topics and description failed. These owner-level metadata checks are separate from the reproduced/fixed download-header issue. The source-only release introduces no additional package-validation failure.

The [v0.4.4 HACS run](https://github.com/deadmeat75/magical-family-clock/actions/runs/40040712020) passed **6/8 checks**. Its annotations identify only missing repository description and topics. Owner-level metadata permissions remain required; no new package-validation failure is reported.

The [v0.4.3 HACS run](https://github.com/deadmeat75/magical-family-clock/actions/runs/40016546404) also passed **6/8 checks**. Its annotations identify the same missing repository description and topics; there are no new package-validation failures. Those owner-level fields still need to be set.

The [v0.4.2 HACS run](https://github.com/deadmeat75/magical-family-clock/actions/runs/40005708598) passed **6/8 checks**; the only failed checks were missing repository About description and topics. GitHub reads confirm those are absent. A previous release-preparation attempt to set the description returned **HTTP 403: Resource not accessible by integration**. This integration permission limit is separate from successful release publication.

The repository owner can edit **About** on GitHub and set:

- Description: `A customizable Home Assistant family-location clock card with visual setup, animated hands, and seasonal artwork.`
- Topics: `home-assistant`, `hacs`, `lovelace-custom-card`, `home-assistant-custom-card`

Then run **Actions → HACS validation → Run workflow** on `main`. Checks remain enabled. Authenticated HACS installation/update remains unverified; default-store approval is not claimed. The user's live Home Assistant installation remains unchanged.
