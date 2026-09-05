# PIER regression checklist

Run automated checks first:

```sh
pnpm install --frozen-lockfile
pnpm test
pnpm run build:site
```

Also syntax-check changed browser/Worker JavaScript and inspect the built site. Use synthetic data only. Never commit or paste a private ICS URL or real claim data into tests.

## Calendar and ICS

- [ ] Import a valid live HTTPS/webcal ICS link through the Worker; events appear and source/update feedback is correct.
- [ ] Import a valid local `.ics` file; it remains local and the UI explains that it will not auto-refresh.
- [ ] Test folded lines, escaped text, all-day events, UTC (`Z`), floating time, `TZID`, and DAILY/WEEKLY/MONTHLY recurrence.
- [ ] In GMT and BST examples, a London 09:00 event displays as 09:00 and belongs to the correct London date/month regardless of device timezone.
- [ ] A UTC event crossing London midnight appears on the correct London calendar day.
- [ ] Refresh an updated rota: additions/changes/removals are reported and prior user status is retained where identity matches.
- [ ] Fail Worker fetch, direct fetch, timeout, malformed ICS, and empty calendar separately. Existing imported events must not be silently erased.
- [ ] Confirm only current month plus previous three London months are selectable.

## Shift classification

Use boundary values as well as ordinary examples:

- [ ] Manual event: entered reason; absent stored reason: `Unscheduled work`.
- [ ] `Study` and `SDT` both display **Study**, default Do not claim, and generate `Self-Development Time` if claimed.
- [ ] Exactly 3 hours within 23:00–06:00 is `Night Shift`; just under 3 hours is not.
- [ ] A 10-hour-or-longer shift crossing midnight, but not meeting Night, is `Long Evening Shift`.
- [ ] A 10-hour-or-longer same-day shift is `Long Day`.
- [ ] Under 10 hours ending exactly 13:00 is `Morning Shift`.
- [ ] Under 10 hours ending exactly 22:00 is `Evening Shift` unless Night has priority.
- [ ] Under 10 hours starting exactly 13:00 is `Afternoon Shift` unless an earlier rule matches.
- [ ] Remaining work is `Day Shift`.
- [ ] Verify capitalization in both outbound and home-bound PDF reasons.

## Shift review regressions

- [ ] Calendar and list show all events when multiple events share one London date; each can be edited/claimed/deleted independently.
- [ ] Planned leave followed by a claimable working shift shows both states and generates rows using the working shift's actual time—not the leave event's time. This is a mandatory fixed-bug regression.
- [ ] Claim/Do not claim toggles persist across rerender and calendar refresh.
- [ ] Study calendar markers transition from `?` (unopened) to `/` (opened and Do not claim) or `✓` (Claim).
- [ ] Editing start/end across midnight preserves the intended London day and recalculates the label.
- [ ] Add a manual day at the first allowed date and current date; reject dates before the previous-three-month boundary or after current month.
- [ ] Select multiple months and verify independent previews, totals, and selection controls.

## Accessibility and assistive technology

- [ ] Complete Setup → Shifts → Review and save → Expense log using keyboard only; verify tab arrows, Home/End, focus visibility, dialog trapping/Escape and focus return.
- [ ] Test 320 CSS px, 400% zoom, 200% text, WCAG text-spacing overrides, portrait/landscape, touch and Windows forced-colour mode.
- [ ] Test with NVDA/Windows and, where in scope, VoiceOver/Safari and TalkBack/Chrome; record headings, landmarks, labels, errors, dialogs, tables and status announcements.
- [ ] Retest generated PDFs for selectable text, tags, reading order, high zoom and screen-reader output. Record the current canvas PDF as a failure until corrected or paired with an accepted accessible equivalent.
- [ ] Record browser/device/AT versions and evidence in `ACCESSIBILITY_AUDIT_BETA.md`; never infer conformance from automated checks alone.

## Claims, expenses, and PDF

- [ ] For every selected month, verify one editable table is shown with the ten specified journey fields; outbound rows are white and home-bound rows use the Pale Sunset Peach/Sea Mist treatment.
- [ ] Edit each field, then open **Preview payroll document** and verify the A4 preview reflects the latest values. Confirm the preview action sits at the bottom right of its month table.
- [ ] Verify Larger text and Extra spacing each change the calendar to a single large month per row; Reduce colour retains accessible status cues.
- [ ] Outbound/homebound rows use first/last linked events, configured commute time, home/base postcodes, and correct shift labels.
- [ ] Mileage, rate, passenger miles/names, and mileage owed are correct.
- [ ] Parking, Humber toll, bus/rail, and second additional expense obey journey/daily/weekly/monthly frequency rules without double counting.
- [ ] Edit every claim-row field; add and delete rows; confirm totals update and persist.
- [ ] Capture, upload, clear, replace, and reuse a signature with mouse, touch, and keyboard-accessible controls where applicable; reject unsupported formats and images over 5 MB.
- [ ] Generate one and multiple PDFs; inspect page count, filenames, form fields, wrapped text, totals, legend placement, and signatures.
- [ ] Regenerate a previously exported month: no duplicate Expense Log row; current aggregate replaces prior month contribution.
- [ ] Delete claim rows and local Expense Log rows; confirm documented local/telemetry consequences.
- [ ] Expense Log says **Exported claims**, **Date form exported**, **Claimable miles**, **Miscellaneous owed (£)**, and **Total owed (£)**; cumulative total is correct.
- [ ] Export Expense Log data and verify values without exposing unrelated local state.
- [ ] Email payroll produces the correct recipient, natural multi-month wording, and reminder to attach PDFs/receipts.

## Backup, privacy, and network

- [ ] Backup contains restorable local state and excludes PDFs. Verify the exact sensitivity warning in Help.
- [ ] Restore warns that current device data will be replaced; valid backup replaces state, malformed/incompatible input fails safely.
- [ ] Inspect browser network requests through Setup → Shifts → PDF → Log. No names, addresses, payroll/vehicle values, signatures, events, claim rows, or log details should be sent by normal telemetry.
- [ ] Live ICS URL reaches only expected fetch routes and is not present in D1/log output.
- [ ] Telemetry on: bounded pseudonymous payload and aggregates sync. Telemetry off: no future sync and deletion request is made.
- [ ] Submit feedback with technical details on/off and screenshot present/removed. Confirm privacy warning and 90-day behavior.
- [ ] Confirm calendar-link/file feedback guidance warns against personal details and unauthorised sharing.

## Reminders, PWA, and push

- [ ] Monthly calendar reminder uses Europe/London, correct date/time, recurrence, URL, and calendar text.
- [ ] Install manifest uses theme `#123047`, background `#F7F3EA`, correct icons/start URL, and standalone display.
- [ ] Service-worker update replaces the prior cache and avoids a mixed old/new shell; offline shell behavior remains usable.
- [ ] On supported HTTPS browsers, enable/test/disable push. Verify generic content, 60-second test throttle, display confirmation, click route, and visible failure state.
- [ ] Verify iOS installed-PWA guidance and unsupported/denied-permission messages.

## Accessibility and responsive UI

- [ ] Keyboard-only: tabs, calendar days, dialogs, radio choices, editing, signature controls, export, and restore are reachable with visible focus.
- [ ] Screen reader: landmarks, tab state, dialog names, calendar-day descriptions, shift status, error/status live regions, and icon labels are meaningful.
- [ ] Status remains understandable without color; test color-blind mode.
- [ ] Open Display & accessibility from within the navigation; verify Larger text and Extra spacing each expand the Tab 2 calendar, Reduce colour preserves status cues, High contrast strengthens controls, and Underline links affects link-style controls.
- [ ] Confirm ordinary claimable calendar days read Claim while Study days retain `?` until reviewed, then show `×` for Do not claim or `✓` for Claim.
- [ ] Confirm weekdays appear above list-view dates; reviewed Do not claim calendar days show `×`; and an empty date can open Add unscheduled day using mouse, touch, Enter and Space.
- [ ] Confirm the empty-date action closes with Escape, outside interaction, scrolling and resizing without trapping focus.
- [ ] Confirm the Deep Navy banner subtitle and subtle light halo remain readable over the banner image at phone, tablet and desktop widths.
- [ ] Confirm a beta calendar-link import tries the same-origin `/ics` route first and that the deployed route returns a Worker validation response rather than a static-site response.
- [ ] Confirm untouched non-Study shifts appear green with `✓` and **Claimable**, while explicit user exclusions remain Do not claim; Study review states must follow `?` until reviewed, then `×` for Do not claim or `✓` for Claim.
- [ ] Confirm the shift-list Delete `×` sits to the left of the day/date, desktop status controls remain central, and narrow layouts stack Claim and Do not claim vertically to the right of the shift.
- [ ] In each monthly journey table, confirm Delete is on the left, totals align beneath mileage/passenger mileage/additional expense, and new rows alternate Work bound then Home bound.
- [ ] Check normal-text contrast at 4.5:1 where applicable, including every dashboard override.
- [ ] Test narrow phone, tablet, 900px breakpoint, and wide desktop. No clipped action, inaccessible table, or unusable dialog.
- [ ] PIER/subtitle remain left-aligned on narrow screens; the active tab is larger without inset corner accents; notification cards and copper interaction states retain white text.
- [ ] Dashboard colour fields use current Sunrise Harbour semantic names/defaults and do not remap navy or steel to unrelated success/surface roles.

## Beta → production promotion

- [ ] Push the candidate to `beta`; confirm only the beta deployment runs and production remains unchanged.
- [ ] Verify beta badge, beta synthetic-data affordance, beta API channel, dashboard overrides, Sunrise Harbour defaults, and all relevant checklist cases.
- [ ] Confirm `main` and `beta` point to the exact tested commit before/after fast-forward promotion as intended.
- [ ] Push/advance `main`; confirm only live deployment and live migrations run, beta remains unchanged, and both public `/api/site-config` endpoints report the correct channel.
- [ ] Smoke-test production over HTTPS, install metadata, ICS route, PDF generation, privacy network behavior, and service-worker update.

## Astral and expense-log regressions

- Automated synthetic coverage: legacy log reconciliation, rounding, zero mileage, unchanged snapshots, and cumulative mileage rendering.
- Verify access icon on navigation right, all seven Astral tools, panel scrolling on narrow screens, Escape/outside/focus-leave dismissal and offline reload. Physical browser/assistive-technology validation is still required.
- Confirm old display options are absent; Study review and colour-blind shift controls remain.
- Load/restore an old non-£0.30 state: Setup shows £0.30; recorded mileage stays unchanged and log totals reconcile without duplicate rows.
