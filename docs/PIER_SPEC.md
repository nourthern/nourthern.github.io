# PIER product specification

## Purpose and principles

PIER means **Painless and Intelligent Expenses Reporting**. It is a local-first travel-expense tool that turns rota events into reviewable payroll claim forms while leaving eligibility and accuracy decisions with the user.

PIER should minimise repeated entry, make every journey reviewable, protect sensitive claim data, work over HTTPS, support PWA installation, target WCAG 2.2 AA, and test meaningful changes in beta before production. Conformance must not be claimed until complete workflow, PDF and assistive-technology evidence passes.

## Four-tab workflow

### Tab 1 — Setup

The user enters the personal and travel values needed by the official claim form: name, base, job title, payroll assignment number, address, vehicle details, claimable one-way mileage, commute time, mileage rate, passenger details, and supported additional-expense settings. Required fields and a sample signature must be complete before claim generation.

The calendar source may be a live ICS URL or an imported `.ics` file. A live link can refresh; a file remains local and must be re-imported for updates. Setup also exposes reminders, privacy controls, backup, restore, install guidance, and beta-only synthetic example data.

Restore copy is authoritative:

> Restore PIER from a previously saved backup. This will replace the data currently stored in PIER on this device.

### Tab 2 — Shifts

PIER offers the current London calendar month and previous three London calendar months. The user may select multiple months, inspect calendar or list views, open a day, edit times, delete events, and choose **Claim** or **Do not claim** per event.

Working events default to Claim. Study/SDT and planned leave default to Do not claim. Opening a study event marks it reviewed but does not force a claim. Both Study and SDT display as **Study**.

In calendar view, an unopened Study event shows **?**. Opening it and leaving **Do not claim** selected changes the marker to **/**; selecting **Claim** changes it to **✓**.

Manual/unscheduled work can be added only within the same four-month window. Its claim reason is the entered text, or `Unscheduled work` if no reason exists in stored data.

### Tab 3 — Claim Form

PIER creates one editable preview per selected month. It calculates work-bound and home-bound rows from shift times, commute time, locations, mileage, passenger mileage, and eligible additional expenses. Users can edit cells, add/delete rows, select months, sign, and save PDFs.

Saving records the month's exported state and adds it once to the local Expense Log. Regeneration must not duplicate its log row. The PDF is an aid; the user remains responsible for eligibility, accuracy, and receipts.

**Email payroll** opens a pre-addressed month-aware email draft. PIER cannot attach files; the user must attach PDFs and receipts.

### Tab 4 — Expense Log

The Expense Log records **Exported claims** locally, with date exported, date range, mileage owed, miscellaneous owed (£), total owed (£), and a cumulative total. Rows can be deleted locally or exported for records. Local deletion does not retract an aggregate contribution already transmitted.

## Calendar interpretation

ICS dates, times, recurrences, displayed days, month membership, edited times, and claim-day interpretation use `Europe/London` civil time. London supplies GMT or BST for the date. UTC (`Z`) timestamps convert to London; floating and TZID times are interpreted on the London calendar.

Folded lines, escaped text, all-day events, and basic DAILY/WEEKLY/MONTHLY recurrence are supported. Fetch failure must be reported without silently replacing existing rota data. Live URLs are sent to the PIER Worker only to retrieve the calendar and are not intentionally persisted there.

### Event defaults

Text containing `study` or token `SDT` is Study and defaults to Do not claim. Leave/absence indicators—including annual leave, holiday, maternity leave, bereavement, sickness, strike, PHC/healthcare, and appointments—default to Do not claim. Other events default to working/Claim. Users can override status.

### Generated shift labels

Apply the first matching rule:

| Priority | Condition | Claim-form label |
|---:|---|---|
| 1 | Manual event | Entered reason, otherwise `Unscheduled work` |
| 2 | Study or SDT | `Self-Development Time` |
| 3 | At least 3 hours worked between 23:00–06:00 | `Night Shift` |
| 4 | At least 10 hours and crosses London midnight | `Long Evening Shift` |
| 5 | At least 10 hours and does not cross London midnight | `Long Day` |
| 6 | Under 10 hours and ends by 13:00 | `Morning Shift` |
| 7 | Under 10 hours and ends at/after 22:00 | `Evening Shift` |
| 8 | Under 10 hours and starts at/after 13:00 | `Afternoon Shift` |
| 9 | Everything else | `Day Shift` |

The night rule has priority over long-shift rules.

### Multiple events and leave days

Events on one date remain independently visible and claimable. Planned leave must not hide or replace a later claimable shift. The calendar may show both; the claim uses the actual claimable shift's time and label.

Events no more than one hour apart may form one linked work sequence: the first event supplies the outbound reason/time and the last supplies the home-bound reason/time.

## Expenses and totals

Mileage uses configured journey miles and rate. Passenger mileage requires passenger names. Parking, Humber toll, and bus/rail expenses follow configured per-journey/daily/weekly/monthly frequency rules. Receipts remain the user's responsibility.

## Reminders

PIER can create a recurring monthly ICS reminder locally in Europe/London. Supported browsers may enable generic, opt-in push reminders for monthly claims, deadlines, rota changes, and unfinished claims. Push may require the installed PWA on iOS and can be tested or disabled. Failures must be visible.

Help explains that the bell opens monthly push-notification and recurring calendar-reminder options, and that push notifications may require PIER to be installed.

## Backup and restore

The backup is a user-controlled JSON copy of locally stored PIER state, excluding PDF files. The Help wording is authoritative:

> Use save icon to create a backup of your PIER data so you can restore it later or move it to another device. The backup may contain personal details, rota information, claim history (exc. PDFs) and other information stored in PIER, so keep the file private and secure. Your data normally stays on this device. Creating a backup saves a copy to a file that you control.

Restore replaces current local PIER state after a valid backup is selected.

## Privacy and telemetry

Names, addresses, payroll/registration values, signatures, full events, claim rows, Expense Log details, and PDFs remain local except information deliberately submitted as feedback. Live calendar links transit the Worker during proxy fetch but are not intentionally stored.

User-controllable telemetry uses a random installation identity and may include app/channel version, broad device type, funnel stage, bounded feature/failure counts, PDF timing, optional survey answers, and replaceable aggregate claim/mileage totals for rolling three- and twelve-month views. It must not contain detailed shifts or claim rows. Turning it off requests deletion of the installation record.

Bug reports are deliberate submissions. Users can remove technical details and screenshots. Reports are retained for 90 days. Calendar links/files may be suggested when authorised team rota material is needed to reproduce dead links or unknown patterns; the UI warns against personal details and unauthorised sharing.

## Accessibility

Normal text should meet 4.5:1 contrast where applicable. Workflow actions must be keyboard operable, focus-visible, assistive-technology labelled, and usable without colour alone. Mobile and desktop retain equivalent functionality. Colour-blind mode preserves state distinctions.

## Beta and production

`beta` deploys only the beta Worker/site. `main` deploys only live. Both use Sunrise Harbour defaults and authorised dashboard appearance/wording overrides. Meaningful changes pass beta verification before `main` advances to the tested commit.
