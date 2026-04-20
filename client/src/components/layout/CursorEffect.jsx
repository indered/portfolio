import { useEffect, useState, useRef } from 'react';
import styles from './CursorEffect.module.scss';

function CursorEffect() {
  const [isMobile, setIsMobile] = useState(false);
  const canvasRef = useRef(null);
  const mouseRef = useRef({ x: 0, y: 0, px: 0, py: 0 });
  const particlesRef = useRef([]);

  useEffect(() => {
    const checkMobile = () => {
      const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
      setIsMobile(isTouchDevice || window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    if (isMobile) {
      document.body.style.cursor = '';
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;

    let cancelled = false;
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    document.body.style.cursor = 'default';

    const onResize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
    const onMove = (e) => {
      const m = mouseRef.current;
      m.px = m.x; m.py = m.y;
      m.x = e.clientX; m.y = e.clientY;
    };

    window.addEventListener('mousemove', onMove);
    window.addEventListener('resize', onResize);

    // Read persona color from CSS var and lighten it
    let trailColor = '#4a9eff';
    const getTrailColor = () => {
      const raw = getComputedStyle(document.documentElement).getPropertyValue('--cursor-color').trim();
      if (raw && raw.startsWith('#')) {
        // Lighten by mixing with white (~30%)
        const r = parseInt(raw.slice(1, 3), 16);
        const g = parseInt(raw.slice(3, 5), 16);
        const b = parseInt(raw.slice(5, 7), 16);
        const lr = Math.min(255, Math.floor(r + (255 - r) * 0.3));
        const lg = Math.min(255, Math.floor(g + (255 - g) * 0.3));
        const lb = Math.min(255, Math.floor(b + (255 - b) * 0.3));
        trailColor = `rgb(${lr},${lg},${lb})`;
      } else {
        trailColor = '#4a9eff';
      }
    };
    getTrailColor();
    // Re-read color periodically in case persona changes
    const colorInterval = setInterval(getTrailColor, 500);

    const loop = () => {
      if (cancelled) return;
      const m = mouseRef.current;
      const p = particlesRef.current;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Spawn particles only while moving
      const dx = m.x - m.px, dy = m.y - m.py;
      const speed = Math.hypot(dx, dy);
      // Reset previous to current so next frame reads zero if no mousemove fires
      m.px = m.x; m.py = m.y;

      if (speed > 2) {
        const count = Math.min(Math.floor(speed * 0.8), 10);
        for (let i = 0; i < count; i++) {
          p.push({
            x: m.x + (Math.random() - 0.5) * 6,
            y: m.y + (Math.random() - 0.5) * 6,
            life: 1,
            sz: 1 + Math.random() * 3,
            vx: (Math.random() - 0.5) * 0.8 - dx * 0.05,
            vy: (Math.random() - 0.5) * 0.8 - dy * 0.05,
          });
        }
      }

      if (p.length > 600) particlesRef.current = p.slice(-600);

      // Draw particles
      for (let i = p.length - 1; i >= 0; i--) {
        const pt = p[i];
        pt.x += pt.vx; pt.y += pt.vy;
        pt.vx *= 0.96; pt.vy *= 0.96;
        pt.life -= 0.012;
        if (pt.life <= 0) { p.splice(i, 1); continue; }
        ctx.globalAlpha = pt.life * 0.4;
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, pt.sz * pt.life, 0, Math.PI * 2);
        ctx.fillStyle = trailColor;
        ctx.fill();
      }

      ctx.globalAlpha = 1;

      requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);

    return () => {
      cancelled = true;
      clearInterval(colorInterval);
      document.body.style.cursor = '';
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('resize', onResize);
    };
  }, [isMobile]);

  if (isMobile) return null;

  return (
    <canvas
      ref={canvasRef}
      className={styles.cursorContainer}
      aria-hidden="true"
    />
  );
}

export default CursorEffect;
