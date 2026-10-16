import {existsSync, lstatSync, readdirSync} from 'node:fs';
import path from 'node:path';
export function validateConfig(config) {
  const errors = [];
  const text = (v,label) => {if(typeof v !== 'string' || !v.trim() || v.length > 4000) errors.push(`${label}: provide nonempty text (max 4000 characters)`);};
  const slug = (v,label) => {if(typeof v!=='string'|| !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(v)) errors.push(`${label}: use lowercase words separated by hyphens`);};
  if(config.schemaVersion!==1) errors.push('schemaVersion must be 1');
  slug(config.id,'id'); text(config.revision,'revision');
  for(const key of ['name','mark','subtitle','footer']) text(config.brand?.[key],`brand.${key}`);
  if(config.brand?.website) {try {const url=new URL(config.brand.website);if(url.protocol!=='https:' || url.username || url.password) throw Error();}catch{errors.push('brand.website must be an HTTPS URL without credentials');}}
  text(config.eyebrow,'eyebrow');
  if(!Array.isArray(config.heading)||config.heading.length!==2) errors.push('heading must contain two lines'); else config.heading.forEach((v,i)=>text(v,`heading.${i}`));
  if(!Array.isArray(config.introduction)||!config.introduction.length) errors.push('introduction must contain text'); else config.introduction.forEach(v=>text(v,'introduction'));
  if(!Array.isArray(config.concepts)||config.concepts.length!==2) errors.push('exactly two concepts are required');
  else config.concepts.forEach((c,i)=>{
    if(c.id !== ['a','b'][i]) errors.push('concept IDs must be a then b');
    slug(c.slug,`concepts.${i}.slug`);
    if(['review','assets','shared','thanks','404','index'].includes(c.slug)) errors.push(`reserved slug: ${c.slug}`);
    for(const key of ['title','tagline','previewLabel','description','linkLabel']) text(c[key],`concepts.${i}.${key}`);
    if(!Array.isArray(c.attributes)||!c.attributes.length) errors.push('concept attributes are required'); else c.attributes.forEach(v=>text(v,'attribute'));
  });
  if(config.concepts?.[0]?.slug === config.concepts?.[1]?.slug) errors.push('concept routes must be distinct');
  if(errors.length) throw new Error(errors.join('\n'));
  return config;
}
export function validateBrief(brief) {
  const missing = [];
  for(const key of ['goal','audience','primaryAction','aesthetics','contentSource']) if(!brief[key]?.trim()) missing.push(key);
  if(!brief.functionality?.length) missing.push('functionality');
  if(!brief.references?.some(r=>r.source?.trim() && r.takeaways?.trim())) missing.push('visual reference with takeaways');
  if(missing.length) throw new Error(`Interview required: ${missing.join(', ')}`);
  if(!brief.directions || brief.directions.length!==2 || brief.directions.some((d,i)=>d.id!==['a','b'][i] || !d.rationale?.trim() || !d.tradeoffs?.trim() || !['ready','approved'].includes(d.status))) throw new Error('Both directions require rationale, tradeoffs and ready/approved status before release');
}
export function assertSafeDirectory(dir) {
  for(const name of readdirSync(dir)) {
    const item=path.join(dir,name), stat=lstatSync(item);
    if(stat.isSymbolicLink()) throw new Error(`Symlinks are not allowed in published content: ${item}`);
    if(name.startsWith('.') || /(?:\.pem|\.key|\.zip|\.tar\.gz)$/.test(name)) throw new Error(`Private or unsupported publish file: ${item}`);
    if(stat.isDirectory()) assertSafeDirectory(item);
  }
}
export function validateProject(project, config) {
  for(const c of config.concepts) {
    const directory=path.join(project,'concepts',c.id);
    if(!existsSync(path.join(directory,'index.html'))) throw new Error(`Missing concept ${c.id}/index.html`);
    assertSafeDirectory(directory);
  }
}
