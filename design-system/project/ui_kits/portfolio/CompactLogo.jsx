// CompactLogo.jsx — top-right logo + Paperwork dropdown + Live button
const { useState: useStateCL, useRef: useRefCL, useEffect: useEffectCL } = React;

function IconDownload() {
  return <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>;
}
function IconBriefcase() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/><line x1="12" y1="12" x2="12" y2="12.01"/></svg>;
}
function IconLive() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>;
}

function CompactLogo() {
  const [menuOpen, setMenuOpen] = useStateCL(false);
  const ref = useRefCL(null);
  useEffectCL(() => {
    if (!menuOpen) return;
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setMenuOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, [menuOpen]);

  return (
    <div ref={ref} style={{
      position: 'fixed', top: 20, right: 24, zIndex: 3, textAlign: 'right',
      display: 'flex', flexDirection: 'column', alignItems: 'flex-end',
    }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
        <img src="../../assets/logo.svg" alt="Mahesh Inder" style={{ height: 44 }} />
        <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 8, letterSpacing: '0.2em', color: 'rgba(255,255,255,0.25)', textTransform: 'uppercase' }}>Full Stack · Dubai</span>
      </div>
      <button onClick={() => setMenuOpen(v => !v)} style={{
        display: 'flex', alignItems: 'center', gap: 8, marginTop: 12, padding: '7px 14px',
        background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: 8, cursor: 'pointer', fontFamily: "'IBM Plex Mono', monospace",
        fontSize: '0.65rem', fontWeight: 500, letterSpacing: '0.14em', textTransform: 'uppercase',
        color: 'rgba(255,255,255,0.55)',
      }}>
        <IconBriefcase /><span>Paperwork</span>
      </button>
      <button style={{
        display: 'flex', alignItems: 'center', gap: 6, marginTop: 8, padding: '6px 12px',
        background: 'rgba(74,158,255,0.1)', border: '1px solid rgba(74,158,255,0.25)',
        borderRadius: 8, cursor: 'pointer', fontFamily: "'IBM Plex Mono', monospace",
        fontSize: '0.62rem', fontWeight: 500, letterSpacing: '0.1em', textTransform: 'uppercase',
        color: 'rgba(74,158,255,0.8)',
      }}>
        <IconLive /><span>Live</span>
      </button>
      {menuOpen && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 10px)', right: 0, minWidth: 174,
          background: 'rgba(8,6,18,0.88)', backdropFilter: 'blur(20px) saturate(1.4)',
          border: '1px solid rgba(255,255,255,0.09)', borderRadius: 10, padding: 6,
          boxShadow: '0 8px 32px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.06)',
        }}>
          {['Resume', 'Cover Letter'].map(l => (
            <a key={l} href="#" style={{
              display: 'flex', alignItems: 'center', gap: 9, padding: '9px 12px', borderRadius: 6,
              fontFamily: "'IBM Plex Mono', monospace", fontSize: '0.72rem', fontWeight: 500,
              letterSpacing: '0.06em', color: 'rgba(255,255,255,0.75)', textDecoration: 'none',
            }} onClick={(e) => { e.preventDefault(); setMenuOpen(false); }}>
              <IconDownload />{l}
            </a>
          ))}
        </div>
      )}
    </div>
  );
}

window.CompactLogo = CompactLogo;
