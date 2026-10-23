# Randomize the clock’s appearance

Version 0.4.4 adds **Randomize** at the bottom left of every clock card, opposite **Fullscreen**. Click or tap it again whenever you want another combination. It also works in expanded view.

Each click chooses a supported bundled face, a color palette, a season, a time of day, a weather effect and one to three visitors. Visitors keep their appropriate environments: flying creatures follow curved routes, water creatures stay at their waterline, and the unicorn remains on the ground. Omitted artwork and creatures are not offered.

Your people, their photos/names, tracking sensors and rules, destinations, fixed/dynamic location names, live moon sensor and bezel readings remain unchanged. The randomized season/time/weather affect the picture; real sensor values and tracking continue to update normally. Motion preferences and World detail are preserved.

## Return to your saved clock

These changes are temporary and apply only to the card you clicked. The button does not save to Home Assistant or overwrite a stored clock/person profile. Reload the dashboard to restore the saved design. Selecting another saved face in Face cycling, or applying a changed card configuration, also applies its configured appearance. Automatic face cycling pauses while a randomized view is displayed, so it does not immediately replace your selection.

If your saved design uses an uploaded face, randomization temporarily uses the bundled faces; reloading restores your uploaded image and all its settings. It does not delete an uploaded asset.

## If motion is still choppy on iPhone or iPad

Update through HACS to 0.4.4 or newer, reload the frontend and fully reopen the companion app. Start with **World detail → Balanced**; it retains animation while drawing fewer tree regions. **Light** removes moving foliage and uses fewer stars if more reduction is needed. Reduce the number of manually configured visitors on particularly busy clocks. Randomize itself adds at most three.

The WebKit renderer targets 30 frames per second in Rich/Balanced and 20 in Light, with bounded 384-pixel moving layers; the castle base photograph retains its HD resolution. These are targets, not guaranteed device frame rates. The renderer skips work while a previous frame is being published, rather than building a backlog. Reduced motion and hidden/offscreen pauses remain respected.

Use **Living world → Check animation** if the clock becomes completely still. See the [iOS guide](IOS-COMPATIBILITY.md) and [full user guide](USER-GUIDE.md).
