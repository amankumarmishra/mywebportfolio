import { useEffect, useRef } from 'react';
import { coarsePointer, reducedMotion } from '../lib/scroll';

/** Waving chequered flag on a 2D canvas: each square is a quad displaced by travelling sine waves. */
export default function Flag({ className = '' }: { className?: string }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current!;
    const ctx = canvas.getContext('2d')!;
    const light = coarsePointer();
    const COLS = light ? 12 : 20;
    const ROWS = light ? 8 : 12;
    let w = 0, h = 0, raf = 0, visible = false, last = 0;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, light ? 1 : 1.5);
      w = canvas.clientWidth;
      h = canvas.clientHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const point = (c: number, r: number, t: number) => {
      const u = c / COLS, v = r / ROWS;
      // amplitude grows away from the pole (left edge)
      const amp = u * 0.06 * h;
      const wave = Math.sin(u * 7 - t * 2.6 + v * 1.6) + 0.4 * Math.sin(u * 13 - t * 3.7);
      return [u * w * 0.98 + wave * amp * 0.25, v * h * 0.9 + h * 0.05 + wave * amp, wave] as const;
    };

    const draw = (t: number) => {
      ctx.clearRect(0, 0, w, h);
      for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
          const a = point(c, r, t), b = point(c + 1, r, t), d = point(c + 1, r + 1, t), e = point(c, r + 1, t);
          // shade by the local slope of the wave so folds read as light and shadow
          const shade = 0.72 + 0.28 * Math.max(-1, Math.min(1, b[2] - a[2]));
          const base = (r + c) % 2 ? 235 : 22;
          const v = Math.round(base * shade);
          ctx.fillStyle = `rgb(${v},${v},${v})`;
          ctx.beginPath();
          ctx.moveTo(a[0], a[1]);
          ctx.lineTo(b[0], b[1]);
          ctx.lineTo(d[0], d[1]);
          ctx.lineTo(e[0], e[1]);
          ctx.closePath();
          ctx.fill();
        }
      }
    };

    const loop = (now: number) => {
      raf = 0;
      if (!visible) return;
      // 30fps on touch devices is plenty for cloth
      if (!light || now - last > 33) {
        last = now;
        draw(now / 1000);
      }
      raf = requestAnimationFrame(loop);
    };

    resize();
    draw(0);
    const ro = new ResizeObserver(() => (resize(), draw(performance.now() / 1000)));
    ro.observe(canvas);
    const io = new IntersectionObserver(([en]) => {
      visible = en.isIntersecting && !reducedMotion();
      if (visible && !raf) raf = requestAnimationFrame(loop);
    });
    io.observe(canvas);
    return () => (cancelAnimationFrame(raf), ro.disconnect(), io.disconnect());
  }, []);

  return <canvas ref={ref} className={className} aria-hidden="true" />;
}
