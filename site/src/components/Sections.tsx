// Everything below the hero, split into its own chunk so first paint only needs the hero.
import { useEffect } from 'react';
import { ScrollTrigger } from '../lib/scroll';
import About from './About';
import PitStops from './PitStops';
import Telemetry from './Telemetry';
import TrackRecords from './TrackRecords';
import TeamRadio from './TeamRadio';
import Contact from './Contact';
import { teamRadio } from '../content';
import { Footer } from './Chrome';

export default function Sections() {
  // pinned sections change page height once mounted
  useEffect(() => {
    const id = requestAnimationFrame(() => ScrollTrigger.refresh());
    return () => cancelAnimationFrame(id);
  }, []);
  return (
    <>
      <main id="main">
        <About />
        <PitStops />
        <Telemetry />
        <TrackRecords />
        {teamRadio.items.length > 0 && <TeamRadio />}
        <Contact />
      </main>
      <Footer />
    </>
  );
}
