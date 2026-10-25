import { Link } from 'react-router-dom';
import Seo from '../components/Seo.jsx';
import Mascot from '../components/Mascot.jsx';
import { PixelSquares } from '../components/BrandIcons.jsx';

export default function NotFound() {
  return (
    <section className="pf-404">
      <Seo title="Page not found — PixelFold" description="That page isn't in any of our folders." path="/404" noindex />
      <div className="container pf-404-inner">
        <Mascot variant="peek" size={200} />
        <p className="section-label">404</p>
        <h1 className="pf-404-title">
          This folder is <em>empty.</em>
        </h1>
        <p className="pf-404-sub">
          The page you were after isn't filed anywhere we can find. The cat has had a look too.
        </p>
        <div className="pf-404-actions">
          <Link to="/" className="btn btn-primary">Back to the front page</Link>
          <Link to="/contact" className="btn btn-outline">Tell us what you were looking for</Link>
        </div>
        <PixelSquares size={22} className="pf-404-pixels" />
      </div>
    </section>
  );
}
