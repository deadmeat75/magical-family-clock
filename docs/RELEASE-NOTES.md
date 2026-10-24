# Magical Family Clock 0.4.5 — HACS download compatibility

Fix HACS downloads failing with **Got more than 8190 bytes when reading**. GitHub’s release redirect policy header exceeds HACS/aiohttp’s default field limit, causing the request to fail before downloading the card.

This release has no attached assets, allowing HACS to use the tested root JavaScript file at the version tag instead. Historical assets are preserved. The installed filename and resource path remain unchanged. Clock features, Randomize, the lighter iOS renderer and saved configuration are retained. Two lifecycle corrections prevent old visibility observers from pausing a remounted clock and prevent resume/frame timestamp skew from reversing elapsed scene time.

## Update through HACS

Refresh the repository information, open Download/Redownload, select **0.4.5**, and wait for a successful download. Then reload Home Assistant and reopen the iOS app. Confirm the installed version in **Living world**. No manual copying or HACS patch is required.

[Detailed HACS troubleshooting](https://github.com/deadmeat75/magical-family-clock/blob/v0.4.5/docs/HACS-DOWNLOAD.md) · [Full guide](https://github.com/deadmeat75/magical-family-clock/blob/v0.4.5/docs/USER-GUIDE.md) · [Publication status](https://github.com/deadmeat75/magical-family-clock/blob/main/docs/PUBLISHING-STATUS.md).

The oversized-header issue is tracked in [HACS #5643](https://github.com/hacs/integration/issues/5643); its upstream fix was still open when checked. This release uses a supported repository-side download route while preserving default HTTP limits. Repository About metadata warnings and physical iOS smoothness remain separate issues.
