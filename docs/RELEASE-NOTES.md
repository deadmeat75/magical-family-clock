# Magical Family Clock 0.4.3 — Motion recovery and natural flight

Recover lost scenery callbacks when returning to Home Assistant, and automatically re-arm a stalled animation loop without resetting the scene. Preserve the native SVG clipping correction from 0.4.2.

- Add **Living world → Check animation** to distinguish card/device motion preferences, disabled scenery and a scene that is not advancing. Display the installed version to identify cached older code. The check verifies frame publication as well as elapsed time.
- Give flying creatures more visible climbs, dips, gentle speed changes and banking, with different routes per saved creature. Preserve offscreen entry/exit, planted ground creatures and waterline placement.
- Add production phone/tablet WebKit and Chromium checks for lost callbacks, app-return recovery, pause explanations and actual changing scenery pixels. Keep reduced-motion and background/offscreen pauses intact.

## Update through HACS

Open **HACS → Magical Family Clock → Download/update → 0.4.3**, reload Home Assistant, and fully close/reopen the iOS app. Existing people, clocks and sensor settings are preserved. Open **Living world → Check animation** if the picture remains still.

[Detailed iOS troubleshooting](https://github.com/deadmeat75/magical-family-clock/blob/v0.4.3/docs/IOS-COMPATIBILITY.md) · [Full guide](https://github.com/deadmeat75/magical-family-clock/blob/v0.4.3/docs/USER-GUIDE.md) · [Publication status](https://github.com/deadmeat75/magical-family-clock/blob/main/docs/PUBLISHING-STATUS.md)

The user reports that reloading cleared the oversized overlays, but motion remains absent on the physical iOS devices with Reduce Motion off. This release adds tested recovery and diagnostics; physical companion-app freeze resolution is not yet confirmed. Automated WebKit viewport tests are not physical-device acceptance. Repository About description/topics still require owner permissions and remain a separate HACS validation issue.

Verification: **64 unit/packaging and 95 browser checks** passed locally and in [exact-commit full CI](https://github.com/deadmeat75/magical-family-clock/actions/runs/40015639279) (85 Chromium, five phone WebKit and five tablet WebKit). The installed Home Assistant 2026.10.2 WebKit dashboard passed surface/motion/live-moon checks with six hands and six inhabitants; the native Chromium editor passed its animation-check action. [Acceptance record](https://github.com/deadmeat75/magical-family-clock/blob/main/docs/IOS-MOTION-RECOVERY.json).
