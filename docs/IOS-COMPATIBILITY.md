# iPhone and iPad rendering correction — 0.4.2

The reported failure was reproduced with the production bundle in WebKit: moving water and foreground foliage appeared as oversized rectangles across the lower clock, and fog could escape its intended bounds. Element dimensions alone looked correct; pixel comparisons exposed the incorrect composition.

## Update with HACS

1. Open **HACS → Magical Family Clock → Download/update** and select **0.4.2** or newer.
2. Reload the Home Assistant frontend. Fully close and reopen the iPhone/iPad companion app if it still displays cached artwork. If necessary, use **Settings → Companion app → Debugging → Reset frontend cache**, then reopen it (menu wording can vary).
3. Keep your saved people, tracking rules and clock configuration. No YAML conversion or dashboard reconstruction is required.
4. Check water and fog, rotate the device, then open and close **Fullscreen**. The moving scene should remain inside the central opening.

If still using 0.4.1 while updating, turn **Living world → Show miniature world** off and select **Clear** weather. Merely pausing motion leaves the original canvas surfaces present, so it does not reliably avoid the rendering defect. Restore your preferred effects after updating.

## What changed

On WebKit, the animation painter now draws to offscreen canvases and publishes bounded native SVG image surfaces. SVG performs their scaling, masking and circular clipping. Consecutive landscape effects share one composited surface, with their sky/lake clips applied while painting. Each surface has at most one image encode/decode in flight and one displayed frame; temporary URLs are revoked on replacement or teardown. Moving scenery runs at up to 12 frames per second in 384-pixel buffers on this path; the underlying castle photograph retains its 1254-pixel resolution, and SVG hands and creature movement continue independently.

Chromium retains direct canvas painting. Both paths use the same painted scene, silhouette and effect settings. Fog uses drifting shapes with transparent gradients without the displacement-filter composition problem.

Bundled bitmaps use shared document URLs rather than duplicated base64 text in every mask, hand and creature part. Registered seasonal imagery uses binary blobs; this also avoids large PNG data strings when a browser cannot encode WebP. Decoded image cache capacity is eight (previously 24), world source cache capacity is two (previously four), and foliage and lamp extraction run only when required.

## Verification and limits

All 63 unit/packaging checks and 89 browser checks passed (83 Chromium, three WebKit phone and three WebKit tablet). The installed Home Assistant 2026.10.2 dashboard also passed WebKit surface, motion and live-moon updates with six hands, six inhabitants and zero frontend exceptions. [Machine-readable evidence](IOS-ACCEPTANCE.json).

[WebKit phone example](ios-webkit-phone.png) · [WebKit tablet example](ios-webkit-tablet.png). These are browser-automation screenshots, not physical-device photographs.


The browser matrix includes Chromium and WebKit with a 440 × 956 phone viewport and an 820 × 1180 tablet viewport, plus rotated views. Production-bundle checks compare painted pixels outside the central opening, exercise expanded-view motion and pause, and repeatedly remove/reinsert dashboard cards while checking temporary URL cleanup and compact markup. These tests reproduce the original clipping failure; a check of DOM dimensions alone did not.

This is desktop WebKit automation with mobile viewport/touch settings, not a physical iPhone 16 Pro Max, 2024 iPad Air, or authenticated iOS Home Assistant companion-app test. The identified rendering failure is reproduced and corrected; device-specific app crashes still need confirmation on the user's devices after updating.

## GitHub emails

The email naming review commit `a140cec` corresponds to a meteor pixel test that selected a random event outside the visible clock opening. That check now uses a known visible trajectory. Fullscreen checks already wait for the asynchronous transition. Normal CI runs on main and pull requests, and superseded runs are cancelled; duplicate review-branch and tag push test workflows are avoided. Release builds still run all required tests.

HACS validation also reports missing repository About description and topics. GitHub's connected integration returns HTTP 403 when attempting to edit those owner-level fields. The owner can set the description and topics listed in [publication status](PUBLISHING-STATUS.md), then rerun HACS validation. These checks remain enabled; changing your Home Assistant settings will not fix repository metadata errors.
