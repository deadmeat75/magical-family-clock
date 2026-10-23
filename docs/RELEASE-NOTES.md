# Magical Family Clock 0.4.4 — Smoother scenery and Randomize

Add **Randomize** opposite Fullscreen: temporarily shuffle supported faces, colors, season, time, weather and one to three visitors while preserving people, locations, sensor mappings, moon sources and bezel data. Reload to restore the saved design; automatic face cycling pauses during a randomized view.

Reduce the iOS scenery workload: prepare small foliage/water textures once, remove duplicate per-frame image decoding, wait for native SVG image loading and skip busy surfaces. Keep the clipping correction, HD base photograph, bounded buffers, URL cleanup, motion preferences and app-return recovery. Stable frame deadlines target 30 fps in Rich/Balanced and 20 in Light on WebKit; actual speed depends on the device and workload.

Update using **HACS → Magical Family Clock → Download/update → 0.4.4**, reload Home Assistant and reopen the iOS app. Your saved clocks and people are retained.

[Randomize and smooth-motion guide](https://github.com/deadmeat75/magical-family-clock/blob/v0.4.4/docs/RANDOMIZE.md) · [Full guide](https://github.com/deadmeat75/magical-family-clock/blob/v0.4.4/docs/USER-GUIDE.md) · [Current publication status](https://github.com/deadmeat75/magical-family-clock/blob/main/docs/PUBLISHING-STATUS.md).

The user reports that iOS animation now works but is choppy. Software WebKit development measurements improved; physical iPhone/iPad frame rates and smoothness remain unverified. Repository About description/topics remain a separate owner-permission HACS validation issue.

Verification: **69 unit/packaging and 98 browser checks** passed locally and in [exact-commit CI](https://github.com/deadmeat75/magical-family-clock/actions/runs/40032792354). Installed Home Assistant WebKit checks verify motion, live moon updates, Randomize data preservation and reload restoration. [Acceptance](https://github.com/deadmeat75/magical-family-clock/blob/main/docs/SMOOTH-MOTION-ACCEPTANCE.json).
