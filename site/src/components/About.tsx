import { useEffect, useRef } from 'react';
import { about } from '../content';
import { gsap, reducedMotion } from '../lib/scroll';
import { Brake, SectionHead } from './ui';

export default function About() {
  const frame = useRef<HTMLDivElement>(null);
  const counter = useRef<HTMLSpanElement>(null);

  // High-speed crash camera: the image is exposed line by line behind a scan bar.
  useEffect(() => {
    const el = frame.current!;
    if (reducedMotion()) return;
    const ctx = gsap.context(() => {
      const t = { ms: 0 };
      gsap.timeline({ scrollTrigger: { trigger: el, start: 'top 75%', once: true } })
        .fromTo('.scan-img', { clipPath: 'inset(0 0 100% 0)' }, { clipPath: 'inset(0 0 0% 0)', duration: 1.5, ease: 'power2.inOut' })
        .fromTo('.scan-bar', { y: 0, opacity: 1 }, { y: () => el.clientHeight, duration: 1.5, ease: 'power2.inOut' }, 0)
        .to(t, { ms: 120, duration: 1.5, ease: 'power2.inOut', onUpdate: () => counter.current && (counter.current.textContent = t.ms.toFixed(3)) }, 0)
        .to('.scan-bar', { opacity: 0, duration: 0.2 })
        .fromTo('.scan-flash', { opacity: 0.6 }, { opacity: 0, duration: 0.5 }, '<')
        .from('.crash-marker', { scale: 0, rotate: -90, duration: 0.6, ease: 'back.out(2)', stagger: 0.08 }, '<');
    }, el);
    return () => ctx.revert();
  }, []);

  const [hello, ...rest] = about.paragraphs;

  return (
    <section id="about" aria-labelledby="about-title" className="relative isolate pb-[clamp(80px,10vw,140px)]">
      <div className="hairgrid" />
      <SectionHead id="about-title" index="02 / Driver" title={about.title} labels={['Passive safety', 'Crashworthiness', 'Vehicle dynamics']} />

      <div className="mt-[clamp(32px,5vw,72px)] grid gap-10 px-[var(--bar-l)] md:grid-cols-12">
        <Brake from="left" className="md:col-span-5">
          <div ref={frame} className="relative aspect-[3/4] w-full max-w-[520px] overflow-hidden bg-surface">
            <img src={about.image} alt={about.imageAlt} width={900} height={1200} loading="lazy" className="scan-img h-full w-full object-cover grayscale-[0.25]" />
            <div className="scan-flash pointer-events-none absolute inset-0 bg-white opacity-0" />
            <div className="scan-bar pointer-events-none absolute inset-x-0 top-0 h-[3px] bg-livery opacity-0 shadow-[0_0_24px_6px_var(--livery)]" />
            {/* crash-test target markers */}
            <span className="crash-marker absolute left-3 top-3" aria-hidden="true" />
            <span className="crash-marker absolute right-3 top-3" aria-hidden="true" />
            <span className="crash-marker absolute bottom-3 left-3" aria-hidden="true" />
            <span className="crash-marker absolute bottom-3 right-3" aria-hidden="true" />
            <div className="mono absolute inset-x-0 bottom-0 flex justify-between bg-gradient-to-t from-black/80 to-transparent px-12 pb-4 pt-10 text-[11px] uppercase tracking-[0.1em]" aria-hidden="true">
              <span>Cam 02 · 1000 fps</span>
              <span>T+<span ref={counter}>120.000</span> ms</span>
            </div>
          </div>
        </Brake>

        <div className="flex flex-col justify-end md:col-span-6 md:col-start-7">
          <Brake from="right">
            <p className="display condensed m-0 text-[clamp(32px,4.6vw,68px)] text-livery">{hello}</p>
          </Brake>
          {rest.map((p, i) => (
            <Brake key={i} delay={0.08 * (i + 1)}>
              <p className="m-0 mt-6 max-w-[56ch] text-[clamp(16px,1.35vw,20px)] leading-[1.5] text-white/80">{p}</p>
            </Brake>
          ))}
        </div>
      </div>
    </section>
  );
}
