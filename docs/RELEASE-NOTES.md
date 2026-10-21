# Magical Family Clock 0.3.0 — Design Studio

Configure people once, reuse them across clocks, and design an animated family clock in the visual editor.

- **Saved people:** account-stored sensor/appearance profiles with independent copies and destination remapping between clocks.
- **Dimensional hands:** new silhouettes, materials, finishes and relief controls. Empty lettering stays empty. Names fit inside the filled surface, with stem or spoon/pointer-tip placement, parallel/perpendicular direction, an independent rotation angle and optional upright flipping.
- **A working-looking mechanism:** connected involute gears with correct contact directions, tooth-count speed ratios and synchronized tooth/gap phase.
- **Sharper animated castle:** full 1254-pixel sources, scalable frame, moving clouds, ripples, window lights, seasonal detail and fireflies, plus weather overlays and reduced-motion controls.
- **Editable face text:** move/style/remove titles and captions on any face; customize fixed or sensor-driven location labels independently of tracking rules.
- **Information bezel:** up to sixteen sensor, time, date or fixed-text readouts, with formatting and style controls.
- **More visual effects:** shadows, bevel, reflection, glare, patina and wear for individual components.
- **Face cycling:** swipe, click, keyboard or optional timer switches templates while keeping the same people and sensor data.
- **Improved design editor:** persistent live preview, current-image request handling, image retry, retained open sections and inline explanations.

Image uploads, complete saved clocks, sensor rules, optional hand readings and privacy-safe exports remain included. Existing version-1 configurations and the separate original clock element remain supported.

## Install or update with HACS

1. Open **HACS → Magical Family Clock** and download/update to **0.3.0**.
2. Reload the Home Assistant frontend; hard-refresh or clear the frontend cache if the older editor remains visible.
3. Edit your clock to use the new controls, and finish with Home Assistant's **Save** action.

For a first install, add `https://github.com/deadmeat75/magical-family-clock` through **HACS → Custom repositories**, category **Dashboard**. Choose **Magical Family Clock (HACS)** in the card picker. The card type remains `custom:magical-family-clock-card`; HACS manages the JavaScript resource.

[Detailed installation/user guide](https://github.com/deadmeat75/magical-family-clock/blob/v0.3.0/docs/USER-GUIDE.md) · [Design Studio guide](https://github.com/deadmeat75/magical-family-clock/blob/v0.3.0/docs/DESIGN-STUDIO.md)

## Verification and limits

Passed **44 unit/packaging checks and 37 Chromium browser checks**, including coexistence with the exact supplied legacy card. Isolated Home Assistant 2026.10.2 checks verified native selectors, saved people and clocks, image persistence, blank names, title placement, bezel, face switching and dashboard reload with zero frontend exceptions. No user's live installation was changed.

Profiles and saved clocks belong to the signed-in Home Assistant account; additions are independent copies. Image/card/library limits and practical readability limits apply. Authenticated HACS installation/update remains unverified, and inclusion in the default HACS store is not claimed. Repository description/topics remain owner-managed metadata; see the publishing-status document for current validation results. WebKit and older-iPad testing remain outside acceptance at the user's request.
