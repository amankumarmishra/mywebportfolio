import { lazy, Suspense, useCallback, useEffect, useState } from 'react';
import { game, teams, type TeamId } from './content';
import { initScroll, lockScroll, ScrollTrigger } from './lib/scroll';
import { hasChosenTeam, setTeam } from './lib/team';
import { liveryWipe } from './lib/wipe';
import Preloader from './components/Preloader';
import ConstructorSelect from './components/ConstructorSelect';
import TopBar from './components/TopBar';
import Hero from './components/Hero';
import { Cursor, LapProgress } from './components/Chrome';

// The game is only downloaded when someone opens it.
const MiniGP = lazy(() => import('./components/MiniGP'));
const Sections = lazy(() => import('./components/Sections'));

type Phase = 'loading' | 'garage' | 'race';

export default function App() {
  const [phase, setPhase] = useState<Phase>('loading');
  const [garage, setGarage] = useState(false);
  const [loader, setLoader] = useState(true);
  const [racing, setRacing] = useState(false);
  const closeGame = useCallback(() => setRacing(false), []);

  useEffect(() => {
    if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
    window.scrollTo(0, 0);
    initScroll();
  }, []);

  useEffect(() => {
    lockScroll(phase !== 'race' || garage);
    if (phase === 'race') ScrollTrigger.refresh();
  }, [phase, garage]);

  const reveal = useCallback(() => setPhase(hasChosenTeam() ? 'race' : 'garage'), []);
  const loaded = useCallback(() => setLoader(false), []);

  const pick = (id: TeamId) => {
    const t = teams.find(x => x.id === id)!;
    liveryWipe(t.livery, t.secondary, () => {
      setTeam(id);
      setGarage(false);
      setPhase('race');
    });
  };

  return (
    <>
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[200] focus:bg-menu focus:px-3 focus:py-2 focus:text-menu-ink">
        Skip to content
      </a>
      {loader && <Preloader onReveal={reveal} onDone={loaded} />}
      {(phase === 'garage' || garage) && (
        <ConstructorSelect onPick={pick} onClose={phase === 'race' ? () => setGarage(false) : undefined} />
      )}
      <TopBar play={phase === 'race'} onGarage={() => setGarage(true)} />
      <Hero play={phase === 'race'} />
      <Suspense fallback={<div id="main" className="min-h-screen" />}>
        <Sections />
      </Suspense>
      <LapProgress />
      <Cursor />
      {phase === 'race' && (
        <button
          onClick={() => setRacing(true)}
          aria-haspopup="dialog"
          className="small fixed bottom-[max(12px,env(safe-area-inset-bottom))] right-[var(--bar-r)] z-[55] flex h-[1.9em] items-center gap-2 bg-livery px-[0.6em] uppercase text-on-livery shadow-[0_8px_24px_-8px_var(--livery)] transition-transform duration-300 ease-[var(--e-brake)] hover:-translate-y-1"
        >
          <span aria-hidden="true" className="inline-block size-[0.7em] [background:conic-gradient(#000_0_25%,#fff_0_50%,#000_0_75%,#fff_0)] [background-size:50%_50%]" />
          {game.launch}
        </button>
      )}
      {racing && (
        <Suspense fallback={null}>
          <MiniGP onClose={closeGame} />
        </Suspense>
      )}
    </>
  );
}
