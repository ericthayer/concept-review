/** @typedef {'desktop'|'mobile'} ViewportMode */
export function mountPreviewControls(root = document) {
  let mode = matchMedia('(max-width: 600px)').matches ? 'mobile' : 'desktop';
  const stages = [...root.querySelectorAll('.iframe-stage')];
  function resize() {
    for (const stage of stages) {
      const frame = stage.querySelector('iframe');
      const [width, height] = mode === 'desktop' ? [1440, 1050] : [390, 844];
      const scale = Math.min(stage.clientWidth / width, 1);
      Object.assign(frame.style, {width:`${width}px`, height:`${height}px`, transform:`scale(${scale})`});
      stage.style.height = `${height * scale}px`;
    }
  }
  function setMode(value) {
    mode = value;
    document.body.dataset.mode = mode;
    root.querySelectorAll('[data-viewport]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.viewport === mode)));
    const field = root.querySelector('[name="viewport"]');
    if (field) field.value = mode;
    resize();
  }
  const controller = new AbortController();
  root.querySelectorAll('[data-viewport]').forEach(b=>b.addEventListener('click',()=>setMode(b.dataset.viewport),{signal:controller.signal}));
  const observer = new ResizeObserver(resize);
  stages.forEach(s=>observer.observe(s));
  setMode(mode);
  return ()=>{observer.disconnect();controller.abort();};
}
export function mountFeedback(root = document) {
  const form = root.querySelector('form[name="concept-feedback"]');
  if (!form) return;
  const status = form.querySelector('[role="status"]');
  const selected = new URLSearchParams(location.search).get('concept');
  if (['a','b'].includes(selected)) form.querySelector(`[name="preference"][value="${selected}"]`).checked = true;
  root.querySelectorAll('[data-choose]').forEach(button=>button.addEventListener('click',()=>{
    const radio = form.querySelector(`[name="preference"][value="${button.dataset.choose}"]`);
    radio.checked = true;
    document.querySelector('#feedback').scrollIntoView({behavior:matchMedia('(prefers-reduced-motion:reduce)').matches?'instant':'smooth'});
    radio.focus({preventScroll:true});
  }));
  form.querySelector('.download-feedback').addEventListener('click',()=>{
    const response = Object.fromEntries(new FormData(form));
    delete response['bot-field']; delete response['form-name'];
    response.exportedAt = new Date().toISOString();
    const url = URL.createObjectURL(new Blob([JSON.stringify(response,null,2)],{type:'application/json'}));
    const link = Object.assign(document.createElement('a'),{href:url,download:`${document.body.dataset.reviewId}-feedback.json`});
    link.click(); setTimeout(()=>URL.revokeObjectURL(url),1000);
    status.textContent = 'Response downloaded to your device. It has not been submitted.';
  });
  form.addEventListener('submit',event=>{
    if (['localhost','127.0.0.1',''].includes(location.hostname)) {
      event.preventDefault();
      status.textContent = 'Local preview: submission requires Netlify hosting. Download your response instead.';
      return;
    }
    form.querySelector('[type="submit"]').disabled = true;
    status.textContent = 'Submitting your feedback…';
    // Native POST preserves server validation, failure pages and no-JS support.
  });
  addEventListener('pageshow',()=>{form.querySelector('[type="submit"]').disabled = false;});
}
if (typeof document !== 'undefined') { mountPreviewControls(); mountFeedback(); }
