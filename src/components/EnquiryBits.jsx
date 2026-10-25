import { CONTACT } from '../lib/site.js';
import { HONEYPOT } from '../lib/enquiry.js';

/* A field people never see or reach; bots fill it in (lib/enquiry.js). */
export function Honeypot() {
  return (
    <div className="hp-field" aria-hidden="true">
      <label>
        Leave this empty
        <input type="text" name={HONEYPOT} tabIndex={-1} autoComplete="off" />
      </label>
    </div>
  );
}

/* What stopped the form: a field to fix (`error` is the message), or 'send' when the
   message itself didn't go, with the other ways to reach us. */
export function FormError({ error }) {
  if (!error) return null;
  return (
    <p className="form-error" role="alert">
      {error === 'send' ? (
        <>
          That didn’t send. Please try again, or email <a href={'mailto:' + CONTACT.email}>{CONTACT.email}</a> or{' '}
          <a href={CONTACT.whatsapp} target="_blank" rel="noopener noreferrer">message us on WhatsApp</a>.
        </>
      ) : (
        error
      )}
    </p>
  );
}
