# HACS download failure: header larger than 8190 bytes

## What the log means

The uploaded log shows two unsuccessful downloads of `v0.4.4/magical-family-clock.js`. HACS reports `ClientResponseError: 400` with `Got more than 8190 bytes when reading` and the start of GitHub’s Content-Security-Policy header. This happens while parsing the release redirect, before the JavaScript is downloaded. It is not a JavaScript rendering exception, and a failed attempt does not install the new card version.

GitHub’s release redirect currently sends a 9,217-byte policy value. HACS/aiohttp’s default header-field limit is 8,190 bytes. The failure reproduces with that default limit; downloading the identical v0.4.4 file from its raw tagged source succeeds and matches its SHA-256. This is also tracked in [HACS issue #5643](https://github.com/hacs/integration/issues/5643). [Upstream fix #5644](https://github.com/hacs/integration/pull/5644) was open when checked; an upstream release containing it is not claimed.

## Update using HACS

1. Refresh Magical Family Clock’s repository information in HACS.
2. Open its Download/Redownload dialog and select **0.4.5** or newer explicitly. Retry an older selected version only after changing this selection.
3. Wait for HACS to report a successful download. Do not delete the existing clock card, saved people or sensor configuration.
4. Reload Home Assistant’s frontend, then fully close and reopen the iOS companion app. If the browser still uses an older card, use **Settings → Companion app → Debugging → Reset frontend cache** (wording can vary).
5. Edit the card, open **Living world**, and confirm **Installed card version: 0.4.5** or newer. Randomize remains at the lower left, opposite Fullscreen.

Clearing the browser cache alone cannot repair a failed HACS download; first complete the download successfully.

No manual file copying, HACS code patch, alternative repository or dashboard resource-path change is needed for this release. If the new attempt still fails, its log should identify the selected version and URL; a continued `releases/download/v0.4.4` URL means the old version is still selected or repository information is stale.

## Repository-side compatibility change

The repository already contains the tested self-contained JavaScript file at its root, and `hacs.json` specifies `content_in_root: true` and its unchanged filename. From 0.4.5, published releases have **no attached release assets**. HACS’s supported file selection therefore falls back to the root file at the selected version tag on `raw.githubusercontent.com`, avoiding the oversized GitHub release redirect header.

GitHub may still show its automatic Source code archives; those are expected and are not attached release assets. Existing historical assets are retained. The publisher refuses to remove or replace them automatically. The installed resource remains `/hacsfiles/magical-family-clock/magical-family-clock.js` with HACS’s version query.

The clock features from 0.4.4 are retained, including Randomize and the lighter iOS rendering path. The update also retires stale visibility observers after remounting and keeps elapsed scene time monotonic on resume. Physical iOS smoothness still needs confirmation after a successful update. [Full guide](USER-GUIDE.md) · [Randomize guide](RANDOMIZE.md) · [Delivery acceptance](HACS-DOWNLOAD-ACCEPTANCE.json).
