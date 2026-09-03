# PIER beta accessibility issue register

| Priority | Type | Requirement | State / retest outcome |
|---|---|---|---|
| Critical | Confirmed WCAG failure | Replace image/canvas-only payroll PDF with selectable, tagged content or a fully accessible equivalent | Open; HTML journey editor is available, but exported PDF remains untagged. |
| High | Required correction | Complete NVDA keyboard and screen-reader workflow testing | Not tested; requires supported Windows environment. |
| High | Required correction | Complete VoiceOver and TalkBack testing where those users are in scope | Not tested; requires supported devices. |
| High | Required correction | Verify 320 px, 400% zoom, 200% text and text-spacing overrides across every state | Implementation updated; full manual matrix pending. |
| High | Required correction | Inventory remaining validation and replace any important transient-only errors | Setup corrected; remaining workflows pending audit. |
| Medium | Required correction | Provide typed/uploaded signature alternative | Blocked pending payroll approval. |
| Medium | Required correction | Verify all contrast after dashboard customisation | Default semantic palette reviewed; runtime override governance/retest required. |
| Medium | Required correction | Verify push, calendar and email hand-offs on target platforms | Wording updated; external-platform retest pending. |
| Low | Optional enhancement | Persist larger-text, spacing and calmer-background preferences across devices | Controls added locally; cross-device synchronisation is not planned because personal data remains local. |

Corrected in beta version 53: `/ics` Worker routing; skip link and main headings; keyboard tabs and associated panels; visible backup control; readable claim editor and isolated payroll preview; contextual repeated-control names; persistent Setup errors; focus/dialog behavior; shift progress, filters, weekly grouping and Undo; Expense Log terminology/caption/Undo; reduced motion; responsive and forced-colour styling; optional feedback no longer opens automatically.
