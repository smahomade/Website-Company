import { useEffect, useState } from 'react';
import { R2 } from '../lib/site.js';

const DEFAULT_SHOTS = [
  { src: R2 + '/screenshots/TopOne/top-one-banner.JPG', url: 'topone.co.uk', href: 'https://topone-salon-website.scmahomade.workers.dev', pos: 'center top', name: 'Top One Salon' },
  { src: R2 + '/screenshots/ChangeWorkTherapies/changeworktherapies-banner.JPG', url: 'changeworktherapies.com', href: 'https://changeworktherapies.com', pos: 'center top', name: 'Change Work Therapies' },
  { src: R2 + '/screenshots/Raza/raza-academy-banner.JPG', url: 'razaacademy.co.uk', href: 'https://razaacademy.co.uk', pos: 'center 12%', name: 'Raza Academy' },
];

/* A browser window frame around a screenshot. */
export function Browser({ src, url, pos = 'center top', className = '', loading = 'lazy' }) {
  return (
    <div className={('pf-browser ' + className).trim()}>
      <div className="pf-browser-bar">
        <span className="pf-browser-dots"><i /><i /><i /></span>
        <span className="pf-browser-url">{url}</span>
      </div>
      <img src={src} alt={url + ' website'} loading={loading} style={{ objectPosition: pos }} />
    </div>
  );
}

/* Screenshots filed inside the hero's own folder (.hero-folder-box).
   Closed: the tops of three framed sites peek out above the folder edge.
   Open (the "Recent work" tab on the folder, or Enter/Space): they rise
   out and fan across the folder front; each one links to the live site.
   Escape or the tab closes it again. */
export default function FiledSites({ shots = DEFAULT_SHOTS }) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open]);

  return (
    <div className={'pf-filed' + (open ? ' is-open' : '')}>
      <div className="pf-filed-sheets">
        {shots.map((s, i) => (
          <a
            key={s.url}
            className={'pf-fsheet pf-fsheet--' + i}
            href={s.href}
            target="_blank"
            rel="noopener noreferrer"
            tabIndex={open ? 0 : -1}
            aria-hidden={!open}
            aria-label={'Open ' + s.name + ' in a new tab'}
            onClick={(e) => {
              if (!open) {
                e.preventDefault();
                setOpen(true);
              }
            }}
          >
            <Browser src={s.src} url={s.url} pos={s.pos} loading="eager" />
            <span className="pf-fsheet-label">{s.name} ↗</span>
          </a>
        ))}
      </div>
      <button
        type="button"
        className="pf-filed-toggle"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-label={open ? 'Put the sites back in the folder' : 'Open the folder to see recent work'}
      >
        <span className="pf-filed-toggle-icon" aria-hidden="true">{open ? '✕' : '▸'}</span>
        {open ? 'Close' : 'Recent work'}
      </button>
    </div>
  );
}
