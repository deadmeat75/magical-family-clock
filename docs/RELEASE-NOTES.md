# Magical Family Clock 0.4.2 — iPhone and iPad rendering correction

Fix oversized moving-water/foreground rectangles and displaced fog on WebKit, as reported on iPhone 16 Pro Max and 2024 iPad Air. The failure was reproduced with the production bundle and corrected with native SVG image surfaces that obey the face's scaling and clipping.

- Preserve live motion in expanded view and after rotation; keep the HD castle base image.
- Share bundled image URLs, use binary registered-scene images, reduce decoded image caches, lazily prepare foliage/lamps, and release temporary frame URLs/canvases after navigation.
- Add phone/tablet WebKit production regression checks for rendered clipping, rotation, expanded-view motion/pause and repeated dashboard remounts.
- Make meteor visibility checks deterministic and avoid duplicate review-branch/tag push CI runs. Required Chromium/WebKit release checks remain enabled.

## Update through HACS

Open **HACS → Magical Family Clock → Download/update → 0.4.2**, reload Home Assistant, and fully close/reopen the iOS app if cached artwork remains. Your existing clock configuration and people are retained.

[Detailed iOS correction and verification](https://github.com/deadmeat75/magical-family-clock/blob/v0.4.2/docs/IOS-COMPATIBILITY.md) · [Full user guide](https://github.com/deadmeat75/magical-family-clock/blob/v0.4.2/docs/USER-GUIDE.md) · [Living World controls](https://github.com/deadmeat75/magical-family-clock/blob/v0.4.2/docs/WORLD-GUIDE.md) · [Publication and validation status](https://github.com/deadmeat75/magical-family-clock/blob/main/docs/PUBLISHING-STATUS.md)

Automated mobile-viewport WebKit checks are not physical iOS companion-app acceptance. The user's live Home Assistant installation was not modified. Repository About description/topics still require owner permissions; HACS metadata validation remains enabled and documented separately from package checks.

Verification: 63 unit/packaging checks and 89 browser checks passed (83 Chromium and six phone/tablet WebKit). The installed Home Assistant 2026.10.2 dashboard passed WebKit surface, motion and live-moon checks with six hands, six inhabitants and zero frontend exceptions. [Evidence](https://github.com/deadmeat75/magical-family-clock/blob/v0.4.2/docs/IOS-ACCEPTANCE.json).
