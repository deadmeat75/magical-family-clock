# Magical Family Clock

**Version 0.3.0 — Design Studio:** save people once and reuse them across clocks, customize dimensional hands and fitted lettering, animate meshing gears and sharper castle scenes, add an information bezel, move and style text, and swipe between faces. The live editor preview includes clearer guidance and image recovery. See the [detailed Design Studio guide](docs/DESIGN-STUDIO.md).

Image uploads, saved clocks, animated weather, sensor rules and optional hand data remain included. Install and update through HACS using this repository as a Dashboard custom repository. Start with the [installation and user guide](docs/USER-GUIDE.md); [0.2.0 notes](docs/NEXT-VERSION.md) describe the previous release.

An original Home Assistant dashboard card showing your household’s whereabouts on an enchanted clock. Each card has independent people, locations, and appearance.

**Start here: [Detailed installation and user guide](docs/USER-GUIDE.md)** — step-by-step setup, portraits, state mappings, castle scenes, backups, updates and troubleshooting.

**Validation:** real Home Assistant 2026.10.2 dashboard saving/reload, live state updates and native selector loading have been verified in an isolated instance. Authenticated HACS custom-repository installation/update remains pending. This project has not been approved for the HACS default store. WebKit and older-iPad testing are outside release requirements; compatibility remains unverified.

| Enchanted Spoons | Brass Clockwork | Living Magical |
| --- | --- | --- |
| ![Parchment spoon clock](docs/enchanted-spoons.png) | ![Brass clock](docs/brass-clockwork.png) | ![Seasonal clock](docs/living-magical.png) |

## Features

- Visual editor and guided setup, entity selectors, people, location dial, portraits, appearance, behavior, and import/export.
- Direct person, device tracker, and sensor states, optional travelling sensors and state attributes. No helpers required.
- Arbitrary locations, aliases, zone-friendly-name matching, and per-person overrides.
- Center-anchored hands, deterministic separation, upright names and portraits, shortest-path movement, reduced motion.
- Independent clocks, complete saved-clock library in Home Assistant account storage, configuration cloning, privacy-safe exports and browser-local appearance presets.
- Original local vector artwork, optional custom images, seasonal/time/weather backgrounds, and fullscreen fallback.
- No external runtime service, analytics, advertising, remote font or separate account. Uploaded images stay in the dashboard configuration.

## HACS installation

The [v0.3.0 release](https://github.com/deadmeat75/magical-family-clock/releases/tag/v0.3.0) includes the self-contained HACS bundle. See [publishing status](docs/PUBLISHING-STATUS.md) for repository metadata requirements and validation limits.

1. Open **HACS → ⋮ → Custom repositories**.
2. Add `https://github.com/deadmeat75/magical-family-clock` as a **Dashboard** repository.
3. Find **Magical Family Clock** and download it.
4. Reload the frontend, edit a dashboard, and choose **Add card → Magical Family Clock (HACS)**.
5. Use **Guided setup**, configure your household, preview, and use Home Assistant’s **Save** button.

HACS normally registers the resource. No npm, SSH, manual copying, or YAML is needed for ordinary configuration. If the card does not appear, check resource registration in HACS and reload the browser cache. Keep existing legacy resources unchanged. The new card registers `magical-family-clock-card` and `magical-family-clock-card-editor`, with card type `custom:magical-family-clock-card`. Your supplied existing card keeps `magical-family-clock`. Both can load together without replacing either registration or resource.

![Layered castle artwork](docs/layered-castle.png)

## Visual configuration

**General:** choose theme, title, maximum size, transparency, and reduced motion. The optional fictional demonstration uses Rowan, Sage, Robin, and Ash. Disable demonstration states before tracking actual entities. No personal household is prepopulated.

**People:** add a person, select a location entity, and optionally select a travelling sensor. Ordinary `person` and `device_tracker` states need no attribute or helper. Add an attribute only when your sensor stores its location there. Save reusable people profiles in your Home Assistant account. Choose materials, shapes, width, length, lettering placement/direction/rotation, priority and portraits. Blank lettering stays blank. Reorder, disable, or remove people without affecting another clock.

**Locations:** enter custom names and exact matching states, one per line. `home` and `not_home` are typical person states. Custom zones usually produce their friendly names; never assume they produce a literal ID such as `zone.office`. Selecting a zone adds its friendly name to matching; explicitly list a zone ID only if the source entity actually returns it. Per-person mappings take precedence. Drag dots around the dial, use arrow keys, or distribute evenly. Zero degrees points right; −90 points up.

**Portraits:** use the visual PNG/JPEG/WebP upload control, or an existing accessible image URL such as `/local/portraits/person.jpg`. Uploads are optimized and embedded in the card configuration. Adjust crop position, zoom, shape, frame and rotation. Initials provide a fallback. Protected `media-source://` links are not resolved. Images are never uploaded to a third party by this card.

**Appearance:** choose **Use layered castle artwork** for a scalable gold/stained-glass frame, full-size castle sources, sixteen season/time combinations and moving scenery. This applies the six reference locations and raised pivot while preserving people and colors. The labels and layout remain editable on the castle. Manual season/time controls preview each combination. Automatic mode uses Home Assistant’s timezone, location and sun events, retaining recent events across timestamp rollover. Dawn/dusk cover ±30 minutes; calculated solar times provide a reload fallback and can differ slightly from Home Assistant’s exact astronomy. Missing solar data has a stable day fallback. Images preload before crossfading, and failed custom images retain the previous scene.

**Design Studio:** **Labels & effects** positions/styles titles and captions and adjusts shadows, bevels, reflection, glare, patina and wear. **Locations** supports fixed or sensor-driven labels with independent typography and positions. **Bezel** adds sensor/time/date/text readouts. **Face cycling** switches templates by swipe, click, keyboard or an optional timer while retaining the same household data. See the [step-by-step guide](docs/DESIGN-STUDIO.md).

**Behavior:** select hand duration, separation, fan/stack arrangement, and fallback locations for unknown and travelling states. Very large groups can still become crowded. The safeguard is 250 people and 250 locations per clock; smaller groups are recommended for readable portraits.

**Presets:** export/import JSON in the editor. Default exports remove personal names, entity IDs, portraits, custom images, zone mappings, and location names. Explicitly enable personal details only for private backups. Review exports before sharing. Browser-local appearance presets store visual settings only. Use **Saved clocks** to save complete clocks in your Home Assistant account and load independent copies on other dashboards. The library includes people, rules and images. Home Assistant’s duplicate card action and full JSON clones remain available.

**Fullscreen:** the button enters and exits fullscreen. Browsers without a usable native API get an in-page expanded view with the same exit button. No additional credentials or dedicated panel is needed.

## Troubleshooting and FAQ

- **Unknown location:** inspect the selected entity’s actual state and mappings. Missing/unmatched states use the configured fallback.
- **Crowded people:** increase separation, reduce portrait size, choose stacked mode, or split people across clocks. Unlimited legibility cannot be guaranteed on a finite screen.
- **Missing image:** try the same path in your authenticated Home Assistant browser. Prefer local paths or HTTPS; mixed-content HTTP can be blocked.
- **Updates:** reload the frontend after HACS updates. Avoid registering the same bundle twice.
- **Old iPad:** the bundle targets ES2018 and Safari 12, avoids WebGL and `crypto.randomUUID`, and guards visibility/fullscreen APIs. Actual iOS 12.5.8 support is unverified, and the host Home Assistant frontend may require newer Safari. Use numeric angle controls if dragging is unavailable.
- **Several clocks:** all instance state is separate. Appearance presets change a card only when explicitly loaded.
- **Privacy:** no telemetry or external runtime dependencies. Image hosts you explicitly configure receive normal browser image requests.
- **Time display:** this is a location clock, not an hour/minute clock.

See [validation and limitations](docs/VALIDATION.md), [advanced examples](docs/EXAMPLES.md), and [release checklist](docs/RELEASE.md).

## Development

Use Node 22 or newer and the existing checkout. Each Codex task is already isolated; do not create another Git worktree unless requested.

```sh
npm ci --cache /workspace/.cache/npm
npm run build
npm test
npm run dev
MFC_CHROMIUM=/usr/bin/chromium npm run test:browser -- --project=chromium
```

The fixture uses fictional people and simulated states. Move the household, open the editor, or add `?production` to exercise the compiled bundle. Native selectors were additionally exercised in Home Assistant 2026.10.2; the isolated fixture tests their property/event contract.

For Chromium tests on a machine with download access:

```sh
PLAYWRIGHT_BROWSERS_PATH=/workspace/.cache/ms-playwright npx playwright install chromium
PLAYWRIGHT_BROWSERS_PATH=/workspace/.cache/ms-playwright npm run test:browser
```

The root `magical-family-clock.js` bundle is self-contained and must be rebuilt with source changes. HACS metadata follows the [official plugin structure](https://www.hacs.xyz/docs/publish/plugin/) and [manifest requirements](https://www.hacs.xyz/docs/publish/start/), checked at `hacs/documentation` commit `4f06a5bd11088a21a453fdcb3eda1603353e6c8a`.

## Legacy provenance

The initial checkout contained only its title README. Subsequently supplied Home Assistant JavaScript, standalone HTML, checksum list, implementation plan, and clock-face reference were inspected. The JavaScript SHA-256 matches the supplied checksum. Unchanged originals are preserved outside the public checkout at `/workspace/magical-clock-reference/originals`.

The supplied Home Assistant card and standalone use different colors, silhouettes, separation, and pivot height. The editor offers their layouts separately. The Living Magical theme uses the supplied curved hand geometry, scaled from 700 to 600 units, with names along the hand and the original upright flip rule. A pointed standalone style is also selectable. See [source comparison](docs/LEGACY-REVIEW.md) for verified values and deliberate safety improvements.

To reuse your existing artwork in a new card, select a reference layout and set **Complete clock-face image URL** (the supplied code uses `/local/magical-clock/clock-face.png`). This reads the image without changing it. Set pivot alignment in Appearance; the canvas source uses 50% height, while the standalone uses 47%. A whole opaque clock face includes its landscape. The layered castle option instead uses a separately generated transparent derivative of your reference and original scene artwork; it is not a lossless extraction. Originals remain unchanged. See [artwork notes](docs/ARTWORK.md).

No live Home Assistant resources, dashboards, helpers, or automations were accessed or modified.

MIT licensed for project source and artwork. SunCalc is bundled under BSD-2-Clause, with its notice in the bundle and [license](docs/SUNCALC-LICENSE.txt). Unchanged supplied source attachments are not part of the public checkout.
