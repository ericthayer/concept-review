/**
 * Entry module, loaded on every page. Registers elements and wires page-level
 * behaviour. Every page is complete HTML without it; this only upgrades.
 */
import './components/masthead.ts';
import './components/info-strip.ts';
import './components/page.ts';
import './components/spread.ts';
import './components/panel.ts';
import './components/caption.ts';
import './components/balloon.ts';
import './components/sfx.ts';
import './components/specimen.ts';
import './components/beat-strip.ts';
import './components/floor-tabs.ts';
import './components/filter.ts';
import { watchMotionPreferences } from './runtime/motion-state.ts';

watchMotionPreferences();

/* The newsletter is a concept: never submit anywhere. */
for (const form of document.querySelectorAll<HTMLFormElement>('form[data-concept-form]')) {
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const status = form.querySelector<HTMLElement>('[role="status"]');
    if (status) status.textContent = 'Concept only: nothing was sent.';
  });
}
