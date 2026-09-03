# PIER beta WCAG 2.2 AA audit record

## Scope and status

Audit baseline: PIER beta version 53, source branch `beta`. The release commit is recorded in the deployment result. This review covers the beta browser application, installed-PWA shell, offline shell, generated PDFs, email draft and calendar-reminder hand-offs. Production, the administrative dashboard, push delivery by external platforms, and real assistive-technology sessions are not represented as tested unless explicitly listed below.

This is an implementation review and automated regression record, not a conformance claim. Manual checks with disabled users and supported assistive technologies remain required.

## Criterion record

| WCAG 2.2 criterion | Result | Evidence or remaining work |
|---|---|---|
| 1.1.1 Non-text Content | Pass in reviewed UI | Meaningful app images/icons have text alternatives or accessible names; decorative symbols are hidden. Recheck generated document imagery. |
| 1.3.1 Info and Relationships | Fail | Browser headings, labels, captions, tabs and dialogs were strengthened. Generated payroll PDFs remain untagged. |
| 1.3.2 Meaningful Sequence | Pass in reviewed UI | Single-column Setup and ordered completion sequence follow DOM order. PDF reading order is unverified. |
| 1.3.4 Orientation | Pass by implementation | No orientation lock. Portrait/landscape physical-device retest remains. |
| 1.3.5 Identify Input Purpose | Needs manual retest | Native input types and labels are present; autocomplete coverage remains to be catalogued. |
| 1.4.1 Use of Colour | Pass in reviewed UI | Shift states use words/symbols and controls as well as colour. |
| 1.4.3 Contrast (Minimum) | Pass for defined semantic palette | Normal text and button combinations are checked against AA targets; dashboard overrides must preserve the same constraint. |
| 1.4.4 Resize Text | Pass by implementation | Relative layout and optional larger-text preference added; physical 200% retest remains. |
| 1.4.10 Reflow | Pass by implementation | Page minimum widths removed/overridden; payroll preview scrolls in its labelled container. Manual 320 px/400% matrix remains. |
| 1.4.11 Non-text Contrast | Pass in reviewed UI | Focus, controls and boundaries use the high-contrast semantic palette. Forced-colour rules added. |
| 1.4.12 Text Spacing | Pass by implementation | Line height and wrapping permit overrides; manual browser matrix remains. |
| 1.4.13 Content on Hover or Focus | Needs manual retest | Essential guidance is visible rather than hover-only. Full inventory remains. |
| 2.1.1 Keyboard | Pass by implementation | Tabs support arrows/Home/End; backup, editors and dialogs are keyboard operable. Full workflow retest remains. |
| 2.1.2 No Keyboard Trap | Pass by implementation | Modal focus is deliberately contained and Escape remains native; manual retest remains. |
| 2.4.1 Bypass Blocks | Pass | Visible-on-focus “Skip to main content” link. |
| 2.4.3 Focus Order | Pass by implementation | DOM order is logical and dialogs return focus. Screen-reader/browser matrix remains. |
| 2.4.6 Headings and Labels | Pass in reviewed UI | Each app view has an `h1`; repeated claim and delete controls include context. |
| 2.4.7 Focus Visible | Pass by implementation | Consistent high-contrast focus indicator. |
| 2.4.11 Focus Not Obscured (Minimum) | Pass by implementation | Scroll margin accounts for sticky navigation. |
| 2.5.3 Label in Name | Pass in reviewed UI | Accessible names retain visible action wording. |
| 2.5.8 Target Size (Minimum) | Pass by implementation | Controls are at least 24 CSS px; frequent controls target about 44 px. |
| 3.2.1 On Focus / 3.2.2 On Input | Pass in reviewed UI | Focus alone does not change context; explicit tab and form actions do. |
| 3.3.1 Error Identification | Pass for Setup | Persistent field-level messages and linked summary replace alert-only Setup validation. Other complex flows require inventory. |
| 3.3.2 Labels or Instructions | Pass in reviewed UI | Labels/instructions are adjacent and at least 16 px. |
| 3.3.3 Error Suggestion | Pass for Setup | Errors state what is missing and how to proceed. |
| 3.3.7 Redundant Entry | Pass in reviewed workflow | Valid values are retained and returning state is local. |
| 3.3.8 Accessible Authentication | Not applicable to app | PIER’s user workflow has no authentication. Dashboard is outside scope. |
| 4.1.2 Name, Role, Value | Pass by implementation | Tabs/panels, dialogs, controls and repeated fields have programmatic names and state. AT retest remains. |
| 4.1.3 Status Messages | Pass in reviewed UI | Progress, import, export and Undo regions expose status without moving focus. Important-message inventory remains. |

All other Level A/AA criteria are currently recorded as not applicable to the reviewed UI or not yet manually assessed; they must be explicitly re-evaluated during the formal device/AT audit.

## Test environment and limitations

- Automated checks: repository regression checks, Worker integration tests, JavaScript syntax checks and static-site build.
- Manual matrix still required: current Chrome/Edge/Firefox/Safari; Windows high contrast; 320 CSS px and 400% zoom; 200% text; portrait/landscape and touch.
- Assistive technology still required: NVDA with supported Windows browser, VoiceOver/Safari if Apple is in scope, TalkBack/Chrome if Android is in scope.
- External verification still required: notification delivery, generated PDF screen-reader/high-zoom behavior and payroll acceptance of a non-drawn signature.

## Retest rule

Every failed or untested item remains open until evidence is attached to a named browser/device/assistive-technology result. Automated tools support but do not replace that assessment.
