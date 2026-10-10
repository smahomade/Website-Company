import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useModalBehaviour } from '../hooks/useModal.js';
import { FolderIcon } from './BrandIcons.jsx';

const TYPE_CLASS = { bonus: 'feat-bonus', priority: 'feat-priority', backend: 'feat-backend' };

/* "View Details" dialog for a service package. Stays mounted so the CSS
   open/close transition can play; the last shown package is kept while
   the dialog fades out. */
export default function ServiceModal({ service, onClose }) {
  const last = useRef(service);
  if (service) last.current = service;
  const d = last.current;
  const open = !!service;

  useModalBehaviour(open, onClose);

  /* Once fully closed, forget the old content. */
  useEffect(() => {
    if (open) return undefined;
    const id = setTimeout(() => {
      last.current = null;
    }, 400);
    return () => clearTimeout(id);
  }, [open]);

  return (
    <div className={'service-modal' + (open ? ' open' : '')} id="serviceModal" role="dialog" aria-modal="true" aria-labelledby="modalTitle">
      <div className="service-modal-overlay" id="modalOverlay" onClick={onClose} />
      <div className="service-modal-box">
        <button className="service-modal-close" id="modalClose" aria-label="Close" onClick={onClose}>
          ✕
        </button>
        {d && (
          <>
            <div className="service-modal-header">
              <div className="service-modal-icon" id="modalIcon">{d.iconKind ? <FolderIcon kind={d.iconKind} size={46} /> : d.icon}</div>
              <div>
                <span className="service-modal-tag" id="modalTag">{d.tag}</span>
                <h2 className="service-modal-title" id="modalTitle">{d.title}</h2>
                <p className="service-modal-price" id="modalPrice" style={d.price ? undefined : { display: 'none' }}>
                  {d.price || ''}
                </p>
              </div>
            </div>
            <p className="service-modal-desc" id="modalDesc">{d.desc}</p>
            <div className="service-modal-deal" id="modalDeal">
              {d.dealTitle && <strong style={{ display: 'block', marginBottom: 5 }}>{d.dealTitle}</strong>}
              {d.deal || ''}
            </div>
            <div className="service-modal-meta" id="modalMeta">
              {(d.meta || []).map((m) => (
                <span className="meta-pill" key={m.text}>
                  {m.icon} {m.text}
                </span>
              ))}
            </div>
            <div className="service-modal-section-label">What's included</div>
            <ul className="service-modal-features" id="modalFeatures">
              {(d.features || []).map((f) => (
                <li key={f.text} className={TYPE_CLASS[f.type] || ''}>{f.text}</li>
              ))}
            </ul>
            <div className="service-modal-note" id="modalNote">{d.note || ''}</div>
            <div className="card-consult"><strong>Quoted per project.</strong> Scope, timeline and price are agreed after a free consultation.</div>
          </>
        )}
        <div className="service-modal-actions">
          <Link to="/register" className="btn btn-primary">Book a consultation &rarr;</Link>
          <button className="service-modal-close-link" id="modalClose2" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}
