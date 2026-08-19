# Travel Claims Manager v5

A local-first Progressive Web App for preparing monthly NHS travel claims.

## Important
- No account or backend is required.
- Drafts are saved locally using localStorage, a local cookie marker, and Cache Storage when available.
- For PWA installation and ICS URL fetching, serve this folder over HTTPS (or localhost).
- Direct `.ics` file import works without a proxy and is the recommended fallback.
- PDF export uses the supplied Northern Lincolnshire & Goole Hospitals NHS Trust form as the visual template and creates a two-page A4 landscape PDF with only populated journey rows.

## Local Windows test
Use `Start Travel Claims Manager.bat` if included in the package, or run any local static web server and open `index.html` through localhost.

## iOS
Open the HTTPS site in Safari → Share → Add to Home Screen → enable Open as Web App.
