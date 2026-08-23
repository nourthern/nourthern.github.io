# Travel Claims Manager v9 - test report

## Automated/static checks

- `node --check app.js`: PASS
- Every JavaScript `$('<id>')` reference has a matching HTML element: PASS
- Service-worker cache updated for v9: PASS
- ZIP integrity test: PASS

## Workflow checks

- Mandatory Setup field list includes all nine requested fields plus sample signature: PASS
- Navigation to Shifts/Claim/Expense Log is blocked when required Setup data is incomplete: PASS
- Personal number still requires at least eight digits: PASS
- Opening Shifts invokes automatic live ICS refresh: PASS (code-path validation)
- Calendar comparison reports added, removed and changed event counts: PASS (logic review)
- Manual ICS-file import remains present: PASS
- Claim selector exposes all selected claim months with previous/next review controls: PASS
- Humber Bridge button is disabled unless `Toll road` is selected: PASS
- Payroll mailto address/subject/body generation: PASS (static validation)

## PDF regression checks

The July and August trial PDFs supplied by the tester were visually reviewed. Page 1 showed the old `200` suffix and slash pattern behind the personal number, while page 2 showed a small extra strip below the header, body/header column misalignment, detached totals and partially obscured legend headings.

v9 redraws those areas. A 1404×992 page-2 geometry render was generated from the actual template and visually inspected:

- body starts at the header boundary: PASS
- journey vertical rules align with header rules: PASS
- blank original journey rows are removed: PASS
- total boxes connect to the table and align under their columns: PASS
- `[1] TYPE OF CLAIM MUST BE COMPLETED` and passenger-mileage legend remain fully visible: PASS

A page-1 mask/overlay regression render was also inspected:

- `200` suffix removed: PASS
- preprinted personal-number slashes removed: PASS
- clean replacement lines remain visible: PASS

## Environment limitation

The sandbox could not make an outbound DNS request to the deployed Cloudflare Worker, so the user's live Allocate URL could not be end-to-end fetched from this environment. The existing Worker path and direct ICS fallback are unchanged apart from automatic invocation and comparison logic.
