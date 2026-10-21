> **Unreleased review draft.** Publication is held for individual visual approval. See the [review gallery](visual-review/README.md). HACS remains on 0.4.0.

# Magical Family Clock 0.4.1 — Natural castle motion

This correction reworks the castle animation following visual feedback on 0.4.0.

- **Visible cloud drift:** two cloud decks move continuously over a separate sky, behind the castle/mountain silhouette. Stationary clouds are no longer left underneath the moving layer.
- **Quieter lake motion:** small continuous waves distort reflections while the shoreline stays fixed; broad sliding image bands are removed.
- **Fine waterfall spray:** downward flow threads and tiny short-lived droplets replace the solid oval shapes.
- **Natural entrances/exits:** flying visitors follow curved paths through the frame edge without fading or resetting in open sky. Lake creatures fully submerge without opacity cuts.
- **Less repetitive movement:** flap/glide cadence, species-specific timing, subtle tail/cloth movement, quieter props and irregular foliage sway.
- **Continuous live updates:** moon/weather refreshes retain landscape time and encounter progress. Reduced motion, visibility and removal stop the landscape painter appropriately.

**Editor space:** remove the duplicate sticky clock from the settings column and use Home Assistant’s existing preview on the right. Encounter preview actions target that clock.

All Living World controls, panels, creatures, moon sensor support and existing clock features remain included. The updated recording uses normal-speed playback without encounter seeking.

## Update through HACS

1. Open **HACS → Magical Family Clock → Download/update → 0.4.1**.
2. Reload the Home Assistant frontend; hard-refresh if the older animation remains.
3. Existing world settings are retained. Flying routes now extend beyond the opening when necessary for natural entry/exit.

[Detailed guide](https://github.com/deadmeat75/magical-family-clock/blob/v0.4.1/docs/WORLD-GUIDE.md) · [Normal-speed animation](https://github.com/deadmeat75/magical-family-clock/raw/refs/tags/v0.4.1/docs/living-world-preview.mp4)

## Verification

53 unit/packaging checks and 50 Chromium browser checks cover route boundaries, visible cloud advection, submersion, pause behavior, live-update continuity and existing card features. Isolated Home Assistant acceptance and release-download verification are recorded in [current publication status](https://github.com/deadmeat75/magical-family-clock/blob/main/docs/PUBLISHING-STATUS.md).

Authenticated HACS installation/update remains unverified. The known repository About description/topics tasks remain separate from package publication. The user's live installation is unchanged.
