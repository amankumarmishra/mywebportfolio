import { useEffect, useRef } from 'react';
import { experience } from '../content';
import { gsap, reducedMotion } from '../lib/scroll';
import { SectionHead } from './ui';

const COMPOUND = {
  soft: { label: 'Soft', color: 'var(--soft)' },
  medium: { label: 'Medium', color: 'var(--medium)' },
  hard: { label: 'Hard', color: 'var(--hard)' },
} as const;

// Most recent stint first, in the order listed in content.ts.
const STINTS = experience.stints;
// Bar widths on the strategy chart roughly follow each stint's length.
const stintLength = (dates: string) => {
  const [a, b] = dates.split(' - ').map(d => d.split('/').map(Number));
  return b && b.length === 2 ? Math.max(3, (b[1] - a[1]) * 12 + (b[0] - a[0])) : 12;
};

export default function PitStops() {
  const section = useRef<HTMLElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const car = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mm = gsap.matchMedia();
    // Pin + horizontal travel on wide screens only; phones get a vertical stack.
    mm.add('(min-width: 900px) and (prefers-reduced-motion: no-preference)', () => {
      const el = track.current!;
      const distance = () => el.scrollWidth - window.innerWidth;
      const tween = gsap.to(el, {
        x: () => -distance(),
        ease: 'none',
        scrollTrigger: {
          trigger: section.current!.querySelector('.pit-pin'),
          pin: true,
          scrub: 0.8,
          end: () => `+=${distance()}`,
          invalidateOnRefresh: true,
          onUpdate: st => car.current && (car.current.style.transform = `translateX(${st.progress * 100}cqw)`),
        },
      });
      // each stint panel "brakes" in as it enters the viewport horizontally
      gsap.utils.toArray<HTMLElement>('.stint').forEach(p =>
        gsap.from(p.querySelectorAll('.stint-in'), {
          x: 120,
          opacity: 0,
          ease: 'back.out(1.4)',
          stagger: 0.04,
          scrollTrigger: { trigger: p, containerAnimation: tween, start: 'left 85%', end: 'left 40%', scrub: 0.6 },
        }),
      );
    });
    if (reducedMotion()) car.current && (car.current.style.transform = 'translateX(100cqw)');
    return () => mm.revert();
  }, []);

  return (
    <section id="experience" ref={section} aria-labelledby="exp-title" className="relative isolate">
      <SectionHead id="exp-title" index="03 / Strategy" title={experience.title} labels={['Stints', 'Compounds', 'Pit windows']} />

      <div className="pit-pin relative flex min-h-[100svh] flex-col justify-center overflow-hidden py-10 min-[900px]:h-[100svh]">
        <div className="hairgrid" />
        {/* strategy chart lane: stint bars by compound, pit markers between */}
        <div className="px-[var(--bar-l)]" aria-hidden="true">
          <div className="mono mb-2 flex justify-between text-[11px] uppercase tracking-[0.12em] text-mute">
            <span>Race strategy · latest first</span><span>{STINTS[0].dates.split(' - ')[1]} ← {STINTS[STINTS.length - 1].dates.split(' - ')[0]}</span>
          </div>
          <div className="relative flex h-[18px] gap-[6px] [container-type:inline-size]">
            {STINTS.map((s, i) => (
              <div key={s.company} className="relative h-full" style={{ flex: stintLength(s.dates) }}>
                <div className="h-full" style={{ background: COMPOUND[s.compound].color, opacity: 0.85 }} />
                {i < STINTS.length - 1 && <span className="mono absolute -right-[3px] top-[22px] translate-x-1/2 text-[10px] text-sector">PIT</span>}
              </div>
            ))}
            <div ref={car} className="pointer-events-none absolute -left-[6px] -top-[5px] h-[28px] w-[3px] bg-white shadow-[0_0_12px_var(--livery)]" />
          </div>
        </div>

        <div ref={track} className="mt-12 flex flex-col gap-16 px-[var(--bar-l)] will-change-transform min-[900px]:w-max min-[900px]:flex-row min-[900px]:gap-0">
          {STINTS.map((s, i) => (
            <article key={s.company} className="stint relative min-[900px]:w-[min(78vw,1000px)] min-[900px]:pr-[8vw]">
              <div className="stint-in flex items-center gap-4">
                <span className="mono text-[12px] text-mute">STINT {String(i + 1).padStart(2, '0')}</span>
                <span className="flex items-center gap-2 border border-white/15 px-2 py-1 text-[12px]">
                  <span className="tyre" style={{ ['--c' as string]: COMPOUND[s.compound].color }} />
                  {COMPOUND[s.compound].label}
                </span>
                {/current/i.test(s.dates) && <span className="mono bg-pb-deep px-2 py-1 text-[11px] text-white">CURRENT</span>}
              </div>
              <div className="stint-in mt-6 flex items-start gap-5">
                {/* fixed box + object-contain: any logo shape scales down to fit instead of spilling out */}
                <span className="flex h-[64px] w-[160px] shrink-0 items-center justify-center overflow-hidden bg-white p-2">
                  <img src={s.logo} alt={`${s.company} logo`} loading="lazy" className="block h-full w-full object-contain" />
                </span>
                <div>
                  <h3 className="display condensed m-0 text-[clamp(30px,4.4vw,64px)]">{s.company}</h3>
                  <p className="m-0 mt-2 text-[clamp(16px,1.4vw,20px)] text-livery">{s.role}</p>
                  <p className="mono m-0 mt-1 text-[12px] uppercase tracking-[0.08em] text-mute">{s.dates} · {s.location}</p>
                </div>
              </div>
              <ul className="m-0 mt-8 grid list-none gap-x-10 gap-y-4 p-0 md:grid-cols-2">
                {s.points.map((p, j) => (
                  <li key={j} className="stint-in relative border-t border-rule pt-3 text-[15px] leading-[1.5] text-white/78">
                    <span className="mono mr-2 text-[11px] text-sector">S{(j % 3) + 1}</span>
                    {p}
                  </li>
                ))}
              </ul>
              {i < STINTS.length - 1 && (
                <div className="mono mt-10 hidden items-center gap-3 text-[11px] uppercase tracking-[0.12em] text-sector min-[900px]:absolute min-[900px]:right-[1.5vw] min-[900px]:top-1/2 min-[900px]:mt-0 min-[900px]:flex min-[900px]:-translate-y-1/2 min-[900px]:[writing-mode:vertical-rl]" aria-hidden="true">
                  Box, box · Pit stop
                </div>
              )}
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
