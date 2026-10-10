import { LOGO } from '../lib/site.js';

/* The PixelFold cat. `variant` picks the animation/placement class. */
export default function Mascot({ variant = 'inline', size = 120, className = '', alt = '' }) {
  return (
    <img
      src={LOGO.mark}
      alt={alt}
      aria-hidden={alt ? undefined : 'true'}
      className={('pf-mascot pf-mascot--' + variant + ' ' + className).trim()}
      style={{ width: size }}
      draggable="false"
    />
  );
}
