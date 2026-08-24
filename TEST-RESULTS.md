# Travel Claims Manager v13 — test results

## Passed

- `app.js` JavaScript syntax check.
- `sw.js` service-worker syntax check.
- Cloudflare Worker syntax check.
- Static DOM reference check: every `$('...')` element reference in the application exists in `index.html`.
- D1 `schema.sql` executed twice successfully against an in-memory SQLite database (idempotency check) and created the expected six tables.
- Existing ICS Worker tests still pass, including allowed-host and CORS-origin checks.
- Push-config route tested with and without D1/VAPID configuration.
- Push-registration route tested with SQL placeholder/binding-count validation.
- VAPID signing + empty Web Push request path tested using a generated P-256 key pair and a mocked FCM push endpoint; test returned success.
- Reminder UI controls confirmed present: local calendar reminder, four push categories, advanced timing controls, enable/disable/test controls.
- Deep-link targets confirmed in the notification Worker for Shifts and Claim Form month routes.
- Service-worker notification click handler implemented to focus an existing app window where possible, otherwise open the relevant deep link.
- D1 storage model checked to exclude claim rows, names, addresses, personal numbers, vehicle registrations, signatures, ICS URLs, shift details, mileage, toll values and individual claim totals/history. The only financial contribution is one replaceable three-month cumulative amount per installation.
- Signature dialog wording confirmed as **Save signature** and saved-signature preview element confirmed on Setup.
- Payroll email wording confirmed to use **and proof of toll crossings** when Humber toll is configured.
- Vehicle registration input and restored data confirmed to normalise to uppercase.
- Claim regeneration tested after changing Setup; the preview recalculated all rows and totals.
- Edited subsistence start/end times and amount confirmed visible after leaving edit mode.
- A 26-row, three-page June claim was rendered and visually checked: page 2 has no totals row; page 3 alone shows 429 miles, 52 passenger miles, £39.00 miscellaneous and £5.25 subsistence.
- The generated PDF shows **START** on one line and renders subsistence row values.
- Payroll month wording regression-tested for one month, multiple months in one year, unsorted duplicates and the cross-year phrase **“October, November and December 2026, and January 2027”**.
- The downloaded calendar file was inspected and confirmed to contain the requested description line break and location.
- `tests/regression-checks.cjs` provides repeatable checks for month wording, calendar content and final-page PDF totals logic.
- Setup order and wording confirmed: calendar connection precedes personal details; **Load backup** is inside Setup; the top action is **Backup site data**.
- Calendar-link dialog confirmed to include close controls, direct Loop/iCalendar links, the supplied illustrated guide and clipboard import.
- Study-event alert and orange-review wording confirmed.
- Mobile/desktop document-preview tap handler confirmed to expose **Edit cells?** and switch the relevant month into table-edit mode.
- Monthly calendar reminder confirmed to contain an unlimited `RRULE:FREQ=MONTHLY;INTERVAL=1` recurrence.
- PDF generation regression checks confirm page counts on every page and final-page-only footer/totals behaviour.
- DRAFT Help, About, privacy and bug-report dialogs confirmed present with close controls.
- Telemetry endpoints, opt-out deletion, aggregate statistics and 90-day bug-report expiry/cleanup confirmed in code and schema validation.

## Reminder behaviour implemented

- Monthly claim reminder.
- Deadline warning before the 5th.
- Optional deadline-day reminder on the 5th.
- One overdue/not-marked-submitted reminder after the usual deadline.
- Unfinished-claim reminder.
- Immediate rota-change browser/PWA notification when an ICS refresh detects added, removed or changed shifts.
- Notifications stop for months reported as submitted.
- Notification lock-screen text contains only generic month/count information; detailed shifts remain local.
- Calendar reminder is generated locally as a recurring `.ics` event with a Europe/London timezone definition.

## Important deployment limitation

A true end-to-end Web Push delivery test to a real Android/iOS/browser subscription cannot be performed inside this build environment because it does not own a user-device push subscription. The Worker-side VAPID request path was tested with a mocked push service. After configuring D1/VAPID in Cloudflare, use **Send test notification** on a real device to validate the final browser/push-service leg.

The local Chromium executable required for automated visual browser screenshots was not available. Static DOM/asset checks, JavaScript syntax checks and regression tests passed, but the release should still receive a brief real-device smoke test on Android Chrome and an installed iOS Home Screen app.

Cloudflare deployment was not performed because the current environment requires explicit user approval before transmitting the changed Worker bundle. Apply `cloudflare-worker/schema.sql` to the existing remote D1 database before deploying `cloudflare-worker/worker.js`.
