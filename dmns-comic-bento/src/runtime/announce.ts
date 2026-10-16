/** Polite screen reader announcements through the page's single #announcer live region. */
export function announce(text: string): void {
  const region = document.getElementById('announcer');
  if (!region) return;
  region.textContent = '';
  requestAnimationFrame(() => {
    region.textContent = text;
  });
}

/** Accessible name of a panel or spread heading (knockout captions keep full text in .vh). */
export function headingText(heading: Element | null): string {
  if (!heading) return '';
  const full = heading.querySelector('.vh')?.textContent ?? heading.textContent ?? '';
  return full.replace(/\s+/g, ' ').trim();
}
