# iPhone and iPad compatibility — 0.4.5

The reported failure was reproduced with the production bundle in WebKit: moving water and foreground foliage appeared as oversized rectangles across the lower clock, and fog could escape its intended bounds. Element dimensions alone looked correct; pixel comparisons exposed the incorrect composition.

## Update with HACS

If HACS reports **Got more than 8190 bytes when reading**, first follow the [0.4.5 download correction](HACS-DOWNLOAD.md). That error prevents installation; frontend cache clearing alone cannot fix it.

1. Open **HACS → Magical Family Clock → Download/update** and select **0.4.5** or newer.
2. Reload the Home Assistant frontend. Fully close and reopen the iPhone/iPad companion app if it still displays cached artwork. If necessary, use **Settings → Companion app → Debugging → Reset frontend cache**, then reopen it (menu wording can vary).
3. Keep your saved people, tracking rules and clock configuration. No YAML conversion or dashboard reconstruction is required.
4. Check water and fog, rotate the device, then open and close **Fullscreen**. The moving scene should remain inside the central opening.

If still using 0.4.1 while updating, turn **Living world → Show miniature world** off and select **Clear** weather. Merely pausing motion leaves the original canvas surfaces present, so it does not reliably avoid the rendering defect. Restore your preferred effects after updating.

## If the picture fits but does not move

Version 0.4.3 adds animation recovery after returning to Home Assistant and a check that explains the effective motion settings. The user confirmed that animation is now working on iOS, but reported choppy motion. Version 0.4.4 reduces the frame workload and improves pacing; physical-device smoothness remains unverified. The recovery tests simulate dropped callbacks in WebKit.

1. Edit the card and open **Living world**. Confirm **Installed card version: 0.4.5** (or newer). If it still shows an older version or has no **Check animation** button, reload the frontend/reset the companion frontend cache after the HACS update.
2. Press **Check animation** with the right-hand clock preview visible. It checks actual scenery frame publication as well as elapsed animation time.
3. If it names **General → Reduced motion**, turn that card setting off if you want animation. This setting is independent of the iOS accessibility preference.
4. If it names **Animate castle scenery**, enable that setting under **Living world**. Enable **Show miniature world** and at least one landscape effect such as water, trees or waterfalls too. Clouds are intentionally absent in Clear weather.
5. A device-preference message means the browser itself reports Reduce Motion, even if the setting appears off in iOS. The clock continues to honor that preference.
6. If the check reports **Animation is running** but the picture is still, report that exact result. If it reports **The scenery did not advance**, save the card, return to the dashboard, reopen the editor and check once more; report the result if it persists. A separate **scene clock is running, but no new picture was published** message identifies a frame-publication problem.
7. Switch away from Home Assistant, return, and try expanded view. Recovery preserves the scene's elapsed time instead of restarting encounters. It never enables motion settings you have disabled.

Flying visitors now follow individual rising/falling curves with gentle speed changes and banking. Entry and exit remain beyond the circular face. Grounded and aquatic inhabitants retain their appropriate placement.

## What changed

On WebKit, the animation painter now draws to offscreen canvases and publishes bounded native SVG image surfaces. SVG performs their scaling, masking and circular clipping. Consecutive landscape effects share one composited surface, with their sky/lake clips applied while painting. Each surface has at most one pending frame and one displayed frame; the native SVG image decodes its own frame, without a second HTML-image pre-decode; temporary URLs are revoked on replacement or teardown. As of 0.4.4, moving scenery targets 30 fps in Rich/Balanced and 20 fps in Light, using 384-pixel buffers on this path; the underlying castle photograph retains its 1254-pixel resolution, and SVG hands and creature movement continue independently.

Tree patches and mobile water pixels are prepared at animation resolution once, avoiding repeated full-image strip scaling. Stable deadlines avoid refresh-rate rounding losses. A busy surface is not repainted until its previous image finishes loading. Frame-rate targets are not guarantees of physical-device performance.

Chromium retains direct canvas painting. Both paths use the same painted scene, silhouette and effect settings. Fog uses drifting shapes with transparent gradients without the displacement-filter composition problem.

Bundled bitmaps use shared document URLs rather than duplicated base64 text in every mask, hand and creature part. Registered seasonal imagery uses binary blobs; this also avoids large PNG data strings when a browser cannot encode WebP. Decoded image cache capacity is eight (previously 24), world source cache capacity is two (previously four), and foliage and lamp extraction run only when required.

## Verification and limits

Version 0.4.4 passes **69 unit/packaging and 98 browser checks** locally and in exact-commit main CI (86 Chromium, six phone WebKit and six tablet WebKit). The installed Home Assistant WebKit dashboard also verifies Randomize preserves household data and reload restores the saved design. A fixed desktop software-WebKit sample improved from 2 to 19.5 published scenery fps, with no duplicate HTML-image frame decodes. Physical iPhone/iPad smoothness is not yet verified. [Current acceptance](SMOOTH-MOTION-ACCEPTANCE.json).

Version 0.4.3 passes **64 unit/packaging and 95 browser checks** locally and in exact-commit GitHub CI (85 Chromium, five phone WebKit and five tablet WebKit). The installed Home Assistant WebKit dashboard passes motion/live moon checks with six hands and six inhabitants, and its Chromium native editor passes the animation-check action. [0.4.3 acceptance](IOS-MOTION-RECOVERY.json). The user now reports that iOS animation works; physical-device smoothness still needs confirmation.

The 0.4.2 baseline passed all 63 unit/packaging checks and 89 browser checks (83 Chromium, three WebKit phone and three WebKit tablet). The installed Home Assistant 2026.10.2 dashboard also passed WebKit surface, motion and live-moon updates with six hands, six inhabitants and zero frontend exceptions. [Machine-readable evidence](IOS-ACCEPTANCE.json).

[WebKit phone example](ios-webkit-phone.png) · [WebKit tablet example](ios-webkit-tablet.png). These are browser-automation screenshots, not physical-device photographs.


The browser matrix includes Chromium and WebKit with a 440 × 956 phone viewport and an 820 × 1180 tablet viewport, plus rotated views. Production-bundle checks compare painted pixels outside the central opening, exercise expanded-view motion and pause, and repeatedly remove/reinsert dashboard cards while checking temporary URL cleanup and compact markup. These tests reproduce the original clipping failure; a check of DOM dimensions alone did not.

This is desktop WebKit automation with mobile viewport/touch settings, not a physical iPhone 16 Pro Max, 2024 iPad Air, or authenticated iOS Home Assistant companion-app test. The identified rendering failure is reproduced and corrected; device-specific app crashes still need confirmation on the user's devices after updating.

## GitHub emails

The animation-check regression on documentation commit `4e112ca` checked a preview that had scrolled outside the viewport. That test now explicitly scrolls the clock into view and waits for visibility before asserting motion. Required browser checks remain enabled.

The email naming review commit `a140cec` corresponds to a meteor pixel test that selected a random event outside the visible clock opening. That check now uses a known visible trajectory. Fullscreen checks already wait for the asynchronous transition. Normal CI runs on main and pull requests, and superseded runs are cancelled; duplicate review-branch and tag push test workflows are avoided. Release builds still run all required tests.

HACS validation also reports missing repository About description and topics. GitHub's connected integration returns HTTP 403 when attempting to edit those owner-level fields. The owner can set the description and topics listed in [publication status](PUBLISHING-STATUS.md), then rerun HACS validation. These checks remain enabled; changing your Home Assistant settings will not fix repository metadata errors.


## Smoother motion and Randomize (0.4.4)

The user reports that iOS animation is working after the recovery update. This release addresses choppiness by reducing per-frame work and improving deadline scheduling. For a busy clock, try **World detail → Balanced** first, then Light if needed. These retain the HD base image. The new **Randomize** button is opposite Fullscreen and preserves saved household data. [Detailed guide](RANDOMIZE.md) · [Current acceptance](SMOOTH-MOTION-ACCEPTANCE.json).
