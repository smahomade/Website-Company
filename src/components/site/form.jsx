import { Children, cloneElement, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { CircleAlert, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/input';
import { HONEYPOT } from '@/lib/enquiry.js';
import { CONTACT, LOGO } from '@/lib/site.js';
import { cn } from '@/lib/utils';

/* The pieces both enquiry forms share. Errors follow the UI/UX rules: each one under its own
   field and tied to it (aria-describedby), plus a summary at the top that takes focus and links to
   each field. */

/* The errors a form is showing: [{ id, message }] in page order. `show` puts up a new list and
   moves focus to the summary; typing in a field clears that field's error. */
export function useFormErrors() {
  const [errors, setErrors] = useState([]);
  const summaryRef = useRef(null);
  const show = (list) => {
    setErrors(list);
    if (list.length) requestAnimationFrame(() => summaryRef.current?.focus());
  };
  const onInput = (e) => {
    const id = e.target.getAttribute('data-error-for') || e.target.id;
    if (id) setErrors((es) => (es.some((x) => x.id === id) ? es.filter((x) => x.id !== id) : es));
  };
  const messageFor = (id) => errors.find((x) => x.id === id)?.message;
  return { errors, show, onInput, messageFor, summaryRef };
}

/* A labelled field. The control (child) gets its id, required, aria-invalid and the id of its
   hint or error. Required fields carry a star; the rest say "optional". */
export function Field({ id, label, required, hint, error, className, children }) {
  const describedBy = error ? id + '-error' : hint ? id + '-hint' : undefined;
  const control = Children.only(children);
  return (
    <div className={cn('flex flex-col gap-2', className)}>
      <Label htmlFor={id}>
        {label}
        {required ? (
          <span aria-hidden="true" className="text-orange-ink"> *</span>
        ) : (
          <span className="font-sans text-sm font-normal text-muted-foreground"> (optional)</span>
        )}
      </Label>
      {cloneElement(control, { id, required, 'aria-invalid': error ? true : undefined, 'aria-describedby': describedBy })}
      {hint && !error && (
        <p id={id + '-hint'} className="text-sm text-muted-foreground">{hint}</p>
      )}
      {error && <FieldError id={id + '-error'}>{error}</FieldError>}
    </div>
  );
}

export function FieldError({ id, children }) {
  return (
    <p id={id} className="flex items-start gap-1.5 text-sm font-semibold text-destructive">
      <CircleAlert aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
      {children}
    </p>
  );
}

/* Shown above the form after a failed send attempt: how many things to fix, each a link that
   puts the cursor in that field */
export function ErrorSummary({ errors, summaryRef }) {
  if (!errors.length) return null;
  return (
    <div ref={summaryRef} tabIndex={-1} role="alert" className="rounded-2xl border border-destructive/30 bg-destructive/[0.06] p-4 outline-none focus-visible:ring-[3px] focus-visible:ring-destructive/25">
      <p className="font-display font-bold text-destructive">{errors.length === 1 ? 'One thing to fix first' : errors.length + ' things to fix first'}</p>
      <ul className="mt-2 list-disc space-y-1 pl-5 text-[15px] text-ink">
        {errors.map((e) => (
          <li key={e.id}>
            <a
              href={'#' + e.id}
              className="underline underline-offset-2 hover:text-destructive"
              onClick={(ev) => {
                ev.preventDefault();
                document.getElementById(e.id)?.focus();
              }}
            >
              {e.message}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* When the message itself didn't go: say so, with the other ways to reach us */
export function SendError() {
  return (
    <p role="alert" className="rounded-2xl border border-destructive/30 bg-destructive/[0.06] p-4 text-[15px] leading-relaxed text-ink">
      <strong className="font-bold text-destructive">That didn’t send.</strong> Please try again, or email{' '}
      <a href={'mailto:' + CONTACT.email} className="font-semibold underline underline-offset-2">{CONTACT.email}</a> or{' '}
      <a href={CONTACT.whatsapp} target="_blank" rel="noopener noreferrer" className="font-semibold underline underline-offset-2">
        message us on WhatsApp
      </a>
      .
    </p>
  );
}

/* A field people never see or reach; bots fill it in (lib/enquiry.js) */
export function Honeypot() {
  return (
    <div aria-hidden="true" className="absolute -left-[10000px] top-auto size-px overflow-hidden">
      <label>
        Leave this empty
        <input type="text" name={HONEYPOT} tabIndex={-1} autoComplete="off" />
      </label>
    </div>
  );
}

export function SubmitButton({ sending, children, className }) {
  return (
    <Button type="submit" size="lg" disabled={sending} aria-busy={sending || undefined} className={cn('w-full sm:w-auto', className)}>
      {sending && <Loader2 aria-hidden="true" className="animate-spin motion-reduce:animate-none" />}
      {sending ? 'Sending…' : children}
    </Button>
  );
}

/* Under each form's send button: what the details are for, and where to read more */
export function PrivacyNote() {
  return (
    <p className="text-sm leading-relaxed text-muted-foreground">
      We only use your details to reply and quote.{' '}
      <Link to="/privacy" className="font-semibold text-ink underline underline-offset-2 hover:text-orange-ink">
        How we handle them
      </Link>
    </p>
  );
}

/* Takes the form's place once it has gone; focus moves to the heading so screen readers hear it */
export function SentPanel({ title, text }) {
  return (
    <div role="status" className="flex flex-col items-center px-4 py-10 text-center">
      <span className="grid size-28 place-items-center rounded-[30px] bg-orange-tint p-4">
        <img src={LOGO.mark} alt="" width="202" height="205" className="h-auto w-full" />
      </span>
      <h2 tabIndex={-1} ref={(el) => el && el.focus()} className="mt-6 font-display text-3xl font-bold tracking-[-0.02em] text-ink outline-none">
        {title}
      </h2>
      <p className="mt-3 max-w-sm leading-relaxed text-muted-foreground">{text}</p>
      <Button asChild variant="outline" className="mt-8">
        <Link to="/">Back to the front page</Link>
      </Button>
    </div>
  );
}
