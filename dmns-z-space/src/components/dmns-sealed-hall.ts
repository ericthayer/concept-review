/**
 * <dmns-sealed-hall>: renovation scrim state. The message is server-rendered; this element ties
 * the hall's heading to it so assistive tech reads the closure with the room name.
 */
export class DmnsSealedHall extends HTMLElement {
  connectedCallback(): void {
    const message = this.querySelector<HTMLElement>('.sealed-hall__text');
    const heading = document.getElementById('hall-title');
    if (!message || !heading) return;
    message.id ||= 'sealed-hall-message';
    heading.setAttribute('aria-describedby', message.id);
    this.dataset['ready'] = '';
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'dmns-sealed-hall': DmnsSealedHall;
  }
}
