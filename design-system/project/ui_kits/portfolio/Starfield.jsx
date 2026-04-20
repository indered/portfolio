// Starfield.jsx — subtle animated star particles
const { useEffect: useEffectSF, useRef: useRefSF } = React;

function Starfield() {
  const ref = useRefSF(null);
  useEffectSF(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let w = canvas.width = window.innerWidth;
    let h = canvas.height = window.innerHeight;
    const stars = Array.from({ length: 180 }, () => ({
      x: Math.random() * w, y: Math.random() * h,
      r: Math.random() * 1.4 + 0.2,
      a: Math.random() * 0.8 + 0.2,
      vx: (Math.random() - 0.5) * 0.02,
      vy: (Math.random() - 0.5) * 0.02,
      twinkle: Math.random() * Math.PI * 2,
    }));
    let raf;
    function draw() {
      ctx.clearRect(0, 0, w, h);
      stars.forEach(s => {
        s.x += s.vx; s.y += s.vy; s.twinkle += 0.02;
        if (s.x < 0) s.x = w; if (s.x > w) s.x = 0;
        if (s.y < 0) s.y = h; if (s.y > h) s.y = 0;
        const alpha = s.a * (0.6 + 0.4 * Math.sin(s.twinkle));
        ctx.fillStyle = `rgba(255,255,255,${alpha})`;
        ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2); ctx.fill();
      });
      raf = requestAnimationFrame(draw);
    }
    draw();
    const onR = () => { w = canvas.width = window.innerWidth; h = canvas.height = window.innerHeight; };
    window.addEventListener('resize', onR);
    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', onR); };
  }, []);
  return <canvas ref={ref} style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none' }} />;
}

function CenterSun() {
  return (
    <div style={{
      position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
      width: 240, height: 240, borderRadius: '50%',
      background: 'radial-gradient(circle at 40% 40%, #ffd77f 0%, #ff8b42 40%, #7a2a08 80%, transparent 100%)',
      boxShadow: '0 0 80px 20px rgba(255, 180, 80, 0.35), 0 0 160px 40px rgba(255, 100, 50, 0.2)',
      zIndex: 1, animation: 'pulse 4s ease-in-out infinite',
    }} />
  );
}

function PlanetOrbits({ onClick }) {
  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: 2 }}>
      {window.PLANETS.map((p, i) => {
        const angle = (i / window.PLANETS.length) * Math.PI * 2;
        const radius = 180 + i * 28;
        return (
          <button key={p.id} onClick={() => onClick(p.id)} style={{
            position: 'absolute', top: '50%', left: '50%',
            transform: `translate(calc(-50% + ${Math.cos(angle) * radius}px), calc(-50% + ${Math.sin(angle) * radius}px))`,
            width: 44, height: 44, borderRadius: '50%', border: 'none',
            background: window.sphereGradient(p.color),
            boxShadow: `0 0 14px 3px ${p.color}77, inset 0 0 8px rgba(0,0,0,0.25)`,
            cursor: 'pointer', fontSize: '1.05rem',
            filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.5))',
          }}>{p.icon}</button>
        );
      })}
    </div>
  );
}

window.Starfield = Starfield;
window.CenterSun = CenterSun;
window.PlanetOrbits = PlanetOrbits;
