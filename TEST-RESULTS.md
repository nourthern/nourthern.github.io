# Travel Claims Manager v8 - test report

## Automated/static checks

- `node --check app.js`: PASS
- `node --check sw.js`: PASS
- Vehicle-registration placeholder `P4Y M3`: PASS
- Tab-2 claimability disclaimer present above Imported shifts: PASS
- Mobile claim actions use a single-column layout at <=700px: PASS
- Service-worker cache advanced to `travel-claims-manager-v8`: PASS

## Shift-description tests

Synthetic events were tested against the v8 classification logic:

- 07:00-12:00 -> `Morning shift`: PASS
- 09:00-17:00 -> `Day shift`: PASS
- 13:00-18:00 -> `Afternoon shift`: PASS
- 14:00-22:30 -> `Evening shift`: PASS
- 08:00-19:00 -> `Long day`: PASS
- 13:30-23:45 -> `Long evening Shift`: PASS
- 20:00-08:00 -> `Night Shift`: PASS
- imported event containing `study` -> `Self-Development Time`: PASS
- manually added `Teaching meeting` -> preserves `Teaching meeting`: PASS

The hierarchy deliberately gives Night Shift priority whenever an event includes time between 00:00 and 06:00. Long-evening and long-day labels then take precedence over generic long-shift labels.

## Linked-shift journey tests

- Shift A ending 13:00 followed by Shift B starting 13:45: grouped as one attendance: PASS.
- Overlapping shifts with start/end boundary within 60 minutes: grouped as one attendance: PASS.
- A later shift on the following day remains a separate attendance: PASS.

For a linked group, claim generation creates only the work-bound journey for the first event and the home-bound journey for the last event.

## Browser-environment limitation

This execution environment blocks Chromium navigation to both localhost and local `file://` pages, so an end-to-end rendered browser test could not be completed here. The JavaScript syntax, deterministic shift logic and requested CSS/HTML changes were tested independently. The previous v7 PDF regression tests remain applicable because v8 does not alter the PDF scaling/export engine.
