import { useRef, useState } from 'react';
import { Pause, Play } from 'lucide-react';
import BrowserFrame from '@/components/home/BrowserFrame.jsx';
import { cn } from '@/lib/utils';

/* A client site in a browser window: its front page, and its tour (a slow scroll through the
   site) only when asked, with the button, or with the mouse over it when `hoverPlay` is set. The
   video isn't fetched until then. Changing `tour` (a new key) starts from the still again. */
export default function TourFrame({ name, url, still, tour, hoverPlay = false, eager = false, className }) {
  const [playing, setPlaying] = useState(false);
  const videoRef = useRef(null);

  const play = () => {
    setPlaying(true);
    requestAnimationFrame(() => videoRef.current?.play()?.catch(() => setPlaying(false)));
  };
  const stop = () => {
    const v = videoRef.current;
    if (v) {
      v.pause();
      v.currentTime = 0;
    }
    setPlaying(false);
  };

  return (
    <div
      className={className}
      onPointerEnter={hoverPlay ? (e) => e.pointerType === 'mouse' && play() : undefined}
      onPointerLeave={hoverPlay ? (e) => e.pointerType === 'mouse' && stop() : undefined}
    >
      <BrowserFrame url={url} className="shadow-md">
        <div className="relative aspect-video bg-sand">
          <img src={still} alt={name + '’s website'} loading={eager ? undefined : 'lazy'} className="absolute inset-0 size-full object-cover object-top" />
          {playing && tour && (
            <video key={tour} ref={videoRef} src={tour} muted loop playsInline aria-hidden="true" tabIndex={-1} className="absolute inset-0 size-full object-cover" />
          )}
          {tour && (
            <button
              type="button"
              onClick={playing ? stop : play}
              aria-label={(playing ? 'Stop the ' : 'Play the ') + name + ' tour'}
              className={cn(
                'absolute bottom-3 right-3 grid size-11 cursor-pointer place-items-center rounded-full bg-cream/95 text-ink shadow-md outline-none transition-colors hover:bg-white focus-visible:ring-[3px] focus-visible:ring-ring/60'
              )}
            >
              {playing ? <Pause className="size-4" /> : <Play className="size-4" />}
            </button>
          )}
        </div>
      </BrowserFrame>
    </div>
  );
}
