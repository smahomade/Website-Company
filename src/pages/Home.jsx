import { useRef } from 'react';
import Seo from '@/components/Seo.jsx';
import Hero from '@/components/home/Hero.jsx';
import ClientStrip from '@/components/home/ClientStrip.jsx';
import Work from '@/components/home/Work.jsx';
import Process from '@/components/home/Process.jsx';
import Benefits from '@/components/home/Benefits.jsx';
import Plans from '@/components/home/Plans.jsx';
import Quotes from '@/components/home/Quotes.jsx';
import Faq from '@/components/home/Faq.jsx';
import CtaBand from '@/components/home/CtaBand.jsx';
import useReveal from '@/hooks/useReveal.js';

/* The home page: who we are, proof first (live client sites), how a project runs, why us, the
   two ways to work together, questions, then one clear next step. */
export default function Home() {
  const pageRef = useRef(null);
  useReveal(pageRef);

  return (
    <div ref={pageRef} className="leading-normal">
      <Seo
        title="PixelFold — Little files, big ideas. Websites for small businesses"
        description="PixelFold designs and builds fast, beautiful websites for small businesses, from the first conversation to launch day. Quoted per project and explained in plain English."
        path="/"
      />
      <Hero />
      <ClientStrip />
      <Work />
      <Process />
      <Benefits />
      <Plans />
      <Quotes />
      <Faq />
      <CtaBand />
    </div>
  );
}
