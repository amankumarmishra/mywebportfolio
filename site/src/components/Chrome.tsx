// Global "car chrome": custom cursor with tyre trail, lap-progress track map, footer.
import { useEffect, useRef } from 'react';
import { footer } from '../content';
import { coarsePointer, lenis, reducedMotion, scrollToHash } from '../lib/scroll';
import { Kerb } from './ui';

export const TRACK_PATH =
  'M60 210 C60 120 140 70 240 80 L520 96 C600 100 640 60 700 40 C780 14 900 30 940 100 C980 170 900 220 820 214 L640 200 C580 196 560 240 600 270 L760 330 C820 352 800 410 730 410 L200 400 C110 398 60 320 60 210 Z';

export function Cursor() {
  const dot = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (coarsePointer() || reducedMotion()) return;
    document.documentElement.classList.add('has-cursor');
    const c = canvas.current!;
    const ctx = c.getContext('2d')!;
    const trail: { x: number; y: number; t: number }[] = [];
    let raf = 0;
    let x = -100, y = -100;
    let color = '#ff1801';

    const size = () => {
      c.width = innerWidth * devicePixelRatio;
      c.height = innerHeight * devicePixelRatio;
      ctx.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);
    };
    size();

    const frame = () => {
      raf = 0;
      const now = performance.now();
      while (trail.length && now - trail[0].t > 260) trail.shift();
      ctx.clearRect(0, 0, innerWidth, innerHeight);
      // two parallel strokes = a pair of tyre marks, fading with age
      for (const off of [-3, 3]) {
        for (let i = 1; i < trail.length; i++) {
          const a = trail[i - 1], b = trail[i];
          const dx = b.x - a.x, dy = b.y - a.y, len = Math.hypot(dx, dy) || 1;
          const nx = (-dy / len) * off, ny = (dx / len) * off;
          ctx.globalAlpha = (1 - (now - b.t) / 260) * 0.55;
          ctx.strokeStyle = color;
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(a.x + nx, a.y + ny);
          ctx.lineTo(b.x + nx, b.y + ny);
          ctx.stroke();
        }
      }
      if (dot.current) dot.current.style.transform = `translate3d(${x}px, ${y}px, 0)`;
      if (trail.length) raf = requestAnimationFrame(frame);
    };

    const move = (e: PointerEvent) => {
      x = e.clientX;
      y = e.clientY;
      trail.push({ x, y, t: performance.now() });
      color = getComputedStyle(document.documentElement).getPropertyValue('--livery').trim() || color;
      const hot = (e.target as Element).closest('a,button,[role=button]');
      dot.current?.classList.toggle('is-hot', !!hot);
      if (!raf) raf = requestAnimationFrame(frame);
    };
    window.addEventListener('pointermove', move, { passive: true });
    window.addEventListener('resize', size);
    return () => {
      document.documentElement.classList.remove('has-cursor');
      window.removeEventListener('pointermove', move);
      window.removeEventListener('resize', size);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <>
      <canvas ref={canvas} className="pointer-events-none fixed inset-0 z-[150] h-full w-full" aria-hidden="true" />
      <div ref={dot} className="cursor-dot pointer-events-none fixed left-0 top-0 z-[151] hidden [@media(hover:hover)_and_(pointer:fine)]:block" aria-hidden="true">
        <span className="block size-[10px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-livery mix-blend-normal transition-transform duration-200 ease-[var(--e-brake)] [.is-hot_&]:scale-[2.6] [.is-hot_&]:bg-white [.is-hot_&]:mix-blend-difference" />
      </div>
    </>
  );
}

export function LapProgress() {
  const path = useRef<SVGPathElement>(null);
  const car = useRef<SVGCircleElement>(null);
  const lap = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const p = path.current!;
    const len = p.getTotalLength();
    p.style.strokeDasharray = `${len}`;
    let raf = 0;
    const update = () => {
      raf = 0;
      const max = document.documentElement.scrollHeight - innerHeight;
      const prog = max > 0 ? Math.min(1, Math.max(0, scrollY / max)) : 0;
      p.style.strokeDashoffset = `${len * (1 - prog)}`;
      const pt = p.getPointAtLength(len * prog);
      car.current?.setAttribute('cx', String(pt.x));
      car.current?.setAttribute('cy', String(pt.y));
      if (lap.current) lap.current.textContent = `S${Math.min(3, 1 + Math.floor(prog * 3))} · ${String(Math.round(prog * 100)).padStart(3, '0')}%`;
    };
    const onScroll = () => !raf && (raf = requestAnimationFrame(update));
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => (window.removeEventListener('scroll', onScroll), window.removeEventListener('resize', onScroll), cancelAnimationFrame(raf));
  }, []);

  return (
    <div
      className="pointer-events-none fixed bottom-[max(12px,env(safe-area-inset-bottom))] left-[var(--bar-l)] z-[55] flex items-end gap-2 mix-blend-difference"
      aria-hidden="true"
    >
      <svg viewBox="0 0 1000 440" className="w-[72px] sm:w-[96px]" fill="none" aria-hidden="true">
        <path d={TRACK_PATH} stroke="rgba(255,255,255,.25)" strokeWidth="26" strokeLinejoin="round" />
        <path ref={path} d={TRACK_PATH} stroke="#fff" strokeWidth="26" strokeLinejoin="round" />
        <circle ref={car} r="42" fill="#fff" />
      </svg>
      <span ref={lap} className="mono text-[10px] text-white">S1 · 000%</span>
    </div>
  );
}

export function Footer() {
  return (
    <footer className="relative">
      <Kerb />
      <div className="flex flex-col items-start justify-between gap-6 px-[var(--bar-l)] pb-[calc(72px+env(safe-area-inset-bottom))] pt-10 sm:flex-row sm:items-end">
        <p className="display m-0 text-[clamp(40px,8vw,120px)]">Driven by<br /><span className="text-livery">Passion</span></p>
        <div className="flex flex-col items-start gap-3 sm:items-end">
          <button
            onClick={() => (lenis ? lenis.scrollTo(0, { duration: 1.6 }) : scrollToHash('#home'))}
            className="small bg-menu px-2 py-1 text-menu-ink"
          >
            Back to grid ↑
          </button>
          <p className="small m-0 text-mute">{footer.text}</p>
        </div>
      </div>
    </footer>
  );
}
