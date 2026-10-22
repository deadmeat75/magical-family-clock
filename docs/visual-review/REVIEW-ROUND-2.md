> Archived review round. [Open the current eight revised examples](REVIEW-ROUND-3.md) for the latest versions and decisions.

# Current revision review

**Unreleased review branch. Published HACS remains v0.4.0.** No release will be published without the remaining visual approvals. Earlier files are retained for comparison; these links point directly to the new examples.

113 items are approved, 24 revised items await approval, and C13–C16 remain omitted. B01–B03 frame appearance is approved separately; their curved readouts are presented below for review. L01–L06 motion effects are approved; their shared scene-edge correction is new.

## Faces and physical name attachments

| Item | New example | Review focus |
| --- | --- | --- |
| F01 | [Revision 5](items/F01-r5.png) · [editable SVG](concepts/F01-editable-lettering-r5.svg) | Taller lettering and refined individual scallop angles. Still an alignment study; not claimed as final production mapping. |
| F03 | [Functional face](items/F03-r7.png) · [dial close-up](items/F03-functional-detail-r7.png) | Local time, real calendar wheels, and lunar phase from the configured source. No arbitrary decorative wheel rotation. |
| F03 readings | [January / new moon](items/F03-winter-r7.png) · [July / full moon](items/F03-summer-r7.png) | Different actual calendar and example sensor readings drive the same face. These are labeled test states, not accelerated natural animation. |
| K09 | [Handwritten parchment](items/K09-r2.png) | Bundled handwriting font, ink color and editable text. |
| K10 | [Hanging tag](items/K10-r2.png) | Individual silhouette excludes the neighbouring tag; lettering follows its sloping surface. |
| K11 | [Oval brooch](items/K11-r2.png) | Individual artwork and adjustable lettering. |
| K12 | [Portrait attachment](items/K12-r2.png) | Ivory backing shown without a photo; the configured person’s photo can fill this opening. |

K09–K12 now have GUI controls for tag position/rotation/scale and text font, size, color, alignment, position and rotation. Empty lettering stays empty. Their appearance remains unapproved.

F03’s large sun dial shows local hours/minutes. The lower dials show day-of-month, weekday and progress through the actual calendar year. The moon uses the existing configured phase sensor or its explicitly selected fallback. Calendar month lengths and leap years are respected. Decorative motion controls do not freeze these readings. This is not a claim to implement every historical astrolabe or planetary measurement.

## Scene edges and approved landscape motion

Start with the new [day close-up](items/sky-registration-day-r1.png) and [night close-up](items/sky-registration-night-r1.png). The mountain guide was retraced against the photograph; a continuous source-pixel fit is shared by the sky/depth masks. Inspect for any remaining bright fringe or misplaced cutout.

The following fresh captures preserve the approved motion behavior and show the revised scene context. **The exact earlier approved files are unchanged.** Open the GIF links to judge motion; static thumbnails cannot show it. Each clip runs at normal renderer speed. L06 starts just before an actual seeded meteor passage so there is no long wait.

| Approved effect | Fresh full view | Fresh close-up |
| --- | --- | --- |
| L01 clouds | [Motion](items/L01-context-r1.gif) | [Close-up](items/L01-context-detail-r1.gif) |
| L02 foliage | [Motion](items/L02-context-r1.gif) | [Close-up](items/L02-context-detail-r1.gif) |
| L03 lake | [Motion](items/L03-context-r1.gif) | [Close-up](items/L03-context-detail-r1.gif) |
| L04 waterfall | [Motion](items/L04-context-r1.gif) | [Close-up](items/L04-context-detail-r1.gif) |
| L05 stars behind clouds | [Motion](items/L05-context-r1.gif) | [Close-up](items/L05-context-detail-r1.gif) |
| L06 shooting star | [Motion](items/L06-context-r1.gif) | [Close-up](items/L06-context-detail-r1.gif) |

These two effects still require approval:

| Item | New full view | New close-up | Change |
| --- | --- | --- | --- |
| L07 window lights | [Revision 4](items/L07-r4.gif) | [Close-up](items/L07-detail-r4.gif) | Independent local brightness changes, rather than repainting the same bright pixels. |
| L08 fireflies | [Revision 4](items/L08-r4.gif) | [Close-up](items/L08-detail-r4.gif) | More visible green light and wandering paths positioned inside the visible foreground opening. |

## Wind, ice, materials and curved readouts

| Item | New example | Change |
| --- | --- | --- |
| W07 wind | [Revision 4 motion](items/W07-r4.gif) | Varied gust paths and individual tumbling. Runtime speed uses the existing weather entity’s wind attributes when available. |
| W09 ice | [Revision 4 growth](items/W09-r4.gif) · [completed frost](items/W09-r4.png) | Confined to the central castle opening; staggered inward crystal growth. The full growth clip is 28 seconds. |
| P02 hammered metal | [Revision 3](items/P02-r3.png) | One continuous texture across the dial, replacing the repeating grid. |
| P03 parchment | [Revision 3](items/P03-r3.png) | Continuous paper grain without repeated tiles. |
| P04 wood | [Revision 3](items/P04-r3.png) | Continuous wood grain without repeated tiles. |
| B01 brass | [Curved readouts](items/B01-r3.png) | Text follows and fits the bezel’s information band. |
| B02 silver | [Curved readouts](items/B02-r3.png) | Same independent readout fitting. |
| B03 carved wood | [Curved readouts](items/B03-r3.png) | Same fitting; approved frame appearance retained. |

W01–W06, W08 and W10 remain approved. Their effects have not been redesigned. Fresh context stills show the shared scene correction: [W01](items/W01-context-r1.png), [W02](items/W02-context-r1.png), [W03](items/W03-context-r1.png), [W04](items/W04-context-r1.png), [W05](items/W05-context-r1.png), [W06](items/W06-context-r1.png), [W08](items/W08-context-r1.png), [W10](items/W10-context-r1.png). These are stills for inspecting the backdrop, not new animation samples.

## Moon brightness

Each sheet shows the same runtime phase on night and blue backgrounds plus a new clock capture. The illuminated surface is 12% brighter; the dark hemisphere still reveals the actual background. The approved lunar surface artwork itself is unchanged.

[N01 new](items/N01-r4.png) · [N02 waxing crescent](items/N02-r4.png) · [N03 first quarter](items/N03-r4.png) · [N04 waxing gibbous](items/N04-r4.png) · [N05 full](items/N05-r4.png) · [N06 waning gibbous](items/N06-r4.png) · [N07 last quarter](items/N07-r4.png) · [N08 waning crescent](items/N08-r4.png)

## Guide and approval

[Detailed configuration guide](../WORLD-GUIDE.md) covers the functional dials, sensor/fallback behavior, tag settings, wind units, frost, and curved bezel text. These are review-branch features; installation remains through HACS after an approved release.

Approve or revise individual IDs as before. New context samples do not reset your existing effect approvals. [Decision record](APPROVALS.md) · [Complete gallery](README.md).
