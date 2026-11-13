import { useEffect, useRef } from 'react';

// Playful background layer, drawn on one <canvas> behind the cards.
// - Ambient: sparkles, dots, rings, confetti strips, little planets and stars,
//   drifting slowly and gently twinkling, in the bank card colours.
//   Each one has a depth, so it shifts with the mouse (parallax).
// - Click: a burst of confetti from the click point, with gravity and fade.
// Respects prefers-reduced-motion (fewer, still particles, no bursts).

const COLORS = ['#1B4277', '#DB0011', '#056DAE', '#E31837', '#00AEEF', '#5A84B4', '#0018A8', '#C9A44E'];

type Kind = 'dot' | 'ring' | 'sparkle' | 'confetti' | 'planet' | 'star';

interface P {
  x: number; y: number; // position (px, CSS)
  vx: number; vy: number; // velocity (px per frame)
  size: number;
  rot: number; vr: number;
  depth: number; // 0.2 (far) … 1 (near): parallax amount and opacity
  kind: Kind;
  color: string;
  twinkle: number; // phase
  life?: number; // bursts only: frames left
  maxLife?: number;
}

const pick = <T,>(a: T[]) => a[Math.floor(Math.random() * a.length)];
const rand = (a: number, b: number) => a + Math.random() * (b - a);

function ambient(w: number, h: number): P {
  const kind = pick<Kind>(['dot', 'dot', 'ring', 'sparkle', 'sparkle', 'confetti', 'confetti', 'planet', 'star']);
  const depth = rand(0.25, 1);
  return {
    x: rand(0, w),
    y: rand(0, h),
    vx: rand(-0.12, 0.12) * depth,
    vy: rand(-0.28, -0.06) * depth, // drift upward, like the cards' flow
    size: (kind === 'planet' ? rand(7, 13) : kind === 'dot' ? rand(2, 4.5) : rand(5, 10)) * (0.6 + depth * 0.6),
    rot: rand(0, Math.PI * 2),
    vr: rand(-0.01, 0.01),
    depth,
    kind,
    color: pick(COLORS),
    twinkle: rand(0, Math.PI * 2),
  };
}

function burstPiece(x: number, y: number): P {
  const a = rand(0, Math.PI * 2);
  const speed = rand(2.5, 7.5);
  const life = Math.round(rand(60, 110));
  return {
    x, y,
    vx: Math.cos(a) * speed,
    vy: Math.sin(a) * speed - 2.5,
    size: rand(5, 9),
    rot: rand(0, Math.PI * 2),
    vr: rand(-0.25, 0.25),
    depth: 1,
    kind: pick<Kind>(['confetti', 'confetti', 'sparkle', 'dot', 'star']),
    color: pick(COLORS),
    twinkle: 0,
    life,
    maxLife: life,
  };
}

function starPath(ctx: CanvasRenderingContext2D, r: number, points: number, inner: number) {
  ctx.beginPath();
  for (let i = 0; i < points * 2; i++) {
    const rr = i % 2 ? r * inner : r;
    const a = (i * Math.PI) / points - Math.PI / 2;
    ctx.lineTo(Math.cos(a) * rr, Math.sin(a) * rr);
  }
  ctx.closePath();
}

function draw(ctx: CanvasRenderingContext2D, p: P, alpha: number) {
  ctx.globalAlpha = alpha;
  ctx.fillStyle = p.color;
  ctx.strokeStyle = p.color;
  const s = p.size;
  switch (p.kind) {
    case 'dot':
      ctx.beginPath();
      ctx.arc(0, 0, s, 0, Math.PI * 2);
      ctx.fill();
      break;
    case 'ring':
      ctx.lineWidth = Math.max(1.2, s * 0.22);
      ctx.beginPath();
      ctx.arc(0, 0, s, 0, Math.PI * 2);
      ctx.stroke();
      break;
    case 'sparkle': // four-point twinkle
      starPath(ctx, s, 4, 0.28);
      ctx.fill();
      break;
    case 'star':
      starPath(ctx, s, 5, 0.48);
      ctx.fill();
      break;
    case 'confetti':
      ctx.beginPath();
      ctx.roundRect(-s * 0.7, -s * 0.22, s * 1.4, s * 0.44, s * 0.2);
      ctx.fill();
      break;
    case 'planet': // ball with a tilted ring, like the astronaut card
      ctx.beginPath();
      ctx.arc(0, 0, s, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = alpha * 0.9;
      ctx.lineWidth = Math.max(1.2, s * 0.16);
      ctx.beginPath();
      ctx.ellipse(0, 0, s * 1.75, s * 0.48, -0.35, 0, Math.PI * 2);
      ctx.stroke();
      break;
  }
}

export default function Particles() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current!;
    const ctx = canvas.getContext('2d')!;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let w = 0, h = 0;
    let parts: P[] = [];
    const bursts: P[] = [];
    const mouse = { x: 0, y: 0, tx: 0, ty: 0 };

    const resize = () => {
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      // About a third of the earlier density (was area / 14000, max 110).
      const count = Math.round(Math.min(38, (w * h) / 40000) * (reduced ? 0.5 : 1));
      parts = Array.from({ length: count }, () => ambient(w, h));
    };

    const onMove = (e: PointerEvent) => {
      mouse.tx = (e.clientX / w - 0.5) * 2;
      mouse.ty = (e.clientY / h - 0.5) * 2;
    };
    const onDown = (e: PointerEvent) => {
      if (reduced) return;
      for (let i = 0; i < 22; i++) bursts.push(burstPiece(e.clientX, e.clientY));
    };

    let frame = 0;
    let t = 0;
    const tick = () => {
      t += 1;
      mouse.x += (mouse.tx - mouse.x) * 0.05;
      mouse.y += (mouse.ty - mouse.y) * 0.05;
      ctx.clearRect(0, 0, w, h);

      for (const p of parts) {
        if (!reduced) {
          p.x += p.vx + Math.sin((t + p.twinkle * 100) * 0.01) * 0.08;
          p.y += p.vy;
          p.rot += p.vr;
        }
        // wrap around the screen edges
        if (p.y < -30) { p.y = h + 30; p.x = rand(0, w); }
        if (p.x < -30) p.x = w + 30;
        if (p.x > w + 30) p.x = -30;

        const px = p.x - mouse.x * 28 * p.depth;
        const py = p.y - mouse.y * 20 * p.depth;
        const tw = p.kind === 'sparkle' || p.kind === 'star' ? 0.55 + 0.45 * Math.sin(t * 0.05 + p.twinkle) : 1;
        ctx.save();
        ctx.translate(px, py);
        ctx.rotate(p.rot);
        if (p.kind === 'sparkle') ctx.scale(0.75 + tw * 0.35, 0.75 + tw * 0.35);
        draw(ctx, p, (0.25 + p.depth * 0.55) * tw);
        ctx.restore();
      }

      for (let i = bursts.length - 1; i >= 0; i--) {
        const p = bursts[i];
        p.vy += 0.16; // gravity
        p.vx *= 0.985;
        p.vy *= 0.985;
        p.x += p.vx;
        p.y += p.vy;
        p.rot += p.vr;
        p.life! -= 1;
        if (p.life! <= 0) { bursts.splice(i, 1); continue; }
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        // confetti flips as it falls
        if (p.kind === 'confetti') ctx.scale(1, Math.cos(p.rot * 2));
        draw(ctx, p, Math.min(1, (p.life! / p.maxLife!) * 1.6));
        ctx.restore();
      }
      ctx.globalAlpha = 1;
      frame = requestAnimationFrame(tick);
    };

    resize();
    window.addEventListener('resize', resize);
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerdown', onDown);
    frame = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('resize', resize);
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerdown', onDown);
    };
  }, []);

  return <canvas ref={ref} className="absolute inset-0 pointer-events-none" aria-hidden="true" />;
}
