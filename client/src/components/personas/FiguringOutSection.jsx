import styles from './FiguringOutSection.module.scss';

// ── Mineral crystal SVG ───────────────────────────────────────────────────────
function Crystal() {
  return (
    <svg className={styles.crystal} viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" role="img">
      {/* Hexagonal crystal facets */}
      <polygon
        points="28,4 46,14 46,34 28,44 10,34 10,14"
        stroke="#8BA370" strokeWidth="1" fill="rgba(139,163,112,0.06)"
      />
      <polygon
        points="28,10 40,17 40,31 28,38 16,31 16,17"
        stroke="#8BA370" strokeWidth="0.6" fill="rgba(139,163,112,0.04)" opacity="0.7"
      />
      {/* Internal facet lines */}
      <line x1="28" y1="4"  x2="28" y2="44" stroke="#8BA370" strokeWidth="0.4" opacity="0.3"/>
      <line x1="10" y1="14" x2="46" y2="34" stroke="#8BA370" strokeWidth="0.4" opacity="0.3"/>
      <line x1="46" y1="14" x2="10" y2="34" stroke="#8BA370" strokeWidth="0.4" opacity="0.3"/>
      {/* Glint */}
      <circle cx="22" cy="17" r="1.2" fill="#A8C490" opacity="0.6"/>
      <circle cx="34" cy="14" r="0.7" fill="#EAE2D0" opacity="0.5"/>
      {/* Bottom drip suggestion */}
      <path d="M28 44 Q28 52 28 52" stroke="#8BA370" strokeWidth="0.8" opacity="0.4" strokeLinecap="round"/>
      <circle cx="28" cy="53" r="1.5" fill="rgba(139,163,112,0.3)"/>
    </svg>
  );
}

// ── Minerals bottom decoration ────────────────────────────────────────────────
function MineralsBg() {
  return (
    <svg className={styles.minerals} viewBox="0 0 800 180" preserveAspectRatio="none" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" role="presentation">
      {/* Left cluster */}
      <polygon points="60,180 90,120 120,160 150,100 180,140 190,180" stroke="#8BA370" strokeWidth="1" fill="rgba(139,163,112,0.08)"/>
      <polygon points="80,180 100,130 125,150" stroke="#8BA370" strokeWidth="0.6" fill="none" opacity="0.5"/>
      <polygon points="150,180 170,110 195,145 210,180" stroke="#8BA370" strokeWidth="0.8" fill="rgba(139,163,112,0.04)"/>
      {/* Right cluster */}
      <polygon points="610,180 640,100 665,140 695,90 720,130 750,180" stroke="#8BA370" strokeWidth="1" fill="rgba(139,163,112,0.08)"/>
      <polygon points="630,180 650,115 675,145" stroke="#8BA370" strokeWidth="0.6" fill="none" opacity="0.5"/>
      <polygon points="700,180 720,115 748,140 760,180" stroke="#8BA370" strokeWidth="0.8" fill="rgba(139,163,112,0.04)"/>
      {/* Centre hint */}
      <polygon points="370,180 385,148 400,165 415,140 430,180" stroke="#8BA370" strokeWidth="0.7" fill="rgba(139,163,112,0.05)" opacity="0.6"/>
    </svg>
  );
}

// ── Section ───────────────────────────────────────────────────────────────────
export default function FiguringOutSection() {
  return (
    <section className={styles.section} aria-labelledby="figuring-out-heading">
      <MineralsBg />

      <div className={styles.inner}>
        {/* Badge */}
        <div className={styles.badge} role="status" aria-label="Launch status">
          <span className={styles.badgeDot} aria-hidden="true" />
          <span className={styles.badgeText}>Launching Soon</span>
        </div>

        {/* Crystal */}
        <Crystal />

        {/* Brand name */}
        <h1 id="figuring-out-heading" className={styles.brandName}>
          <a
            href="https://figuringout.club"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Figuring Out - Visit the electrolyte brand website (opens in new tab)"
          >
            Figuring Out
          </a>
        </h1>

        {/* Eyebrow */}
        <p className={styles.eyebrow}>
          an electrolyte brand · Dubai
        </p>

        <div className={styles.divider} aria-hidden="true" />

        {/* Tagline */}
        <p className={styles.tagline}>
          In the world where everyone is figuring out,{' '}
          <span className={styles.taglineHighlight}>
            at least we figured out the hydration right.
          </span>
        </p>

        {/* Visit link */}
        <a
          href="https://figuringout.club"
          target="_blank"
          rel="noopener noreferrer"
          className={styles.visitBtn}
          aria-label="Visit Figuring Out website (opens in new tab)"
        >
          Visit Website
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M7 17L17 7M17 7H7M17 7v10"/>
          </svg>
        </a>
      </div>
    </section>
  );
}
