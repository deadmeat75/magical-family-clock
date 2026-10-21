# Review decisions and remaining work

[Gallery](README.md) · [Individual checklist](APPROVALS.md) · [Decision record](approvals.json)

**Release remains held. HACS is still on 0.4.0.** The review branch contains proposed illustrations and unreleased landscape changes. An artwork approval applies to that individual example; it does not approve unfinished animation or authorize a release.

## Recorded decisions

Approved: **C01, C02, C03, C04, C05, C06, C07, C08, C09, C10, C12, X01, X02, L01, F04, F05**.

Omitted from the proposed artwork set: **C13, C14, C15, C16**. These examples remain in repository history for reference and are excluded from the new artwork selection.

Revised proposals awaiting approval: **C11, L02–L08, F01–F03, H01–H12**. Other items remain pending. The gallery links to revision 1; the original examples remain unchanged for comparison.

## Characters must inhabit their environment

The revised character images are visual proposals, not finished animated creatures. Static-image translation is not an acceptable final animation technique.

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
- **F03:** complete antique astronomical-clock redesign, with an ivory destination ring, celestial decoration and a miniature landscape. The current picture is a static art-direction proposal. Production needs separate fixed cabinet/dial art, a rotating time/celestial wheel, seasonal landscape layers and independent sensor-driven weather effects. Time, season and weather must compose without rotating destination text or tracking hands. A painted celestial face must not replace the real lunar phase sensor behavior.
- **F04 and F05:** approved visual examples remain unchanged.

## Hand proposals

Each of **H01–H12** now has its own realistic crafted-metal proposal, with physical proportions, fine engraving, bevels, openwork and surface detail. They are individually reviewable illustrations, not replacements already wired into the card. After approval, runtime work must establish exact pivot positions, fit optional names and data inside the physical surface, preserve portrait placement and rotation choices, and supply consistent size, width, material and finish controls.

The approved bitmap and GIF examples have SHA-256 hashes in the decision record so later gallery generation cannot silently change what was approved. All other approvals remain pending until explicitly given.
