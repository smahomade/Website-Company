import { FolderIcon } from './BrandIcons.jsx';

/* Home-page "How it works" step: photo on top, folder icon as a badge. */
export default function StepCard({ kind, img, tag, num, title, desc }) {
  return (
    <div className="hiw-step-card pf-step-card pf-folder">
      <div className="pf-step-photo">
        <img src={img} alt="" loading="lazy" />
        <span className="pf-step-badge"><FolderIcon kind={kind} size={34} /></span>
        <span className="pf-step-num" aria-hidden="true">{num}</span>
      </div>
      <span className="pf-step-tag">{tag}</span>
      <h3 className="pf-step-title">{title}</h3>
      <p className="pf-step-desc">{desc}</p>
    </div>
  );
}
