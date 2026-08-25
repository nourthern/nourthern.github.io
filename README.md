# Travel Claims Manager v15

Privacy-first static PWA for preparing monthly travel claims from an Allocate ICS rota.

## v15 highlights

- Professional header shortcuts for About, Help/feedback, notification settings and local-data backup.
- Notification health indicator, simplified reminder pop-ups and server-reported push delivery failures.
- End-to-end example data generator with 22 synthetic shifts for pre-release human testing.
- Flexible recurring fares/parking/toll expenses with per-journey, daily, weekly and monthly placement.
- Local ICS-file status, clearer privacy/cookie information and optional compressed feedback screenshots retained for 90 days.
- Larger generated PDF row text, with the template legend shown on the final page only.
- All-user current-year claim aggregate, shown from May onward alongside the rolling three-month figure.

## v13 highlights

- Calendar-link help with direct Loop/iCalendar links, clipboard import and an illustrated guide.
- Clearer Android/iOS push-notification setup guidance.
- Study-event warning, mobile preview-to-edit prompt, monthly calendar recurrence wording.
- PDF page numbering and final-page-only footer.
- DRAFT Help, About, privacy and bug-reporting panels.
- Privacy-preserving aggregate usage telemetry, including active-user count and a replaceable all-users three-month claim total; telemetry can be disabled.

## v12 highlights

- Claim previews can be regenerated after Setup or shift changes.
- Vehicle registrations are normalised to uppercase.
- Subsistence times, amounts and totals remain visible in the preview and exported PDF.
- Multi-page PDFs show whole-claim totals only on the final page, including passenger miles.
- Payroll email month lists group years naturally, including claims spanning New Year.
- Calendar reminder wording, line break and location have been updated.

## v11 reminder highlights

- Local recurring `.ics` calendar reminder generator.
- Optional state-aware Web Push reminders using the existing Cloudflare Worker + D1.
- Push categories: monthly claim, deadline, rota-change and unfinished-claim reminders.
- Notification taps deep-link to the relevant app tab and month.
- Generic lock-screen notification text; claim/rota detail stays local.
- Sample-signature dialog now says **Save signature** and the saved signature is visibly previewed in Setup.
- Payroll email uses **“and proof of toll crossings”** when Humber toll is configured.

## Website deployment

The static website is served from this GitHub Pages repository. Do not publish secrets.

## Cloudflare

ICS fetching continues to use:

`https://travel-claims-ics.n-e-alwaa.workers.dev/`

The Worker and D1 schema must be updated to v15 for notification health, annual telemetry and screenshot-enabled feedback. See `CLOUDFLARE-WORKER-SETUP.md`.

Calendar `.ics` reminders work even if push/D1 is not configured.

## Privacy boundary

Claim forms, names, addresses, payroll assignment numbers, registrations, signatures, calendar URLs, shift details and PDFs remain local to the user's browser/device. D1 stores minimal pseudonymous reminder data, coarse feature-use counts, replaceable three-month and current-year cumulative amounts per installation, and deliberately submitted feedback reports with optional compressed screenshots. Reports and screenshots are deleted after 90 days. No claim rows or individual claim history are stored.
