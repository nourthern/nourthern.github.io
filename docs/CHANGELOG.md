# PIER changelog

This records significant product changes visible from repository evidence. Dates and version numbers are omitted where no authoritative release record exists.

## Unreleased

### Changed

- Kept PIER branding left-aligned on narrow screens, enlarged the active tab without inset corner accents, and added the requested copper interaction colour.
- Restored Steel Blue/white notification-choice cards with Storm Slate interaction states and expanded the notification Help wording.
- Replaced Study calendar diamonds with the `?` → `/` or `✓` review-state sequence.
- Corrected dashboard colour configuration to the current Sunrise Harbour semantic tokens and defaults.
- Renamed the expansion to **Painless and Intelligent Expenses Reporting**.
- Recovered the beta shift-calendar/day-dialog implementation onto current production history, including editable event times and the planned-leave/claimable-shift fix.
- Replaced shift labels with the authoritative ordered hierarchy: manual reason, Self-Development Time, Night Shift, Long Evening Shift, Long Day, Morning Shift, Evening Shift, Afternoon Shift, then Day Shift.
- Normalized Study and SDT events to display as **Study**.
- Made ICS, recurrence, calendar-day grouping, edited times, reminders, and claim interpretation use Europe/London with GMT/BST handling.
- Limited manual unscheduled days to current month plus previous three months.
- Renamed Expense Log terminology from submitted to exported and clarified owed-value headers.
- Replaced backup/restore and feedback guidance with explicit privacy/sensitivity wording.
- Applied Sunrise Harbour colors to manifest metadata and aligned shell/app/service-worker cache markers at `51`.
- Applied authorized dashboard color overrides to beta as well as production.
- Corrected deployment branches to `beta` and `main`, isolated branch concurrency, and prevented production runs from overwriting beta.

### Documentation

- Added the authoritative product, architecture, design-system, testing, changelog, and future-agent guidance set.

## Earlier repository history

### Product and workflow

- Introduced the four-tab Setup → Shifts → Claim Form → Expense Log workflow.
- Added live/link and local-file ICS import, multi-month review, manual shifts, claim overrides, editable claim tables, signatures, multi-page PDF export, payroll email drafts, and local Expense Log.
- Added calendar/list shift views, per-day dialogs, multiple-event handling, and planned-leave plus claimable-shift display.
- Added mileage, passenger mileage, parking, toll, bus/rail, receipt guidance, and frequency-aware additional expenses.
- Added local backup/restore, install guidance, recurring calendar reminders, opt-in push notifications, and rota-change/unfinished-claim reminders.

### Design and accessibility

- Adopted the Sunrise Harbour visual system, PIER wordmark/harbour banner, responsive layouts, explicit status states, focus treatment, and color-blind support.
- Preserved the official claim document appearance separately from site theming.

### Architecture and privacy

- Added Cloudflare Worker ICS proxying, D1-backed push/telemetry/feedback/dashboard services, separate beta/live channels, and GitHub deployment automation.
- Added PWA manifest/service worker and versioned offline shell assets.
- Added minimal pseudonymous telemetry, rolling aggregate statistics, opt-out/deletion, 90-day feedback retention, optional reviewed screenshots, telemetry suppression, and dashboard customization backups/drafts.
- Kept personal form data, complete rota information, signatures, claim rows, PDFs, and detailed Expense Log data local by normal operation.

### Important fixes

- Prevented planned leave from supplying the displayed/generated time when a claimable shift follows on the same day.
- Improved PDF pagination, totals, legends, row fit, page numbering, and multi-month payroll wording.
- Improved service-worker update behavior, notification test confirmation/throttling, calendar-refresh diffing, and beta ICS routing.
