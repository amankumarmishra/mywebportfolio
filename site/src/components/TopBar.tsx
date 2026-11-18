import { useEffect, useRef, useState } from 'react';
import { nav } from '../content';
import { gsap, lockScroll, reducedMotion, scrollToHash } from '../lib/scroll';
import { useTeam } from '../lib/team';

const SQUARES = [0, 1, 2, 3, 4];

export default function TopBar({ onGarage, play }: { onGarage: () => void; play: boolean }) {
  const team = useTeam();
  const [open, setOpen] = useState(false);
  const panel = useRef<HTMLDivElement>(null);
  const menuBtn = useRef<HTMLButtonElement>(null);

  // Logo squares switch on like start lights once the race starts.
  useEffect(() => {
    if (!play || reducedMotion()) return;
    gsap.fromTo('.logo-sq', { opacity: 0 }, { opacity: 1, duration: 0.14, ease: 'power1.out', stagger: 0.07, delay: 0.7 });
    gsap.fromTo('.bar-act', { clipPath: 'inset(0 100% 0 0)' }, { clipPath: 'inset(0 0% 0 0)', duration: 0.6, ease: 'power3.out', delay: 1.02, stagger: 0.05 });
  }, [play]);

  useEffect(() => {
    lockScroll(open);
    if (!open) return;
    if (!reducedMotion()) {
      gsap.fromTo(panel.current, { clipPath: 'inset(0 0 100% 0)' }, { clipPath: 'inset(0 0 0% 0)', duration: 0.7, ease: 'expo.out' });
      gsap.from('.menu-link', { yPercent: 110, duration: 0.8, ease: 'expo.out', stagger: 0.05, delay: 0.1 });
    }
    panel.current?.querySelector('a')?.focus();
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  const go = (href: string) => {
    setOpen(false);
    menuBtn.current?.focus();
    requestAnimationFrame(() => scrollToHash(href));
  };

  return (
    <>
      <header className="pointer-events-none fixed inset-x-0 top-0 z-[60] mix-blend-difference">
        <a
          href="#home"
          onClick={e => (e.preventDefault(), go('#home'))}
          aria-label="Aman Kumar Mishra — home"
          className="pointer-events-auto absolute left-[var(--bar-l)] top-[var(--bar-t)] block w-[max(calc(118*var(--u)),84px)]"
        >
          <svg viewBox="0 0 118 30" className="block w-full" aria-hidden="true">
            {SQUARES.map(i => (
              <rect key={i} className="logo-sq" x={i * 19.2} y={i % 2 ? 10.9 : 0} width="8.2" height="8.2" fill="#fff" />
            ))}
            <rect className="logo-sq" x="96" y="21.8" width="8.2" height="8.2" fill="#fff" />
          </svg>
        </a>
      </header>

      <div className="fixed right-[var(--bar-r)] top-[var(--bar-t)] z-[61] flex items-center gap-[1.22em] text-[length:var(--small)]">
        <button
          onClick={onGarage}
          className="bar-act small flex items-center gap-2 leading-none"
          aria-label={`Constructor: ${team.name}. Change team`}
        >
          <span className="inline-block size-[0.8em] bg-livery shadow-[0_0_0_1px_rgba(255,255,255,.4)]" />
          <span className="hidden sm:inline">{team.short}</span>
        </button>
        <button
          ref={menuBtn}
          onClick={() => setOpen(o => !o)}
          aria-expanded={open}
          aria-controls="site-menu"
          className="bar-act small h-[1.508em] w-[6.349em] bg-menu pl-[0.33em] text-left leading-[1.508em] text-menu-ink transition-colors hover:bg-white"
        >
          <span>{open ? 'Close' : 'Menu'}</span>
        </button>
      </div>

      {open && (
        <div
          ref={panel}
          id="site-menu"
          role="dialog"
          aria-modal="true"
          aria-label="Site menu"
          className="fixed inset-0 z-[59] flex flex-col justify-end bg-menu text-menu-ink"
        >
          <nav className="px-[var(--bar-l)] pb-[max(24px,calc(40*var(--u)))]">
            <ul className="m-0 list-none p-0">
              {nav.map((n, i) => (
                <li key={n.href} className="overflow-hidden border-t border-black/10">
                  <a
                    href={n.href}
                    onClick={e => (e.preventDefault(), go(n.href))}
                    className="menu-link group flex items-baseline gap-4 py-1 focus-visible:outline-menu-ink"
                  >
                    <span className="mono w-8 text-[12px] opacity-50">{String(i).padStart(2, '0')}</span>
                    <span className="display text-[clamp(36px,8.4vw,120px)] transition-colors group-hover:text-livery">{n.label}</span>
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      )}
    </>
  );
}
