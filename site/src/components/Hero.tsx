import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { hero, socials } from '../content';
import { gsap, onVelocity, reducedMotion, scrollToHash, ScrollTrigger } from '../lib/scroll';
import DecryptedText from './rb/DecryptedText';
import { TRACK_PATH } from './Chrome';
import { Instagram, LinkedIn, Mail } from './icons';
import './hero.css';

const VIDEO =
  'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20261005_143740_52dbf3ef-ea20-4594-a1ad-91d6c2970159.mp4';

// An original, generic circuit outline (not any real track), shared with the lap map.
const TRACK = TRACK_PATH;

const LINES = [hero.firstName.split(' ')[0], hero.firstName.split(' ')[1] ?? '', hero.lastName].filter(Boolean);
const SERVICES = ['Passive Safety', 'Crashworthiness', 'Vehicle Dynamics'];

function Ticker() {
  const spd = useRef<HTMLSpanElement>(null);
  const gear = useRef<HTMLSpanElement>(null);
  const rpm = useRef<HTMLSpanElement>(null);
  const drs = useRef<HTMLSpanElement>(null);
  const bar = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    let target = 0;
    let speed = 0;
    let raf = 0;
    const off = onVelocity(v => (target = Math.min(340, Math.abs(v) * 9)));
    const loop = () => {
      // ease toward target, coast down when scrolling stops
      speed += (target - speed) * 0.08;
      target *= 0.94;
      const g = speed < 4 ? 0 : Math.min(8, 1 + Math.floor(speed / 44));
      const band = g ? (speed - (g - 1) * 44) / 44 : 0;
      const r = Math.round(g ? 6200 + band * 5800 : 4000 + Math.sin(performance.now() / 160) * 60);
      if (spd.current) spd.current.textContent = String(Math.round(speed)).padStart(3, '0');
      if (gear.current) gear.current.textContent = g ? String(g) : 'N';
      if (rpm.current) rpm.current.textContent = String(r).padStart(5, '0');
      if (drs.current) {
        const on = speed > 250;
        drs.current.textContent = on ? 'OPEN' : 'OFF';
        drs.current.style.color = on ? 'var(--improved)' : '';
      }
      if (bar.current) bar.current.style.transform = `scaleX(${Math.min(1, r / 12000)})`;
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => (off(), cancelAnimationFrame(raf));
  }, []);

  return (
    <div className="mono min-w-[200px] text-right text-[11px] uppercase leading-[1.6] tracking-[0.08em]" aria-hidden="true">
      <div className="flex justify-end gap-4">
        <span><span className="text-mute">SPD </span><span ref={spd} className="tabular-nums">000</span> km/h</span>
        <span><span className="text-mute">GEAR </span><span ref={gear} className="text-sector">N</span></span>
      </div>
      <div className="flex justify-end gap-4">
        <span><span className="text-mute">RPM </span><span ref={rpm} className="tabular-nums">04000</span></span>
        <span><span className="text-mute">DRS </span><span ref={drs}>OFF</span></span>
      </div>
      <span className="mt-1 block h-[3px] w-full bg-white/10">
        <span ref={bar} className="block h-full origin-left bg-[linear-gradient(90deg,var(--improved)_0_55%,var(--livery)_55%_85%,var(--pb)_85%)]" />
      </span>
    </div>
  );
}

export default function Hero({ play }: { play: boolean }) {
  const root = useRef<HTMLElement>(null);
  const video = useRef<HTMLVideoElement>(null);
  // Phones and touch tablets get a light SVG arc instead of streaming the video.
  const [rich] = useState(() => matchMedia('(min-width: 768px) and (pointer: fine)').matches);

  useEffect(() => {
    if (reducedMotion()) video.current?.pause();
    else video.current?.play().catch(() => {});
  }, []);

  // Hidden start state until the formation lap ends.
  useLayoutEffect(() => {
    if (reducedMotion()) return;
    gsap.set(root.current!.querySelectorAll('.hl__track'), { yPercent: 100 });
    gsap.set(root.current!.querySelectorAll('.services .rv'), { y: '130%' });
    gsap.set(root.current!.querySelector('.rule'), { scaleX: 0 });
    gsap.set(root.current!.querySelectorAll('.soft-in'), { y: '0.55em', opacity: 0 });
  }, []);

  useEffect(() => {
    if (!play) return;
    const el = root.current!;
    const path = el.querySelector<SVGPathElement>('.hero__track path')!;
    const len = path.getTotalLength();
    path.style.strokeDasharray = `${len}`;

    if (reducedMotion()) {
      path.style.strokeDashoffset = '0';
      return;
    }
    const ctx = gsap.context(() => {
      gsap.timeline()
        .to('.hl__track', { yPercent: 0, duration: 1.05, ease: 'expo.out', stagger: 0.08 }, 0.1)
        .to('.rule', { scaleX: 1, duration: 0.85, ease: 'power4.inOut' }, 0.24)
        .to('.services .rv', { y: 0, duration: 0.8, ease: 'power4.out', stagger: 0.06 }, 0.56)
        .to('.soft-in', { y: 0, opacity: 1, duration: 0.75, ease: 'power4.out', stagger: 0.05 }, 0.78)
        .fromTo(path, { strokeDashoffset: len }, { strokeDashoffset: len * 0.62, duration: 1.6, ease: 'power2.out' }, 0.4);
      // the rest of the lap is drawn by scrolling
      gsap.to(path, {
        strokeDashoffset: 0,
        ease: 'none',
        scrollTrigger: { trigger: el, start: 'top top', end: 'bottom top', scrub: 0.6 },
      });
      gsap.to('.hl', { yPercent: -18, ease: 'none', scrollTrigger: { trigger: el, start: 'top top', end: 'bottom top', scrub: true } });
    }, el);
    ScrollTrigger.refresh();
    return () => ctx.revert();
  }, [play]);

  return (
    <header id="home" ref={root} className="hero">
      {rich ? (
        <div className="hero__photo" role="presentation">
          <video ref={video} src={VIDEO} muted loop playsInline preload="metadata" aria-hidden="true" />
        </div>
      ) : (
        <svg className="hero__arc" viewBox="0 0 400 300" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
          <defs>
            <radialGradient id="arcGlow" cx="50%" cy="62%" r="55%">
              <stop offset="0" stopColor="var(--livery)" stopOpacity=".28" />
              <stop offset="1" stopColor="var(--livery)" stopOpacity="0" />
            </radialGradient>
          </defs>
          <rect width="400" height="300" fill="url(#arcGlow)" />
          <path d="M-20 250 C 80 120, 300 110, 430 60" fill="none" stroke="var(--livery)" strokeWidth="1.4" />
          <path d="M-20 250 C 80 120, 300 110, 430 60" fill="none" stroke="var(--livery)" strokeWidth="8" opacity=".18" />
        </svg>
      )}
      <div className="hairgrid" />
      <svg className="hero__track" viewBox="0 0 1000 440" fill="none" aria-hidden="true">
        <path d={TRACK} stroke="var(--livery)" strokeWidth="2.2" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
      </svg>

      <p className="tagline small m-0">
        <span className="soft-in">{hero.tagline}.</span>
        <span className="soft-in text-mute">{hero.role.split(' (')[0]},</span>
        <span className="soft-in text-mute">{hero.role.match(/\((.*)\)/)?.[1]}</span>
      </p>
      <address className="contact m-0">
        <span className="soft-in flex gap-2">
          {([
            [socials.email, 'Email', Mail, false],
            [socials.linkedin, 'LinkedIn', LinkedIn, true],
            [socials.instagram, 'Instagram', Instagram, true],
          ] as const).map(([href, label, Icon, ext]) => (
            <a key={label} href={href} aria-label={label} title={label} {...(ext && { target: '_blank', rel: 'noopener noreferrer' })}
              className="grid size-10 place-items-center border border-white/15 transition-colors hover:border-livery hover:text-livery">
              <Icon className="size-[18px]" />
            </a>
          ))}
        </span>
      </address>

      <ul className="services small" aria-label="Focus areas">
        {SERVICES.map(s => <li key={s}><span className="rv">{s}</span></li>)}
      </ul>
      <div className="rule rule-line" aria-hidden="true" />

      <div className="hero__under">
        <a
          href="#contact"
          onClick={e => (e.preventDefault(), scrollToHash('#contact'))}
          className="soft-in small group flex items-center gap-3 bg-menu py-[0.35em] pl-[0.5em] pr-[0.4em] text-menu-ink transition-colors hover:bg-livery hover:text-on-livery"
        >
          {hero.cta}
          <svg width="1.1em" height="1.1em" viewBox="0 0 16 16" aria-hidden="true" className="transition-transform duration-300 group-hover:translate-x-1">
            <path d="M2 8h11M9 3l5 5-5 5" stroke="currentColor" strokeWidth="1.6" fill="none" />
          </svg>
        </a>
        <div className="soft-in hidden sm:block"><Ticker /></div>
      </div>

      <h1 className="hl display" aria-label={`${hero.firstName} ${hero.lastName}`}>
        {LINES.map((l, i) => (
          <span key={l} className="hl__clip" aria-hidden="true">
            <span className="hl__track">
              {play ? (
                <DecryptedText text={l} animateOn="view" sequential revealDirection={i % 2 ? 'end' : 'start'} speed={38} characters="0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ" encryptedClassName="text-livery" useOriginalCharsOnly={false} />
              ) : (
                l
              )}
            </span>
          </span>
        ))}
      </h1>
    </header>
  );
}
