# PIER · Travel Expense Manager

**Painless and Intelligent Expenses Reporting** is a local-first PWA for preparing monthly travel claims from an Allocate rota.

[Live PIER](https://pier.bynour.uk) · [Beta PIER](https://beta.pier.bynour.uk)

## Workflow

1. **Setup:** enter personal and journey details, connect an ICS rota or import a file, and draw or upload a signature.
2. **Shifts:** review the current and previous three London calendar months in calendar or list view. Work defaults to Claim; Study requires review. Add unscheduled work when needed.
3. **Claim Form:** review and edit journey rows, preview the payroll document, and save monthly PDFs. Attach the files and receipts yourself when emailing payroll.
4. **Expense Log:** review exported periods, claimable miles, miscellaneous costs and estimated totals, including cumulative miles and money.

Mileage reimbursement is estimated at **£0.30 per claimable mile**, plus miscellaneous expenses. Claimable miles are the sum of journey mileage, including outbound and home-bound rows. Saved logs are recalculated from their recorded miles when loaded or restored; existing downloaded PDFs are not modified.

## Accessibility and appearance

PIER uses the Sunrise Harbour palette. The **Astral Accessibility** access button sits at the right of the navigation bar, replacing the former Display & accessibility menu. It provides text-to-speech, contrast, saturation, text size, text spacing, screen mask and line-height controls. The MIT-licensed bundle is served with PIER and cached for offline use; see [vendor provenance](vendor/astral/README.md).

Keyboard navigation, visible focus, Setup error links, explicit claim states and a separate colour-blind shift option remain available. WCAG 2.2 AA is the target; full conformance is not claimed. Payroll PDFs are image-based, and physical assistive-technology testing remains outstanding.

## Privacy and backups

Names, addresses, payroll/vehicle details, signatures, complete rota data and detailed claim histories are stored locally. A live ICS URL is sent to the PIER Worker to retrieve the calendar. Optional telemetry sends limited pseudonymous usage and aggregate amounts/mileage. Deliberately submitted feedback may include reviewed details/screenshots and is retained for 90 days.

Backups contain local application data, excluding PDFs. Keep them private. Restore replaces the current device's PIER data. Monthly calendar reminders work locally; optional push reminders require the supported Worker/browser setup.

## Development and releases

```sh
pnpm install --frozen-lockfile
pnpm test
pnpm run build:site
```

`index.html`, `styles.css` and ordered `app-parts/` modules form the browser application. `scripts/build-site.mjs` copies public assets to `site-dist/`. Cloudflare Worker services provide the ICS proxy, push reminders, aggregate telemetry, feedback and protected operations dashboard.

GitHub Actions deploys `beta` to beta only and `main` to live only. Verify meaningful changes in beta before production. Keep application, asset-query and service-worker versions aligned. Never commit credentials, personal backups or private calendar URLs.

## Maintained project documentation

Read [AGENTS.md](AGENTS.md) before changing the application. Update this overview when user-visible features, setup, privacy or deployment change; detailed release history belongs in the changelog.

- [Product specification](docs/PIER_SPEC.md)
- [Architecture and data boundaries](docs/ARCHITECTURE.md)
- [Design system](docs/DESIGN_SYSTEM.md)
- [Testing checklist](docs/TESTING.md)
- [Changelog](docs/CHANGELOG.md)
