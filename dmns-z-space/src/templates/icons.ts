import { trusted, type SafeHtml } from './html.js';

/** Decorative inline icons. Each is aria-hidden; the accessible name lives in text. */
export const externalIcon: SafeHtml = trusted(
  '<svg class="icon icon--external" viewBox="0 0 16 16" width="12" height="12" aria-hidden="true" focusable="false"><path d="M6 3h7v7M13 3 4 12" fill="none" stroke="currentColor" stroke-width="1.5"/></svg>',
);

export const arrowLeft: SafeHtml = trusted(
  '<svg class="icon" viewBox="0 0 16 16" width="16" height="16" aria-hidden="true" focusable="false"><path d="M10 3 5 8l5 5" fill="none" stroke="currentColor" stroke-width="1.5"/></svg>',
);

export const arrowRight: SafeHtml = trusted(
  '<svg class="icon" viewBox="0 0 16 16" width="16" height="16" aria-hidden="true" focusable="false"><path d="m6 3 5 5-5 5" fill="none" stroke="currentColor" stroke-width="1.5"/></svg>',
);

export const stairIcon: SafeHtml = trusted(
  '<svg class="icon" viewBox="0 0 16 16" width="16" height="16" aria-hidden="true" focusable="false"><path d="M2 14h4v-4h4V6h4V2" fill="none" stroke="currentColor" stroke-width="1.5"/></svg>',
);
