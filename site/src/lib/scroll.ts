import Lenis from 'lenis';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
export const coarsePointer = () => window.matchMedia('(pointer: coarse)').matches;

export let lenis: Lenis | null = null;
const velocityListeners = new Set<(v: number) => void>();

/** Scroll velocity in px/frame (Lenis) or estimated from native scroll. */
export const onVelocity = (fn: (v: number) => void) => {
  velocityListeners.add(fn);
  return () => velocityListeners.delete(fn);
};

export function initScroll() {
  if (reducedMotion()) {
    let last = window.scrollY;
    window.addEventListener('scroll', () => {
      const v = window.scrollY - last;
      last = window.scrollY;
      velocityListeners.forEach(l => l(v));
    }, { passive: true });
    return;
  }
  lenis = new Lenis({ lerp: 0.1, wheelMultiplier: 1 });
  // GSAP's ticker drives Lenis so pinned ScrollTrigger sections never lag a frame.
  lenis.on('scroll', (l: Lenis) => {
    ScrollTrigger.update();
    velocityListeners.forEach(fn => fn(l.velocity));
  });
  gsap.ticker.add(time => lenis?.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);
}

export function scrollToHash(hash: string) {
  const el = document.querySelector(hash) as HTMLElement | null;
  if (!el) return;
  if (lenis) lenis.scrollTo(el, { offset: 0, duration: 1.4 });
  else el.scrollIntoView({ behavior: reducedMotion() ? 'auto' : 'smooth' });
}

export const lockScroll = (locked: boolean) => {
  if (lenis) (locked ? lenis.stop() : lenis.start());
  document.documentElement.style.overflow = locked ? 'hidden' : '';
};

export { gsap, ScrollTrigger };
