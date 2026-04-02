import { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { SOCIAL_LINKS, ABOUT } from '../../lib/constants';
import styles from './SocialLinksSection.module.scss';

// ─── Platform meta — brand color is for hover glow only, NOT card backgrounds ──
const PLATFORM_META = {
  github: {
    hoverColor: '#E6EDF3',
    handle: '@indered',
    description: 'Open source · code · repos',
    label: 'View Profile',
  },
  linkedin: {
    hoverColor: '#0A66C2',
    handle: 'in/maheshinder',
    description: 'Professional network · career',
    label: 'Connect',
  },
  instagram: {
    hoverColor: '#E1306C',
    handle: '@maheshinder',
    description: 'Life · travel · moments',
    label: 'Follow',
  },
  mail: {
    hoverColor: '#C8853F',
    handle: ABOUT.email,
    description: 'Drop a message · collab · chat',
    label: 'Send Mail',
  },
  twitter: {
    hoverColor: '#1DA1F2',
    handle: '@maheshinder',
    description: 'Thoughts · threads · takes',
    label: 'Follow',
  },
};

// ─── SVG Icons ─────────────────────────────────────────────────────────────────
const ICONS = {
  github: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.438 9.8 8.205 11.387.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61-.546-1.387-1.333-1.756-1.333-1.756-1.09-.745.083-.73.083-.73 1.205.085 1.838 1.237 1.838 1.237 1.07 1.834 2.807 1.304 3.492.997.108-.775.42-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.31.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.3 1.23A11.51 11.51 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.29-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222 0 1.606-.015 2.896-.015 3.293 0 .322.216.694.825.576C20.565 21.796 24 17.298 24 12c0-6.63-5.37-12-12-12z" />
    </svg>
  ),
  linkedin: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  ),
  instagram: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
    </svg>
  ),
  mail: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <path d="M22 4l-10 8L2 4" />
    </svg>
  ),
  twitter: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  ),
};

const CopyIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <rect x="9" y="9" width="13" height="13" rx="2" />
    <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
  </svg>
);

const CheckIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M20 6L9 17l-5-5" />
  </svg>
);

// ─── Monochrome social card ────────────────────────────────────────────────────
function SocialCard({ link }) {
  const meta = PLATFORM_META[link.icon] || {};
  const icon = ICONS[link.icon];

  return (
    <a
      href={link.url}
      target="_blank"
      rel="noopener noreferrer"
      className={styles.card}
      style={{ '--hover-color': meta.hoverColor }}
    >
      <div className={styles.cardIcon} style={{ color: meta.hoverColor }}>
        {icon}
      </div>

      <div className={styles.cardBody}>
        <span className={styles.cardPlatform}>{link.name}</span>
        <span className={styles.cardHandle}>{meta.handle}</span>
        <span className={styles.cardDesc}>{meta.description}</span>
      </div>

      <span className={styles.cardCta}>{meta.label} →</span>
    </a>
  );
}

// ─── Email block ───────────────────────────────────────────────────────────────
function EmailBlock() {
  const [copied, setCopied] = useState(false);
  const timerRef = useRef(null);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(ABOUT.email);
      setCopied(true);
      clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => setCopied(false), 2200);
    } catch { /* fallback */ }
  }, []);

  return (
    <div className={styles.emailBlock}>
      <span className={styles.emailLabel}>Or just write</span>
      <div className={styles.emailRow}>
        <a href={`mailto:${ABOUT.email}`} className={styles.emailAddress}>
          {ABOUT.email}
        </a>
        <button
          className={styles.copyBtn}
          onClick={handleCopy}
          aria-label={copied ? 'Copied!' : 'Copy email'}
          type="button"
        >
          <AnimatePresence mode="wait" initial={false}>
            {copied ? (
              <motion.span key="check" initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.6, opacity: 0 }} transition={{ duration: 0.15 }}>
                <CheckIcon />
              </motion.span>
            ) : (
              <motion.span key="copy" initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.6, opacity: 0 }} transition={{ duration: 0.15 }}>
                <CopyIcon />
              </motion.span>
            )}
          </AnimatePresence>
        </button>
      </div>
      <span className={styles.emailMeta}>Response within 24 hours.</span>
    </div>
  );
}

// ─── Main ──────────────────────────────────────────────────────────────────────
export default function SocialLinksSection() {
  const cards = SOCIAL_LINKS.filter(l => l.icon !== 'mail');

  return (
    <div className={styles.social}>

      {/* ── Current Status hero ── */}
      <div className={styles.hero}>
        <div className={styles.statusLine}>
          <span className={styles.statusDot} aria-hidden="true" />
          <span className={styles.statusText}>
            Open to senior engineering roles&nbsp;&nbsp;·&nbsp;&nbsp;Available for consulting
          </span>
        </div>
        <h2 className={styles.heroName}>{ABOUT.name}</h2>
        <p className={styles.heroLocation}>Full Stack Developer&nbsp;&nbsp;·&nbsp;&nbsp;{ABOUT.location}</p>
        <div className={styles.heroRule} aria-hidden="true" />
      </div>

      {/* ── Cards grid ── */}
      <div className={styles.grid}>
        {cards.map((link, i) => (
          <SocialCard key={link.name} link={link} index={i} />
        ))}
      </div>

      {/* ── Email section ── */}
      <EmailBlock />

    </div>
  );
}
