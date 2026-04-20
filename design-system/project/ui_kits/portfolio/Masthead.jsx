// Masthead.jsx — giant MAHESH / INDER editorial reveal
const { useState, useEffect } = React;

function Masthead({ onDone }) {
  const [shown, setShown] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setShown(true), 60);
    return () => clearTimeout(t);
  }, []);

  const reveal = (text, startDelay) => text.split('').map((c, i) => (
    <span key={i} style={{ display: 'inline-block', overflow: 'hidden', verticalAlign: 'top', lineHeight: 'inherit' }}>
      <span style={{
        display: 'inline-block',
        transform: shown ? 'translateY(0)' : 'translateY(110%)',
        transition: `transform 0.72s cubic-bezier(0.16, 1, 0.3, 1) ${startDelay + i * 0.04}s`,
      }}>{c === ' ' ? '\u00A0' : c}</span>
    </span>
  ));

  return (
    <div style={{
      position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', mixBlendMode: 'screen',
      pointerEvents: 'none', padding: '0 clamp(16px, 4vw, 60px)',
    }}>
      <div style={{ width: '100%' }}>
        <div style={{
          fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 700,
          fontSize: 'clamp(12vw, 17vw, 240px)', lineHeight: 0.88, letterSpacing: '0.08em',
          textTransform: 'uppercase', color: 'rgba(255,255,255,0.88)', textAlign: 'left',
        }}>{reveal('MAHESH', 0.3)}</div>
        <div style={{
          fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 700,
          fontSize: 'clamp(12vw, 17vw, 240px)', lineHeight: 0.88, letterSpacing: '0.08em',
          textTransform: 'uppercase', color: 'rgba(255,255,255,0.88)', textAlign: 'right',
          marginTop: '-0.04em',
        }}>{reveal('INDER', 0.3 + 6 * 0.04 + 0.08)}</div>
      </div>
      <div style={{
        marginTop: 'clamp(16px, 2.5vw, 36px)', fontFamily: "'IBM Plex Mono', monospace",
        fontSize: 'clamp(0.55rem, 0.75vw, 11px)', letterSpacing: '0.38em',
        textTransform: 'uppercase', color: 'rgba(255,255,255,0.28)', textAlign: 'center',
        opacity: shown ? 1 : 0, transition: 'opacity 0.7s ease 1.4s',
      }}>
        <span style={{ display: 'block', width: 32, height: 1, background: 'rgba(255,255,255,0.18)', margin: '0 auto 14px' }} />
        Full Stack Developer&nbsp;&nbsp;·&nbsp;&nbsp;Dubai, UAE
      </div>
    </div>
  );
}

window.Masthead = Masthead;
