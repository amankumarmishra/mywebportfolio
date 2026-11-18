import { motion, useReducedMotion, useSpring } from 'motion/react';
import { useCallback, useEffect, useLayoutEffect, useRef, useState, type PointerEvent } from 'react';
import { SplitText } from 'gsap/SplitText';
import { teamRadio, type Testimonial } from '../content';
import { gsap } from '../lib/scroll';
import { LinkedIn } from './icons';
import Modal from './Modal';
import { Brake, Kerb, SectionHead } from './ui';

gsap.registerPlugin(SplitText);

const ITEMS = teamRadio.items;
// LAP number = order written, oldest first
const LAP = Object.fromEntries([...ITEMS].sort((a, b) => a.date.localeCompare(b.date)).map((t, i) => [t.id, i + 1]));
const WAVE = [0.35, 0.7, 0.5, 1, 0.6, 0.85, 0.4, 0.95, 0.55, 0.75, 0.3, 0.6];
const initials = (name: string) => {
  const w = name.split(' ');
  return (w[0][0] + (w.length > 1 ? w[w.length - 1][0] : '')).toUpperCase();
};

/** Photo, or a driver-number style monogram in the active livery. Fixed size, so no layout shift. */
function Avatar({ t, size }: { t: Testimonial; size: number }) {
  const box = { width: size, height: size };
  return t.image ? (
    <img src={t.image} alt={t.name} width={size} height={size} loading="lazy" decoding="async" className="shrink-0 object-cover" style={box} />
  ) : (
    <span role="img" aria-label={t.name} className="relative grid shrink-0 place-items-center overflow-hidden bg-livery text-on-livery" style={box}>
      <span className="display condensed -skew-x-[10deg] text-[calc(var(--s)*0.46)] leading-none" style={{ ['--s' as string]: `${size}px` }}>
        {initials(t.name)}
      </span>
      <span className="absolute inset-x-0 bottom-0 h-[14%] bg-livery-2" />
    </span>
  );
}

/** Radio waveform: pulses when its card scrolls into view (variants come from the card). */
function Waveform() {
  const reduce = useReducedMotion();
  return (
    <span className="flex h-4 items-center gap-[2px]" aria-hidden="true">
      {WAVE.map((h, i) => (
        <motion.span
          key={i}
          className="block h-full w-[2px] bg-livery"
          style={{ scaleY: reduce ? h * 0.6 : 0.2 }}
          variants={reduce ? undefined : {
            off: { scaleY: 0.2 },
            on: { scaleY: [0.2, h, 0.3, h * 0.8, 0.25, h, h * 0.45], transition: { duration: 1.6, delay: i * 0.025, ease: 'easeInOut' } },
          }}
        />
      ))}
    </span>
  );
}

/** Quote text clamped to 6 lines; reveals line by line the first time it is visible. */
function Quote({ text, className, onClamp }: { text: string; className: string; onClamp?: (clamped: boolean) => void }) {
  const ref = useRef<HTMLParagraphElement>(null);
  const reduce = useReducedMotion();
  useLayoutEffect(() => {
    const el = ref.current!;
    // re-check after resizes, re-splits and font loads: the box size stays fixed while the text reflows
    const check = () => onClamp?.(el.scrollHeight > el.clientHeight + 2);
    const ro = new ResizeObserver(check);
    ro.observe(el);
    document.fonts.ready.then(check);
    if (reduce) return () => ro.disconnect();
    let shown = false;
    let tween: gsap.core.Tween | undefined;
    const split = SplitText.create(el, {
      type: 'lines',
      mask: 'lines',
      autoSplit: true,
      onSplit: self => {
        check();
        if (shown) return;
        tween = gsap.from(self.lines, { yPercent: 110, duration: 0.8, stagger: 0.08, ease: 'expo.out', paused: true });
        return tween;
      },
    });
    // IntersectionObserver (not ScrollTrigger) so cards scrolled in sideways in the carousel also reveal
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      shown = true;
      tween?.play();
      io.disconnect();
    }, { threshold: 0.35 });
    io.observe(el);
    return () => (ro.disconnect(), io.disconnect(), split.revert());
  }, [reduce, onClamp]);
  return <p ref={ref} className={`m-0 max-h-[6lh] overflow-hidden ${className}`}>{text}</p>;
}

/** Slight 3D tilt toward the mouse. Off for touch and reduced motion. */
function useTilt() {
  const reduce = useReducedMotion();
  const rotateX = useSpring(0, { stiffness: 220, damping: 20 });
  const rotateY = useSpring(0, { stiffness: 220, damping: 20 });
  return {
    style: { rotateX, rotateY, transformPerspective: 900 },
    onPointerMove: (e: PointerEvent<HTMLElement>) => {
      if (reduce || e.pointerType !== 'mouse') return;
      const r = e.currentTarget.getBoundingClientRect();
      rotateY.set(((e.clientX - r.left) / r.width - 0.5) * 5);
      rotateX.set(-((e.clientY - r.top) / r.height - 0.5) * 5);
    },
    onPointerLeave: () => (rotateX.set(0), rotateY.set(0)),
  };
}

function Header({ t, big }: { t: Testimonial; big?: boolean }) {
  return (
    <figcaption className="flex items-center gap-4">
      <Avatar t={t} size={big ? 72 : 56} />
      <span className="min-w-0 flex-1">
        <span className={`display condensed block leading-[0.95] ${big ? 'text-[clamp(26px,2.6vw,40px)]' : 'text-[24px]'}`}>{t.name}</span>
        <span className="mt-1 block text-[14px] leading-snug text-livery">{t.role} @ {t.company}</span>
        {t.relationship && <span className="block text-[13px] text-mute">{t.relationship}</span>}
      </span>
      {t.linkedinUrl && (
        <a href={t.linkedinUrl} target="_blank" rel="noopener noreferrer" aria-label={`${t.name} on LinkedIn`} title="LinkedIn"
          className="grid size-10 shrink-0 place-items-center border border-white/15 transition-colors hover:border-livery hover:text-livery">
          <LinkedIn className="size-[18px]" />
        </a>
      )}
    </figcaption>
  );
}

const Meta = ({ t }: { t: Testimonial }) => (
  <div className="mono mt-5 flex items-center gap-3 text-[11px] uppercase tracking-[0.14em]">
    <Waveform />
    <span className="bg-livery px-1.5 py-0.5 text-on-livery">{teamRadio.label}</span>
    <time dateTime={t.date} className="text-mute">LAP {LAP[t.id]} · {t.date.slice(0, 7)}</time>
  </div>
);

function Transmission({ t, big, onOpen }: { t: Testimonial; big?: boolean; onOpen: (t: Testimonial) => void }) {
  const reduce = useReducedMotion();
  const [clamped, setClamped] = useState(false);
  const tilt = useTilt();
  return (
    <motion.figure
      initial="off"
      whileInView="on"
      viewport={{ amount: 0.4 }}
      variants={reduce ? { off: { opacity: 0 }, on: { opacity: 1, transition: { duration: 0.4 } } } : undefined}
      {...tilt}
      className="relative m-0 flex h-full flex-col border border-rule bg-[#16100b] p-[clamp(20px,2.4vw,36px)]"
    >
      <span className="absolute inset-x-0 top-0 h-[3px] bg-livery" aria-hidden="true" />
      <Header t={t} big={big} />
      <Meta t={t} />
      <blockquote className="m-0 mt-4">
        <Quote
          text={t.text}
          onClamp={setClamped}
          className={`${big ? 'text-[clamp(20px,2.2vw,32px)] leading-[1.32]' : 'text-[16px] leading-[1.55] text-white/80'} ${clamped ? '[mask-image:linear-gradient(#000_65%,transparent)]' : ''}`}
        />
      </blockquote>
      {clamped && (
        <button onClick={() => onOpen(t)} className="mono mt-auto self-start pt-5 text-[11px] uppercase tracking-[0.14em] text-livery hover:underline">
          {teamRadio.more} →
        </button>
      )}
    </motion.figure>
  );
}

/** Native scroll-snap row: swipe on touch, arrows when focused, drag with a mouse, plus visible buttons. */
function Carousel({ items, onOpen }: { items: Testimonial[]; onOpen: (t: Testimonial) => void }) {
  const list = useRef<HTMLUListElement>(null);
  const drag = useRef<{ x: number; left: number; moved: boolean; id: number } | null>(null);
  const [pos, setPos] = useState({ i: 0, start: true, end: items.length < 2 });
  const reduce = useReducedMotion();

  const update = useCallback(() => {
    const el = list.current!;
    const w = (el.firstElementChild as HTMLElement | null)?.offsetWidth ?? 1;
    setPos({ i: Math.round(el.scrollLeft / w), start: el.scrollLeft < 4, end: el.scrollLeft + el.clientWidth >= el.scrollWidth - 4 });
  }, []);
  useEffect(update, [update]);

  const step = (dir: 1 | -1) => {
    const el = list.current!;
    const card = el.firstElementChild as HTMLElement;
    el.scrollBy({ left: dir * (card.offsetWidth + 20), behavior: reduce ? 'auto' : 'smooth' });
  };

  const onDown = (e: PointerEvent<HTMLUListElement>) => {
    if (e.pointerType !== 'mouse' || e.button !== 0) return;
    drag.current = { x: e.clientX, left: list.current!.scrollLeft, moved: false, id: e.pointerId };
  };
  const onMove = (e: PointerEvent<HTMLUListElement>) => {
    const d = drag.current;
    if (!d) return;
    const dx = e.clientX - d.x;
    if (!d.moved && Math.abs(dx) > 6) {
      // capture only once it is a real drag, so plain clicks still reach buttons and links
      d.moved = true;
      list.current!.setPointerCapture(d.id);
      list.current!.style.scrollSnapType = 'none';
    }
    if (d.moved) list.current!.scrollLeft = d.left - dx;
  };
  const onUp = () => {
    if (drag.current?.moved) {
      const el = list.current!;
      el.style.scrollSnapType = '';
      const w = (el.firstElementChild as HTMLElement).offsetWidth + 20;
      el.scrollTo({ left: Math.round(el.scrollLeft / w) * w, behavior: reduce ? 'auto' : 'smooth' });
      // swallow the click that ends a drag
      el.addEventListener('click', ev => ev.stopPropagation(), { capture: true, once: true });
    }
    drag.current = null;
  };

  const btn = 'grid size-11 place-items-center border border-white/20 text-[18px] transition-colors hover:border-livery hover:text-livery disabled:pointer-events-none disabled:opacity-30';
  return (
    <div className="mt-[clamp(40px,6vw,72px)]">
      <div className="flex items-end justify-between gap-4 px-[var(--bar-l)]">
        <h3 className="eyebrow m-0">{teamRadio.othersTitle}</h3>
        <div className="flex items-center gap-3">
          <span className="mono text-[12px] text-mute" aria-hidden="true">
            {String(Math.min(pos.i + 1, items.length)).padStart(2, '0')} / {String(items.length).padStart(2, '0')}
          </span>
          <button className={btn} onClick={() => step(-1)} disabled={pos.start} aria-label={teamRadio.prev}>←</button>
          <button className={btn} onClick={() => step(1)} disabled={pos.end} aria-label={teamRadio.next}>→</button>
        </div>
      </div>
      <ul
        ref={list}
        tabIndex={0}
        aria-label={teamRadio.othersTitle}
        onScroll={update}
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={onUp}
        onPointerCancel={onUp}
        className="m-0 mt-5 flex list-none snap-x snap-mandatory gap-5 overflow-x-auto scroll-px-[var(--bar-l)] px-[var(--bar-l)] pb-4 pt-2 [scrollbar-width:none] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-livery [&::-webkit-scrollbar]:hidden"
      >
        {items.map(t => (
          <li key={t.id} className="w-[min(86vw,420px)] shrink-0 snap-start select-none">
            <Transmission t={t} onOpen={onOpen} />
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function TeamRadio() {
  const [open, setOpen] = useState<Testimonial | null>(null);
  const close = useCallback(() => setOpen(null), []);
  const featured = ITEMS.find(t => t.featured) ?? ITEMS[0];
  const rest = ITEMS.filter(t => t !== featured);
  return (
    <section id="radio" aria-labelledby="radio-title" className="relative isolate pb-[clamp(80px,10vw,140px)]">
      <div className="hairgrid" />
      <SectionHead id="radio-title" index="06 / Radio" title={teamRadio.title} labels={['Pit wall', 'Transmissions', 'Copy that']} />

      <Brake className="mt-12 px-[var(--bar-l)] lg:max-w-[1100px]">
        <Transmission t={featured} big onOpen={setOpen} />
      </Brake>

      {rest.length > 0 && <Carousel items={rest} onOpen={setOpen} />}

      {open && (
        <Modal label={`${teamRadio.more}: ${open.name}`} onClose={close} sheet>
          <figure className="m-0 p-[clamp(20px,4vw,40px)] pt-14">
            <Header t={open} big />
            <Meta t={open} />
            <blockquote className="m-0 mt-5 whitespace-pre-line text-[clamp(17px,1.6vw,20px)] leading-[1.6]">{open.text}</blockquote>
          </figure>
        </Modal>
      )}
      <div className="mt-[clamp(64px,8vw,120px)]"><Kerb /></div>
    </section>
  );
}
