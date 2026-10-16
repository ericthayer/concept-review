import {cpSync,existsSync,mkdirSync,readFileSync,writeFileSync} from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
export function scaffoldProject(destination) {
  destination=path.resolve(destination);
  if(existsSync(destination)) throw new Error('Destination already exists; choose a new directory to preserve work');
  mkdirSync(destination,{recursive:true});
  cpSync(fileURLToPath(new URL('../project/',import.meta.url)),destination,{recursive:true});
  console.log(`Scaffolded ${destination}. Complete brief.json, review.config.json and both concepts before a release build.`);
}
if(process.argv[1] && path.resolve(process.argv[1])===fileURLToPath(import.meta.url)) {
  if(!process.argv[2]) throw new Error('Usage: scaffold.mjs <new-project-directory>');
  scaffoldProject(process.argv[2]);
}
