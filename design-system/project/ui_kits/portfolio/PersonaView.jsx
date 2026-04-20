// PersonaView.jsx — inside-a-planet layout with bleed orb + project card
function PersonaView({ personaId, onBack }) {
  const planet = window.PLANETS.find(p => p.id === personaId) || window.PLANETS[0];
  const color = planet.color;

  const content = {
    work: {
      eyebrow: 'Senior Full Stack · Emirates NBD',
      title: 'Systems built to last',
      quote: "Code written to be read. Architecture that doesn't apologise.",
      project: {
        badge: '2× Google I/O Featured',
        name: 'Tokopedia Discovery',
        subtitle: 'Featured at Google I/O, twice',
        body: "Built APIs for Indonesia's largest marketplace so blazingly fast Google put them on stage at I/O. Not once, twice.",
        tech: ['React', 'Node.js', 'GraphQL', 'Go', 'Kubernetes'],
      },
    },
    runner: {
      eyebrow: 'The Long Run · Dubai',
      title: "Km 32 is where the body quits",
      quote: "And the mind takes over. Dubai taught me that.",
      project: {
        badge: '2,847 km run · 312 sessions',
        name: 'Valentine Day Run',
        subtitle: '10.5 km at 5\'33"/km',
        body: "Recent activity, pulled from Strava. Half Marathon prep is in full swing. The longest single run so far is a 42.2 km marathon.",
        tech: ['Running', 'Dubai', 'Half Marathon'],
      },
    },
    ventures: {
      eyebrow: 'Arc Protocol · DIFC Dubai',
      title: 'Neural infrastructure meets decentralised energy',
      quote: "If Hinton gave AI its architecture and Tesla gave us distributed energy, Arc Protocol is the protocol that lets them trade.",
      project: {
        badge: 'Pre-seed · Active',
        name: 'Arc Protocol',
        subtitle: 'Deep Tech',
        body: "The next wave of AI won't run in a data centre. It'll run on Arc.",
        tech: ['Decentralised AI', 'On-chain Energy', 'Neural Markets'],
      },
    },
    music: {
      eyebrow: 'Strings & Frequencies',
      title: 'Guitar on weekends. DJ decks on weeknights.',
      quote: "Sleep is a work in progress.",
      project: {
        badge: "Mahesh's Quantum Playlist",
        name: 'Starboy',
        subtitle: 'The Weeknd · 3:50',
        body: 'Frequencies that fuel the multiverse. A rotating playlist of what is actually playing in Dubai this week.',
        tech: ['Guitar', 'DJ', 'Ableton'],
      },
    },
    about: {
      eyebrow: 'Personal',
      title: "Schrödinger's Boyfriend",
      quote: "Simultaneously perfect and a red flag until observed.",
      project: {
        badge: 'About · Dubai, UAE',
        name: 'Mahesh Inder',
        subtitle: 'Full Stack Developer',
        body: "Full-stack developer who treats codebases like universes. Each one deserves its own laws of physics.",
        tech: ['Dubai', 'Punjab', 'APJ Abdul Kalam TU'],
      },
    },
    connect: {
      eyebrow: 'The Network Node',
      title: 'Every connection is a new dimension',
      quote: "The social fabric of spacetime.",
      project: {
        badge: 'Social',
        name: 'Find Mahesh',
        subtitle: 'GitHub · LinkedIn · Instagram · Mail',
        body: 'Pick whichever universe you prefer. The email usually gets the fastest reply.',
        tech: ['@indered', 'mahesh-inder', 'mahesh.inder_'],
      },
    },
    thoughts: {
      eyebrow: 'The Thinker',
      title: 'Guru Nanak taught me to question',
      quote: "Hawking showed me where questions lead.",
      project: {
        badge: 'Essay · 7 min read',
        name: 'On questioning everything',
        subtitle: 'A note from Dubai',
        body: "I spent most of my twenties trying to have the right answers. Turned out the better move was getting comfortable with the questions.",
        tech: ['Essay', 'Sikhi', 'Physics'],
      },
    },
  }[personaId] || {};

  const useEditorial = personaId === 'thoughts';

  return (
    <div data-persona={personaId} style={{
      '--persona-color': color, position: 'relative', minHeight: '100vh',
      background: '#141210', color: '#E8E4DE', overflow: 'hidden',
    }}>
      {/* Bleed orb */}
      <div style={{
        position: 'absolute', top: '-20%', right: '-15%', width: '60vw', height: '60vw',
        borderRadius: '50%', background: `radial-gradient(circle, ${color}22 0%, transparent 60%)`,
        pointerEvents: 'none', zIndex: 0,
      }} />
      <div style={{
        position: 'absolute', bottom: '-25%', left: '-10%', width: '50vw', height: '50vw',
        borderRadius: '50%', background: `radial-gradient(circle, ${color}14 0%, transparent 55%)`,
        pointerEvents: 'none', zIndex: 0,
      }} />

      <button onClick={onBack} style={{
        position: 'fixed', top: 20, left: 24, zIndex: 5,
        background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)',
        padding: '7px 14px', borderRadius: 8, fontFamily: "'IBM Plex Mono', monospace",
        fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase',
        color: 'rgba(255,255,255,0.55)', cursor: 'pointer',
      }}>← Solar System</button>

      <div style={{
        position: 'relative', zIndex: 1, maxWidth: 1000, margin: '0 auto',
        padding: 'clamp(80px, 10vw, 140px) clamp(20px, 4vw, 40px) 120px',
      }}>
        <div style={{
          fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, letterSpacing: '0.38em',
          textTransform: 'uppercase', color, marginBottom: 20,
        }}>
          <span style={{ display: 'inline-block', width: 32, height: 1, background: color, verticalAlign: 'middle', marginRight: 14 }} />
          {content.eyebrow}
        </div>

        <h1 style={{
          fontFamily: useEditorial ? "'Cormorant Garamond', Georgia, serif" : "'Plus Jakarta Sans', sans-serif",
          fontStyle: useEditorial ? 'italic' : 'normal',
          fontWeight: useEditorial ? 500 : 700,
          fontSize: useEditorial ? 'clamp(2.5rem, 6vw, 4.5rem)' : 'clamp(2rem, 5vw, 3.5rem)',
          lineHeight: 1.1, letterSpacing: useEditorial ? 0 : '-0.01em',
          margin: 0, color: '#E8E4DE',
        }}>{content.title}</h1>

        <p style={{
          fontFamily: "'Newsreader', Georgia, serif", fontStyle: 'italic',
          fontSize: 'clamp(1.1rem, 2vw, 1.35rem)', lineHeight: 1.5, color: '#a59d93',
          maxWidth: 640, marginTop: 24,
        }}>{content.quote}</p>

        {/* Project card */}
        <div style={{
          marginTop: 56, maxWidth: 620, background: '#1E1C18',
          borderRadius: 12, border: '1px solid rgba(255,255,255,0.07)', padding: 28,
        }}>
          <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase', color }}>{content.project.badge}</div>
          <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 26, fontWeight: 700, marginTop: 10, color: '#E8E4DE' }}>{content.project.name}</div>
          <div style={{ fontFamily: "'Newsreader', serif", fontStyle: 'italic', fontSize: 17, color: '#8A8278', marginTop: 4 }}>{content.project.subtitle}</div>
          <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 15, lineHeight: 1.6, color: '#a1a1aa', marginTop: 12 }}>{content.project.body}</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 16 }}>
            {content.project.tech.map(t => (
              <span key={t} style={{
                fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, padding: '4px 10px',
                borderRadius: 9999, background: `${color}1f`, color,
                border: `1px solid ${color}33`,
              }}>{t}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

window.PersonaView = PersonaView;
