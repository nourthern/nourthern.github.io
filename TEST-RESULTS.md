# Travel Claims Manager v12 — test results

## Passed

- `app.js` JavaScript syntax check.
- `sw.js` service-worker syntax check.
- Cloudflare Worker syntax check.
- Static DOM reference check: every `$('...')` element reference in the application exists in `index.html`.
- D1 `schema.sql` executed successfully against an in-memory SQLite database and created the expected four tables.
- Existing ICS Worker tests still pass, including allowed-host and CORS-origin checks.
- Push-config route tested with and without D1/VAPID configuration.
- Push-registration route tested with SQL placeholder/binding-count validation.
- VAPID signing + empty Web Push request path tested using a generated P-256 key pair and a mocked FCM push endpoint; test returned success.
- Reminder UI controls confirmed present: local calendar reminder, four push categories, advanced timing controls, enable/disable/test controls.
- Deep-link targets confirmed in the notification Worker for Shifts and Claim Form month routes.
- Service-worker notification click handler implemented to focus an existing app window where possible, otherwise open the relevant deep link.
- D1 storage model checked to exclude claim rows, names, addresses, personal numbers, vehicle registrations, signatures, ICS URLs, shift details, mileage and expense amounts.
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
