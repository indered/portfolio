import styles from './MusicSection.module.scss';
import { PERSONAS } from '../../lib/constants';

const persona = PERSONAS.music;

// --- Waveform divider (15% opacity, between sections) ---
function WaveformDivider() {
  return (
    <div className={styles.waveformDivider} aria-hidden="true">
      {Array.from({ length: 48 }).map((_, i) => (
        <span
          key={i}
          className={styles.waveBar}
          style={{
            '--bar-index': i,
            '--bar-base-h': `${14 + Math.abs(Math.sin(i * 0.42 + 1.1)) * 40}px`,
            '--bar-delay': `${(i * 0.07) - Math.floor((i * 0.07) / 1.8) * 1.8}s`,
          }}
        />
      ))}
    </div>
  );
}

// --- Small equalizer bars (accent) ---
function Equalizer() {
  return (
    <div className={styles.equalizer} aria-label="Now playing">
      {[...Array(4)].map((_, i) => (
        <span key={i} className={styles.eqBar} style={{ '--eq-i': i }} />
      ))}
    </div>
  );
}

// --- Vinyl accent (small, decorative only) ---
function VinylAccent() {
  return (
    <div className={styles.vinylAccent} aria-hidden="true">
      <div className={styles.vinylAccentDisc}>
        <div className={styles.vinylAccentLabel}>
          <div className={styles.vinylAccentHole} />
        </div>
        <div className={styles.vinylAccentReflection} />
      </div>
    </div>
  );
}

// --- Guitar SVG (amber tones, no string annotations) ---
function GuitarSvg() {
  return (
    <svg
      className={styles.guitarSvg}
      viewBox="0 0 120 320"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      {/* Neck */}
      <rect x="50" y="0" width="20" height="200" rx="4" className={styles.guitarNeck} />
      {/* Frets */}
      {[30, 58, 84, 108, 130, 150, 168, 185].map((y, i) => (
        <rect key={i} x="50" y={y} width="20" height="2" rx="1" className={styles.guitarFret} />
      ))}
      {/* Strings on neck */}
      {[54, 57, 60, 63, 66, 69].map((x, i) => (
        <line key={i} x1={x} y1="0" x2={x} y2="200" className={styles.guitarString} style={{ '--str-i': i }} />
      ))}
      {/* Body */}
      <ellipse cx="60" cy="265" rx="45" ry="55" className={styles.guitarBody} />
      <ellipse cx="60" cy="265" rx="32" ry="40" className={styles.guitarBodyInner} />
      {/* Sound hole */}
      <circle cx="60" cy="258" r="16" className={styles.guitarHole} />
      <circle cx="60" cy="258" r="12" className={styles.guitarHoleInner} />
      {/* Bridge */}
      <rect x="44" y="285" width="32" height="6" rx="3" className={styles.guitarBridge} />
      {/* Strings on body */}
      {[54, 57, 60, 63, 66, 69].map((x, i) => (
        <line key={i} x1={x} y1="200" x2={x} y2="291" className={styles.guitarString} style={{ '--str-i': i }} />
      ))}
      {/* Headstock */}
      <rect x="46" y="0" width="28" height="24" rx="6" className={styles.guitarHead} />
      {/* Tuning pegs */}
      {[48, 54, 60, 66].map((x, i) => (
        <circle key={i} cx={x} cy={i < 2 ? 4 : 18} r="3" className={styles.guitarPeg} />
      ))}
    </svg>
  );
}

// --- DJ Caricature placeholder SVG ---
function DjCaricature() {
  return (
    <svg
      className={styles.djSilhouette}
      viewBox="0 0 200 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      {/* Head */}
      <circle cx="100" cy="42" r="22" fill="rgba(148,163,184,0.18)" stroke="rgba(148,163,184,0.35)" strokeWidth="1.5" />
      {/* Headphones arc */}
      <path d="M78 42 Q100 18 122 42" stroke="rgba(148,163,184,0.5)" strokeWidth="3" fill="none" strokeLinecap="round" />
      {/* Headphone cups */}
      <rect x="71" y="36" width="10" height="14" rx="5" fill="rgba(148,163,184,0.3)" stroke="rgba(148,163,184,0.5)" strokeWidth="1" />
      <rect x="119" y="36" width="10" height="14" rx="5" fill="rgba(148,163,184,0.3)" stroke="rgba(148,163,184,0.5)" strokeWidth="1" />
      {/* Body / torso */}
      <rect x="78" y="68" width="44" height="46" rx="8" fill="rgba(148,163,184,0.12)" stroke="rgba(148,163,184,0.3)" strokeWidth="1.5" />
      {/* Arms extended to decks */}
      <line x1="78" y1="82" x2="38" y2="108" stroke="rgba(148,163,184,0.35)" strokeWidth="6" strokeLinecap="round" />
      <line x1="122" y1="82" x2="162" y2="108" stroke="rgba(148,163,184,0.35)" strokeWidth="6" strokeLinecap="round" />
      {/* DJ Decks table */}
      <rect x="20" y="108" width="160" height="10" rx="4" fill="rgba(148,163,184,0.2)" stroke="rgba(148,163,184,0.35)" strokeWidth="1" />
      {/* Left turntable */}
      <circle cx="60" cy="140" r="28" fill="rgba(148,163,184,0.08)" stroke="rgba(148,163,184,0.3)" strokeWidth="1.5" />
      <circle cx="60" cy="140" r="18" stroke="rgba(148,163,184,0.2)" strokeWidth="1" fill="none" />
      <circle cx="60" cy="140" r="5" fill="rgba(148,163,184,0.3)" stroke="rgba(148,163,184,0.4)" strokeWidth="1" />
      {/* Right turntable */}
      <circle cx="140" cy="140" r="28" fill="rgba(148,163,184,0.08)" stroke="rgba(148,163,184,0.3)" strokeWidth="1.5" />
      <circle cx="140" cy="140" r="18" stroke="rgba(148,163,184,0.2)" strokeWidth="1" fill="none" />
      <circle cx="140" cy="140" r="5" fill="rgba(148,163,184,0.3)" stroke="rgba(148,163,184,0.4)" strokeWidth="1" />
      {/* Mixer in center */}
      <rect x="82" y="115" width="36" height="24" rx="3" fill="rgba(148,163,184,0.15)" stroke="rgba(148,163,184,0.3)" strokeWidth="1" />
      {/* Fader */}
      <rect x="98" y="118" width="4" height="14" rx="2" fill="rgba(148,163,184,0.4)" />
      <rect x="96" y="123" width="8" height="4" rx="1" fill="rgba(148,163,184,0.6)" />
      {/* EQ knobs */}
      <circle cx="88" cy="122" r="3" fill="rgba(148,163,184,0.35)" />
      <circle cx="88" cy="132" r="3" fill="rgba(148,163,184,0.35)" />
      <circle cx="112" cy="122" r="3" fill="rgba(148,163,184,0.35)" />
      <circle cx="112" cy="132" r="3" fill="rgba(148,163,184,0.35)" />
      {/* Tonearm left */}
      <line x1="80" y1="115" x2="68" y2="128" stroke="rgba(148,163,184,0.45)" strokeWidth="1.5" strokeLinecap="round" />
      {/* Tonearm right */}
      <line x1="120" y1="115" x2="132" y2="128" stroke="rgba(148,163,184,0.45)" strokeWidth="1.5" strokeLinecap="round" />
      {/* Sound waves from decks */}
      <path d="M18 168 Q14 162 18 156" stroke="rgba(148,163,184,0.25)" strokeWidth="1.5" fill="none" strokeLinecap="round" />
      <path d="M12 172 Q6 162 12 152" stroke="rgba(148,163,184,0.15)" strokeWidth="1.5" fill="none" strokeLinecap="round" />
      <path d="M182 168 Q186 162 182 156" stroke="rgba(148,163,184,0.25)" strokeWidth="1.5" fill="none" strokeLinecap="round" />
      <path d="M188 172 Q194 162 188 152" stroke="rgba(148,163,184,0.15)" strokeWidth="1.5" fill="none" strokeLinecap="round" />
    </svg>
  );
}

// --- YouTube placeholder embed ---
function YouTubePlaceholder() {
  return (
    <div className={styles.ytPlaceholder}>
      <div className={styles.ytLogo} aria-hidden="true">
        <svg width="68" height="48" viewBox="0 0 68 48" xmlns="http://www.w3.org/2000/svg">
          <rect width="68" height="48" rx="14" fill="#FF0000" />
          <polygon points="27,14 27,34 47,24" fill="white" />
        </svg>
      </div>
      <p className={styles.ytLabel}>Playlist · Updated regularly</p>
      <p className={styles.ytNote}>Connect YouTube playlist here</p>
    </div>
  );
}

// --- Main component ---
export default function MusicSection() {
  return (
    <div className={styles.music}>

      {/* ====== SECTION 1: HERO ====== */}
      <div className={styles.hero}>
        <div className={styles.heroInner}>
          <div className={styles.heroEyebrow}>
            <Equalizer />
            <span className={styles.heroEyebrowText}>Guitar · DJ Decks · Dubai</span>
          </div>

          <h2 className={styles.heroTitle}>
            {persona.title}
          </h2>

          <p className={styles.heroSubtitle}>
            {persona.tagline}
          </p>
        </div>
      </div>

      {/* ====== WAVEFORM DIVIDER 1 ====== */}
      <WaveformDivider />

      {/* ====== SECTION 2: TWO-PANEL INSTRUMENT SPLIT ====== */}
      <div className={styles.instrumentGrid}>
        {/* LEFT: On Guitar */}
        <div className={styles.panelGuitar}>
          <div className={styles.panelHeader}>
            <span className={styles.panelAccentLine} data-accent="guitar" />
            <span className={styles.panelLabel} data-accent="guitar">On Guitar</span>
          </div>

          <div className={styles.panelBody}>
            <div className={styles.guitarVisual}>
              <GuitarSvg />
            </div>
            <div className={styles.panelContent}>
              <h3 className={styles.panelTitle} data-accent="guitar">Fingerpicking &amp; Rhythm</h3>
              <p className={styles.panelDesc}>
                Weekend sessions, acoustic in hand. Drawn to Indian classical fingerpicking,
                blues chord progressions, and the occasional lo-fi loop that ends up on repeat
                for three days.
              </p>
              <ul className={styles.panelFacts}>
                <li className={styles.panelFact}>
                  <span className={styles.factKey}>Style</span>
                  <span className={styles.factVal}>Fingerstyle · Blues · Acoustic</span>
                </li>
                <li className={styles.panelFact}>
                  <span className={styles.factKey}>Influences</span>
                  <span className={styles.factVal}>John Mayer · Ragas · Nusrat</span>
                </li>
                <li className={styles.panelFact}>
                  <span className={styles.factKey}>Instrument</span>
                  <span className={styles.factVal}>Spruce-top acoustic, 6-string</span>
                </li>
                <li className={styles.panelFact}>
                  <span className={styles.factKey}>Playing since</span>
                  <span className={styles.factVal}>5+ years</span>
                </li>
              </ul>
              <div className={styles.genrePills}>
                {['Classical Indian', 'Blues', 'Lo-fi', 'Acoustic'].map((g) => (
                  <span key={g} className={styles.genrePill} data-accent="guitar">{g}</span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT: On the Decks */}
        <div className={styles.panelDj}>
          <div className={styles.panelHeader}>
            <span className={styles.panelAccentLine} data-accent="dj" />
            <span className={styles.panelLabel} data-accent="dj">On the Decks</span>
          </div>

          <div className={styles.panelBody}>
            <div className={styles.djCaricatureZone}>
              <DjCaricature />
              <p className={styles.djCaricatureCaption}>
                [ DJ Caricature — Coming Soon ]
              </p>
            </div>
            <div className={styles.panelContent}>
              <h3 className={styles.panelTitle} data-accent="dj">Learning to Mix</h3>
              <p className={styles.panelDesc}>
                Weeknight sessions building track selection instincts. House, techno,
                and the kind of deep cuts that make a room pause. Still learning the
                craft — but the ear is already there.
              </p>
              <ul className={styles.panelFacts}>
                <li className={styles.panelFact}>
                  <span className={styles.factKey}>Genre</span>
                  <span className={styles.factVal} data-accent="dj">Deep House · Techno · Electronic</span>
                </li>
                <li className={styles.panelFact}>
                  <span className={styles.factKey}>Equipment</span>
                  <span className={styles.factVal}>Pioneer DJ setup, Rekordbox</span>
                </li>
                <li className={styles.panelFact}>
                  <span className={styles.factKey}>Stage</span>
                  <span className={styles.factVal}>Learning · building library</span>
                </li>
                <li className={styles.panelFact}>
                  <span className={styles.factKey}>Inspiration</span>
                  <span className={styles.factVal}>Boiler Room · Resident Advisor</span>
                </li>
              </ul>
              <div className={styles.genrePills}>
                {['Deep House', 'Techno', 'Electronic', 'Ambient'].map((g) => (
                  <span key={g} className={styles.genrePill} data-accent="dj">{g}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ====== WAVEFORM DIVIDER 2 ====== */}
      <WaveformDivider />

      {/* ====== SECTION 3: YOUTUBE PLAYLIST ====== */}
      <div className={styles.playlistSection}>
        <div className={styles.playlistHeaderRow}>
          <div className={styles.playlistTitleGroup}>
            <VinylAccent />
            <div>
              <p className={styles.playlistEyebrow}>YouTube</p>
              <h3 className={styles.playlistTitle}>What I'm Listening To</h3>
            </div>
          </div>
          <p className={styles.playlistMeta}>Updated regularly · Guitar covers &amp; DJ sets</p>
        </div>

        <div className={styles.ytEmbedWrapper}>
          <YouTubePlaceholder />
        </div>

        <p className={styles.playlistFootnote}>
          Guitar covers &amp; DJ sets · Updated regularly
        </p>
      </div>

    </div>
  );
}
