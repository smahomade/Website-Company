import BrowserFrame from '@/components/home/BrowserFrame.jsx';
import { HERO_CARDS } from '@/data/heroCards.js';
import { cn } from '@/lib/utils';

/* The three client sites, each designed around its own brand, fanned out with the latest on top.
   Still images only. */
const LOOKS = ['Raza Academy', 'Top One Salon', 'Change Work Therapies'].map((name) => {
  const card = HERO_CARDS.find((c) => c.name === name);
  const id = name.toLowerCase().replace(/ /g, '-');
  return { name, url: card.url, small: '/images/home/site-' + id };
});
const FAN = ['left-0 top-0', 'left-[11%] top-[18%]', 'left-[22%] top-[36%]'];

export default function SiteFan({ eager = false, className }) {
  return (
    <div className={cn('relative aspect-[16/13]', className)}>
      {LOOKS.map((l, i) => (
        <BrowserFrame key={l.name} url={l.url} className={cn('absolute w-[78%]', FAN[i])}>
          <img
            src={l.small + '-800.webp'}
            srcSet={l.small + '-480.webp 480w, ' + l.small + '-800.webp 800w'}
            sizes="(min-width: 1024px) 420px, 78vw"
            width="800"
            height="450"
            alt={l.name + '’s home page'}
            loading={eager ? undefined : 'lazy'}
            className="aspect-video w-full object-cover object-top"
          />
        </BrowserFrame>
      ))}
    </div>
  );
}
