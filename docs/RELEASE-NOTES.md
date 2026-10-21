# Magical Family Clock 0.1.0-rc.1

Initial public release candidate of a customizable Home Assistant dashboard card.

- Three themes, a visual editor and guided setup, independent clock instances, portraits, location aliases and personal state mappings.
- Separate generated transparent castle frame and sixteen bundled seasonal/time-of-day scenes, with preloading, crossfades, and failed-image fallback.
- Source-aligned curved/pointed hands, upright names, configurable pivot, shared-location separation and retained hands for unknown states.
- Self-contained `magical-family-clock.js` asset, HACS metadata, documentation, screenshots and automated checks.

The new card type is `custom:magical-family-clock-card`. Existing `magical-family-clock` installations remain separate.

Home Assistant 2026.10.2 was exercised in an isolated test container. Real dashboard saving/reload, state-driven movement and native selector registration passed. Chromium is the supported tested browser target for this candidate; WebKit and older iPad testing are outside release acceptance and compatibility is unverified.

HACS 2.0.5 was installed into the isolated test instance and its setup form loaded. End-to-end authenticated GitHub custom-repository installation/update is still pending. This candidate is not approved for the public HACS default store. In HACS, add this public repository as a Dashboard custom repository and choose the candidate/default branch as available.

The castle frame is a generated derivative of the user-provided visual reference, not a lossless extraction. Scene illustrations are generated original artwork. The original clock and source attachments were left unchanged.
