import { useRef, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import styles from './CursorShowcase.module.scss';
import cursorStyles from './CursorEffect.module.scss';

const CURSOR_NAMES = [
  'Comet Trail', 'Gravitational Pull', 'Starfield Wake',
  'Magnetic Dot', 'Orbit Cursor', 'Spotlight',
  'Crosshair', 'Blob Morph', 'Dot + Ring',
];

export default function CursorShowcase() {
  const { id } = useParams();
  const active = Math.max(0, Math.min(parseInt(id || '1', 10) - 1, 8));
  const canvasRef = useRef(null);
  const mouseRef = useRef({ x: 0, y: 0, px: 0, py: 0 });
  const stateRef = useRef({});
  const activeRef = useRef(active);
  activeRef.current = active;

  useEffect(() => { stateRef.current = {}; }, [active]);

  useEffect(() => {
    const el = document.querySelector(`.${cursorStyles.cursorContainer}`);
    if (el) el.style.display = 'none';
    document.body.style.cursor = 'default';
    return () => {
      if (el) el.style.display = '';
      document.body.style.cursor = '';
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let cancelled = false;
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const onResize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
    const onMove = (e) => {
      const m = mouseRef.current;
      m.px = m.x; m.py = m.y;
      m.x = e.clientX; m.y = e.clientY;
    };

    window.addEventListener('mousemove', onMove);
    window.addEventListener('resize', onResize);

    const loop = () => {
      if (cancelled) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      DRAW_FNS[activeRef.current]?.(ctx, mouseRef.current, stateRef.current);
      requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);

    return () => {
      cancelled = true;
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('resize', onResize);
    };
  }, []);

  return (
    <div className={styles.page}>
      <canvas ref={canvasRef} className={styles.canvas} />
      <div className={styles.label}>
        <span className={styles.number}>{active + 1}/{CURSOR_NAMES.length}</span>
        <span className={styles.name}>{CURSOR_NAMES[active]}</span>
      </div>
    </div>
  );
}

// ── Draw functions ──────────────────────────────────────────────────────────

function drawComet(ctx, m, s) {
  if (!s.p) s.p = [];
  const dx = m.x - m.px, dy = m.y - m.py;
  const speed = Math.hypot(dx, dy);
  const count = Math.min(Math.floor(speed * 0.5) + 1, 6);
  for (let i = 0; i < count; i++) {
    s.p.push({ x: m.x, y: m.y, life: 1, sz: 1.5 + Math.random() * 4,
      vx: (Math.random() - 0.5) * 2 - dx * 0.1,
      vy: (Math.random() - 0.5) * 2 - dy * 0.1 });
  }
  if (s.p.length > 500) s.p = s.p.slice(-500);
  s.p = s.p.filter(p => p.life > 0);
  for (const p of s.p) {
    p.x += p.vx; p.y += p.vy; p.vx *= 0.98; p.vy *= 0.98; p.life -= 0.008;
    ctx.globalAlpha = p.life;
    ctx.beginPath(); ctx.arc(p.x, p.y, p.sz * p.life, 0, Math.PI * 2);
    ctx.fillStyle = '#4a9eff'; ctx.fill();
  }
  ctx.globalAlpha = 1;
  ctx.beginPath(); ctx.arc(m.x, m.y, 5, 0, Math.PI * 2);
  ctx.fillStyle = '#fff'; ctx.fill();
}

function drawGrav(ctx, m) {
  const vx = m.x - m.px, vy = m.y - m.py;
  const speed = Math.hypot(vx, vy);
  const sx = 1 + Math.min(speed * 0.04, 0.8);
  const ang = Math.atan2(vy, vx);
  ctx.save(); ctx.translate(m.x, m.y); ctx.rotate(ang);
  ctx.scale(sx, 1 / sx);
  ctx.beginPath(); ctx.arc(0, 0, 20, 0, Math.PI * 2);
  ctx.strokeStyle = 'rgba(255,255,255,0.5)'; ctx.lineWidth = 2; ctx.stroke();
  ctx.restore();
  ctx.beginPath(); ctx.arc(m.x, m.y, 4, 0, Math.PI * 2);
  ctx.fillStyle = '#fff'; ctx.fill();
}

function drawStars(ctx, m, s) {
  if (!s.p) s.p = [];
  const dx = m.x - m.px, dy = m.y - m.py;
  if (Math.hypot(dx, dy) > 3) {
    const a = Math.atan2(dy, dx);
    for (let i = 0; i < 3; i++) {
      const spread = (Math.random() - 0.5) * Math.PI * 0.8;
      s.p.push({ x: m.x, y: m.y,
        vx: Math.cos(a + Math.PI + spread) * (0.5 + Math.random() * 2),
        vy: Math.sin(a + Math.PI + spread) * (0.5 + Math.random() * 2),
        life: 1, sz: 1 + Math.random() * 2.5 });
    }
  }
  if (s.p.length > 500) s.p = s.p.slice(-500);
  s.p = s.p.filter(p => p.life > 0);
  for (const p of s.p) {
    p.x += p.vx; p.y += p.vy; p.life -= 0.008;
    ctx.globalAlpha = p.life;
    ctx.fillStyle = '#fff';
    ctx.beginPath(); ctx.arc(p.x, p.y, p.sz * p.life, 0, Math.PI * 2); ctx.fill();
  }
  ctx.globalAlpha = 1;
  ctx.beginPath(); ctx.arc(m.x, m.y, 4, 0, Math.PI * 2);
  ctx.fillStyle = '#fff'; ctx.fill();
}

function drawMagnetic(ctx, m, s) {
  if (!s.p) s.p = [];
  s.p.push({ x: m.x, y: m.y, life: 1 });
  if (s.p.length > 300) s.p = s.p.slice(-300);
  s.p = s.p.filter(t => t.life > 0);
  for (const t of s.p) {
    t.life -= 0.025;
    const r = 18 * t.life;
    const g = ctx.createRadialGradient(t.x, t.y, 0, t.x, t.y, r);
    g.addColorStop(0, `rgba(74,158,255,${t.life * 0.4})`);
    g.addColorStop(1, 'transparent');
    ctx.fillStyle = g;
    ctx.beginPath(); ctx.arc(t.x, t.y, r, 0, Math.PI * 2); ctx.fill();
  }
  ctx.beginPath(); ctx.arc(m.x, m.y, 7, 0, Math.PI * 2);
  ctx.fillStyle = '#fff'; ctx.fill();
}

function drawOrbit(ctx, m, s) {
  s.a = (s.a || 0) + 0.05;
  const R = 22;
  const ox = m.x + Math.cos(s.a) * R, oy = m.y + Math.sin(s.a) * R;
  ctx.beginPath(); ctx.arc(m.x, m.y, R, 0, Math.PI * 2);
  ctx.strokeStyle = 'rgba(255,255,255,0.12)'; ctx.lineWidth = 1; ctx.stroke();
  ctx.beginPath(); ctx.arc(m.x, m.y, 5, 0, Math.PI * 2);
  ctx.fillStyle = '#fff'; ctx.fill();
  ctx.beginPath(); ctx.arc(ox, oy, 4, 0, Math.PI * 2);
  ctx.fillStyle = '#4a9eff'; ctx.fill();
  const g = ctx.createRadialGradient(ox, oy, 0, ox, oy, 10);
  g.addColorStop(0, 'rgba(74,158,255,0.4)'); g.addColorStop(1, 'transparent');
  ctx.fillStyle = g; ctx.beginPath(); ctx.arc(ox, oy, 10, 0, Math.PI * 2); ctx.fill();
}

function drawSpotlight(ctx, m) {
  const g = ctx.createRadialGradient(m.x, m.y, 0, m.x, m.y, 150);
  g.addColorStop(0, 'rgba(255,255,255,0.1)');
  g.addColorStop(0.4, 'rgba(255,255,255,0.04)');
  g.addColorStop(1, 'transparent');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
}

function drawCrosshair(ctx, m, s) {
  s.a = (s.a || 0) + 0.01;
  ctx.save(); ctx.translate(m.x, m.y); ctx.rotate(s.a);
  ctx.strokeStyle = 'rgba(255,255,255,0.8)'; ctx.lineWidth = 1.5; ctx.lineCap = 'round';
  for (let i = 0; i < 4; i++) {
    const a = (i * Math.PI) / 2;
    ctx.beginPath();
    ctx.moveTo(Math.cos(a) * 6, Math.sin(a) * 6);
    ctx.lineTo(Math.cos(a) * 18, Math.sin(a) * 18);
    ctx.stroke();
  }
  ctx.restore();
  ctx.beginPath(); ctx.arc(m.x, m.y, 2, 0, Math.PI * 2);
  ctx.fillStyle = '#fff'; ctx.fill();
}

function drawBlob(ctx, m, s) {
  if (!s.sx) { s.sx = m.x; s.sy = m.y; }
  s.sx += (m.x - s.sx) * 0.12; s.sy += (m.y - s.sy) * 0.12;
  const vx = m.x - m.px, vy = m.y - m.py;
  const speed = Math.hypot(vx, vy);
  const stretch = Math.min(speed * 0.2, 10);
  const ang = Math.atan2(vy, vx);
  ctx.save(); ctx.translate(s.sx, s.sy); ctx.rotate(ang);
  ctx.beginPath(); ctx.ellipse(0, 0, 14 + stretch, 14 - stretch * 0.3, 0, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(255,255,255,0.15)'; ctx.fill();
  ctx.strokeStyle = 'rgba(255,255,255,0.5)'; ctx.lineWidth = 1.5; ctx.stroke();
  ctx.restore();
}

function drawDotRing(ctx, m, s) {
  if (!s.rx) { s.rx = m.x; s.ry = m.y; }
  s.rx += (m.x - s.rx) * 0.1; s.ry += (m.y - s.ry) * 0.1;
  ctx.beginPath(); ctx.arc(s.rx, s.ry, 14, 0, Math.PI * 2);
  ctx.strokeStyle = 'rgba(255,255,255,0.4)'; ctx.lineWidth = 1.5; ctx.stroke();
  ctx.beginPath(); ctx.arc(m.x, m.y, 3, 0, Math.PI * 2);
  ctx.fillStyle = '#fff'; ctx.fill();
}

const DRAW_FNS = [
  drawComet, drawGrav, drawStars, drawMagnetic, drawOrbit,
  drawSpotlight, drawCrosshair, drawBlob, drawDotRing,
];
