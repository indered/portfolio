// PlanetDock.jsx — macOS magnifying planet dock
const { useState: useStatePD } = React;

const PLANETS = [
  { id: 'work', icon: '💻', title: 'Work', color: '#2a7fe0' },
  { id: 'runner', icon: '🏃', title: 'The Long Run', color: '#c44b28' },
  { id: 'ventures', icon: '🚀', title: 'Ventures', color: '#8BA370' },
  { id: 'music', icon: '🎵', title: 'Music', color: '#e8a855' },
  { id: 'about', icon: '💘', title: 'Personal', color: '#e0527a' },
  { id: 'connect', icon: '🌐', title: 'Connect', color: '#c8a070' },
  { id: 'thoughts', icon: '📖', title: 'Thinker', color: '#8b7d6b' },
];

function sphereGradient(color) {
  return `radial-gradient(circle at 34% 30%, rgba(255,255,255,0.82) 0%, ${color} 32%, rgba(0,0,0,0.18) 68%, transparent 100%)`;
}

function PlanetDock({ activeId, onNavigate }) {
  const [hovered, setHovered] = useStatePD(null);
  return (
    <div style={{
      position: 'fixed', bottom: 20, left: 0, right: 0, margin: '0 auto', width: 'fit-content',
      zIndex: 9,
    }} onMouseLeave={() => setHovered(null)}>
      <div style={{
        display: 'flex', alignItems: 'flex-end', gap: 16, padding: '10px 22px 12px',
        background: 'rgba(0,0,0,0.40)', backdropFilter: 'blur(20px)',
        borderRadius: 44, border: '1px solid rgba(255,255,255,0.1)',
        boxShadow: '0 4px 24px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.06)',
      }}>
        {PLANETS.map((p, i) => {
          const isHover = hovered === i;
          const isActive = activeId === p.id;
          const scale = isHover ? 1.65 : 1;
          return (
            <div key={p.id} style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5 }}>
              {isHover && (
                <div style={{
                  position: 'absolute', bottom: 'calc(52px + 12px)', left: '50%',
                  transform: 'translateX(-50%)', background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255,255,255,0.12)', borderRadius: 8, padding: '5px 10px 6px',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, whiteSpace: 'nowrap',
                }}>
                  <span style={{ fontSize: '1rem', lineHeight: 1 }}>{p.icon}</span>
                  <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 7, letterSpacing: '0.13em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.75)' }}>{p.title}</span>
                </div>
              )}
              <button onMouseEnter={() => setHovered(i)} onClick={() => onNavigate(p.id)} style={{
                width: 52, height: 52, borderRadius: '50%', border: 'none',
                transformOrigin: 'bottom center',
                transform: `scale(${scale})`,
                transition: 'transform 0.3s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.3s ease',
                background: sphereGradient(p.color),
                boxShadow: isHover
                  ? `0 0 24px 8px ${p.color}cc, inset 0 0 10px rgba(0,0,0,0.25)`
                  : isActive
                    ? `0 0 18px 5px ${p.color}, inset 0 0 10px rgba(0,0,0,0.25)`
                    : `0 0 8px 2px ${p.color}44, inset 0 0 10px rgba(0,0,0,0.25)`,
                outline: isActive ? '2px solid rgba(255,255,255,0.55)' : 'none',
                outlineOffset: 2, display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer',
              }}>
                <span style={{ fontSize: '1.3rem', filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.5))' }}>{p.icon}</span>
              </button>
              <span style={{ width: 4, height: 4, borderRadius: '50%', background: 'rgba(255,255,255,0.85)', opacity: isActive ? 1 : 0, transition: 'opacity 0.25s' }} />
            </div>
          );
        })}
      </div>
    </div>
  );
}

window.PLANETS = PLANETS;
window.PlanetDock = PlanetDock;
window.sphereGradient = sphereGradient;
