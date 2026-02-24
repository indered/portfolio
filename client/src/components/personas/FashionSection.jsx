import { useState, useMemo, useRef } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform, useSpring } from 'motion/react';
import { PERSONAS, FASHION_ITEMS } from '../../lib/constants';
import styles from './FashionSection.module.scss';

const persona = PERSONAS.fashion;

// Rich editorial gradient configs per category — color-blocked but visually layered
const CARD_CONFIG = {
  Streetwear: {
    gradient: 'linear-gradient(145deg, #0a0a0a 0%, #1a0a2e 35%, #0f0f23 65%, #1a0a0a 100%)',
    overlay: 'repeating-linear-gradient(45deg, transparent, transparent 2px, rgba(245,158,11,0.04) 2px, rgba(245,158,11,0.04) 4px)',
    accent: '#f59e0b',
    label: 'SS\'26',
    vibe: 'URBAN COSMOS',
  },
  Formal: {
    gradient: 'linear-gradient(160deg, #0d0d0d 0%, #1a1410 40%, #2a1f0a 70%, #0d0d0d 100%)',
    overlay: 'repeating-linear-gradient(-30deg, transparent, transparent 3px, rgba(245,158,11,0.03) 3px, rgba(245,158,11,0.03) 6px)',
    accent: '#f59e0b',
    label: 'FW\'26',
    vibe: 'DUBAI NOIR',
  },
  Athletic: {
    gradient: 'linear-gradient(135deg, #050a05 0%, #0a1a0a 40%, #001a0d 70%, #050a05 100%)',
    overlay: 'repeating-linear-gradient(90deg, transparent, transparent 4px, rgba(34,197,94,0.05) 4px, rgba(34,197,94,0.05) 5px)',
    accent: '#22c55e',
    label: 'SPORT',
    vibe: 'KINETIC FORM',
  },
  Casual: {
    gradient: 'linear-gradient(125deg, #1a0515 0%, #2a0a1a 45%, #1a051a 75%, #0a0005 100%)',
    overlay: 'repeating-linear-gradient(60deg, transparent, transparent 2px, rgba(236,72,153,0.05) 2px, rgba(236,72,153,0.05) 4px)',
    accent: '#ec4899',
    label: 'EASY',
    vibe: 'PINK ENTROPY',
  },
  Winter: {
    gradient: 'linear-gradient(155deg, #050510 0%, #0a0a20 40%, #0d0d2e 70%, #05050a 100%)',
    overlay: 'repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(102,126,234,0.04) 3px, rgba(102,126,234,0.04) 4px)',
    accent: '#818cf8',
    label: 'AW\'26',
    vibe: 'FROST LAYER',
  },
  Summer: {
    gradient: 'linear-gradient(140deg, #1a0f00 0%, #2a1800 40%, #1a0a00 70%, #0a0500 100%)',
    overlay: 'repeating-linear-gradient(135deg, transparent, transparent 2px, rgba(251,191,36,0.05) 2px, rgba(251,191,36,0.05) 5px)',
    accent: '#fbbf24',
    label: 'RESORT',
    vibe: 'SOLAR PEAK',
  },
};

const SEASONS = [
  { label: 'Spring / Summer \'26', code: 'SS26', active: true },
  { label: 'Fall / Winter \'26', code: 'FW26', active: false },
  { label: 'Resort \'27', code: 'RS27', active: false },
  { label: 'Pre-Fall \'27', code: 'PF27', active: false },
  { label: 'Capsule Drop', code: 'CAP', active: false },
];

const PULL_QUOTE = 'Style is not what you wear — it is the language your presence speaks before you open your mouth.';

// Card layout alternates to mimic editorial asymmetry
const LAYOUT_VARIANTS = ['tall', 'wide', 'square', 'square', 'wide', 'tall'];

function useParallax(ref) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useTransform(y, [-0.5, 0.5], [4, -4]);
  const rotateY = useTransform(x, [-0.5, 0.5], [-4, 4]);
  const springRotateX = useSpring(rotateX, { stiffness: 120, damping: 20 });
  const springRotateY = useSpring(rotateY, { stiffness: 120, damping: 20 });

  function onMouseMove(e) {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    x.set((e.clientX - rect.left) / rect.width - 0.5);
    y.set((e.clientY - rect.top) / rect.height - 0.5);
  }

  function onMouseLeave() {
    x.set(0);
    y.set(0);
  }

  return { rotateX: springRotateX, rotateY: springRotateY, onMouseMove, onMouseLeave };
}

function FashionCard({ item, index, layoutVariant }) {
  const config = CARD_CONFIG[item.category] || CARD_CONFIG.Streetwear;
  const ref = useRef(null);
  const { rotateX, rotateY, onMouseMove, onMouseLeave } = useParallax(ref);

  return (
    <motion.article
      ref={ref}
      className={`${styles.card} ${styles[`card--${layoutVariant}`]}`}
      layout
      initial={{ opacity: 0, y: 32 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.94 }}
      transition={{ duration: 0.5, delay: index * 0.08, ease: [0.25, 0.46, 0.45, 0.94] }}
      style={{ rotateX, rotateY, transformPerspective: 900 }}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
      whileHover={{ scale: 1.015 }}
    >
      {/* Color-blocked editorial panel */}
      <div
        className={styles.cardCanvas}
        style={{
          background: config.gradient,
          '--card-accent': config.accent,
        }}
      >
        {/* Diagonal stripe texture overlay */}
        <div
          className={styles.cardTexture}
          style={{ backgroundImage: config.overlay }}
        />

        {/* Geometric shape decoration */}
        <div className={styles.cardShape} style={{ borderColor: config.accent }} />
        <div className={styles.cardShapeInner} style={{ background: `${config.accent}12` }} />

        {/* Vibe label — large editorial type watermark */}
        <div className={styles.cardVibe}>{config.vibe}</div>

        {/* Season tag top-right */}
        <div className={styles.cardSeason} style={{ color: config.accent, borderColor: `${config.accent}44` }}>
          {config.label}
        </div>

        {/* Hover reveal: description with backdrop blur */}
        <motion.div
          className={styles.cardReveal}
          initial={{ opacity: 0 }}
          whileHover={{ opacity: 1 }}
          transition={{ duration: 0.25 }}
        >
          <p className={styles.cardRevealText}>{item.description}</p>
        </motion.div>
      </div>

      {/* Card footer metadata */}
      <div className={styles.cardFooter}>
        <div className={styles.cardMeta}>
          <h3 className={styles.cardTitle}>{item.title}</h3>
          <span
            className={styles.cardTag}
            style={{ color: config.accent, borderColor: `${config.accent}55` }}
          >
            {item.category}
          </span>
        </div>
        <div className={styles.cardIndex}>
          {String(index + 1).padStart(2, '0')}
        </div>
      </div>
    </motion.article>
  );
}

export default function FashionSection() {
  const categories = useMemo(() => {
    const cats = [...new Set(FASHION_ITEMS.map((item) => item.category))];
    return ['All', ...cats];
  }, []);

  const [activeCategory, setActiveCategory] = useState('All');

  const filteredItems = useMemo(() => {
    if (activeCategory === 'All') return FASHION_ITEMS;
    return FASHION_ITEMS.filter((item) => item.category === activeCategory);
  }, [activeCategory]);

  return (
    <div className={styles.fashion}>
      {/* Grain texture overlay — pure CSS animated noise */}
      <div className={styles.grain} aria-hidden="true" />

      {/* ===== EDITORIAL HEADER ===== */}
      <header className={styles.header}>
        <motion.div
          className={styles.headerEyebrow}
          initial={{ opacity: 0, x: -24 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <span className={styles.eyebrowLine} />
          <span className={styles.eyebrowText}>The Style Particle</span>
          <span className={styles.eyebrowLine} />
        </motion.div>

        <motion.h2
          className={styles.displayTitle}
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.1, ease: [0.25, 0.46, 0.45, 0.94] }}
        >
          <span className={styles.displayTitleMain}>{persona.title}</span>
          <span className={styles.displayTitleSub}>by Mahesh Inder</span>
        </motion.h2>

        <motion.p
          className={styles.tagline}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.25 }}
        >
          {persona.tagline}
        </motion.p>
      </header>

      {/* ===== SEASON HORIZONTAL SCROLL ===== */}
      <motion.div
        className={styles.seasonStrip}
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay: 0.3 }}
        aria-label="Collections"
      >
        <div className={styles.seasonScroll}>
          {SEASONS.map((s) => (
            <div
              key={s.code}
              className={`${styles.seasonItem} ${s.active ? styles.seasonItemActive : ''}`}
            >
              <span className={styles.seasonCode}>{s.code}</span>
              <span className={styles.seasonLabel}>{s.label}</span>
              {s.active && <span className={styles.seasonDot} />}
            </div>
          ))}
        </div>
      </motion.div>

      {/* ===== PULL QUOTE ===== */}
      <motion.blockquote
        className={styles.pullQuote}
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7, delay: 0.15 }}
      >
        <span className={styles.pullQuoteMark}>&ldquo;</span>
        <p className={styles.pullQuoteText}>{PULL_QUOTE}</p>
        <cite className={styles.pullQuoteCite}>— Mahesh Inder, Dubai</cite>
      </motion.blockquote>

      {/* ===== CATEGORY FILTER PILLS ===== */}
      <motion.div
        className={styles.filterBar}
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: 0.2 }}
        role="group"
        aria-label="Filter by category"
      >
        <span className={styles.filterLabel}>COLLECTION</span>
        {categories.map((cat) => (
          <button
            key={cat}
            className={`${styles.filterPill} ${activeCategory === cat ? styles.filterPillActive : ''}`}
            onClick={() => setActiveCategory(cat)}
            aria-pressed={activeCategory === cat}
          >
            {cat === 'All' ? 'All Pieces' : cat}
          </button>
        ))}
      </motion.div>

      {/* ===== EDITORIAL LOOKBOOK GRID ===== */}
      <motion.div className={styles.lookbook} layout>
        <AnimatePresence mode="popLayout">
          {filteredItems.map((item, i) => (
            <FashionCard
              key={item.id}
              item={item}
              index={i}
              layoutVariant={LAYOUT_VARIANTS[i % LAYOUT_VARIANTS.length]}
            />
          ))}
        </AnimatePresence>
      </motion.div>

      {/* ===== EDITORIAL FOOTER STRIP ===== */}
      <motion.div
        className={styles.editorialFooter}
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, delay: 0.2 }}
      >
        <span className={styles.editorialFooterItem}>Streetwear</span>
        <span className={styles.editorialSep}>×</span>
        <span className={styles.editorialFooterItem}>Formal</span>
        <span className={styles.editorialSep}>×</span>
        <span className={styles.editorialFooterItem}>Dubai Style</span>
        <span className={styles.editorialSep}>×</span>
        <span className={styles.editorialFooterItem}>Hypebeast</span>
        <span className={styles.editorialSep}>×</span>
        <span className={styles.editorialFooterItem}>Editorial</span>
      </motion.div>
    </div>
  );
}
