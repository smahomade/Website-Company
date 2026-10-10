import { useState } from 'react';

/* Inline before/after slider. Both screenshots are tall full-page captures,
   so only their top portion is shown, cropped to a fixed-height frame.
   A range input drives the divider so it works with mouse, touch and keys. */
export default function CompareInline({ before, after, label, caption }) {
  const [pct, setPct] = useState(38);
  return (
    <figure className="pf-compare">
      <div className="pf-compare-frame">
        <img className="pf-compare-after" src={after} alt={label + ' — after'} loading="lazy" />
        <img
          className="pf-compare-before"
          src={before}
          alt={label + ' — before'}
          loading="lazy"
          style={{ clipPath: 'inset(0 ' + (100 - pct) + '% 0 0)' }}
        />
        <span className="pf-compare-line" style={{ left: pct + '%' }}>
          <span className="pf-compare-knob">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8" aria-hidden="true">
              <polyline points="15 18 9 12 15 6" />
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </span>
        </span>
        <span className="pf-compare-tag pf-compare-tag--before">Before</span>
        <span className="pf-compare-tag pf-compare-tag--after">After</span>
        <input
          className="pf-compare-range"
          type="range"
          min="4"
          max="96"
          value={pct}
          onChange={(e) => setPct(Number(e.target.value))}
          aria-label={'Compare ' + label + ' before and after'}
        />
      </div>
      {caption && <figcaption className="pf-compare-caption">{caption}</figcaption>}
    </figure>
  );
}
