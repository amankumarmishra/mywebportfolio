import { useEffect, useRef, useState } from 'react';
import { game } from '../content';
import { useTeam } from '../lib/team';
import Modal from './Modal';

const W = 400, H = 600;
const ROAD_L = 40, ROAD_R = 360;
const CAR_W = 34, CAR_H = 62;
const PLAYER_Y = H - CAR_H - 28;
const LAP = 9000; // px of track per lap
const BEST_KEY = 'f1gp-bestlap';

type Phase = 'ready' | 'racing' | 'crashed';
type Rival = { x: number; y: number; v: number; c: string };
type Sector = 'pb' | 'improved' | 'sector' | null;

const fmt = (ms: number) => {
  const s = ms / 1000;
  return `${Math.floor(s / 60)}:${(s % 60).toFixed(3).padStart(6, '0')}`;
};
const readBest = () => {
  try { return Number(localStorage.getItem(BEST_KEY)) || 0; } catch { return 0; }
};

function drawCar(ctx: CanvasRenderingContext2D, x: number, y: number, body: string, accent: string, tilt = 0) {
  ctx.save();
  ctx.translate(x, y + CAR_H / 2);
  ctx.rotate(tilt);
  ctx.translate(0, -CAR_H / 2);
  ctx.fillStyle = '#0b0b0b';
  for (const [wx, wy] of [[-CAR_W / 2 - 3, 8], [CAR_W / 2 - 5, 8], [-CAR_W / 2 - 3, CAR_H - 22], [CAR_W / 2 - 5, CAR_H - 22]]) ctx.fillRect(wx, wy, 8, 15);
  ctx.fillStyle = accent;
  ctx.fillRect(-CAR_W / 2 - 2, 0, CAR_W + 4, 5); // front wing
  ctx.fillRect(-CAR_W / 2 + 2, CAR_H - 6, CAR_W - 4, 6); // rear wing
  ctx.fillStyle = body;
  ctx.beginPath();
  ctx.moveTo(-4, 3);
  ctx.lineTo(4, 3);
  ctx.lineTo(9, 22);
  ctx.lineTo(13, 34);
  ctx.lineTo(11, CAR_H - 8);
  ctx.lineTo(-11, CAR_H - 8);
  ctx.lineTo(-13, 34);
  ctx.lineTo(-9, 22);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = 'rgba(0,0,0,.6)';
  ctx.beginPath();
  ctx.ellipse(0, 30, 4.5, 7, 0, 0, Math.PI * 2); // cockpit
  ctx.fill();
  ctx.strokeStyle = '#d4d4d4';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.arc(0, 30, 7, Math.PI * 1.1, Math.PI * 1.9); // halo
  ctx.stroke();
  ctx.restore();
}

export default function MiniGP({ onClose }: { onClose: () => void }) {
  const team = useTeam();
  const canvas = useRef<HTMLCanvasElement>(null);
  const input = useRef({ left: false, right: false });
  const [phase, setPhase] = useState<Phase>('ready');
  const [hud, setHud] = useState({ lap: 1, time: 0, last: 0, best: readBest(), sector: null as Sector, kmh: 0 });
  const startRef = useRef<() => void>(() => {});

  useEffect(() => {
    const cv = canvas.current!;
    const ctx = cv.getContext('2d')!;
    const dpr = Math.min(devicePixelRatio || 1, 2);
    cv.width = W * dpr;
    cv.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    let state: Phase = 'ready';
    let px = W / 2, vx = 0, speed = 0, dist = 0, scroll = 0;
    let lapStart = 0, lastLap = 0, best = readBest(), lap = 1;
    let rivals: Rival[] = [];
    let spawnIn = 1;
    let raf = 0, prev = performance.now(), hudTick = 0, now = 0;
    let flash: Sector = null;

    const reset = () => {
      px = W / 2; vx = 0; speed = 260; dist = 0; rivals = []; spawnIn = 0.8;
      lap = 1; lapStart = now; lastLap = 0; flash = null;
      state = 'racing';
      setPhase('racing');
    };
    startRef.current = reset;

    const crash = () => {
      state = 'crashed';
      setPhase('crashed');
    };

    const step = (dt: number) => {
      // steering with acceleration + grip so the car glides instead of snapping
      const steer = (input.current.right ? 1 : 0) - (input.current.left ? 1 : 0);
      vx += steer * 2600 * dt;
      vx *= Math.pow(0.0009, dt); // lateral grip
      px = Math.max(ROAD_L + CAR_W / 2 + 4, Math.min(ROAD_R - CAR_W / 2 - 4, px + vx * dt));
      if (px <= ROAD_L + CAR_W / 2 + 4 || px >= ROAD_R - CAR_W / 2 - 4) vx *= -0.3;

      speed = Math.min(820, speed + 9 * dt);
      dist += speed * dt;
      scroll = (scroll + speed * dt) % 80;

      spawnIn -= dt;
      if (spawnIn <= 0) {
        const colors = ['#2b2b2b', '#5b5b5b', '#8a8a8a', '#3d3d3d'];
        rivals.push({ x: ROAD_L + 30 + Math.random() * (ROAD_R - ROAD_L - 60), y: -CAR_H, v: speed * (0.35 + Math.random() * 0.25), c: colors[(Math.random() * colors.length) | 0] });
        spawnIn = Math.max(0.38, 1.25 - speed / 1000) * (0.7 + Math.random() * 0.6);
      }
      for (const r of rivals) r.y += (speed - r.v) * dt;
      rivals = rivals.filter(r => r.y < H + CAR_H);
      for (const r of rivals) {
        if (Math.abs(r.x - px) < CAR_W - 6 && Math.abs(r.y - PLAYER_Y) < CAR_H - 10) return crash();
      }

      if (dist >= lap * LAP) {
        const t = now - lapStart;
        flash = !best || t < best ? 'pb' : lastLap && t < lastLap ? 'improved' : 'sector';
        if (!best || t < best) {
          best = t;
          try { localStorage.setItem(BEST_KEY, String(Math.round(t))); } catch { /* ignore */ }
        }
        lastLap = t;
        lapStart = now;
        lap++;
      }
    };

    const render = () => {
      ctx.fillStyle = '#0f0b07';
      ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = '#1d1a17';
      ctx.fillRect(ROAD_L, 0, ROAD_R - ROAD_L, H);
      // kerbs
      for (let y = -80 + scroll; y < H; y += 80) {
        ctx.fillStyle = team.livery;
        ctx.fillRect(ROAD_L - 12, y, 12, 40);
        ctx.fillRect(ROAD_R, y, 12, 40);
        ctx.fillStyle = '#eee';
        ctx.fillRect(ROAD_L - 12, y + 40, 12, 40);
        ctx.fillRect(ROAD_R, y + 40, 12, 40);
      }
      // lane marks + speed streaks
      ctx.fillStyle = 'rgba(255,255,255,.12)';
      for (let y = -80 + scroll; y < H; y += 80) {
        ctx.fillRect(ROAD_L + (ROAD_R - ROAD_L) / 3, y, 3, 34);
        ctx.fillRect(ROAD_L + ((ROAD_R - ROAD_L) * 2) / 3, y, 3, 34);
      }
      // start/finish line approaches as the lap ends
      const toLine = lap * LAP - dist;
      if (state === 'racing' && toLine < PLAYER_Y + 40) {
        const ly = PLAYER_Y - toLine;
        for (let i = 0; i < 16; i++) for (let j = 0; j < 2; j++) {
          ctx.fillStyle = (i + j) % 2 ? '#fff' : '#111';
          ctx.fillRect(ROAD_L + i * 20, ly + j * 10, 20, 10);
        }
      }
      for (const r of rivals) drawCar(ctx, r.x, r.y, r.c, '#777');
      drawCar(ctx, px, PLAYER_Y, team.livery, team.secondary, vx / 3000);
      if (state === 'crashed') {
        ctx.fillStyle = 'rgba(0,0,0,.45)';
        ctx.fillRect(0, 0, W, H);
      }
    };

    const loop = (t: number) => {
      const dt = Math.min(0.05, (t - prev) / 1000);
      prev = t;
      now = t;
      if (state === 'racing') step(dt);
      render();
      hudTick += dt;
      if (hudTick > 0.05) {
        hudTick = 0;
        setHud({ lap, time: state === 'racing' ? t - lapStart : 0, last: lastLap, best, sector: flash, kmh: Math.round(speed * 0.42) });
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    const key = (down: boolean) => (e: KeyboardEvent) => {
      if (['ArrowLeft', 'KeyA'].includes(e.code)) (input.current.left = down, e.preventDefault());
      if (['ArrowRight', 'KeyD'].includes(e.code)) (input.current.right = down, e.preventDefault());
      if (down && (e.code === 'Space' || e.code === 'Enter') && state !== 'racing' && e.target === document.body) (e.preventDefault(), reset());
    };
    const kd = key(true), ku = key(false);
    window.addEventListener('keydown', kd);
    window.addEventListener('keyup', ku);
    return () => (cancelAnimationFrame(raf), window.removeEventListener('keydown', kd), window.removeEventListener('keyup', ku));
  }, [team.livery, team.secondary]);

  // hold either half of the canvas to steer
  const touch = (e: React.PointerEvent<HTMLCanvasElement>, down: boolean) => {
    if (e.pointerType === 'mouse') return;
    const r = e.currentTarget.getBoundingClientRect();
    const left = e.clientX - r.left < r.width / 2;
    input.current.left = down && left;
    input.current.right = down && !left;
  };
  const hold = (dir: 'left' | 'right') => ({
    onPointerDown: (e: React.PointerEvent) => (e.preventDefault(), (input.current[dir] = true)),
    onPointerUp: () => (input.current[dir] = false),
    onPointerLeave: () => (input.current[dir] = false),
    onPointerCancel: () => (input.current[dir] = false),
  });

  const sectorColor = hud.sector ? `var(--${hud.sector})` : 'var(--mute)';

  return (
    <Modal label={game.title} onClose={onClose} wide>
      <div className="p-4 pt-12 sm:p-6 sm:pt-12">
        <div className="mono grid grid-cols-4 gap-2 text-[11px] uppercase tracking-[0.08em]" aria-live="off">
          <div><span className="block text-mute">Lap</span><span className="text-[16px]">{String(hud.lap).padStart(2, '0')}</span></div>
          <div><span className="block text-mute">Time</span><span className="text-[16px] tabular-nums">{fmt(hud.time)}</span></div>
          <div><span className="block text-mute">Last</span><span className="text-[16px] tabular-nums" style={{ color: sectorColor }}>{hud.last ? fmt(hud.last) : '—'}</span></div>
          <div><span className="block text-mute">Best</span><span className="text-[16px] tabular-nums text-pb">{hud.best ? fmt(hud.best) : '—'}</span></div>
        </div>
        <div className="relative mx-auto mt-3 w-full max-w-[400px]">
          <canvas
            ref={canvas}
            className="block aspect-[2/3] w-full touch-none bg-black"
            onPointerDown={e => touch(e, true)}
            onPointerMove={e => e.buttons && touch(e, true)}
            onPointerUp={e => touch(e, false)}
            onPointerCancel={e => touch(e, false)}
            aria-label={`${game.title}: steer your ${'car'} with arrow keys or A and D`}
            role="img"
          />
          <span className="mono absolute right-2 top-2 text-[11px] text-white/70">{hud.kmh} km/h</span>
          {phase !== 'racing' && (
            <div className="absolute inset-0 grid place-items-center bg-black/55 p-6 text-center">
              <div>
                <p className="display m-0 text-[44px]">{phase === 'crashed' ? game.crash : game.title}</p>
                <p className="m-0 mt-2 text-[14px] text-white/75">{phase === 'crashed' ? `Laps completed: ${hud.lap - 1}` : game.intro}</p>
                <p className="mono m-0 mt-2 text-[11px] text-mute">{game.controls}</p>
                <button data-autofocus onClick={() => startRef.current()} className="small mt-5 bg-livery px-4 py-2 uppercase text-on-livery">
                  {phase === 'crashed' ? game.restart : game.start}
                </button>
              </div>
            </div>
          )}
        </div>
        <div className="mt-3 grid grid-cols-2 gap-3 sm:hidden">
          <button aria-label="Steer left" className="h-14 border border-white/20 text-2xl" {...hold('left')}>←</button>
          <button aria-label="Steer right" className="h-14 border border-white/20 text-2xl" {...hold('right')}>→</button>
        </div>
      </div>
    </Modal>
  );
}
