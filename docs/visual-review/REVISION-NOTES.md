# Review decisions and remaining work

[Gallery](README.md) · [Individual checklist](APPROVALS.md) · [Decision record](approvals.json)

**Release remains held. HACS is still on 0.4.0.** The review branch contains proposed illustrations and unreleased landscape changes. An artwork approval applies to that individual example; it does not approve unfinished animation or authorize a release.

## Recorded decisions

Approved: **C01–C12, X01–X02, L01, F02, F04–F05, H01–H12, K01–K08, P01, P05, M01–M13, S01–S16, I01–I13, T01–T10, U01–U02**, plus the lunar surface artwork. K01–K08 approval requires editable text color; the UI now controls portrait fallback initials as well as hand lettering.

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
- **F03:** complete antique astronomical-clock redesign, with an ivory destination ring, celestial decoration and a miniature landscape. The current picture is a static art-direction proposal. Production needs separate fixed cabinet/dial art, a rotating time/celestial wheel, seasonal landscape layers and independent sensor-driven weather effects. Time, season and weather must compose without rotating destination text or tracking hands. A painted celestial face must not replace the real lunar phase sensor behavior.
- **F04 and F05:** approved visual examples remain unchanged.

## Approved hand designs and optional attachments

All **H01–H12** realistic hand designs are approved. Their artwork remains unchanged. Runtime work still needs exact pivots and consistent size, width, material and finish controls.

Names need their own optional physical surface on narrow and openwork hands: an affixed parchment slip, a small attached name tag, or a brooch/small framed portrait that uses the person’s photo. These attachment designs will be reviewed separately. Preserve placement and rotation choices, optional sensor readouts, blank names, and the ability to hide every attachment. Attachments must follow their parent hand and look mechanically affixed.

The approved bitmap and GIF examples have SHA-256 hashes in the decision record so later gallery generation cannot silently change what was approved. All other approvals remain pending until explicitly given.

## Current review pass

New material, metalwork, panel, attachment and season/time studies are individually linked in the latest index. Season/time sheets are lighting proposals, not registered final fullscreen assets. Their final resolution, alignment and motion mapping require further work after artwork approval.

W01 removes both painted and animated clouds for clear weather. Rain, snow, sleet, wind and fog have new animated runtime examples. W09 is branching frost growing inward from the protective glass edge. W10 uses irregular branching discharges with restrained scene illumination. The approved moon surface is reused with calculated spherical lighting across all eight phases; sensor mappings remain unchanged. B03 uses natural wood grain, and E01–E06 have new runtime comparisons.

F03 is being revised toward an old magical celestial grandfather clock: no flowers, rainbow palette, airbrushed nebula or modern scientific diagrams. F01's second lettering study uses tall fine capitals following the reference's curved, changing orientation. F02 is now approved; its continuous age control remains to implement.

All source changes are unreleased. The public release remains 0.4.0.

## Latest implemented corrections

The castle no longer receives full-scene photographic wear/patina tiles. Protective-glass frost is above the location panels and grows at the edge. W07 leaves rotate around their own local origins, W08 fog drifts across the scene, and W10 has longer near/distant discharges in different sky positions. The moon's unlit side is transparent; the star mask still hides stars behind its full outline. A daylight display option is available without changing existing phase-source mappings.

B01–B03 use crafted rim artwork mapped continuously around the ring at editable widths. E01–E06 use isolated on/off review panels; duplicated SVG IDs and unresolved relative texture paths no longer invalidate the comparisons. The effects have distinct directional depth, reflected surroundings, concentrated highlights, edge oxidation and handling scratches.

L02–L08 have new normal-speed full-clock and close-up clips. The L06 comparison shows four real seeded passages while skipping quiet gaps, with each visible passage retaining normal speed. L07's independent light variation is roughly five times slower.

F01 revision 4 aligns each location name to the curved outer edge of its own painted scallop, with an inward margin. The browser check verifies placement within each lobe and samples the underlying gold artwork. Names remain editable SVG text. F03 revision 6 uses asymmetric layered celestial wheels. These face studies remain artwork proposals; final rotating layers and dynamic-name fitting still require implementation.

Remaining visual approvals: F01, F03; L02–L08; P02–P04; K09–K12; W01–W10; N01–N08; B01–B03; E01–E06. See the decision record for conditions and explicit approvals.

## Current revision pass

[Fresh review examples](REVIEW-ROUND-2.md) preserve all explicit approvals. W01–W06, W08, W10, E01–E06 and L01–L06 effects are approved. B01–B03 frame appearance is approved, with curved readouts still to review. P02–P04 all require non-tiled textures.

F03 revision 7 is implemented as a functional astronomical theme, with real local time, calendar wheels and existing moon-source/fallback handling. F01 revision 5 remains a lettering placement proposal. K09–K12 revision 2 now render as individually clipped physical attachments with GUI lettering controls. Wind uses weather speed units and varied paths; frost is confined to the central scene. Moon brightness, curved bezel text, local lamp variation and visible foreground fireflies have new runtime examples. New context clips for approved landscape effects use the retraced mountain guide and continuous source edge fit.

Earlier art-direction notes above describe previous stages. The current review page identifies what is newly implemented and what still requires visual approval. Release remains held at published HACS v0.4.0.
