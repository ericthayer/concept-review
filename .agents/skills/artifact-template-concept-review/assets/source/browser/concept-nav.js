/** Mount the shared review navigation without changing concept styling. */
export async function mountConceptNav(target, active) {
  if(new URLSearchParams(location.search).get('embed')==='1') {target.hidden=true;return;}
  const response=await fetch('/review/navigation.json');
  if(!response.ok) throw new Error('Review navigation unavailable');
  const config=await response.json();
  const nav=document.createElement('nav');nav.className='concept-bar';nav.setAttribute('aria-label','Concept review');
  for(const item of [{route:'/',title:'← Compare',id:'home'},...config.concepts,{route:`/?concept=${active}#feedback`,title:'Share feedback ↗',id:'feedback'}]) {
    const a=document.createElement('a');a.href=item.route;a.textContent=item.title;
    if(item.id===active) a.setAttribute('aria-current','page');nav.append(a);
  }
  target.replaceChildren(nav);
}
