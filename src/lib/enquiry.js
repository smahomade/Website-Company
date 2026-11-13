import emailjs from '@emailjs/browser';
import { EMAILJS } from './site.js';
import { trackEvent } from './routeChange.js';

/* The quote and contact forms both go through here: checking the fields, keeping bots out, and
   sending through EmailJS. */

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/* What's wrong with the fields inside `root` (a form, or one step of it): each required field left
   empty, and an email or web address that can't be one. Returns [{ id, message }] in page order,
   empty when all is well. A field's own "it's empty" message comes from its data-error. Radio
   buttons and tick boxes are left to the form itself. */
export function checkFields(root) {
  const errors = [];
  root.querySelectorAll('input, select, textarea').forEach((field) => {
    if (field.disabled || !field.id || ['hidden', 'radio', 'checkbox'].includes(field.type)) return;
    const value = field.value.trim();
    let message = null;
    if (field.required && !value) message = field.dataset.error || 'Fill this in';
    else if (field.type === 'email' && value && !EMAIL.test(value)) message = 'Enter an email address like name@example.com';
    else if (field.type === 'url' && value && !/\.[a-z]{2,}/i.test(value)) message = 'Enter the web address, like yourbusiness.co.uk';
    if (message) errors.push({ id: field.id, message });
  });
  return errors;
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
