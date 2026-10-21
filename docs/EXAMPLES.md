# Optional advanced examples

Ordinary setup uses the visual editor. YAML is optional.

```yaml
type: custom:magical-family-clock-card
version: 1
title: Our whereabouts
theme: enchanted-spoons
members:
  - id: example-person
    name: Example person
    entity: person.example
    color: '#c5a46c'
locations:
  - id: home
    name: Home
    angle: -90
    states: [home]
  - id: office
    name: Work
    angle: 0
    states: [Office]
  - id: away
    name: Away
    angle: 90
    states: [not_home]
  - id: unknown
    name: Unknown
    angle: 180
    states: [unknown, unavailable, '']
unknown_location: unknown
```

Names, IDs, and zone state strings are examples; select your own entities. A travelling entity can be selected in the editor and mapped to a travelling location. Different cards may use the same Home Assistant entities without sharing configuration.

## Optional original-household mapping

These values were verified in the supplied files, not against a live installation. They are never product defaults. The Home Assistant canvas source draws these people in this order, with Andrew on top:

| Name | Location sensor | Verified hand color | Text color |
| --- | --- | --- | --- |
| Indy | sensor.indy_clock_location | `#e4b747` | `#fff8e9` |
| Lillie | sensor.lillie_clock_location | `#963c49` | `#fff8e9` |
| Krystal | sensor.krystal_clock_location | `#d69a91` | `#fff8e9` |
| Andrew | sensor.andrew_clock_location | `#fff3d9` | `#382614` |

Select **Use supplied Home Assistant layout** in the new card editor to use Home −90°, Work 180°, School 0°, Gym 90°, Away 45°, Travelling −135°, 12° separation, and the curved hand style. It preserves any people/colors you already configured. Choose each person's colors above explicitly if recreating that particular version. Disable portraits for the original silhouette. The layout reads the existing `/local/magical-clock/clock-face.png`; it does not write it.

The standalone source instead uses Andrew `#e6b343`, Krystal `#c63864`, Lillie `#139d61`, Indy `#246bd2`, and different text colors, a pointed silhouette, 17° separation, and a 47% pivot height. **Use supplied standalone layout** keeps those geometry choices separate; it does not silently replace your person colors.

Travelling binary sensors mentioned in the original written specification are optional enhancements; neither supplied implementation binds those binary sensors. Both supplied files use the location sensor's state. Keep existing helpers and dashboards unchanged while testing the new card.
