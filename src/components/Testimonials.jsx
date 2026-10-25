import { Link } from 'react-router-dom';
import { TESTIMONIALS } from '../data/testimonials.js';
import { PORTFOLIO } from '../data/portfolio.js';

/* Client quotes (data/testimonials.js); `only` limits them to one client (a case study). Shows
   nothing until there are some. */
export default function Testimonials({ only, label = 'In their words' }) {
  const list = TESTIMONIALS.filter((t) => !only || t.client === only);
  if (!list.length) return null;
  return (
    <section className="pf-quotes">
      <div className="container">
        <p className="section-label">{label}</p>
        <div className="pf-quotes-grid">
          {list.map((t) => {
            const p = PORTFOLIO.find((x) => x.id === t.client);
            return (
              <figure className="pf-quote" key={t.client + t.name}>
                <blockquote>“{t.quote}”</blockquote>
                <figcaption>
                  <strong>{t.name}</strong>
                  {t.role ? ', ' + t.role : ''}
                  {p && !only && (
                    <>
                      {' · '}
                      <Link to={'/portfolio/' + p.id}>{p.title}</Link>
                    </>
                  )}
                </figcaption>
              </figure>
            );
          })}
        </div>
      </div>
    </section>
  );
}
