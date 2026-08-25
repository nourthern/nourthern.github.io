# Travel Claims Manager v15 — test results

## Passed

- JavaScript syntax checks passed for the application, all six application parts, service worker and Cloudflare Worker.
- `tests/regression-checks.cjs` passed, including DOM references, reminder ICS content, PDF continuation-page masking, yearly telemetry, screenshot feedback, notification status and the 22-shift example-data control.
- The Cloudflare Worker production build completed successfully with only the D1 database, allowed-origin and VAPID-subject bindings.
- The existing remote D1 database was inspected before migration. Six additive v15 columns were then applied successfully without replacing existing tables or records.
- Worker v15 deployed successfully. Live checks confirmed push is configured and `/api/stats` returns both three-month and current-year aggregate fields.
- Desktop and narrow mobile layouts were visually checked. The four header actions wrap cleanly and dialogs remain usable.
- The example-data button populated synthetic Setup details, a sample signature and 22 shifts in the current month.
- Calendar-source behaviour was checked: a saved iCalendar link hides file import on Shifts; local ICS use shows the last update date and the manual-update reminder.
- Required Setup validation marks missing inputs in red, including paired passenger fields and expense-cost dependencies.
- Additional-expense generation was checked for per-journey, daily, weekly and monthly frequency placement. Frequency is changeable only for parking and bus/rail fares.
- Notification state handling was checked for calendar setup, push setup, no configured reminder, and failed push delivery.
- Screenshot attachment preparation was checked using the supplied image: preview, resizing/compression and removal worked without submitting the image as a live report.
- A synthetic August claim containing 22 shifts was exported as a three-page PDF and every page was rendered for visual inspection.
- The PDF table and cell widths are unchanged. Entered row data uses larger fit-to-cell text, with automatic reduction only where needed to prevent clipping.
- The claim-type and receipt legend is absent from continuation pages 2 and 3. Page numbers remain visible and totals remain on the final page only.

## Deliberately retained for testing

- The **Fill with example data and shifts** button and its on-page warning remain visible while the website is under development. Remove this control before the site is shared as final.

## Remaining real-device check

- Browser push delivery still needs one final smoke test using **Send test notification** on each supported real-device/browser combination. The server, VAPID configuration and failure-reporting paths are deployed and responding.
