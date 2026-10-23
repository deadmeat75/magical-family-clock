> Archived review round. [Open the three newest revisions](REVIEW-ROUND-4.md).

> **B03 update:** Revision 4 approved and preserved. Remaining revisions: F01, W09 and B01.

> **B02 update:** Revision 4 approved with editable text color. The Bezel tab provides a Readout color picker for each reading.

> **P04 update:** Revision 4 solid wood is approved and preserved.

> **L07 update:** Revision 5 is approved; its motion examples are preserved.

> **Review update:** F03 has been abandoned and is excluded from the planned release. F01 revision 6 needs further alignment. The F03 examples below are archived; they no longer require review.

# Eight revised examples for review

**Review branch only. Release held. Published HACS remains v0.4.0.** These are the current examples; older rounds remain archived. There is no need to review the already approved examples again.

133 items are approved, three require revision or review, and F03 plus C13–C16 are omitted. N01–N08 revision 4, P02–P03 revision 3, K09–K12 revision 2, W07 revision 4 and L08 revision 4 are recorded as approved. Approved source files are protected by SHA-256 checks.

| ID | Current example | What to inspect |
| --- | --- | --- |
| F01 | [Revision 6](items/F01-r6.png) · [editable SVG](concepts/F01-editable-lettering-r6.svg) | Entire lettering moved inward, with tighter spans. Every painted glyph is checked against the gold-face boundary with clearance. This remains a lettering placement proposal; production dynamic-name fitting follows approval. |
| F03 | [Revision 8 still](items/F03-r8.png) · [rotating discs](items/F03-r8.gif) · [mechanism close-up](items/F03-detail-r8.gif) | Four illustrated windows, with fixed labels explaining each reading. No astronomical hands, scales or numeric dials. |
| L07 | [Revision 5 motion](items/L07-r5.gif) · [castle close-up](items/L07-detail-r5.gif) · [still](items/L07-r5.png) | Flicker slowed by 25% from revision 4. Only identified castle window panes illuminate; trees are excluded. Twelve seconds at normal speed. |
| W09 | [Revision 5 growth](items/W09-r5.gif) · [glass close-up](items/W09-detail-r5.gif) · [completed ice](items/W09-r5.png) | Fine white needle ice grows inward from the central glass rim over 28 seconds, then holds for four seconds. No whole-leaf fade-ins. GIF repeat resets the demonstration; runtime growth does not loop. |
| P04 | [Revision 4 solid wood](items/P04-r4.png) | Strong irregular grain, pores, natural variation and rounded profile lighting, based on the supplied real-wood frame references. New generated material artwork; no repeated texture tiles. |
| B01 | [Revision 4 brass](items/B01-r4.png) | Upper lettering moved inward onto the smooth band. Accepted lower baseline retained; frame unchanged. |
| B02 | [Revision 4 silver](items/B02-r4.png) | Top text substantially lower/inward; bottom slightly lower/outward. Frame unchanged. |
| B03 | [Revision 4 carved wood](items/B03-r4.png) | Same text-placement correction as B02. Frame unchanged. |

## F03: what the pictures mean

The fixed cabinet contains four separate moving image carriers, viewed through circular apertures. Existing painted artwork supplies the illustrations. Each disc rotates when its selected data changes; it does not spin arbitrarily.

| Picture window | Meaning and input |
| --- | --- |
| Day / night, upper left | Dawn, day, dusk or night from the configured sun data or calculated local solar position; local civil-hour fallback when solar data is absent. Manual preview overrides remain available. |
| Moon phase, upper right | Existing lunar sensor/manual/calculated source and configured missing-sensor behavior. The selected moon picture retains continuous phase illumination. |
| Season, lower left | Spring, summer, autumn or winter from the local date, hemisphere or manual override. |
| Weather, lower right | Clear, clouds, light rain, rain, snow, sleet, wind, fog, ice or lightning from the weather entity/override. |

The motion clip deliberately changes test inputs every 3.5 seconds to demonstrate the mechanism. **It does not imply that real seasons or lunar phases cycle that quickly.** Each move takes the normal 1.8 seconds. The clip returns to its starting frame when it loops. Face finish effects are off to keep the mechanism study clear; family whereabouts hands are omitted from this illustration but remain supported in the card.

Separate test snapshots: [dawn / spring / light rain / first quarter](items/F03-dawn-r8.png), [day / summer / clear / full moon](items/F03-day-r8.png), [dusk / winter / snow / last quarter](items/F03-dusk-r8.png), [night / autumn / lightning / new moon](items/F03-night-r8.png).

## Supplemental L06 shooting-star check

The approved meteor behavior is preserved. This [four-passage full view](items/L06-context-r2.gif) and [sky close-up](items/L06-context-detail-r2.gif) show four actual seeded encounters with varied origins and directions. Only the quiet waiting gaps are omitted; each passage retains normal speed. The previous context clip happened to show just one event.

## Reviewing when convenient

Open the direct image or GIF links above for full-size inspection. GIFs are the motion examples; PNGs cannot show movement. Reply with an ID and approval or requested correction, for example `Approve B02` or `Revise W09: ...`. Unmentioned items remain pending. No release will be created from silence.

[Complete checklist](APPROVALS.md) · [Decision record](approvals.json) · [Detailed world and controls guide](../WORLD-GUIDE.md)
