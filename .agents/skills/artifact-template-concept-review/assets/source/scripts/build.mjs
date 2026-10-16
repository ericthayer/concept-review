import {readFileSync,writeFileSync,mkdirSync,cpSync,existsSync,rmSync} from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {validateConfig,validateBrief,validateProject,assertSafeDirectory} from './validate.mjs';
import {escapeHTML,renderHeader,renderContent,renderFooter} from '../components/review.mjs';
export const engineRoot = fileURLToPath(new URL('../',import.meta.url));
export function buildReview({project,out,release=false}) {
  project=path.resolve(project); out=path.resolve(out);
  if(out===project || !out.startsWith(project+path.sep)) throw new Error('Output must be a child directory of the project');
  if(['concepts','assets','shared'].includes(path.relative(project,out).split(path.sep)[0])) throw new Error('Output cannot overwrite source directories');
  if(existsSync(out) && !existsSync(path.join(out,'.concept-review-build'))) throw new Error('Refusing to replace an unrecognized output directory');
  const config=validateConfig(JSON.parse(readFileSync(path.join(project,'review.config.json'),'utf8')));
  validateProject(project,config);
  if(release) validateBrief(JSON.parse(readFileSync(path.join(project,'brief.json'),'utf8')));
  for(const name of ['assets','shared']) if(existsSync(path.join(project,name))) assertSafeDirectory(path.join(project,name));
  rmSync(out,{recursive:true,force:true}); mkdirSync(path.join(out,'review'),{recursive:true});
  writeFileSync(path.join(out,'.concept-review-build'),'Generated; safe to rebuild.');
  const values={title:escapeHTML(`${config.brand.name} — Concept Review`),description:escapeHTML(config.introduction.join(' ')),id:escapeHTML(config.id),revision:escapeHTML(config.revision),header:renderHeader(config),content:renderContent(config),footer:renderFooter(config)};
  const master=readFileSync(path.join(engineRoot,'templates/master.html'),'utf8');
  writeFileSync(path.join(out,'index.html'),master.replace(/\{\{(\w+)\}\}/g,(_,key)=>{if(!(key in values)) throw new Error(`Unknown template key ${key}`);return values[key];}));
  for(const file of ['base.css','review.css']) cpSync(path.join(engineRoot,'styles',file),path.join(out,'review',file));
  cpSync(path.join(engineRoot,'browser/review.js'),path.join(out,'review/review.js'));
  for(const c of config.concepts) cpSync(path.join(project,'concepts',c.id),path.join(out,c.slug),{recursive:true});
  for(const name of ['assets','shared']) if(existsSync(path.join(project,name))) cpSync(path.join(project,name),path.join(out,name),{recursive:true});
  const navigation=config.concepts.map(c=>({id:c.id,title:c.title,route:`/${c.slug}/`}));
  writeFileSync(path.join(out,'review/navigation.json'),JSON.stringify({id:config.id,revision:config.revision,concepts:navigation},null,2));
  cpSync(path.join(engineRoot,'browser/concept-nav.js'),path.join(out,'review/concept-nav.js'));
  mkdirSync(path.join(out,'thanks'),{recursive:true});
  writeFileSync(path.join(out,'thanks/index.html'),`<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex"><title>Feedback received</title><link rel="stylesheet" href="/review/base.css"><link rel="stylesheet" href="/review/review.css"><main class="confirmation"><p class="study-label">REVIEW / RESPONSE RECEIVED</p><h1>Thank you for your perspective.</h1><p>Your feedback will help shape the next direction.</p><a href="/">Return to both concepts →</a></main></html>`);
  writeFileSync(path.join(out,'404.html'),'<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>Page not found</title><h1>That page is not part of this review.</h1><a href="/">Return to concepts</a></html>');
  writeFileSync(path.join(out,'robots.txt'),'User-agent: *\nDisallow: /\n');
  writeFileSync(path.join(out,'_headers'),'/*\n  X-Content-Type-Options: nosniff\n  Referrer-Policy: strict-origin-when-cross-origin\n  X-Frame-Options: SAMEORIGIN\n  Content-Security-Policy: frame-ancestors \'self\'\n  X-Robots-Tag: noindex, nofollow\n');
  console.log(`Built ${config.id} (${config.revision}): /, ${navigation.map(c=>c.route).join(', ')}, /thanks/`);
  return {out,config};
}
if(process.argv[1] && path.resolve(process.argv[1])===fileURLToPath(import.meta.url)) {
  const args=process.argv.slice(2), value=key=>args[args.indexOf(key)+1];
  if(!args.includes('--project')||!args.includes('--out')) throw new Error('Usage: build.mjs --project <directory> --out <project/dist> [--release]');
  buildReview({project:value('--project'),out:value('--out'),release:args.includes('--release')});
}
