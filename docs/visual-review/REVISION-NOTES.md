# Review decisions and remaining work

[Gallery](README.md) · [Individual checklist](APPROVALS.md) · [Decision record](approvals.json)

**Release remains held. HACS is still on 0.4.0.** The review branch contains proposed illustrations and unreleased landscape changes. An artwork approval applies to that individual example; it does not approve unfinished animation or authorize a release.

## Recorded decisions

Approved: **C01–C12, X01–X02, L01–L06, L08, F02, F04–F05, H01–H12, K01–K12, P01–P03, P05, M01–M13, S01–S16, I01–I13, T01–T10, U01–U02, W01–W08, W10, N01–N08, E01–E06**, plus the lunar surface artwork. Lettering retains editable UI text color.

Omitted from the proposed artwork set: **C13, C14, C15, C16**. These examples remain in repository history for reference and are excluded from the new artwork selection.

See [Latest revisions](LATEST-REVISIONS.md) and the [complete checklist](APPROVALS.md) for current revision numbers and remaining approvals. Earlier examples are archived; revisions never imply approval.

## Characters must inhabit their environment

C01–C12 artwork is approved. Final environment-aware character animation still requires implementation and review. Static-image translation is not an acceptable final animation technique.

- Small creatures, including the revised C07 pixie, belong in the foreground at a suitably small scale. Its review sheet includes a static placement study at about 4.5% of clock width and enlarged detail views.
- C11 is a wild unicorn with no saddle, bridle, blanket, chains or other adornments. Its revised pose has natural supporting legs. Travel must follow suitable terrain, with articulated legs, planted hooves, believable weight transfer and a coordinated walk cycle; it must not float or slide across water or open space.
- C12's boat artwork is approved **with conditions**: the hull must intersect the waterline on navigable water; travel, buoyancy, reflection and wake must agree. This motion still requires implementation and review.
- Aquatic creatures must remain attached to their water environment while swimming, surfacing and submerging. Flying creatures need coherent flight, wing and body movement, believable depth and environmental occlusion. Entry, exit and repeat boundaries must not visibly teleport a creature.
- Character animation, shoreline/terrain masks, species-specific movement and final placement must be reviewed before release. The revised painted character set is not yet installed in the runtime renderer.

## Landscape revisions in the engineering draft

| ID | Revised behavior and review examples |
| --- | --- |
| L01 | Approved cloud advection retained. Its approved example is unchanged. |
| L02 | More visible irregular canopy sway around fixed roots. Separate spring-petal and autumn-leaf clips; neither seasonal effect is added in summer or winter. |
| L03 | Stronger fine lake reflection waves while the shoreline remains fixed. |
| L04 | Clearer downward water threads and visible small ballistic droplets at impact points. No filled spray discs or moving spotlight shapes. |
| L05 | Brighter, more pronounced independent star twinkling. Cloud coverage erases the stars below it; stars remain behind the moon, towers and foreground. |
| L06 | Variable 20–75 second quiet intervals, different sky origins and varied diagonal trajectories. A per-clock session seed preserves an active encounter during sensor refreshes. Meteors stay behind clouds, moon and foreground. |
| L07 | Actual painted window regions use separate irregular light sources, rather than a synchronized brightness pulse. |
| L08 | Greenish bioluminescent glow, independent light pulses and wandering paths near foreground vegetation. |

The main GIFs show eight seconds at normal speed. Meteor clips start just before a passage so it can be reviewed without waiting. The varied-encounter clip skips the quiet intervals between four passages; each passage itself retains normal speed. Additional cloudy-sky clips demonstrate depth and occlusion.

The new **Living world → Landscape and motion controls → Seasonal petals and leaves** checkbox is independent of tree sway. **Appearance → Castle motion intensity** controls the strength of tree and water motion. Reduced motion, offscreen visibility and paused scenery still stop decorative motion; fullscreen continues to animate normally.

## Face proposals and controls still to implement

- **F01:** aged scalloped parchment, worn mixed materials and flowing location names inspired by the supplied reference. The review lettering is a separate editable SVG layer; it is not painted into the background. The production implementation must fit changing fixed or sensor-driven names, allow style changes and keep tracking geometry independent of the lettering curves.
- **F02:** continuous age/finish control from **0% brand new polished brass** to **100% antique**, with a brighter lightly aged default. The review shows three points along that range with the existing meshing gear model. The material endpoints are proposed artwork; the production age control is not implemented yet.
- **F03:** revision 8 implements four labeled rotating picture discs for day/night, moon phase, season and weather. Astronomical hands, calendar scales and numerical dials have been removed. Family whereabouts hands remain independent. Existing source/fallback behavior drives the readings. [Current review](REVIEW-ROUND-3.md).
- **F04 and F05:** approved visual examples remain unchanged.

## Approved hand designs and optional attachments

All **H01–H12** realistic hand designs are approved. Their artwork remains unchanged. Runtime work still needs exact pivots and consistent size, width, material and finish controls.

Names need their own optional physical surface on narrow and openwork hands: an affixed parchment slip, a small attached name tag, or a brooch/small framed portrait that uses the person’s photo. These attachment designs will be reviewed separately. Preserve placement and rotation choices, optional sensor readouts, blank names, and the ability to hide every attachment. Attachments must follow their parent hand and look mechanically affixed.

The approved bitmap and GIF examples have SHA-256 hashes in the decision record so later gallery generation cannot silently change what was approved. All other approvals remain pending until explicitly given.

## Current review: round 3

[Eight revised examples](REVIEW-ROUND-3.md) supersede previous proposals for F01, F03, L07, W09, P04 and B01–B03. F01 now checks full glyph ink inside the painted scallops. F03 is a working illustrated-disc mechanism. L07 is 25% slower than revision 4 and limited to identified panes. W09 uses fine needles revealed by one continuous inward growth front. P04 has a new irregular solid-wood surface and rounded lighting. Upper bezel text is lower on all three rims; B01 keeps the accepted lower baseline and B02/B03 lower their bottom baseline slightly. Approved artwork and examples remain unchanged.

The additional L06 context clip presents four real seeded passages with waiting gaps removed. It does not alter the approved motion behavior. Earlier iteration examples remain archived in the previous review rounds; the current decision record is authoritative.

## F03 abandoned

The user has explicitly abandoned F03. Exclude its astronomical/picture-disc face from the planned release and further review. Existing source and studies are archival until runtime removal/integration cleanup; this decision is not a release authorization. Remaining visual work: F01, W09 and B01.

## W09 follow-up

Revision 5 inward growth behavior is accepted and preserved. The ice still looks leaf-like: increase fine crystal density and lower existing opacity by 15% (factor 0.85). Appearance remains unapproved.

## B01 follow-up

Revision 4 needs both the top and bottom text lowered just a hair. Keep current size and curvature. This supersedes keeping the exact earlier accepted bottom baseline; the previously accepted reference remains preserved.

## Current review: round 4

[Three revised examples](REVIEW-ROUND-4.md) supersede earlier F01, W09 and B01 studies. F01 revision 7 fits smooth contours per scallop, W09 revision 6 increases fine crystal density at 85% of the previous opacity while preserving growth, and B01 revision 5 lowers both lines slightly. B02/B03, L07 and P04 are approved. F03 is omitted and excluded from the runtime. The earlier source files and illustrations remain archived. No release is authorized by these review preparations.
