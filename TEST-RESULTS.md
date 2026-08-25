# Travel Claims Manager v16 — test results

## Passed

- JavaScript syntax checks passed for the application, all six application parts, service worker and Cloudflare Worker.
- `tests/regression-checks.cjs` passed, including DOM references, reminder ICS content, intermediate-page legend masking, rolling telemetry, screenshot feedback, notification status and the 22-shift example-data control.
- The Cloudflare Worker production build completed successfully with only the D1 database, allowed-origin and VAPID-subject bindings.
- The existing remote D1 database was inspected before migration. Six additive v15 columns were then applied successfully without replacing existing tables or records.
- Worker v16 deployed successfully. Live checks confirmed push is configured and `/api/stats` returns both three-month and rolling 12-month aggregate fields.
- Desktop and 762 × 642 layouts were visually checked. Backup sits immediately before **Saved locally**, while About, Help and notifications align at the banner's lower right without the inner circles around “i” and “?”.
- Header ordering was checked with **Install app** immediately after the save icon and before the local-save status.
- The example-data button populated synthetic Setup details, a sample signature and 22 shifts in the current month.
- Calendar-source behaviour was checked: a saved iCalendar link hides file import on Shifts; local ICS use shows the last update date and the manual-update reminder.
- Required Setup validation marks missing inputs in red, including paired passenger fields and expense-cost dependencies.
- Populated Setup controls render white while empty controls remain shaded. Passenger details hide/disable bus and rail fares, **None** sets cost to £0.00, and parking offers only daily, weekly and monthly frequency choices.
- Additional-expense generation was checked for per-journey, daily, weekly and monthly placement. A 34-row parking claim contained 17 outbound parking charges and zero homebound parking charges.
- The second additional-expense frequency follows the same parking rules independently. Selecting parking or Humber toll as the main expense hides the matching duplicate option from the second expense.
- Notification state handling was checked for calendar setup, push setup, no configured reminder, and failed push delivery.
- Screenshot attachment preparation was checked using the supplied image: preview, resizing/compression and removal worked without submitting the image as a live report.
- A synthetic August claim containing 22 shifts was exported as a three-page PDF and every page was rendered for visual inspection.
- The PDF table and cell widths are unchanged. Entered row data uses larger fit-to-cell text, with automatic reduction only where needed to prevent clipping. Page-one imported data is larger, consistently sized and raised clear of its underline.
- The claim-type and receipt legend is absent from intermediate page 2 and displayed directly below the final table on page 3. The trailing right-edge line artefact is removed; page numbers and final-page-only totals remain intact.
- A 34-row QA claim placed 33 unchanged-height rows on intermediate page 2 and reserved the final row, totals and legend for page 3. The output remained a valid three-page landscape A4 PDF.
- Per-row claim type editing was verified with `PTR` carried into the PDF. The miscellaneous header displayed only **PARKING** and **NAME OF PASSENGERS**, omitted hotel costs, and row values contained the passenger name without a “Passenger(s):” prefix.
- The generated filename was `Travel Claim - A Example - 2026-08.pdf`, confirming first-initial and surname naming.

## Deliberately retained for testing

- The **Fill with example data and shifts** button and its on-page warning remain visible while the website is under development. Remove this control before the site is shared as final.

## Remaining real-device check

- Browser push delivery still needs one final smoke test using **Send test notification** on each supported real-device/browser combination. The server, VAPID configuration and failure-reporting paths are deployed and responding.
