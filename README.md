# Travel Claims Manager v12

Privacy-first static PWA for preparing monthly travel claims from an Allocate ICS rota.

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

The Worker must be updated to the v12 `cloudflare-worker/worker.js` for push notifications. See `CLOUDFLARE-WORKER-SETUP.md`.

Calendar `.ics` reminders work even if push/D1 is not configured.

## Privacy boundary

Claim forms, names, addresses, personal numbers, registrations, signatures, calendar URLs, shift details and PDFs remain local to the user's browser/device. D1 stores only the minimal pseudonymous subscription/preferences and coarse monthly state required to decide whether a reminder is due.
