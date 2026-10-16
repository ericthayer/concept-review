import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import {exhibitions,official} from '../example/shared/museum-data.js';
import {estimateAdmission,getDateNotice,isMuseumClosed} from '../example/shared/planning.js';
import {renderMuseumExample} from '../scripts/render-dmns.mjs';

test('admission estimator uses published rates and distinguishes member admission',()=>{
  assert.equal(estimateAdmission({adult:2,youth:2,senior:0}),97.8);
  assert.equal(estimateAdmission({adult:2,youth:2,senior:0},true),0);
  assert.equal(estimateAdmission({adult:0,youth:0,senior:1}),23.95);
  assert.equal(estimateAdmission({adult:-4,youth:0,senior:0}),0);
  assert.equal(estimateAdmission({adult:100,youth:0,senior:0}),335.4);
});
test('visit planner distinguishes museum closure and temporary exhibition notice',()=>{
  assert.equal(isMuseumClosed('2026-12-25'),true);
  assert.equal(isMuseumClosed('2027-08-26'),true);
  assert.equal(isMuseumClosed('2026-10-28'),false);
  assert.match(getDateNotice('2026-10-28'),/Prehistoric Journey is closed/);
  assert.match(getDateNotice('2026-12-25'),/museum is closed/);
  assert.equal(getDateNotice('not-a-date'),'');
});
test('both concepts contain the requested pages and real supporting exhibition routes',()=>{
  renderMuseumExample();
  for(const concept of ['a','b']) {
    for(const route of ['','visit/','purchase/','exhibitions/',...exhibitions.map(x=>`exhibitions/${x.id}/`)]) {
      const file=`example/concepts/${concept}/${route}index.html`;
      assert.ok(existsSync(file),file);
      const html=readFileSync(file,'utf8');
      assert.ok(html.includes('Independent redesign study'));
      assert.ok(html.includes('October 27–29'));
      assert.ok(!/Eric Thayer|ethayer\.design|Health Scholars|MadRamps/.test(html));
      assert.ok(!html.includes('{{'));
    }
    const purchase=readFileSync(`example/concepts/${concept}/purchase/index.html`,'utf8');
    assert.ok(purchase.includes(official.admission));
    assert.ok(purchase.includes('Your selections are not transferred'));
    const visit=readFileSync(`example/concepts/${concept}/visit/index.html`,'utf8');
    assert.ok(visit.includes('data-day-planner'));
    assert.ok(visit.includes('A suggested digital itinerary, not a map or reservation.'));
  }
  assert.ok(!existsSync('example/assets/portrait.jpg'));
  assert.ok(!existsSync('example/assets/health-scholars.webp'));
});
