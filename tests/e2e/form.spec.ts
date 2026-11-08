import { afterAll, describe, expect, test } from 'vitest';
import { close, open } from './browser';

const API = 'https://api.web3forms.com/submit';
afterAll(close);

async function fill(page: import('playwright-core').Page, phone = '052-1234567') {
  await page.fill('#cf-name', 'ישראל ישראלי');
  if (phone) await page.fill('#cf-phone', phone);
  await page.fill('#cf-message', 'בדיקה');
}

describe('contact form', () => {
  test('shows Hebrew validation for missing phone', async () => {
    const { page } = await open('/contact');
    let posted = false;
    await page.route(API, (r) => { posted = true; return r.fulfill({ status: 200, body: '{"success":true}' }); });
    await fill(page, '');
    await page.click('#contact-form button[type=submit]');
    await expect.poll(() => page.textContent('#cf-phone-err')).toContain('טלפון');
    expect(posted).toBe(false);
  });

  test('rejects a phone that is not Israeli', async () => {
    const { page } = await open('/contact');
    await fill(page, '12');
    await page.click('#contact-form button[type=submit]');
    await expect.poll(() => page.textContent('#cf-phone-err')).toContain('מספר טלפון תקין');
  });

  test('on POST failure shows "השליחה נכשלה" and keeps field values', async () => {
    const { page } = await open('/contact');
    await page.route(API, (r) => r.fulfill({ status: 500, body: '{"success":false}' }));
    await fill(page);
    await page.click('#contact-form button[type=submit]');
    await expect.poll(() => page.textContent('#contact-form .form-status')).toContain('השליחה נכשלה');
    expect(await page.inputValue('#cf-name')).toBe('ישראל ישראלי');
    expect(await page.inputValue('#cf-phone')).toBe('052-1234567');
  });

  test('on success shows "תודה! נחזור אליכם בהקדם" and resets', async () => {
    const { page } = await open('/contact');
    let body: any = null;
    await page.route(API, (r) => { body = r.request().postDataJSON(); return r.fulfill({ status: 200, contentType: 'application/json', body: '{"success":true}' }); });
    await fill(page);
    await page.click('#contact-form button[type=submit]');
    await expect.poll(() => page.textContent('#contact-form .form-status')).toContain('תודה! נחזור אליכם בהקדם');
    expect(await page.inputValue('#cf-name')).toBe('');
    expect(body.phone).toBe('052-1234567');
  });

  test('project page link pre-fills the project field', async () => {
    const { page } = await open('/contact?project=' + encodeURIComponent('לגונה'));
    expect(await page.inputValue('#contact-form input[name=project]')).toBe('לגונה');
  });

  test('?subject=urban opens the residents form', async () => {
    const { page } = await open('/contact?subject=urban');
    expect(await page.isVisible('#cf-address')).toBe(true);
  });
});
