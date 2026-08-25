const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const root = path.resolve(__dirname, '..');
const app01 = fs.readFileSync(path.join(root, 'app-parts', 'app-01.js'), 'utf8');
const app02 = fs.readFileSync(path.join(root, 'app-parts', 'app-02.js'), 'utf8');
const app03 = fs.readFileSync(path.join(root, 'app-parts', 'app-03.js'), 'utf8');
const app04 = fs.readFileSync(path.join(root, 'app-parts', 'app-04.js'), 'utf8');
const app05 = fs.readFileSync(path.join(root, 'app-parts', 'app-05.js'), 'utf8');
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const styles = fs.readFileSync(path.join(root, 'styles.css'), 'utf8');
const sw = fs.readFileSync(path.join(root, 'sw.js'), 'utf8');
const worker = fs.readFileSync(path.join(root, 'cloudflare-worker', 'worker.js'), 'utf8');

const phraseStart = app04.indexOf('function naturalJoin');
const phraseEnd = app04.indexOf("$('emailPayroll')", phraseStart);
assert.ok(phraseStart >= 0 && phraseEnd > phraseStart, 'Payroll month helpers were not found');

const sandbox = {};
vm.runInNewContext(`${app04.slice(phraseStart, phraseEnd)}\nresult = { monthsPhrase };`, sandbox);
const { monthsPhrase } = sandbox.result;

assert.equal(monthsPhrase(['2026-10']), 'October 2026');
assert.equal(monthsPhrase(['2026-10', '2026-11']), 'October and November 2026');
assert.equal(
  monthsPhrase(['2026-10', '2026-11', '2026-12', '2027-01']),
  'October, November and December 2026, and January 2027'
);
assert.equal(
  monthsPhrase(['2027-01', '2026-12', '2026-10', '2026-12', '2026-11']),
  'October, November and December 2026, and January 2027'
);

assert.match(app02, /Payroll's deadline for claims, to be paid end of this month, is on the 5th of the month\\nOpen Travel Claims Manager:/);
assert.match(app02, /LOCATION:\$\{icsEscape\(eventLocation\)\}/);
assert.match(app02, /RRULE:FREQ=MONTHLY;INTERVAL=1/);
assert.match(app04, /drawPage2\(c\.getContext\('2d'\),img2,chunk,isLast\?claimTotals:null,isLast\)/);
assert.match(app04, /function drawPageNumber\(ctx,page,total\)/);
assert.match(app04, /ctx\.fillRect\(0,752,1404,240\)/);
assert.match(app04, /function drawFinalPageLegend/);
assert.match(app04, /if\(showLegend\)drawFinalPageLegend\(ctx,img,bottom\)/);
assert.match(app04, /const dataFont=18,dataMin=11/);
assert.match(app04, /drawWrappedTextFit/);
assert.match(app04, /ctx\.fillText\(fmtNum\(claimTotals\.pass\),869,bottom\+12\)/);
assert.match(app04, /drawTextFit\(ctx,r\.mealFrom\|\|'',1195,y/);
assert.match(app04, /ctx\.fillText\(money\(claimTotals\.meals\)/);
assert.match(html, /id="backupBtn"[^>]+aria-label="Back up site data"/);
assert.match(html, /id="backupBtn"[\s\S]+id="saveStatus"[\s\S]+id="openAbout"/);
assert.doesNotMatch(html, /id="openAbout"[^>]*>[\s\S]{0,150}<circle/);
assert.match(html, /id="busRailOption"/);
assert.match(html, />Above price frequency</);
assert.match(html, /id="perJourneyFrequencyOption"/);
assert.match(html, /id="openNotifications"/);
assert.match(html, /id="prefillExampleData"/);
assert.match(html, /id="expenseFrequency"/);
assert.match(html, /id="otherExpenseFields"/);
assert.match(html, /Report a bug \/ give feedback/);
assert.match(html, /id="bugScreenshot"/);
assert.match(html, /id="calendarHelpDialog"/);
assert.match(html, /id="studyReviewAlert"/);
assert.match(html, /id="privacyDialog"/);
assert.match(html, /id="helpDialog"/);
assert.match(html, /id="aboutDialog"/);
assert.match(html, /id="bugReportDialog"/);
assert.match(app05, /claimedLastThreeMonthsPence/);
assert.match(app05, /claimedCurrentYearPence/);
assert.match(app05, /for\(let i=0;i<22;i\+\+\)/);
assert.match(app05, /Edit cells\?/);
assert.match(app01, /busRailOption\.hidden=passengerUsed/);
assert.match(app01, /type==='parking'&&!\['daily','weekly','monthly'\]\.includes\(frequency\.value\)/);
assert.match(app03, /state\.settings\.commuteType!=='parking'/);
assert.match(app03, /state\.settings\.otherExpenseType!=='parking'/);
assert.match(styles, /#setup input\.has-value,#setup select\.has-value,#setup textarea\.has-value\{background:#fff!important\}/);
assert.match(styles, /\.header-icon-btn\.plain-symbol svg\{width:26px;height:26px;stroke-width:2\.2\}/);
assert.match(html, /Not affiliated with NLaG Trust or Humber Health Partnership\./);
assert.match(app04, /serviceWorker\.addEventListener\('controllerchange'/);
assert.match(app04, /updateViaCache:'none'/);
assert.match(sw, /fetch\(e\.request,\{cache:'no-cache'\}\)/);
assert.match(worker, /\/api\/telemetry/);
assert.match(worker, /\/api\/stats/);
assert.match(worker, /\/api\/bug-report/);
assert.match(worker, /\/api\/push\/status/);
assert.match(worker, /screenshot_data/);
assert.match(worker, /claimed_current_year_pence/);

console.log('Regression checks passed.');
