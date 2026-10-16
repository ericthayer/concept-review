import {mountConceptNav} from '/review/concept-nav.js';
export function initializeConcept() {mountConceptNav(document.getElementById('review-nav'),'b').catch(()=>{ /* Keep the static comparison link on failure. */ });}
initializeConcept();
