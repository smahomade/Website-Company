import { CheckIcon } from './Icons.jsx';
import FiledSites from './DeviceStack.jsx';

/* The shared banner used by the inner pages: flat charcoal, with the label,
   title and subtitle inside a folder outline and a row of tick badges.
   Pass `filed` to tuck three client screenshots inside that folder; a tab
   on the folder opens them. */
export default function PageHero({ label, title, accent, sub, badges = [], className = '', filed = false, children }) {
  return (
    <section className={('services-hero ' + (filed ? 'services-hero--filed ' : '') + className).trim()}>
      <div className="container">
        <div className={'hero-folder-box' + (filed ? ' hero-folder-box--filed' : '')}>
          {filed && <FiledSites />}
          <p className="section-label services-hero-label">{label}</p>
          <h1 className="services-hero-title">
            {title} <em>{accent}</em>
          </h1>
          <p className="services-hero-sub">{sub}</p>
        </div>
        {badges.length > 0 && (
          <div className="services-hero-badges">
            {badges.map((b, i) => (
              <span key={b} style={{ '--i': i }}>
                <CheckIcon /> {b}
              </span>
            ))}
          </div>
        )}
        {children}
      </div>
    </section>
  );
}
