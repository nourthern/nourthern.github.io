# Travel Claims Manager v9

Privacy-first static PWA for preparing monthly travel claims from an Allocate ICS rota.

## Updating the hosted site

Upload the website files/folders from this package to the existing GitHub Pages repository, replacing the previous version. The shared secure Worker URL remains baked into the app. If the POST-based Cloudflare Worker from v7/v8 is already deployed, no Worker change is required for v9.

The service-worker cache is bumped for v9. After GitHub Pages publishes the files, refresh the site once while online; installed PWAs may need to be closed and reopened.

## v9 workflow changes

- Setup now stores the reusable sample signature.
- Full name, base site, designation/job title, personal number, home address, registration, engine cc, one-way claimable miles, commute time and sample signature are mandatory before leaving Setup.
- Shifts automatically refreshes the saved ICS URL each time the tab is opened.
- Refresh compares the latest rota with the previously stored version and reports added, removed and changed events.
- Direct ICS file import remains available if the live refresh is unavailable.
- Claim Form can review every month selected in Shifts using the month selector and previous/next controls.
- `Edit rows` is renamed `Edit table`.
- The signature/export/submission workflow is combined as `Sign and save PDF`: it applies the locally stored signature, dates the form, saves a separate PDF for the current month, and adds that month to the Expense Log.
- Humber Bridge Website is enabled only when Toll road is selected in Setup.
- Email payroll opens the device mail client with the payroll address, subject and body prefilled. Attachments still need to be added by the user because `mailto:` cannot attach local files automatically.

## PDF fixes

- Smaller input-value typography on page 1.
- Removed the old printed `200` suffix beside Claim for Month.
- Removed the preprinted slash pattern behind Personal Number and redraws a clean value line.
- Journey table starts exactly at the header boundary.
- Body column boundaries use the same x-coordinates as the header.
- Original unused rows are blanked before populated rows are drawn.
- Totals are drawn in connected outlined cells aligned under their corresponding columns.
- Legend text below the table is no longer painted over.

## Privacy

Personal details, signature, claims and expense log remain local to the browser/device. The Cloudflare Worker is used only to retrieve the user's ICS calendar and does not receive claim-form details.
