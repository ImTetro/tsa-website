import { onPage, $, $$ } from './core';
import { isIsraeliPhone } from '../lib/phone';

const PHONE_FALLBACK = '09-8820022';

onPage(() => {
  const form = $<HTMLFormElement>('#contact-form');
  if (!form) return;
  const status = $('.form-status', form)!;
  const btn = $<HTMLButtonElement>('button[type=submit]', form)!;
  const btnText = btn.querySelector('span')!;
  const nameLabel = $<HTMLLabelElement>('label[for=cf-name]', form)!;

  // ---- variant (general / residents), also from ?subject=urban; project from ?project= ----
  const setVariant = (v: string) => {
    form.dataset.variant = v;
    $$('.v-general', form).forEach((el) => { el.hidden = v !== 'general'; });
    $$('.v-residents', form).forEach((el) => { el.hidden = v !== 'residents'; });
    nameLabel.textContent = (v === 'residents' ? nameLabel.dataset.residents : nameLabel.dataset.general) || nameLabel.textContent;
    $<HTMLInputElement>(`input[name=_variant][value=${v}]`, form)!.checked = true;
  };
  $$<HTMLInputElement>('input[name=_variant]', form).forEach((r) => r.addEventListener('change', () => setVariant(r.value)));
  const q = new URLSearchParams(location.search);
  if (q.get('subject') === 'urban') setVariant('residents');
  const proj = q.get('project');
  if (proj) {
    $<HTMLInputElement>('input[name=project]', form)!.value = proj.slice(0, 120);
    $('#cf-project-name', form)!.textContent = proj.slice(0, 120);
    $('#cf-project-line', form)!.hidden = false;
  }

  // ---- validation ----
  const err = (id: string, text: string) => { const e = $(`#${id}-err`, form); if (e) e.textContent = text; const i = $(`#${id}`, form); i?.setAttribute('aria-invalid', String(!!text)); return !text; };
  const val = (id: string) => ($<HTMLInputElement>(`#${id}`, form)?.value ?? '').trim();
  const validate = () => {
    const residents = form.dataset.variant === 'residents';
    const ok = [
      err('cf-name', val('cf-name') ? '' : 'נא למלא שם'),
      err('cf-phone', !val('cf-phone') ? 'נא למלא מספר טלפון' : isIsraeliPhone(val('cf-phone')) ? '' : 'נא להזין מספר טלפון תקין'),
      err('cf-email', residents || !val('cf-email') || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val('cf-email')) ? '' : 'כתובת האימייל אינה תקינה'),
      err('cf-address', !residents || val('cf-address') ? '' : 'נא למלא את כתובת הבניין'),
    ];
    return ok.every(Boolean);
  };
  ['cf-name', 'cf-phone', 'cf-email', 'cf-address'].forEach((id) => $(`#${id}`, form)?.addEventListener('blur', () => { if (form.dataset.tried) validate(); }));

  // ---- submit ----
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    form.dataset.tried = '1';
    status.className = 'form-status'; status.textContent = '';
    if (!validate()) { $<HTMLElement>('[aria-invalid=true]', form)?.focus(); return; }
    const data: Record<string, string> = {};
    const residents = form.dataset.variant === 'residents';
    new FormData(form).forEach((v, k) => {
      if (k === '_variant') return;
      const el = form.elements.namedItem(k) as HTMLElement | null;
      if (el && el.closest('[hidden]')) return; // skip fields of the other variant
      data[k] = String(v);
    });
    data.subject = residents ? 'פנייה מנציגות דיירים – אתר טטרו שחר' : data.project ? `פנייה בנושא ${data.project} – אתר טטרו שחר` : 'פנייה חדשה מאתר טטרו שחר';
    data.inquiry_type = residents ? 'נציגות דיירים' : 'פנייה כללית';
    btn.disabled = true; const label = btnText.textContent; btnText.textContent = 'שולח…';
    try {
      const res = await fetch(form.action, { method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' }, body: JSON.stringify(data) });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || !json.success) throw new Error('send failed');
      form.reset();
      // reset() restores the page's own project (project pages) and keeps the visible line in sync
      $('#cf-project-line', form)!.hidden = !$<HTMLInputElement>('input[name=project]', form)!.value;
      delete form.dataset.tried;
      setVariant(residents ? 'residents' : 'general');
      status.className = 'form-status ok'; status.textContent = 'תודה! נחזור אליכם בהקדם';
    } catch {
      status.className = 'form-status bad'; status.textContent = `השליחה נכשלה. נסו שוב או התקשרו ${PHONE_FALLBACK}`;
    } finally {
      btn.disabled = false; btnText.textContent = label;
    }
  });
});
