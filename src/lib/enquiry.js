import emailjs from '@emailjs/browser';
import { EMAILJS } from './site.js';
import { trackEvent } from './routeChange.js';

/* The quote and contact forms both go through here: checking the fields, keeping bots out, and
   sending through EmailJS. */

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/* Marks empty required fields (and an email that can't be one) and says what is wrong, or null
   when the form is good to send. */
export function checkFields(form) {
  let missing = false;
  let badEmail = false;
  form.querySelectorAll('[required], input[type="email"]').forEach((field) => {
    if (field.disabled) return;
    const value = field.value.trim();
    const wrong = (field.required && !value) || (field.type === 'email' && value && !EMAIL.test(value));
    if (!wrong) return;
    if (field.type === 'email' && value) badEmail = true;
    else missing = true;
    field.setAttribute('aria-invalid', 'true');
    field.style.borderColor = '#ef4444';
    field.addEventListener(
      'input',
      () => {
        field.style.borderColor = '';
        field.removeAttribute('aria-invalid');
      },
      { once: true }
    );
  });
  if (missing) return 'Fill in the highlighted fields first.';
  if (badEmail) return 'That email address doesn’t look right. Check it and try again.';
  return null;
}

/* Bots fill in every field, including one people never see (Honeypot), and send within moments
   of the page opening. Either one: treat it as a bot. */
export const HONEYPOT = 'hp_website';
export function looksLikeBot(form, shownAt) {
  const trap = form.elements.namedItem(HONEYPOT);
  return !!(trap && trap.value) || Date.now() - shownAt < 2500;
}

/* Sends one enquiry and reports it to Analytics as a lead. Bots get a pretend success and
   nothing is sent. Throws if EmailJS fails. */
export async function sendEnquiry({ form, shownAt, template, params, lead }) {
  if (looksLikeBot(form, shownAt)) return;
  await emailjs.send(EMAILJS.service, template, params, { publicKey: EMAILJS.publicKey });
  trackEvent('generate_lead', { form: lead });
}
