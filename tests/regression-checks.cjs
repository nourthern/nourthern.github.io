const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const root = path.resolve(__dirname, '..');
const app02 = fs.readFileSync(path.join(root, 'app-parts', 'app-02.js'), 'utf8');
const app04 = fs.readFileSync(path.join(root, 'app-parts', 'app-04.js'), 'utf8');

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
assert.match(app04, /drawPage2\(c\.getContext\('2d'\),img2,chunk,isLast\?claimTotals:null\)/);
assert.match(app04, /ctx\.fillText\(fmtNum\(claimTotals\.pass\),869,bottom\+12\)/);
assert.match(app04, /ctx\.fillText\(r\.mealFrom\|\|'',1195,y\)/);
assert.match(app04, /ctx\.fillText\(money\(claimTotals\.meals\)/);

console.log('Regression checks passed.');
