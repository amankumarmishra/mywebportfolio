import { useEffect, useRef, useState } from 'react';
import { preloader } from '../content';
import { gsap, reducedMotion } from '../lib/scroll';

const LIGHTS = 5;
const STEP = 520; // ms between lights, roughly the real start sequence cadence
const HOLD = 700; // all five lit before lights out
const TOTAL = STEP * LIGHTS + HOLD;

const fmt = (ms: number) => {
  const m = Math.floor(ms / 60000);
  const s = Math.floor((ms % 60000) / 1000);
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}.${String(Math.floor(ms % 1000)).padStart(3, '0')}`;
};

export default function Preloader({ onReveal, onDone }: { onReveal: () => void; onDone: () => void }) {
  const root = useRef<HTMLDivElement>(null);
  const [lit, setLit] = useState(0);
  const [out, setOut] = useState(false);
  const timer = useRef<HTMLSpanElement>(null);
  const pct = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const quick = reducedMotion();
    const total = quick ? 400 : TOTAL;
    const start = performance.now();
    let raf = 0;
    let finished = false;

    const finish = () => {
      if (finished) return;
      finished = true;
      setOut(true);
      onReveal(); // mount what sits underneath before the curtain lifts
      if (quick) {
        gsap.to(root.current, { opacity: 0, duration: 0.3, onComplete: onDone });
        return;
      }
      // Lights out: hold a beat dark, then launch the curtain upward.
      gsap.timeline({ delay: 0.25, onComplete: onDone })
        .to('.pl-ui', { opacity: 0, y: -12, duration: 0.3, ease: 'power2.in' })
        .to(root.current, { clipPath: 'inset(0 0 100% 0)', duration: 0.9, ease: 'expo.inOut' }, '<0.1');
    };

    const tick = (now: number) => {
      const t = Math.min(now - start, total);
      if (timer.current) timer.current.textContent = fmt(t);
      if (pct.current) pct.current.textContent = String(Math.round((t / total) * 100)).padStart(3, '0');
      setLit(quick ? LIGHTS : Math.min(LIGHTS, Math.floor(t / STEP) + (t > 0 ? 1 : 0)));
      if (t >= total) finish();
      else raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [onDone, onReveal]);

  return (
    <div
      ref={root}
      role="status"
      aria-live="polite"
      aria-label="Loading: formation lap"
      className="fixed inset-0 z-[100] isolate overflow-hidden"
      style={{ background: 'linear-gradient(180deg,#0d0905,#130e09)', clipPath: 'inset(0 0 0% 0)' }}
    >
      <div className="hairgrid" />
      <div className="pl-ui absolute inset-x-0 top-0 flex justify-between px-[max(16px,calc(20.65*var(--u)))] pt-[max(12px,calc(12.8*var(--u)))]">
        <p className="small m-0">{preloader.title}<br /><span className="text-mute">Lap 0 / Grid</span></p>
        <p className="small m-0 text-right mono">
          <span ref={pct}>000</span>%
        </p>
      </div>

      <div className="absolute inset-0 grid place-items-center">
        <div className="flex flex-col items-center gap-8">
          <div className="flex gap-[clamp(8px,1.6vw,20px)]" aria-hidden="true">
            {Array.from({ length: LIGHTS }, (_, i) => {
              const on = !out && i < lit;
              return (
                <div key={i} className="flex flex-col gap-[clamp(4px,0.6vw,8px)] rounded-[6px] bg-[#0a0a0a] p-[clamp(5px,0.7vw,9px)] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.07)]">
                  {[0, 1].map(r => (
                    <span
                      key={r}
                      className="relative block size-[clamp(22px,4.2vw,52px)] rounded-full transition-[background-color,box-shadow] duration-100"
                      style={{
                        background: on ? '#ff1a0d' : '#1d1612',
                        boxShadow: on ? '0 0 24px 4px rgba(255,26,13,.55), inset 0 0 8px rgba(255,255,255,.35)' : 'inset 0 2px 6px rgba(0,0,0,.8)',
                      }}
                    >
                      {/* the silent "beep": a ring pulses outward as each light comes on */}
                      {on && r === 1 && i === lit - 1 && (
                        <span className="absolute inset-0 rounded-full border-2 border-[#ff1a0d] animate-[beep_.5s_ease-out_forwards]" />
                      )}
                    </span>
                  ))}
                </div>
              );
            })}
          </div>
          <p className="pl-ui mono m-0 text-[clamp(28px,6vw,64px)] font-semibold tabular-nums tracking-tight">
            <span ref={timer}>00:00.000</span>
          </p>
        </div>
      </div>

      <div className="pl-ui absolute inset-x-0 bottom-0 px-[max(16px,calc(20.65*var(--u)))] pb-[max(14px,calc(16*var(--u)))]">
        <div className="rule-line mb-3" />
        <p className="eyebrow m-0 flex justify-between"><span>{out ? 'Lights out' : 'Hold position'}</span><span>Aman Kumar Mishra</span></p>
      </div>
      <style>{`@keyframes beep{from{transform:scale(1);opacity:.9}to{transform:scale(1.9);opacity:0}}`}</style>
    </div>
  );
}
