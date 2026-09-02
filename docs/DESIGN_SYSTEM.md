# PIER design system

## Sunrise Harbour palette

These are the current authoritative default tokens in `styles.css`.

| Token | Hex | Semantic purpose |
|---|---|---|
| Deep Navy | `#123047` | Header/banner, inactive tabs, strong controls, focus pairing |
| Steel Blue | `#365F7A` | Standard buttons, borders, links/structural blue |
| Sunset Copper | `#98521F` | Active tab, progression emphasis, accent |
| Warm Background | `#F7F3EA` | Page and manifest background |
| Card White | `#FFFDF9` | Cards/panels |
| Primary Text | `#183242` | Main body text |
| Secondary Text | `#586E7A` | Hints and secondary copy |
| Sea Mist | `#DCE8ED` | Soft cool surface |
| Tidepool Teal | `#2F6F68` | Claim/success semantics |
| Storm Slate | `#556D79` | Inactive/no-claim semantics and hover state |
| Dune Gold | `#C18A24` | Attention, focus, progression hover |
| Pale Sunset Peach | `#FBE9DD` | Study/review surface |
| Claim Background | `#E8F3F0` | Claimable shift/calendar surface |
| Inactive Background | `#EEF2F3` | Do-not-claim surface |
| Warning Background | `#FFF3D6` | Warning/attention surface |
| Semantic Red | `#A33F32` | Error/destructive emphasis |
| Error Background | `#FCEDEA` | Error surface |

White (`#FFFFFF`) is used for high-contrast text on dark controls and some input/document surfaces. Dashboard overrides may replace approved semantic tokens in both channels; they do not change the meaning of the token.

## Shift and calendar states

| State | Foreground/border | Background | Meaning |
|---|---|---|---|
| Claim | Tidepool Teal `#2F6F68` | Claim Background `#E8F3F0` | Included unless user changes status |
| Do not claim | Storm Slate `#556D79` | Inactive Background `#EEF2F3` | Excluded unless user changes status |
| Study | Sunset/Dune attention treatment | Pale Sunset Peach `#FBE9DD` | Study/SDT requiring visible review; default Do not claim |
| Planned leave | Slate treatment | Inactive neutral surface | Non-claim leave/absence |
| Night | Deep Navy marker/accent in addition to Claim state | Claim surface | Claimable shift meeting night rule |
| Error | Semantic Red `#A33F32` | Error Background `#FCEDEA` | Invalid/failed action |

Status is also communicated by text, radio selection, symbols, borders, and accessible labels—not color alone. Colour-blind mode strengthens marker shapes/focus treatment.

## Navigation and controls

- The top banner uses Deep Navy with the sunset harbour hero image and white PIER branding.
- Inactive tabs use Deep Navy with white text. The active tab uses Sunset Copper with white text and an inset indicator.
- Standard primary, secondary, and file-style buttons use Steel Blue with white text; hover uses Storm Slate.
- Forward workflow links whose IDs end in `Continue` use Sunset Copper; hover uses Dune Gold with Deep Navy text.
- Success/claim actions use Tidepool Teal where specifically assigned.
- Warning/review surfaces use Warning Background/Dune Gold or the Study treatment.
- Destructive/error states use Semantic Red and must include explicit text or labels.

Buttons remain rounded rectangles at the current radius; icon buttons and compact controls retain their established shapes. A palette change alone does not authorise layout, typography, radius, icon, branding, or behavior changes.

## Surfaces, typography, and branding

The page is Warm Background. Content cards are Card White with Steel Blue-derived borders and established shadows/radii. Official claim previews remain visually separate white documents and are not recolored by site theme changes.

The interface font stack is `Arial, Helvetica, sans-serif`. Existing hierarchy, weights, sizes, and official-form typography are intentional constraints. The PIER wordmark uses `icons/pier-logo-navy.png`; the header also includes the “Travel Expense Manager” descriptor. Do not redraw, recolor, crop, or replace the wordmark as an incidental styling change.

The banner image is `icons/pier-sunset-hero.jpg`, positioned to preserve the harbour/sunset composition. The manifest theme is Deep Navy `#123047`; manifest background is Warm Background `#F7F3EA`.

## Responsive behavior

Desktop uses broad cards, multi-column Setup grids, sticky horizontal tabs, and document previews. At 900px and below, headings/grids/shift rows stack and claim previews become horizontally scrollable. At 700px and below, local tools, reminder choices, feedback previews, and claim actions become single-column/touch-friendly. Functionality and state labels must remain equivalent at all widths.

## Accessibility

Target WCAG 2.1 AA. Normal text should meet 4.5:1 contrast where applicable; large text and non-text controls must meet their applicable thresholds. Preserve visible keyboard focus, 44px-class touch targets where practical, semantic labels, dialog focus behavior, and reduced reliance on color. Test all dashboard color overrides for contrast before publishing them.
