# Travel Claims Manager v11 — test results

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
