import { useRef } from 'react';
import { motion, useInView } from 'motion/react';
import { PERSONAS, STARTUP_INFO } from '../../lib/constants';
import styles from './BlockchainAISection.module.scss';

const persona = PERSONAS.ventures;

// ── Network graph data — neutral gray, entrance animation only ────────────────
const NODES = [
  { id: 'n1', cx: 40,  cy: 110 },
  { id: 'n2', cx: 120, cy: 55  },
  { id: 'n3', cx: 120, cy: 165 },
  { id: 'n4', cx: 220, cy: 30  },
  { id: 'n5', cx: 220, cy: 110 },
  { id: 'n6', cx: 220, cy: 190 },
  { id: 'n7', cx: 320, cy: 70  },
  { id: 'n8', cx: 320, cy: 150 },
  { id: 'n9', cx: 390, cy: 110 },
];

const EDGES = [
  { from: 'n1', to: 'n2' },
  { from: 'n1', to: 'n3' },
  { from: 'n2', to: 'n4' },
  { from: 'n2', to: 'n5' },
  { from: 'n3', to: 'n5' },
  { from: 'n3', to: 'n6' },
  { from: 'n4', to: 'n7' },
  { from: 'n5', to: 'n7' },
  { from: 'n5', to: 'n8' },
  { from: 'n6', to: 'n8' },
  { from: 'n7', to: 'n9' },
  { from: 'n8', to: 'n9' },
];

function getNode(id) {
  return NODES.find((n) => n.id === id);
}

function pathLength(from, to) {
  const dx = to.cx - from.cx;
  const dy = to.cy - from.cy;
  return Math.sqrt(dx * dx + dy * dy);
}

function hexPoints(cx, cy, r) {
  return Array.from({ length: 6 }, (_, i) => {
    const angle = (Math.PI / 180) * (60 * i - 30);
    return `${cx + r * Math.cos(angle)},${cy + r * Math.sin(angle)}`;
  }).join(' ');
}

// ── Neutral Gray Network SVG ──────────────────────────────────────────────────
function BlockchainNetwork({ inView }) {
  return (
    <svg
      className={styles.networkSvg}
      viewBox="0 0 430 220"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      {/* Edges — entrance draw animation only, no continuous glow */}
      <g>
        {EDGES.map(({ from, to }, i) => {
          const a = getNode(from);
          const b = getNode(to);
          const len = pathLength(a, b);
          return (
            <line
              key={`${from}-${to}`}
              x1={a.cx} y1={a.cy}
              x2={b.cx} y2={b.cy}
              className={styles.networkEdge}
              strokeDasharray={len}
              strokeDashoffset={inView ? 0 : len}
              style={{
                transitionDelay: `${i * 0.15}s`,
                transitionDuration: '0.6s',
                transitionTimingFunction: 'ease-out',
                transitionProperty: 'stroke-dashoffset',
              }}
            />
          );
        })}
      </g>

      {/* Hex nodes — entrance animation only, no continuous pulsing */}
      <g>
        {NODES.map((node, i) => {
          const delay = `${0.1 + i * 0.07}s`;
          return (
            <g key={node.id} className={styles.nodeGroup}>
              <polygon
                points={hexPoints(node.cx, node.cy, 13)}
                className={styles.hexOuter}
                style={{
                  transitionDelay: delay,
                  opacity: inView ? 1 : 0,
                  transform: inView ? 'scale(1)' : 'scale(0)',
                  transformOrigin: `${node.cx}px ${node.cy}px`,
                  transitionDuration: '0.45s',
                  transitionTimingFunction: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
                  transitionProperty: 'opacity, transform',
                }}
              />
              <polygon
                points={hexPoints(node.cx, node.cy, 7)}
                className={styles.hexInner}
                style={{
                  transitionDelay: `${parseFloat(delay) + 0.08}s`,
                  opacity: inView ? 1 : 0,
                  transitionDuration: '0.35s',
                  transitionProperty: 'opacity',
                }}
              />
            </g>
          );
        })}
      </g>
    </svg>
  );
}

// ── Venture status pill ───────────────────────────────────────────────────────
function StatusPill({ status }) {
  const mod =
    status === 'Active'  ? styles.pillActive  :
    status === 'Exited'  ? styles.pillExited  :
                           styles.pillStealth;
  return <span className={`${styles.statusPill} ${mod}`}>{status}</span>;
}

// ── Single venture card ───────────────────────────────────────────────────────
function VentureCard({ venture, index, inView }) {
  return (
    <motion.div
      className={styles.ventureCard}
      initial={{ opacity: 0, y: 24 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay: 0.1 + index * 0.12, ease: 'easeOut' }}
    >
      <div className={styles.ventureCardTop}>
        <div className={styles.ventureCardMeta}>
          <span className={styles.ventureType}>{venture.type}</span>
          <StatusPill status={venture.status} />
        </div>
        <span className={styles.ventureYear}>{venture.year}</span>
      </div>
      <h3 className={styles.ventureName}>{venture.name}</h3>
      <p className={styles.ventureDesc}>{venture.description}</p>
    </motion.div>
  );
}

// ── Key metrics strip ─────────────────────────────────────────────────────────
function MetricsStrip({ inView }) {
  const metrics = [
    { value: '2024',     label: 'Founded'  },
    { value: 'DIFC',     label: 'Location' },
    { value: 'Pre-seed', label: 'Stage'    },
  ];

  return (
    <motion.div
      className={styles.metricsStrip}
      initial={{ opacity: 0 }}
      animate={inView ? { opacity: 1 } : {}}
      transition={{ duration: 0.6, delay: 0.25 }}
      aria-label="Key metrics"
    >
      <div className={styles.metricsRule} aria-hidden="true" />
      <div className={styles.metricsRow}>
        {metrics.map((m, i) => (
          <div key={m.label} className={styles.metricItem}>
            <motion.span
              className={styles.metricValue}
              initial={{ opacity: 0, y: 12 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.35 + i * 0.1 }}
            >
              {m.value}
            </motion.span>
            <span className={styles.metricLabel}>{m.label}</span>
          </div>
        ))}
      </div>
      <div className={styles.metricsRule} aria-hidden="true" />
    </motion.div>
  );
}

// ── Focus area tile ───────────────────────────────────────────────────────────
function FocusTile({ label, index, inView }) {
  return (
    <motion.div
      className={styles.focusTile}
      initial={{ opacity: 0, y: 16 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.45, delay: 0.3 + index * 0.1, ease: 'easeOut' }}
    >
      <span className={styles.focusTileNumber}>0{index + 1}</span>
      <span className={styles.focusTileLabel}>{label}</span>
    </motion.div>
  );
}

// ── DIFC / legitimacy badge ───────────────────────────────────────────────────
function ContextBadge({ label, inView, delay }) {
  return (
    <motion.div
      className={styles.contextBadge}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={inView ? { opacity: 1, scale: 1 } : {}}
      transition={{ duration: 0.35, delay }}
    >
      <span className={styles.contextBadgeIcon} aria-hidden="true">◆</span>
      {label}
    </motion.div>
  );
}

// ── Arc Protocol "whitepaper" card ────────────────────────────────────────────
function PitchCard({ inView }) {
  return (
    <motion.div
      className={styles.pitchCard}
      initial={{ opacity: 0, x: 30 }}
      animate={inView ? { opacity: 1, x: 0 } : {}}
      transition={{ duration: 0.7, delay: 0.5, ease: 'easeOut' }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
    >
      <div className={styles.pitchCardHeader}>
        <span className={styles.pitchCardLabel}>WHITEPAPER</span>
        <span className={styles.pitchCardAccent} aria-hidden="true" />
      </div>
      <div className={styles.pitchCardTitle}>{STARTUP_INFO.name}</div>
      <div className={styles.pitchCardSubtitle}>{STARTUP_INFO.focus[0]}</div>
      <div className={styles.pitchCardLines} aria-hidden="true">
        {Array.from({ length: 5 }).map((_, i) => (
          <span key={i} className={styles.pitchCardLine} style={{ width: `${78 - i * 10}%` }} />
        ))}
      </div>
      <div className={styles.pitchCardFooter}>
        <span className={styles.pitchCardFooterItem}>Pre-seed · DIFC</span>
        <span className={styles.pitchCardFooterItem}>Dubai, UAE</span>
      </div>
    </motion.div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function BlockchainAISection() {
  const sectionRef = useRef(null);
  const networkRef = useRef(null);
  const venturesRef = useRef(null);

  const inView         = useInView(sectionRef,  { once: true, amount: 0.1 });
  const networkInView  = useInView(networkRef,  { once: true, amount: 0.2 });
  const venturesInView = useInView(venturesRef, { once: true, amount: 0.15 });

  return (
    <div className={styles.blockchain} ref={sectionRef}>

      {/* ── Subtle grid background — no glow, no particles ── */}
      <div className={styles.bgLayer} aria-hidden="true">
        <svg className={styles.bgGrid} xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          <defs>
            <pattern id="blockGrid" width="48" height="48" patternUnits="userSpaceOnUse">
              <path d="M 48 0 L 0 0 0 48" fill="none" stroke="rgba(0,0,0,0.04)" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#blockGrid)" />
        </svg>
      </div>

      {/* ── HERO ── */}
      <div className={styles.hero}>
        <div className={styles.heroContent}>

          {/* Company name + title */}
          <motion.div
            className={styles.heroEyebrow}
            initial={{ opacity: 0, y: -8 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.4 }}
          >
            <span className={styles.eyebrowText}>FOUNDER &amp; OPERATOR</span>
          </motion.div>

          <motion.h2
            className={styles.heroTitle}
            initial={{ opacity: 0, y: 24 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.08 }}
          >
            {STARTUP_INFO.name}
          </motion.h2>

          {/* Status badge — clean, no animation */}
          <motion.div
            className={styles.statusBadge}
            initial={{ opacity: 0 }}
            animate={inView ? { opacity: 1 } : {}}
            transition={{ duration: 0.4, delay: 0.2 }}
          >
            <span className={styles.statusDot} aria-hidden="true" />
            <span className={styles.statusText}>BUILDING</span>
            <span className={styles.statusSep} aria-hidden="true">·</span>
            <span className={styles.statusDetail}>{STARTUP_INFO.status}</span>
          </motion.div>

          <motion.p
            className={styles.heroTagline}
            initial={{ opacity: 0, y: 16 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.55, delay: 0.28 }}
          >
            {STARTUP_INFO.tagline}
          </motion.p>

          {/* DIFC legitimacy badges */}
          <div className={styles.contextBadges}>
            <ContextBadge label="DIFC FinTech Hive"         inView={inView} delay={0.42} />
            <ContextBadge label="Dubai Blockchain Strategy" inView={inView} delay={0.52} />
            <ContextBadge label="Web3 Capital"              inView={inView} delay={0.62} />
          </div>
        </div>

        {/* Right column: persona tagline pull-quote */}
        <motion.div
          className={styles.heroPullQuote}
          initial={{ opacity: 0, x: 24 }}
          animate={inView ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.35 }}
          aria-label="Founder tagline"
        >
          <span className={styles.pullQuoteGlyph} aria-hidden="true">&ldquo;</span>
          <p className={styles.pullQuoteText}>{persona.tagline}</p>
        </motion.div>
      </div>

      {/* ── KEY METRICS STRIP ── */}
      <MetricsStrip inView={inView} />

      {/* ── VENTURES PORTFOLIO ── */}
      <div className={styles.venturesSection} ref={venturesRef}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionLabel}>VENTURES</span>
          <div className={styles.sectionHeaderLine} aria-hidden="true" />
        </div>
        <div className={styles.venturesGrid}>
          {STARTUP_INFO.ventures.map((v, i) => (
            <VentureCard key={v.name} venture={v} index={i} inView={venturesInView} />
          ))}
        </div>
      </div>

      {/* ── NETWORK DIAGRAM + PITCH CARD ── */}
      <div className={styles.networkSection} ref={networkRef}>
        <motion.div
          className={styles.networkHeader}
          initial={{ opacity: 0 }}
          animate={networkInView ? { opacity: 1 } : {}}
          transition={{ duration: 0.45 }}
        >
          <span className={styles.sectionLabel}>PROTOCOL TOPOLOGY</span>
          <div className={styles.networkStats}>
            <span className={styles.networkStat}><em>9</em> nodes</span>
            <span className={styles.networkStat}><em>12</em> edges</span>
            <span className={styles.networkStat}><em>0.3s</em> finality</span>
          </div>
        </motion.div>

        <div className={styles.networkCanvas}>
          <BlockchainNetwork inView={networkInView} />
          <PitchCard inView={networkInView} />
        </div>
      </div>

      {/* ── STARTUP DESCRIPTION + VISION QUOTE ── */}
      <motion.div
        className={styles.startupSpread}
        initial={{ opacity: 0, y: 32 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6, delay: 0.15 }}
      >
        <div className={styles.startupLeft}>
          <span className={styles.sectionLabel}>ABOUT THE VENTURE</span>
          <p className={styles.startupDescription}>{STARTUP_INFO.description}</p>
        </div>

        <motion.blockquote
          className={styles.visionQuote}
          initial={{ opacity: 0, x: 16 }}
          animate={inView ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.32 }}
        >
          <div className={styles.visionQuoteInner}>
            <span className={styles.visionQuoteGlyph} aria-hidden="true">&ldquo;</span>
            <p className={styles.visionText}>{STARTUP_INFO.vision}</p>
          </div>
          <div className={styles.visionQuoteAttrib}>
            <span className={styles.visionQuoteAuthor}>Mahesh Inder</span>
            <span className={styles.visionQuoteRole}>Founder, Arc Protocol — DIFC, Dubai</span>
          </div>
        </motion.blockquote>
      </motion.div>

      {/* ── FOCUS AREAS ── */}
      <div className={styles.focusSection}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionLabel}>FOCUS AREAS</span>
          <div className={styles.sectionHeaderLine} aria-hidden="true" />
        </div>
        <div className={styles.focusTiles}>
          {STARTUP_INFO.focus.map((area, i) => (
            <FocusTile key={area} label={area} index={i} inView={inView} />
          ))}
        </div>
      </div>

      {/* ── Bottom rule ── */}
      <motion.div
        className={styles.sectionDivider}
        initial={{ scaleX: 0 }}
        animate={inView ? { scaleX: 1 } : {}}
        transition={{ duration: 1.0, delay: 0.6 }}
        aria-hidden="true"
      />
    </div>
  );
}
