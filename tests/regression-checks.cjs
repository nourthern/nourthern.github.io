'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const read = (...parts) => fs.readFileSync(path.join(root, ...parts), 'utf8');

const html = read('index.html');
const styles = read('styles.css');
const app00 = read('app-parts', 'app-00.js');
const app02 = read('app-parts', 'app-02.js');
const worker = read('cloudflare-worker', 'worker.js');
const liveConfig = read('cloudflare-worker', 'wrangler.jsonc');
const betaConfig = read('cloudflare-worker', 'wrangler.beta.jsonc');
const workflow = read('.github', 'workflows', 'deploy-cloudflare.yml');

// App shell: retain the four primary user workflows and current assembled script.
for (const tab of ['setup', 'shifts', 'claim', 'log']) {
  assert.match(html, new RegExp('id="' + tab + '"'), 'Missing ' + tab + ' panel');
}
assert.match(html, /<script src="app\.js\?v=\d+"><\/script>/);
assert.match(html, /id="calendarHelpDialog"/);
assert.match(html, /id="calendarUrl"/);

// Calendar refresh: the app must select the Worker by deployment and POST live links to /ics.
assert.match(app00, /IS_BETA_DEPLOYMENT/);
assert.match(app00, /APP_CHANNEL=IS_BETA_DEPLOYMENT\?'beta':'live'/);
assert.match(app00, /BAKED_WORKER_URL=IS_BETA_DEPLOYMENT\?'https:\/\/pier-beta\.n-e-alwaa\.workers\.dev':'https:\/\/travel-claims-ics\.n-e-alwaa\.workers\.dev'/);
assert.match(app02, /async function fetchText/);
assert.match(app02, /BAKED_WORKER_URL[^\n]*\/ics/);
assert.match(app02, /method:'POST'/);
assert.match(app02, /JSON\.stringify\(\{url\}\)/);
assert.match(app02, /isIcs\(text\)/);

// Worker: route is POST-only, validates allowed Allocate hosts, and fetches calendars without storing them.
assert.match(worker, /DEFAULT_ALLOWED_HOSTS=\['nlag\.allocate-cloud\.co\.uk'\]/);
assert.match(worker, /if\(url\.pathname==='\/ics'\)/);
assert.match(worker, /if\(request\.method!=='POST'\)/);
assert.match(worker, /fetchCalendar\(raw,env,request\.signal\)/);
assert.match(worker, /BEGIN:VCALENDAR/);
assert.match(worker, /Cache-Control':'no-store, private/);

// Cloudflare deployment separation and beta asset routing.
assert.match(liveConfig, /"name": "travel-claims-ics"/);
assert.match(liveConfig, /"APP_CHANNEL": "live"/);
assert.match(betaConfig, /"name": "pier-beta"/);
assert.match(betaConfig, /"APP_CHANNEL": "beta"/);
assert.match(betaConfig, /"run_worker_first": \["\/ics", "\/dashboard\\*", "\/api\/\\*"\]/);
assert.match(workflow, /wrangler deploy --config cloudflare-worker\/wrangler\.jsonc/);
assert.match(workflow, /wrangler deploy --config cloudflare-worker\/wrangler\.beta\.jsonc/);

// Sunrise Harbour palette and accessible selected/focus states remain wired into the live stylesheet.
for (const token of [
  '--deep-navy:#123047',
  '--steel-blue:#365F7A',
  '--sunset-copper:#98521F',
  '--warm-background:#F7F3EA',
  '--card-white:#FFFDF9',
  '--primary-text:#183242',
  '--tidepool-teal:#2F6F68',
  '--dune-gold:#C18A24'
]) assert.match(styles, new RegExp(token.replace(/[.*+?^\${}()|[\]\\]/g, '\\$&')));
assert.match(styles, /\.tab\.active\{background:var\(--sunset-copper\);color:#fff/);
assert.match(styles, /outline[^}]*var\(--dune-gold\)/);
assert.match(styles, /box-shadow[^}]*var\(--deep-navy\)/);

// Claim-form rendering must stay separate from site-wide presentation styling.
assert.match(styles, /Preserve the official claim document preview and print appearance/);

console.log('Release checks passed.');
