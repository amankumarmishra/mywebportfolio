import { useEffect, useLayoutEffect, useRef } from 'react';
import { constructorSelect, teams, type TeamId } from '../content';
import { gsap, reducedMotion } from '../lib/scroll';
import { useTeam } from '../lib/team';

type Props = { onPick: (id: TeamId) => void; onClose?: () => void };

export default function ConstructorSelect({ onPick, onClose }: Props) {
  const root = useRef<HTMLDivElement>(null);
  const active = useTeam();

  // Garage reveal: each livery door rolls up from below, staggered.
  useLayoutEffect(() => {
    if (reducedMotion()) return;
    const ctx = gsap.context(() => {
      gsap.from('.door', { yPercent: 105, duration: 1.1, ease: 'expo.out', stagger: 0.08 });
      gsap.from('.cs-head > *', { y: 24, opacity: 0, duration: 0.7, ease: 'power3.out', stagger: 0.06, delay: 0.2 });
    }, root);
    return () => ctx.revert();
  }, []);

  useEffect(() => {
    root.current?.querySelector<HTMLButtonElement>('[data-team-btn]')?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && onClose) onClose();
      // keep Tab inside the dialog
      if (e.key === 'Tab' && root.current) {
        const f = root.current.querySelectorAll<HTMLElement>('button');
        const first = f[0], last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) (e.preventDefault(), last.focus());
        else if (!e.shiftKey && document.activeElement === last) (e.preventDefault(), first.focus());
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div
      ref={root}
      role="dialog"
      aria-modal="true"
      aria-labelledby="cs-title"
      className="fixed inset-0 z-[90] isolate flex flex-col overflow-hidden"
      style={{ background: 'linear-gradient(180deg,#0d0905,#130e09)' }}
    >
      <div className="hairgrid" />
      <div className="cs-head flex items-start justify-between gap-6 px-[max(16px,calc(20.65*var(--u)))] pt-[max(14px,calc(12.8*var(--u)))] pb-6">
        <div>
          <p className="eyebrow m-0 mb-3">Garage · Constructor</p>
          <h2 id="cs-title" className="display m-0 text-[clamp(34px,6.4vw,92px)]">{constructorSelect.title}</h2>
        </div>
        <div className="flex max-w-[22ch] flex-col items-end gap-4 text-right">
          <p className="small m-0 text-mute">{constructorSelect.subtitle}</p>
          {onClose && (
            <button onClick={onClose} className="small bg-menu px-[0.5em] py-[0.25em] text-menu-ink">Close</button>
          )}
        </div>
      </div>

      <ul className="m-0 grid flex-1 list-none grid-rows-5 gap-px p-0 md:grid-cols-5 md:grid-rows-1">
        {teams.map((t, i) => (
          <li key={t.id} className="relative overflow-hidden">
            <button
              data-team-btn
              onClick={() => onPick(t.id)}
              aria-pressed={active.id === t.id}
              className="door group relative flex h-full w-full flex-col justify-between overflow-hidden p-[clamp(12px,1.6vw,22px)] text-left"
              style={{ background: t.livery, color: t.id === 'mclaren' || t.id === 'redbull' ? '#141414' : '#fff' }}
            >
              {/* roller-door slats */}
              <span aria-hidden="true" className="pointer-events-none absolute inset-0 opacity-25 [background:repeating-linear-gradient(180deg,rgba(0,0,0,.35)_0_1px,transparent_1px_14px)]" />
              <span aria-hidden="true" className="absolute inset-y-0 right-0 w-[18%] transition-transform duration-500 ease-[var(--e-expo)] group-hover:-translate-x-2" style={{ background: t.secondary, opacity: 0.9 }} />
              <span className="mono relative text-[11px] tracking-[0.14em]">{String(i + 1).padStart(2, '0')} / {active.id === t.id ? 'SELECTED' : 'TAP TO RUN'}</span>
              <span className="relative">
                <span className="display condensed block text-[clamp(30px,6vw,96px)] leading-[0.8] transition-transform duration-500 ease-[var(--e-brake)] group-hover:-translate-y-2 md:[writing-mode:vertical-rl] md:rotate-180">
                  {t.short}
                </span>
                <span className="small mt-2 block opacity-80 md:hidden">{t.name}</span>
              </span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
