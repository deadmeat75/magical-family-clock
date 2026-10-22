const HELP = {
  name_attachment:
    "Choose engraving or an optional physical tag attached to this hand. A framed portrait uses this person’s photo. Blank hand lettering stays blank.",
  attachment_scale:
    "Size multiplier for the complete tag. Start at 1; use 0.5 for half size. The lettering scales with it.",
  attachment_x:
    "Move the complete tag left (negative) or right (positive), measured in the clock’s 600-unit drawing coordinates.",
  attachment_y:
    "Move the complete tag up (negative) or down (positive) relative to its default position halfway along the hand.",
  attachment_rotation:
    "Rotate the whole tag relative to its hand, including the artwork and lettering. Degrees from -180 to 180.",
  attachment_text_x:
    "Move only the lettering left or right on the tag. These offsets use the larger source-art coordinates; start with changes of 10–20.",
  attachment_text_y:
    "Move only the lettering up or down on the tag. Start at 0 and make changes of 10–20 source-art units.",
  attachment_text_rotation:
    "Rotate lettering relative to the tag. Zero follows the tag’s natural baseline; it does not rotate the artwork.",
  attachment_text_size:
    "Lettering size in source-art units, before the tag is scaled. Start at 68. Adjust to fit your name; the text is not forced into the hand blade.",
  attachment_align:
    "Left, center or right alignment inside the tag’s writing area. Position offsets apply after this alignment.",
  attachment_font:
    "Enter a font family. Caveat is bundled for handwritten ink; Georgia gives formal lettering. Blank selects the style’s default. Lettering color comes from the existing text color picker.",
  name_position:
    "Place the name along the stem or at the spoon/pointer tip. Spoon-tip lettering uses the bowl; pointer-tip lettering fits the solid blade near its point. It never changes a portrait image’s rotation.",
  name_orientation:
    "Parallel runs the letters along the hand. Perpendicular runs them across it. Text is fitted inside the available surface, including narrow stems and cutouts.",
  name_rotation:
    "Rotate only the hand lettering, from -180 to 180 degrees, in addition to the Parallel/Perpendicular choice. Fit is recalculated at the chosen angle.",
  name_upright:
    "Flip lettering as a hand turns so it remains readable. Turn off to preserve your exact text rotation relative to the hand, even when upside down.",

  title:
    "The main heading drawn on the dial. Delete all text to remove it. Each clock keeps its own heading.",
  caption:
    "The smaller line of lettering on the face. Clear it to remove it without replacement text.",
  name: "The person’s normal display name. An empty name stays empty. Use Editor label to identify an unnamed hand in the editor.",
  editor_label:
    "Private label used in the editor and saved people library. It never appears on the clock face.",
  hand_label:
    "Exact lettering engraved on this hand. Clear this field to remove the lettering completely; the sensors still work.",
  nickname:
    "Optional shorter name. Exact hand lettering takes priority when supplied.",
  entity:
    "Choose the existing Home Assistant entity providing this value. A person/device tracker usually reports home, not_home or a zone name; a sensor can report a room or another state.",
  attribute:
    "Leave blank to read the entity state. Enter the exact attribute key, such as battery_level, to read an attribute instead. Find keys under Developer Tools → States.",
  travelling_entity:
    "Optional sensor that explicitly reports travel. States on, true or moving send the hand to your selected Travelling destination before other matching rules.",
  enabled:
    "Show this person without removing their setup. Turning it off keeps the profile and sensor choices but hides the hand.",
  theme:
    "Choose the face’s visual style. People and sensor readings stay the same. Castle scenery is selected separately under Clock artwork.",
  artwork:
    "Use a fully editable dial or the layered castle. The castle has separate scenery, moving layers and a scalable frame. Complete-face uploads cover underlying scenery.",
  size: "Maximum card width in pixels, from 200 to 2000. The card still shrinks to fit its dashboard column; start with 640.",
  aspect_ratio:
    "Width divided by height. Use 1 for a square, greater than 1 for wider spacing, or less than 1 for taller spacing. Valid range 0.6–1.6.",
  reduced_motion:
    "Stop decorative animations and remove motion transitions. Your device’s Reduce Motion preference also applies. Live data still updates.",
  transparent:
    "Remove the rectangular card background so the dashboard shows around the clock.",
  demo: "Use fictional sample states instead of your real sensors. Turn this off before checking household tracking.",
  color:
    "Choose a custom color. For hands and bezels this applies to the Color material; metallic and wood materials have their own natural shading.",
  text_color:
    "Color of the hand’s lettering and portrait fallback initials. Keep sufficient contrast with its material; aged brass usually suits a dark engraving.",
  length:
    "Scale this hand’s length, from 0.5 to 1.1 of the standard length. Use 1 initially; shorten hands when portraits collide with labels.",
  width:
    "Scale the hand’s stem width from 0.5 to 2.5. Portrait size is controlled independently.",
  material:
    "Choose a shaded material such as aged brass, copper, silver, wood or glass. Color uses your custom color with dimensional shading.",
  finish:
    "Polished emphasizes highlights; brushed adds grain; aged adds patina and wear. Combine with the Effects controls for the desired surface.",
  relief:
    "Depth of the hand’s raised edge from 0 (flat edge) to 1 (strong bevel). Material and shape remain independent.",
  hand_design:
    "Choose the hand silhouette. Theme follows the selected face; other choices keep that shape when faces change. Skeleton and filigree include cutouts.",
  duration:
    "Time in milliseconds for a hand to move to a new destination. Use 1000 for one second or 0 for an instant update. Range 0–10000.",
  priority:
    "Higher numbers take precedence. For people, higher numbers draw later on top; for destinations, they are matched before lower-priority destinations.",
  show_name:
    "Show or hide all text naming this hand, including fallback initials. Turning this off does not change location tracking.",
  show_portrait:
    "Show a supplied portrait at the hand tip. With no image, an enabled nonempty name may supply initials; an empty name supplies no initials.",
  portrait_shape:
    "Crop the portrait to an oval or circle. This does not alter the uploaded file.",
  portrait_frame: "Use a brass portrait border or remove the outline.",
  portrait_zoom:
    "Enlarge the image inside its crop from 1 to 4. Start at 1, then use horizontal/vertical position to frame the face.",
  portrait_x:
    "Move the image within the portrait crop horizontally. Range 0–100; 50 centers it.",
  portrait_y:
    "Move the image within the portrait crop vertically. Range 0–100; 50 centers it.",
  portrait_rotation:
    "Rotate only the portrait image, from -180 to 180 degrees. Use 0 for an upright photo.",
  head_size:
    "Scale the portrait frame from 0.6 to 1.5. Start at 1; reduce it if several people share a destination.",
  angle:
    "Destination angle around the dial: -90 is top, 0 is right, 90 is bottom, 180 is left. This controls where hands point; label x/y can move the text separately.",
  states:
    "Exact source states that point to this destination, one per line. Example: home, Office or Kitchen. These are separate from the displayed label.",
  aliases:
    "Additional exact state names accepted for this destination. Add one per line; spelling follows your sensor’s actual reported values.",
  zone: "Optional Home Assistant zone. Matching uses its friendly name, for example Office, rather than assuming the entity ID is returned by a tracker.",
  case_insensitive:
    "Ignore uppercase/lowercase differences when matching states and aliases. Home and home then match the same destination.",
  dynamic_locations:
    "Temporarily add names seen in selected location sensors and available zones. The dial redistributes angles. Leave this off for stable fixed destinations and use per-label sensor naming instead.",
  label_mode:
    "Fixed shows the text you enter. Sensor reads a selected entity state or attribute while preserving this destination’s angle and matching rules.",
  label_entity:
    "Entity supplying this label’s displayed name, for example sensor.alex_room. This changes text only, not the hand’s tracking source.",
  label_attribute:
    "Leave blank for the entity state, or enter an attribute key for the displayed name.",
  label_fallback:
    "Text shown if the label source is missing, unknown or unavailable. It may be blank. Tracking still follows the destination matching rules.",
  radius:
    "Distance of the label from the center in SVG units. Start at 213. Explicit x/y coordinates take priority.",
  x: "Horizontal text position as a percentage of the face. 0 is left, 50 is center, 100 is right. Clear it to return to the destination angle/radius.",
  y: "Vertical text position as a percentage of the face. 0 is top, 50 is center, 100 is bottom. Clear it to return to the destination angle/radius.",
  rotation:
    "Rotate this location’s text from -180 to 180 degrees. 0 keeps it horizontal.",
  season_override:
    "Auto follows the calendar and hemisphere. A manual season stays fixed for previewing or a preferred appearance.",
  period_override:
    "Auto follows the selected sun entity and Home Assistant’s location/timezone. Choose dawn, day, dusk or night to pin the scene.",
  weather_effect:
    "Auto follows your selected weather entity. A manual effect previews that weather in every season and at any time.",
  weather_intensity:
    "Particle density from 0.2 (sparse) to 2 (dense). This is a visual setting, not a weather sensor measurement.",
  weather_motion:
    "Animate rain, snow and other weather marks. Turn off for a static atmospheric overlay.",
  background_mode:
    "Auto selects an environment from available sun/weather/season data. Manual uses the Manual background choice on the generic dial.",
  background:
    "The generic dial’s pinned background when Background mode is Manual. Castle season/time controls are separate.",
  seasonal:
    "Use calendar seasons in automatic generic backgrounds. Castle season selection has its own Auto option.",
  hemisphere:
    "Choose north or south so summer and winter match your region. North is the default.",
  sun_entity:
    "Sun entity used for daylight and dawn/dusk detection, normally sun.sun.",
  weather_entity:
    "Optional weather entity providing conditions such as rainy, snowy or fog. Auto weather uses it; no separate weather service is contacted.",
  brightness:
    "Overall visual brightness from 0.15 to 1.5. Start at 1. This does not dim the physical display.",
  gears:
    "Run the visible gear mechanism on the Clockwork face. Turning it off pauses the gears rather than hiding them.",
  gear_speed:
    "Seconds per revolution of the 40-tooth driving wheel, from 5 to 300. Smaller numbers turn faster. The meshed 24-tooth wheels counter-rotate in 60% of that time; for example, 60 seconds gives 36-second smaller wheels. Decorative motion speed also scales the mechanism.",
  background_opacity:
    "Opacity of custom generic background images from 0 to 1. Castle scenes fill their own opening.",
  background_transition:
    "Image crossfade length in milliseconds. Start at 1500; use 0 to switch immediately. Reduced motion removes the transition.",
  detail:
    "Rich shows decorative marks; Minimal simplifies the vector dial for readability.",
  font: "Choose a font available on your device. If it is unavailable, the listed serif/sans-serif fallback is used.",
  show_location_labels:
    "Show editable location text above the face artwork. Turn off if your own uploaded image already contains lettering.",
  show_branding:
    "Show the title and caption layers. Their individual opacity and empty text controls can hide either one separately.",
  pivot_x:
    "Hand pivot as a horizontal percentage of the face, usually 50. Change only to align a custom uploaded dial.",
  pivot_y:
    "Hand pivot as a vertical percentage of the face, usually 50; the supplied standalone layout used 47.",
  separation:
    "Angular spacing, in degrees, between people at the same destination. Range 0–25; 12–18 usually keeps a household readable.",
  collision:
    "Fan separates hands by angle. Stack also shortens successive hands to make crowded portraits easier to distinguish.",
  unknown_location:
    "Fallback destination for a missing, unknown or unmatched state. The hand remains present.",
  travelling_location:
    "Destination selected by an active travelling entity. Create that destination under Locations first.",
  operator:
    "Compare the source to the value below. Equals and Contains compare text; Above and Below compare numbers in the source sensor’s own units.",
  value:
    "Value to compare with, such as Kitchen or 5. Numerical thresholds do not convert sensor units.",
  location:
    "Destination to use when this rule matches. Rules run in their listed order after the dedicated travelling override.",
  state:
    "Exact sensor state to override for this person only, for example not_home. Shared destination matches are checked later.",
  label:
    "Short prefix shown before the reading. Leave blank to display only the value.",
  unit: "Units appended to a reading, such as %, km/h or °C. Blank omits the unit. No numeric conversion is performed.",
  decimals:
    "Decimal places for numeric readings, from 0 to 3. Text values remain text; clear this field to preserve the original precision.",
  placement:
    "Place this reading above, below or beside the portrait/tip. It stays upright as the hand turns.",
  personal:
    "Include household names, sensor IDs, images and rules in a private backup. Leave off for a privacy-safe export you intend to share.",
  scene_motion:
    "Animate clouds, water, window lights and seasonal details independently of weather. Disable for a still castle; live sensor updates continue.",
  scene_intensity:
    "Strength of the castle’s ambient motion from 0 (invisible) to 1 (strong). Start at 0.65.",
  motion_speed:
    "Decorative animation speed multiplier from 0.25 to 3. A value of 1 is normal. Tracking transition duration remains separate.",
  shadow:
    "Raise the surface visually with a soft cast shadow falling down and right. 0 removes it; 1 gives the strongest depth.",
  bevel:
    "Add a narrow lit upper-left edge and shaded lower-right edge. This makes the existing shape look cut or raised without changing its silhouette.",
  reflection:
    "Reflect cool sky light and warmer surroundings in polished surfaces. Rough wood and brushed finishes reflect less strongly.",
  glare:
    "Add a concentrated light highlight on polished metal or portrait glass. Use a low value for a restrained glint.",
  patina:
    "Accumulate darker oxidation along metal edges and crevices. Silver tarnishes; wood uses darker aging rather than green metal oxide.",
  wear: "Fine handling scratches and brighter worn edges, from 0 (clean) to 1 (most worn). This changes the surface only; names and tracking stay intact.",
  kind: "Choose a sensor reading, local time, date, or fixed text. Sensor readings can use a state or attribute.",
  seconds:
    "Include seconds in a time readout. The clock uses Home Assistant’s timezone when available.",
  text: "Fixed text for this bezel item. Clear it to remove the wording.",
  fallback:
    "Text shown when this reading is unavailable. Use a dash or leave blank to hide missing information.",
  icon: "Optional short symbol, such as ☀, ⚡ or ♥, placed before this readout. This is text, not an external icon download.",
  remember:
    "Remember the last face on this browser for this clock. Other browsers keep their own selection.",
  auto: "Automatically advance through selected faces. Cycling pauses on hover, keyboard focus, offscreen, and with reduced motion.",
  interval:
    "Seconds between automatic face changes, from 10 to 3600. Start with 30.",
  transition:
    "Face fade duration in milliseconds, from 0 to 3000. Reduced motion switches directly.",
};
export function settingHelp(key, label, type, options) {
  if (key === "name_size")
    return "Maximum hand-lettering size. Text automatically shrinks to fit the selected surface, position and direction. Very narrow areas or long names may be hidden; widen the hand, shorten the lettering or use the spoon bowl.";
  if (label.startsWith("Bezel width"))
    return "Thickness of the extra information ring, from 18 to 70 SVG units. The card expands its viewport so the ring is not cropped.";
  if (label === "Readout angle")
    return "Position around the information bezel: -90 top, 0 right, 90 bottom, 180 left. This moves the readout only, not a hand destination.";
  if (label === "Show information bezel")
    return "Add an outer information ring. When off, the readouts are hidden and the clock returns to its normal size.";
  if (label === "Location label size")
    return "Font size for only this location. Leave blank to follow the clock-wide location text size.";
  if (label === "Template name")
    return "Friendly name displayed between the face-navigation arrows. It does not change the clock title or people.";
  if (label.startsWith("Readout entity"))
    return "Sensor or other entity supplying this bezel value. Use a weather entity with an attribute such as temperature, or a battery, room or other sensor.";
  if (label.startsWith("Reading entity") || label.startsWith("Rule entity"))
    return "Optional entity supplying this reading or rule. Leave blank to use this person’s location entity. This does not replace their tracking sensor.";
  if (label.endsWith(" opacity"))
    return "Visibility from 0 (hidden) to 1 (fully visible). Sensor values continue updating even when the component is hidden.";

  if (/_(?:x|y)$/.test(key) && /^(?:title|caption)_/.test(key))
    return `${key.endsWith("_y") ? "Vertical" : "Horizontal"} position of this text as a percentage of the face. 50 is the center. Clear vertical position or use Reset position for the template’s recommended placement.`;
  if (
    /_(?:size|font|color|opacity)$/.test(key) &&
    /^(?:title|caption|location|name)_/.test(key)
  )
    return key.endsWith("_size")
      ? "Text size in SVG units; it scales with the clock. Adjust while watching the live preview."
      : key.endsWith("_opacity")
        ? "Text visibility from 0 (invisible) to 1 (fully visible). This affects only this text layer."
        : key.endsWith("_color")
          ? "Color for this text layer. Choose sufficient contrast against the face."
          : HELP.font;
  if (key === "opacity")
    return "Visibility from 0 (hidden) to 1 (fully visible). The sensor and tracking rules keep working when the label is hidden.";
  if (key === "size")
    return "Text size in SVG units. It scales with the clock; increase for readability and check for overlap.";
  if (HELP[key]) return HELP[key];
  if (/image|portrait|face_image/.test(key))
    return "Optional accessible image URL or /local/ path. Prefer the upload control to select a file without entering a path. Broken images show a visible error.";
  if (/color/.test(key))
    return "Select a color using the picker. It changes the customizable vector surface; baked colors inside uploaded images remain part of those images.";
  if (options)
    return (
      "Choose " +
      label.toLowerCase() +
      ". Available choices: " +
      options.map((o) => (Array.isArray(o) ? o[1] : o)).join(", ") +
      "."
    );
  return type === "checkbox"
    ? "Enable this option to apply it to this clock. The preview updates immediately."
    : "Optional " +
        label.toLowerCase() +
        ". Change it while watching the preview; empty values use the indicated automatic/default behavior.";
}
