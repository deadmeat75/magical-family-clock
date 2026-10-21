# Version 0.2.0

This release implements the requested improvements. Install and update version `v0.2.0` through HACS. The user's live Home Assistant installation and original clock are unchanged; installation remains an explicit user action.

## Included

- Visual PNG/JPEG/WebP uploads with preview, optimization, remove actions and optional URL entry; embedded in dashboard configuration.
- Complete named clock library in Home Assistant account storage, with preview, independent loading, duplicate, rename and delete.
- Aged brass surfaces and engraved hand names; original handmade Whimsical Workshop face.
- Editable/removable captions across bundled faces, more fonts, independent text sizing, theme color overrides, per-hand width and additional arrow/leaf/sword shapes.
- Clearer seasonal castle grading and independent animated weather: gentle/heavy rain, snow, sleet, clouds, wind, fog, frost/ice and occasional lightning.
- Manual weather intensity, static weather, device reduced-motion support and offscreen pause; custom season/time/weather scene uploads.
- Discovery from available zone and selected location sensor states, optional runtime locations, and per-person entity/attribute rules.
- Up to four optional, formatted entity/attribute readings per hand, with above/below/beside placement and unavailable-value hiding.
- Prominent setup actions, collapsible advanced controls, explanations, upload errors and a detailed expanded [user guide](USER-GUIDE.md).

## Validation

**Passed:** build, 31 unit/packaging checks and 22 Chromium browser checks, including coexistence with the exact supplied legacy card.

The prior regression suite plus new checks cover image upload and unsafe format rejection, full clock library CRUD and independent copies, location rules, dynamic locations, metric formatting, missing readings, caption text safety, per-hand updates without replacing SVG nodes, and all weather effect types.

Real Home Assistant 2026.10.2 was tested in a disposable isolated instance: account-storage save/read/rename/delete, actual GUI portrait upload, full saved-clock loading after page reload, dashboard save/reload with embedded portrait persistence, live state movement and native entity selection. No frontend exceptions were observed. HACS authenticated repository install/update remains an existing unverified step. WebKit and older-iPad testing are excluded as requested.

## Practical limits

Uploaded images are embedded, rather than written into Home Assistant's file storage. Each optimized image is limited to two million encoded characters, a complete card to 2.5 MB and the account library to 3 MB/30 entries. Home Assistant's dashboard transport also limits the total save message: use smaller images or shared `/local/` URLs for multiple image-heavy cards. Full exports and account library entries contain household details and images. Privacy-safe exports remove optional readings, rules and custom captions as well as older personal fields.

The library belongs to the signed-in account. Copies are independent, not linked templates; simultaneous library edits across devices use Home Assistant's last-write-wins store. No cross-account sharing or automatic deployment is implied. Advanced numerical rules use the reported sensor units. Dynamic labels may redistribute angles as data changes. Existing raster face labels cannot be edited away; use unlettered uploads.
