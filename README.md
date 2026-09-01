# PIER · Travel Expense Manager v31 beta

## v31 beta highlights

- Calendar-first shift checking for one to four selected months, with a Monday-first responsive layout and accessible non-colour status markers.
- Calendar days open a focused shift pop-up that closes from its close button, Escape, or a click outside.
- Planned leave replaces times in calendar cells; exact start and end times remain amendable in list view.
- Opening a study day marks it reviewed, and a claimed study day uses the tick marker. Review remains optional before continuing.
- Deterministic seven-category shift labels using the BMA three-hour night-overlap rule.
- Production can be served through the Cloudflare Worker custom domain and edge certificate for broader managed-device TLS compatibility.

## v19 highlights

- PIER visual identity, custom wordmark, approved coastal palette and square app mark.
- Optional colour-blind friendly shift patterns and local ICS-file dating.
- Final Help/About copy with claim-form-only user counts and rolling aggregate mileage.
- More reliable push testing with delivery acknowledgement and a visible local fallback.
- Password-protected operations dashboard and a separately deployed beta site.

Privacy-first static PWA for preparing monthly travel claims from an Allocate ICS rota.

## v17 highlights

- Generated claim rows are taller and use larger fit-to-cell text without changing any column width.
- Final-page totals now match the journey-row type size, and page numbers are centred.

## v16 highlights

- About statistics now compare the rolling last three months with the rolling last 12 months on record, using the same locally held expense-log history.
- Existing aggregate contributions are migrated to a safe baseline that cannot make the 12-month figure smaller than the three-month figure.

## v15 highlights

- Professional header shortcuts with About, Help and notifications at the banner's lower right, and backup beside the local-save status.
- Notification health indicator, simplified reminder pop-ups and server-reported push delivery failures.
- End-to-end example data generator with 22 synthetic shifts for pre-release human testing.
- Flexible recurring fares/parking/toll expenses, with passenger/fare conflict prevention and outbound-only daily, weekly or monthly parking charges.
- Local ICS-file status, clearer privacy/cookie information and optional compressed feedback screenshots retained for 90 days.
- Larger generated PDF text, with uniform raised page-one data, a compact final-page legend and no trailing table-edge artefact.
- All-user longer-period claim aggregate alongside the rolling three-month figure.
- Automatic release checks and page refreshes keep the installed/offline-capable site current without clearing its local data.
- The About panel identifies Travel Claims Manager as an independent project not affiliated with NLaG Trust or Humber Health Partnership.
- Setup supports independent frequency rules for a second parking expense and prevents the same parking/toll category being selected twice.
- Claim types can be edited per row, miscellaneous headings reflect only configured expenses/passengers, and passenger names no longer carry a redundant prefix.
- Intermediate PDF table pages use the available page height, and filenames include the claimant's first initial and surname.

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

The Worker and D1 schema must be updated to v19 for notification health, rolling aggregate telemetry, mileage statistics, the private dashboard and screenshot-enabled feedback. See `CLOUDFLARE-WORKER-SETUP.md`.

Calendar `.ics` reminders work even if push/D1 is not configured.

## Privacy boundary

Claim forms, names, addresses, payroll assignment numbers, registrations, signatures, calendar URLs, shift details and PDFs remain local to the user's browser/device. D1 stores minimal pseudonymous reminder data, coarse feature-use counts, replaceable three-month and rolling 12-month cumulative amount/mileage aggregates per installation, and deliberately submitted feedback reports with optional compressed screenshots. Reports and screenshots are deleted after 90 days. No claim rows or individual claim history are stored.
