/* What happens after someone gets in touch. Same three lines everywhere
   so the promise is consistent across the site. */
const STEPS = [
  { t: 'We reply within 24 hours', d: 'Usually the same day. A real person, not an auto-responder.' },
  { t: 'A quick chat, your way', d: 'WhatsApp, a call or email, whichever suits you.' },
  { t: 'Scope, timeline and quote in writing', d: 'Agreed before any work starts. No obligation.' },
];

export default function NextSteps({ title = 'What happens next' }) {
  return (
    <div className="pf-next">
      <p className="section-label">{title}</p>
      <ol className="pf-next-list">
        {STEPS.map((s, i) => (
          <li key={s.t}>
            <span className="pf-next-num">{i + 1}</span>
            <div>
              <strong>{s.t}</strong>
              <span>{s.d}</span>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}
