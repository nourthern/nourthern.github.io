# Travel Claims Manager v8

A privacy-first static PWA for preparing monthly travel claims.

## Deployment

Upload the website files to the existing GitHub Pages repository, replacing the previous version. The shared Cloudflare Worker URL remains baked into the app. If you already deployed the hardened POST-based Worker supplied with v7, no Worker change is required for v8.

Because the service-worker cache name changed to `travel-claims-manager-v8`, the updated site should replace the old cached app after GitHub Pages publishes it. If a phone still shows the old version, close/re-open the installed PWA or refresh the hosted page once while online.

## v8 changes

- Setup vehicle-registration example changed to `P4Y M3`.
- Claimability disclaimer is repeated immediately above Imported shifts in Tab 2.
- Generated claim reasons no longer copy rota time ranges or verbose imported rota names.
- Imported shifts receive plain-language labels: Morning shift, Afternoon shift, Day shift, Evening shift, Long shift, Long evening Shift, Long day, or Night Shift.
- Any claimed imported shift containing `study` is labelled `Self-Development Time`. Study events still default to Do not claim/orange for manual review.
- Manually added/unscheduled shifts keep the exact reason entered by the user.
- Claimable shifts touching 00:00-06:00 are classified as Night Shift before other classifications.
- Consecutive claimable shifts whose boundary times are within 60 minutes are treated as one attendance: one work-bound journey for the earlier shift and one home-bound journey for the later shift.
- On phone-sized screens, Edit rows, Add/change signature, Export PDF, and Mark submitted now stack vertically at full width.
- Existing v7 fixes remain: four-month claim window, selected-month shift filtering, Claim/Do not claim dropdown, green/grey/orange shift states, secure baked-in Worker, POST-based ICS fetch, corrected A4 PDF scaling, signature placement, alternating table bands and template-derived column widths.
