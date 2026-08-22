# Travel Claims Manager

Privacy-first NHS travel claims PWA with local autosave, ICS rota import, monthly claim generation, signature capture, template-based PDF export, and a local expense log.

## What changed in this build

- Top navigation uses real `#setup`, `#shifts`, `#claim`, and `#log` links with JavaScript enhancement. This means the tabs remain navigable even if the app JavaScript encounters a later error.
- ICS URL is stored on the **Setup** tab and reused on future claims.
- Shifts now has only the two requested actions: **Fetch calendar** and **Refresh calendar**.
- Month selection is limited to the current calendar month plus the previous four months.
- A Cloudflare Worker can be used as the preferred server-side ICS fetcher; direct calendar and public CORS fallbacks remain available.
- Direct `.ics` file import remains completely local and does not need the Worker.

## Files

- `index.html`, `styles.css`, `app.js`: PWA
- `sw.js`: offline service worker
- `manifest.json`, `icons/`: PWA installation assets
- `template/`: supplied NHS form pages used for PDF export
- `cloudflare-worker/worker.js`: server-side ICS fetcher
- `cloudflare-worker/wrangler.jsonc`: optional Wrangler configuration
- `cloudflare-worker/tests/worker.test.mjs`: local Worker tests
- `CLOUDFLARE-WORKER-SETUP.md`: beginner setup guide

## Quick local test

For normal website behaviour, serve the folder over localhost instead of double-clicking `index.html`:

- Windows: use `Start Travel Claims Manager.bat`
- macOS/Linux: run `python3 -m http.server 8765` in this folder and open `http://localhost:8765`

You can also open the HTML file directly. Basic navigation and local `.ics` import are designed to work there, but service-worker installation and some browser networking features require HTTPS or localhost.

## Cloudflare Worker

The Worker is restricted by default to `nlag.allocate-cloud.co.uk`, which matches the supplied Allocate calendar host. It only accepts GET/OPTIONS, only fetches HTTPS URLs, limits response size, follows a small number of redirects only when they remain on an allowed host, and never forwards your cookies or credentials.

After deployment, copy the Worker URL into:

**Setup → ICS proxy / Worker URL**

Then put your ICS URL into:

**Setup → ICS calendar URL**

Go to **Shifts → Fetch calendar**.

## Important privacy note

Your ICS URL may contain a private calendar token. Treat it like a password. Do not publish it in GitHub repositories, screenshots, or public documentation. The supplied Allocate URL is intentionally not hard-coded into the app.

## Cloudflare setup

See `CLOUDFLARE-WORKER-SETUP.md` for the beginner-friendly dashboard instructions. Cloudflare's current documentation supports creating a Worker from the Workers & Pages dashboard and deploying it to a `workers.dev` URL. See the official documentation linked in that guide.
