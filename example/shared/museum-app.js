import {exhibitions,findExhibition,official} from './museum-data.js';
import {estimateAdmission,getDateNotice,isMuseumClosed} from './planning.js';
import {escapeHTML,icon,route} from './museum-components.mjs';

const e=escapeHTML;
export function safeGet(key){try{return sessionStorage.getItem(key);}catch{return null;}}
export function safeSet(key,value){try{sessionStorage.setItem(key,value);}catch{}}
export function getMotionPreference(){let stored=null;try{stored=localStorage.getItem('dmns-motion');}catch{}return stored==='off'||matchMedia('(prefers-reduced-motion:reduce)').matches?'off':'on';}
let transition;
export function updateView(update,direction='forward') {
  document.documentElement.dataset.travel=direction;
  transition?.skipTransition();
  if(getMotionPreference()==='off'||typeof document.startViewTransition!=='function') {update();return Promise.resolve();}
  transition=document.startViewTransition(update);
  const active=transition;
  return active.finished.catch(()=>{}).finally(()=>{if(transition===active)transition=null;});
}
export function announce(message){document.querySelector('.live-announcement').textContent=message;}
export function initializeMotion(){
  const set=()=>{const preference=getMotionPreference();document.documentElement.dataset.motion=preference;if(preference==='off'){transition?.skipTransition();for(const animation of document.getAnimations?document.getAnimations():[])animation.cancel();}document.querySelectorAll('[data-motion-toggle]').forEach(b=>{b.textContent=`Motion ${preference}`;b.setAttribute('aria-pressed',String(preference==='off'));});};
  set();
  document.querySelectorAll('[data-motion-toggle]').forEach(button=>button.addEventListener('click',()=>{const next=getMotionPreference()==='on'?'off':'on';try{localStorage.setItem('dmns-motion',next);}catch{}document.documentElement.dataset.motion=next;set();announce(next==='off'?'Motion reduced. All content remains available.':'Motion enabled where your system preference allows.');}));
  matchMedia('(prefers-reduced-motion:reduce)').addEventListener('change',set);
}
export function initializeDepth(){
  const scenes=[...document.querySelectorAll('[data-depth-scene]')];if(!scenes.length)return;
  let scheduled=false;const visible=new Set();
  const render=()=>{scheduled=false;for(const scene of visible){const bounds=scene.getBoundingClientRect(),value=Math.max(0,Math.min(1,(innerHeight-bounds.top)/(innerHeight+bounds.height)));scene.style.setProperty('--depth',getMotionPreference()==='off'||innerWidth<760?'0':value.toFixed(4));}};
  const schedule=()=>{if(!scheduled){scheduled=true;requestAnimationFrame(render);}};
  const observer=new IntersectionObserver(entries=>{entries.forEach(entry=>entry.isIntersecting?visible.add(entry.target):visible.delete(entry.target));schedule();},{rootMargin:'100px'});
  scenes.forEach(scene=>observer.observe(scene));addEventListener('scroll',schedule,{passive:true});addEventListener('resize',schedule);addEventListener('pagehide',()=>{observer.disconnect();removeEventListener('scroll',schedule);removeEventListener('resize',schedule);},{once:true});
}
export function initializeFilters(){
  const filters=[...document.querySelectorAll('[data-filter]')];if(!filters.length)return;
  filters.forEach(button=>button.addEventListener('click',()=>updateView(()=>{
    filters.forEach(b=>b.setAttribute('aria-pressed',String(b===button)));
    const items=[...document.querySelectorAll('[data-filter-item]')];let count=0;
    items.forEach(item=>{item.hidden=button.dataset.filter!=='All'&&item.dataset.category!==button.dataset.filter;if(!item.hidden)count++;});
    document.querySelector('[data-filter-count]').textContent=`${count} exhibition${count===1?'':'s'}`;
  },'lateral')));
}
export function initializePanelReveals(){
  if(document.documentElement.dataset.concept!=='b'||getMotionPreference()==='off')return;
  const panels=[...document.querySelectorAll('.comic-chapter .comic-panel')];
  const observer=new IntersectionObserver(entries=>{
    for(const entry of entries){if(!entry.isIntersecting)continue;
      const panel=entry.target;observer.unobserve(panel);
      if(getMotionPreference()==='off'||typeof panel.animate!=='function')continue;
      panel.animate([{opacity:.65,transform:'translateY(18px)'},{opacity:1,transform:'translateY(0)'}],{duration:500,easing:'cubic-bezier(.2,.75,.2,1)'});
      const subject=panel.querySelector('img,.fossil-drawing');
      subject?.animate([{opacity:.7,transform:'scale(1.035)'},{opacity:1,transform:'scale(1)'}],{duration:650,delay:80,easing:'cubic-bezier(.2,.75,.2,1)'});
    }
  },{threshold:.15});
  panels.forEach(panel=>observer.observe(panel));addEventListener('pagehide',()=>observer.disconnect(),{once:true});
}
export function initializeDialogs(concept){
  const directory=document.querySelector('#directory-dialog'),specimen=document.querySelector('#specimen-dialog'),credits=document.querySelector('#credits-dialog');
  let trigger=null,selectedImage=null,previousImageName='',previousOverflow='';
  function open(dialog,button){trigger=button;previousOverflow=document.body.style.overflow;document.body.style.overflow='hidden';if(!dialog.open)dialog.showModal();dialog.querySelector('button')?.focus({preventScroll:true});}
  function close(dialog){const image=selectedImage,oldName=previousImageName;return updateView(()=>{dialog.close();if(image)image.style.viewTransitionName='specimen-image';document.body.style.overflow=previousOverflow;trigger?.focus({preventScroll:true});},'back').then(()=>{if(selectedImage===image&&image){image.style.viewTransitionName=oldName;selectedImage=null;}});}
  document.querySelector('[data-open-directory]')?.addEventListener('click',event=>{const button=event.currentTarget;updateView(()=>open(directory,button));});
  document.querySelector('[data-open-credits]')?.addEventListener('click',event=>{open(credits,event.currentTarget);});
  for(const dialog of [directory,specimen,credits]){
    dialog.querySelector('[data-close-dialog]')?.addEventListener('click',()=>close(dialog));
    dialog.addEventListener('cancel',event=>{event.preventDefault();close(dialog);});
    dialog.addEventListener('click',event=>{if(event.target===dialog){const bounds=dialog.getBoundingClientRect();if(event.clientX<bounds.left||event.clientX>bounds.right||event.clientY<bounds.top||event.clientY>bounds.bottom)close(dialog);}});
  }
  document.querySelectorAll('[data-inspect]').forEach(button=>button.addEventListener('click',()=>{
    const item=findExhibition(button.dataset.inspect);if(!item)return;
    const source=button.closest('article,figure,.comic-panel,.detail-narrative')?.querySelector('img');
    if(source){selectedImage=source;previousImageName=source.style.viewTransitionName;source.style.viewTransitionName='specimen-image';}
    updateView(()=>{
      if(source)source.style.viewTransitionName='none';
      specimen.querySelector('[data-specimen-content]').innerHTML=`<img class="specimen-media" src="${item.image}" alt="${e(item.alt)}" style="view-transition-name:specimen-image"><div class="specimen-copy"><p class="eyebrow">A CLOSER LOOK / ${e(item.title)}</p><h2 id="specimen-title">${e(item.factLabel)}</h2><p>${e(item.fact)}</p><a class="text-link" href="${route(concept,`exhibitions/${item.id}`)}">Explore ${e(item.title)} ${icon()}</a></div>`;
      open(specimen,button);
    });
  }));
  document.querySelector('[data-reveal-fossil]')?.addEventListener('click',event=>{
    const button=event.currentTarget;updateView(()=>{const revealed=button.dataset.revealed!=='true';button.dataset.revealed=String(revealed);button.setAttribute('aria-expanded',String(revealed));button.querySelector('.fossil-drawing').hidden=revealed;button.querySelector('.fossil-reveal').hidden=!revealed;announce(revealed?'The drawing reveals a photograph of fossil skulls in the DMNS collection.':'The decorative fossil drawing is visible again.');});
  });
}
export function initializeTickets(){
  if(!document.querySelector('[data-total]'))return;
  const counts={adult:2,youth:0,senior:0};let member=false;
  function render(){for(const [key,count] of Object.entries(counts)){document.querySelector(`[data-count-output="${key}"]`).textContent=count;document.querySelector(`[data-count="${key}"][data-delta="-1"]`).disabled=count===0;document.querySelector(`[data-count="${key}"][data-delta="1"]`).disabled=count===12;}
    document.querySelector('[data-total]').textContent=new Intl.NumberFormat('en-US',{style:'currency',currency:'USD'}).format(estimateAdmission(counts,member));
    document.querySelector('.member-message').hidden=!member;
    for(const [key,price] of Object.entries({adult:27.95,youth:20.95,senior:23.95}))document.querySelector(`[data-rate="${key}"]`).textContent=member?'Included':`$${price.toFixed(2)}`;
    const link=document.querySelector('[data-checkout-link]');link.href=member?official.planetarium:official.admission;link.innerHTML=`${member?'Find member experiences':'Continue on dmns.org'} ${icon('up',18)}`;
    document.querySelectorAll('[data-visitor]').forEach(button=>button.setAttribute('aria-pressed',String((button.dataset.visitor==='member')===member)));
    document.querySelector('.estimate-label').textContent=member?'Member general admission is included':'General-admission estimate';
  }
  document.querySelectorAll('[data-count]').forEach(button=>button.addEventListener('click',()=>{const key=button.dataset.count;counts[key]=Math.max(0,Math.min(12,counts[key]+Number(button.dataset.delta)));render();}));
  document.querySelectorAll('[data-visitor]').forEach(button=>button.addEventListener('click',()=>updateView(()=>{member=button.dataset.visitor==='member';render();announce(member?'Member admission is included. Bring your member card. Separate timed experiences still require tickets.':'General visitor admission estimates are shown.');})));
  render();
}
export function initializePlanner(concept){
  const form=document.querySelector('[data-day-planner]');if(!form)return;
  const date=form.querySelector('[name="visit-date"]');const now=new Date();date.min=`${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}`;
  form.addEventListener('submit',event=>{event.preventDefault();const value=date.value,item=findExhibition(form.querySelector('[name="interest"]:checked').value),result=form.querySelector('.planner-result');
    updateView(()=>{
      if(isMuseumClosed(value)){result.innerHTML=`<p>${e(getDateNotice(value))}</p>`;return;}
      const title=new Date(value+'T12:00:00').toLocaleDateString('en-US',{month:'long',day:'numeric',year:'numeric'});
      const temporarilyClosed=item.id==='prehistoric-journey'&&value>='2026-10-27'&&value<='2026-10-29';
      result.innerHTML=`<p><strong>${e(title)}</strong></p><p>${temporarilyClosed?'Try Wildlife Halls as your starting point. Prehistoric Journey is closed on your date.':`Start with ${e(item.title)} on ${e(item.floor.toLowerCase())}.`}</p><p><small>${e(getDateNotice(value))}</small></p><a href="${route(concept,`exhibitions/${temporarilyClosed?'wildlife-halls':item.id}`)}">Explore your first stop ${icon('arrow',15)}</a><small>A suggested digital itinerary, not a map or reservation. Check official availability before purchasing.</small>`;
    });
  });
}
export function initializeNavigation(concept){
  const embedded=new URLSearchParams(location.search).get('embed')==='1'||self!==top;
  if(embedded)document.documentElement.classList.add('embedded');
  const navigation=document.querySelector('#review-nav');
  if(!embedded){navigation.innerHTML=`<nav class="review-concept-bar" aria-label="Concept review"><a href="/">← Compare concepts</a><a href="/concept-a/" ${concept==='a'?'aria-current="page"':''}>A — Walk Into Wonder</a><a href="/concept-b/" ${concept==='b'?'aria-current="page"':''}>B — Panel by Panel</a><a href="/?concept=${concept}#feedback">Share feedback</a></nav>`;}
  document.addEventListener('click',event=>{
    const link=event.target.closest('a[href]');if(!link)return;
    const url=new URL(link.href,location.href);if(url.origin!==location.origin)return;
    if(url.pathname.startsWith(`/concept-${concept}/`)&&embedded){url.searchParams.set('embed','1');link.href=url.href;}
    if(link.hasAttribute('data-exhibit-link')){
      const image=link.querySelector('img'),title=link.querySelector('h2,h3');
      if(image)image.style.viewTransitionName='exhibit-media';if(title)title.style.viewTransitionName='exhibit-title';
      safeSet('dmns-gallery',JSON.stringify({url:location.href,scroll:scrollY}));
    }
    safeSet('dmns-travel',link.dataset.travel||'forward');document.documentElement.dataset.travel=link.dataset.travel||'forward';
  });
  document.documentElement.dataset.travel=performance.getEntriesByType('navigation')[0]?.type==='back_forward'?'back':safeGet('dmns-travel')||'forward';
  addEventListener('pagehide',()=>safeSet('dmns-scroll:'+location.pathname,String(scrollY)));
  addEventListener('pageshow',event=>{
    if(event.persisted){initializeDepth();document.querySelectorAll('[style*="view-transition-name"]').forEach(node=>{if(node.closest('.exhibition-image-link')||node.closest('.comic-panel'))node.style.viewTransitionName='none';});}
  });
}
export function initializeMuseum(){
  const concept=document.documentElement.dataset.concept;
  initializeNavigation(concept);initializeMotion();initializeDepth();initializePanelReveals();initializeFilters();initializeDialogs(concept);initializeTickets();initializePlanner(concept);
}
if(typeof document!=='undefined')initializeMuseum();
