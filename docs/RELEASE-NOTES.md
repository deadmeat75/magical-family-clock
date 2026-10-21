# Magical Family Clock 0.2.0

A visual setup and customization release for the Home Assistant dashboard card.

- Upload portraits, faces and backgrounds in the editor, with optimization and previews.
- Save complete named clocks in your Home Assistant account; preview, duplicate, rename, delete and load independent copies on other dashboards.
- Realistic aged brass and original handmade Whimsical Workshop faces, engraved hand lettering, editable/removable captions, more fonts and colors, adjustable hand widths and additional shapes.
- Clearer seasonal castle scenes with independent animated rain, snow, sleet, clouds, wind, fog, ice and lightning, plus static/reduced-motion settings and combination-specific image uploads.
- Discover locations from available state data, configure sensor-based destination rules, and display optional speed, battery, room or other scalar readings on each hand.
- Friendlier editor actions, collapsible advanced controls and an expanded illustrated user guide.

## Install or update using HACS

Add `https://github.com/deadmeat75/magical-family-clock` as a **Dashboard** custom repository in HACS if not already present. Download/update to **0.2.0**, reload the frontend, and use **Magical Family Clock (HACS)**. The card type remains `custom:magical-family-clock-card`. No manual resource upload is needed for a HACS installation.

If you previously added a temporary `/local/mfc-next/` resource, remove that resource entry and let HACS manage the new card resource. Do not remove the separate original `magical-family-clock` resource or overwrite its files.

## Verification and limits

Passed 31 unit/packaging checks and 22 Chromium browser tests, including coexistence with the supplied legacy card. Isolated Home Assistant 2026.10.2 tests passed dashboard save/reload, native entity selection, image upload persistence and saved-clock account storage with no frontend exceptions.

Saved clocks belong to the signed-in Home Assistant account and load independent copies. Embedded image/card/library size limits apply; see the user guide. No user's live Home Assistant installation was changed. Authenticated HACS installation/update remains unverified, and inclusion in the HACS default store is not claimed. WebKit and older-iPad compatibility remain unverified, as requested.
