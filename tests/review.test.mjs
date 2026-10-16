import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync,readFileSync,writeFileSync,existsSync,rmSync,readdirSync} from 'node:fs';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {buildReview} from '../.agents/skills/artifact-template-concept-review/assets/source/scripts/build.mjs';
import {scaffoldProject} from '../.agents/skills/artifact-template-concept-review/assets/source/scripts/scaffold.mjs';
import {validateConfig,validateBrief} from '../.agents/skills/artifact-template-concept-review/assets/source/scripts/validate.mjs';
const config=JSON.parse(readFileSync(new URL('../example/review.config.json',import.meta.url)));
const brief=JSON.parse(readFileSync(new URL('../example/brief.json',import.meta.url)));
test('release intake rejects missing goal and missing visual references',()=>{
  validateBrief(brief);
  assert.throws(()=>validateBrief({...brief,goal:''}),/Interview required: goal/);
  assert.throws(()=>validateBrief({...brief,references:[]}),/visual reference/);
  assert.throws(()=>validateBrief({...brief,directions:brief.directions.map(d=>({...d,status:'draft'}))}),/ready\/approved/);
});
test('config rejects route collisions, path traversal and executable URLs',()=>{
  for(const slug of ['../private','assets','concept-a']) {
    const bad=structuredClone(config);bad.concepts[1].slug=slug;
    assert.throws(()=>validateConfig(bad));
  }
  assert.throws(()=>validateConfig({...config,brand:{...config.brand,website:'javascript:alert(1)'}}));
  assert.throws(()=>validateConfig({...config,concepts:[config.concepts[0]]}),/exactly two/);
});
test('fresh scaffold produces independent HTML routes and escapes client copy',()=>{
  const temp=mkdtempSync(path.join(tmpdir(),'concept-review-'));
  try {
    const project=path.join(temp,'client');scaffoldProject(project);
    assert.throws(()=>scaffoldProject(project),/already exists/);
    const settings=JSON.parse(readFileSync(path.join(project,'review.config.json')));
    settings.brand.name='Acme <script>alert(1)</script>';
    settings.concepts[0].slug='editorial';settings.concepts[1].slug='workspace';
    writeFileSync(path.join(project,'review.config.json'),JSON.stringify(settings));
    const out=path.join(project,'dist');
    assert.throws(()=>buildReview({project,out,release:true}),/Interview required/);
    buildReview({project,out});
    const html=readFileSync(path.join(out,'index.html'),'utf8');
    assert.ok(html.includes('Acme &lt;script&gt;'));
    assert.ok(!html.includes('<script>alert(1)</script>'));
    for(const file of ['editorial/index.html','workspace/index.html','review/concept-nav.js','thanks/index.html','404.html']) assert.ok(existsSync(path.join(out,file)),file);
    assert.ok(!existsSync(path.join(out,'brief.json')));
    assert.ok(!existsSync(path.join(out,'review.config.json')));
    assert.ok(html.includes('name="concept-feedback"'));
    for(const field of ['form-name','review-id','revision','viewport','bot-field','preference','keep','changes','name','email']) assert.ok(html.includes(`name="${field}"`),field);
    const routes=JSON.parse(readFileSync(path.join(out,'review/navigation.json')));
    assert.deepEqual(routes.concepts.map(c=>c.route),['/editorial/','/workspace/']);
    buildReview({project,out}); // Deterministic rebuild in owned output.
    assert.equal(readFileSync(path.join(out,'index.html'),'utf8'),html);
    assert.throws(()=>buildReview({project,out:path.join(project,'concepts')}),/overwrite source/);
  } finally {rmSync(temp,{recursive:true,force:true});}
});
test('example keeps both complete concepts and a compatible form',()=>{
  const project=path.resolve('example'),out=path.join(project,'dist');
  buildReview({project,out,release:true});
  const files=[];
  function walk(dir){for(const ent of readdirSync(dir,{withFileTypes:true})){const p=path.join(dir,ent.name);if(ent.isDirectory())walk(p);else files.push(p);}}
  walk(out);
  for(const file of files.filter(f=>/\.(html|css|js)$/.test(f))) {
    const source=readFileSync(file,'utf8');
    const urls=[...source.matchAll(/(?:src|href)=["']([^"']+)["']/g),...source.matchAll(/(?:from\s+|import\s*)["']([^"']+)["']/g),...source.matchAll(/url\(["']?([^\s)'";]+)["']?\)/g)].map(m=>m[1]);
    for(const url of urls) {
      if(/^(?:https?:|mailto:|data:|#)/.test(url)||url.includes('${')) continue;
      const clean=url.split(/[?#]/)[0];if(!clean)continue;
      const target=clean.startsWith('/')?path.join(out,clean):path.resolve(path.dirname(file),clean);
      assert.ok(existsSync(target)||existsSync(path.join(target,'index.html')),`${path.relative(out,file)} -> ${url}`);
    }
  }
  const index=readFileSync(path.join(out,'index.html'),'utf8');
  assert.equal((index.match(/<iframe /g)||[]).length,2);
  assert.ok(index.includes('data-netlify="true"'));
  assert.ok(index.includes('action="/thanks/"'));
});
