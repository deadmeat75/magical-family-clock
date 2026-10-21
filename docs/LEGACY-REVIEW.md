# Review of the supplied references

## What was inspected

The user supplied `magical-family-clock.js`, `index.html`, `SHA256SUMS.txt`, an earlier `IMPLEMENTATION-PLAN.md`, a spoon-clock photograph, and a complete castle clock-face image in chat.

The attached plan is an earlier planning document, not a new instruction to deploy or replace anything. Its initial statement that source was unavailable describes that earlier stage. Its proposed 16-scene system and precise ±30-minute solar windows are not features present in either supplied working implementation, and are not claimed as implemented by this review.

The supplied JavaScript SHA-256 is:

```
2175121f6813aa6284db580caf36f869f39cbe7cc914d4ae82b5ed1cdbd348fe
```

It matches `SHA256SUMS.txt`. That list covers only the JavaScript. Locally calculated hashes for all four file attachments are recorded at `/workspace/magical-clock-reference/reference-hashes.json`; unchanged copies are at `/workspace/magical-clock-reference/originals`. They are outside the public checkout and were not overwritten, reformatted, or bundled into the release asset. The standalone hash is `e72cbada162aaad3c5793a42cfab3cdc60003f32508d1c3498e558324751fbb3`.

The chat images were visually inspected. No claim is made that their original image bytes were downloaded, hashed, separated into layers, or relicensed. The candidate can read your existing face image through its normal Home Assistant URL.

## Important differences between the two implementations

| Behavior | Home Assistant JavaScript | Standalone HTML |
| --- | --- | --- |
| Runtime | Lovelace `hass` property | Same-origin OAuth/PKCE and WebSocket client |
| Custom element | `magical-family-clock` | No card registration |
| Coordinates | Canvas 700 × 700 | SVG 700 × 700 |
| Shared pivot | (350, 350), 50% height | (350, 329), 47% height |
| Hand length | 252 units | Pointed silhouette extending 258 units |
| Shared-location spacing | 12° | 17° |
| Shape | Four quadratic curves | Decorative angular point with cubic base |
| Names | Along the stem, flip only when upside down; fitted font | Along the stem with fixed −90° local rotation |
| Layering | Indy, Lillie, Krystal, Andrew on top | Krystal, Lillie, Indy, Andrew on top |
| Unknown state | Omits that person's hand | Falls back to Away |
| Matching | Exact six state strings | Case folding plus workplace/school/home keyword fallbacks |
| Movement | Shortest-path easing | Rebuilds hand SVG on state events, with no hand transition |

The standalone's top-relative angles convert to the same right-relative destination angles as the canvas: Home −90°, Work 180°, School 0°, Gym 90°, Away 45°, Travelling −135°. Its pivot is genuinely different; it must not be silently treated as the centered canvas variant. The supplied image's hub appears above the square's geometric center, so exact artwork alignment still needs visual confirmation with the actual image URL.

Verified household colors differ too; see [advanced examples](EXAMPLES.md). The earlier written sample color preferences are not substituted for the values in these supplied sources. Neither file subscribes to the optional travelling binary sensors described in the master specification.

## Changes made to the separate candidate

- Changed its type to `custom:magical-family-clock-card` and editor to `magical-family-clock-card-editor`. The existing `magical-family-clock` registration remains untouched. The HACS asset filename remains `magical-family-clock.js` in its own checkout/install location; it must never be copied over the existing `/local/magical-clock/` file.
- Added the source-defined curved silhouette, with control points scaled exactly from 700 to 600 coordinates. Living Magical uses it by default; each person can choose another style.
- Added the standalone pointed silhouette as a separate choice, not a replacement for the curved version.
- Added along-hand names with the source's upright flip rule. A short-lived animation-frame tracker follows actual CSS rotation while the hand moves; it is canceled on disconnection. Portrait rotation remains independent.
- Added optional legacy layouts with six verified destinations, 12°/17° spacing and 50%/47% pivots. They preserve already-configured people and colors and contain no personal names or entity bindings.
- Added a complete clock-face image setting and adjustable pivot coordinates. Images preload before replacing the bundled face, and a failed face load leaves usable fallback artwork and labels.
- Kept all enabled hands for unknown/missing states. Omitting them, as the old canvas source does, would reintroduce the reported disappearing-hand behavior. Personal state mappings remain explicit; broad workplace keyword guesses from the standalone are not silently applied to every household.
- Retained stable person IDs for collision grouping, rather than identifying people by name. Duplicate names therefore cannot collapse into one fan position.

Source proportions, layout and text flip logic are reused; the new SVG render pipeline uses duration-based CSS movement rather than claiming byte-for-byte or pixel-for-pixel equivalence with the canvas renderer. The reference photograph is design inspiration, not bundled redistributable artwork.

## Artwork and scene boundaries

The supplied castle image visibly contains the colored segments, labels, gold rings, hub and landscape in one flattened composition. The spoon photograph represents a different physical clock. Neither is an existing transparent frame/landscape pair.

Reading the complete castle image preserves its pixels. Placing a new sky behind an opaque image cannot replace the castle scene. A faithful dynamic version needs a separately prepared frame/label overlay and aligned landscape layers. The subsequent implementation now includes a generated transparent frame derivative and sixteen original scene tiles. This is not a lossless extraction of the supplied pixels. The originals remain unchanged; see ARTWORK.md. A complete opaque face remains a static option, while the layered castle option exposes the new scenes.

## Validation

Unit checks compare the curved path control points with the original canvas equations, verify all six angles and both pivots/spacings, check the upright flip rule through multiple full rotations, and verify four shared-location hands plus unknown fallback.

The Chromium coexistence test was run with `MFC_LEGACY_JS` pointing to the exact preserved legacy JavaScript. It verifies separate constructors and picker registrations. Other browser checks verify custom-face loading, pivot alignment, failed-image fallback, and all prior editor/card behavior. Tests use a synthetic image fixture; pixel-perfect comparison to the actual installed artwork is still pending.

No source was deployed to the user’s Home Assistant. The candidate was subsequently exercised in a separate disposable Home Assistant 2026.10.2 container. No existing clock, standalone page, dashboard, helper, entity, or automation was changed. Real Home Assistant dashboard/selector acceptance was subsequently verified; authenticated HACS custom-repository installation/update remains pending; WebKit and physical iOS 12 testing are outside the release requirements as described in [VALIDATION.md](VALIDATION.md).
