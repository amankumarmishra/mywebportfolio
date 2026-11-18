import { gsap, reducedMotion } from './scroll';

/** Sweeps a skewed livery-coloured panel across the screen; `onCover` runs while the screen is hidden. */
export function liveryWipe(color: string, secondary: string, onCover: () => void) {
  if (reducedMotion()) {
    onCover();
    return Promise.resolve();
  }
  const wrap = document.createElement('div');
  wrap.setAttribute('aria-hidden', 'true');
  wrap.style.cssText = 'position:fixed;inset:0;z-index:120;pointer-events:none;overflow:hidden';
  const bar = (bg: string, w: string) => {
    const el = document.createElement('div');
    el.style.cssText = `position:absolute;top:-10%;bottom:-10%;left:0;width:${w};background:${bg};transform:translateX(-110%) skewX(-14deg)`;
    wrap.appendChild(el);
    return el;
  };
  const accent = bar(secondary, '130vw');
  const main = bar(color, '130vw');
  document.body.appendChild(wrap);

  return new Promise<void>(resolve => {
    gsap.timeline({ onComplete: () => (wrap.remove(), resolve()) })
      .to([accent, main], { xPercent: 0, x: '-10vw', duration: 0.55, ease: 'power3.in', stagger: 0.06 })
      .call(onCover)
      .to([main, accent], { x: '120vw', duration: 0.6, ease: 'power3.out', stagger: 0.05 }, '+=0.05');
  });
}
