/**
 * Render-blocking entry (loaded with blocking="render"): must register pagereveal before the
 * first frame so the incoming page can join the cross-document transition. Keep it tiny.
 */
import { wireCrossDocument } from './dom/page-transitions.js';

wireCrossDocument();
