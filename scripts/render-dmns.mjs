import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {exhibitions} from '../example/shared/museum-data.js';
import {escapeHTML,SiteHeader,SiteFooter,MuseumDialogs,HomeA,HomeB,VisitPage,PurchasePage,ExhibitionIndex,ExhibitionDetail} from '../example/shared/museum-components.mjs';
const root=fileURLToPath(new URL('../',import.meta.url));
export function renderMuseumExample(){
  const master=readFileSync(path.join(root,'example/templates/museum-master.html'),'utf8');
  for(const concept of ['a','b']){
    const pages=[{type:'home',title:concept==='a'?'Walk Into Wonder':'Wonder, Panel by Panel',destination:'',content:concept==='a'?HomeA():HomeB()},
      {type:'visit',title:'Plan Your Visit',destination:'visit',content:VisitPage(concept)},
      {type:'purchase',title:'Find Your Tickets',destination:'purchase',content:PurchasePage(concept)},
      {type:'exhibitions',title:'Explore Exhibitions',destination:'exhibitions',content:ExhibitionIndex(concept)},
      ...exhibitions.map(item=>({type:'detail',title:item.title,exhibition:item.id,destination:`exhibitions/${item.id}`,content:ExhibitionDetail(concept,item)}))];
    for(const page of pages){
      const values={concept,page:page.type,exhibition:page.exhibition||'',theme:concept==='a'?'#f5f4ef':'#f4f0e4',title:escapeHTML(`${page.title} — DMNS Redesign Study`),description:escapeHTML('An independent design concept for the Denver Museum of Nature & Science. Explore, plan a visit, and find official ticket destinations.'),header:SiteHeader(concept,page.type),content:page.content,footer:SiteFooter(concept),dialogs:MuseumDialogs(concept)};
      const directory=path.join(root,'example/concepts',concept,page.destination);mkdirSync(directory,{recursive:true});
      writeFileSync(path.join(directory,'index.html'),master.replace(/\{\{(\w+)\}\}/g,(_,key)=>values[key]??''));
    }
  }
  console.log('Rendered 14 DMNS concept pages from the shared museum master and typed content.');
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url))renderMuseumExample();
