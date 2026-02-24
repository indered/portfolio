import { useRef, useEffect, useState } from 'react';
import { motion, useInView } from 'motion/react';
import { PERSONAS, RUNNING_STATS } from '../../lib/constants';
import styles from './RunnerSection.module.scss';

const persona = PERSONAS.runner;

// ── Recent runs — Dubai context ────────────────────────────────────────────────
const RUNS = [
  {
    day: '14', month: 'FEB',
    distance: '10.5', unit: 'km',
    title: 'Palm Jumeirah Loop',
    pace: "5'33\"", duration: '58:22', type: 'EASY',
  },
  {
    day: '12', month: 'FEB',
    distance: '5.2', unit: 'km',
    title: 'Downtown Dawn Recovery',
    pace: "5'20\"", duration: '27:45', type: 'RECOVERY',
  },
  {
    day: '10', month: 'FEB',
    distance: '21.1', unit: 'km',
    title: 'Al Qudra Desert Trail',
    pace: "5'19\"", duration: '1:52:30', type: 'LONG',
  },
  {
    day: '08', month: 'FEB',
    distance: '8.0', unit: 'km',
    title: 'JBR Beach Tempo',
    pace: "5'24\"", duration: '43:12', type: 'TEMPO',
  },
];

// ── Count-up hook ──────────────────────────────────────────────────────────────
function useCountUp(target, active, duration = 1600) {
  const [val, setVal] = useState(0);
  const done = useRef(false);

  useEffect(() => {
    if (!active || done.current) return;
    done.current = true;
    const num = parseFloat(String(target).replace(/[^0-9.]/g, ''));
    if (isNaN(num)) { setVal(target); return; }
    const start = performance.now();
    const tick = (now) => {
      const p = Math.min((now - start) / duration, 1);
      const e = 1 - Math.pow(2, -10 * p);
      setVal(p < 1 ? Math.floor(num * e) : num);
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [active, target, duration]);

  return val;
}

// ── Stat item — number + unit + label, no box ──────────────────────────────────
function Stat({ raw, label, decimals = 0, prefix = '', suffix = '', delay = 0 }) {
  const ref = useRef();
  const inView = useInView(ref, { once: true, amount: 0.5 });
  const numeric = parseFloat(String(raw).replace(/[^0-9.]/g, ''));
  const count = useCountUp(numeric, inView);

  const display = isNaN(numeric)
    ? raw
    : decimals > 0
      ? count.toFixed(decimals)
      : count >= 1000
        ? count.toLocaleString()
        : count;

  return (
    <motion.div
      ref={ref}
      className={styles.stat}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className={styles.statNumber}>
        {prefix}<span className={styles.statCount}>{display}</span>
        {suffix && <span className={styles.statSuffix}>{suffix}</span>}
      </div>
      <div className={styles.statLabel}>{label}</div>
    </motion.div>
  );
}

// ── Type badge color ───────────────────────────────────────────────────────────
const TYPE_OPACITY = { EASY: 0.5, RECOVERY: 0.45, LONG: 0.85, TEMPO: 0.7 };

// ── Run row ────────────────────────────────────────────────────────────────────
function RunRow({ run, index }) {
  return (
    <motion.div
      className={styles.row}
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.45, delay: index * 0.07, ease: [0.16, 1, 0.3, 1] }}
    >
      {/* Date */}
      <div className={styles.rowDate}>
        <span className={styles.rowDay}>{run.day}</span>
        <span className={styles.rowMonth}>{run.month}</span>
      </div>

      {/* Distance — the dominant number */}
      <div className={styles.rowDist}>
        <span className={styles.rowDistNum}>{run.distance}</span>
        <span className={styles.rowDistUnit}>{run.unit}</span>
      </div>

      {/* Route name */}
      <div className={styles.rowRoute}>
        <span className={styles.rowTitle}>{run.title}</span>
      </div>

      {/* Meta: pace · duration · type */}
      <div className={styles.rowMeta}>
        <span className={styles.rowPace}>{run.pace}/km</span>
        <span className={styles.rowDuration}>{run.duration}</span>
        <span
          className={styles.rowType}
          style={{ opacity: TYPE_OPACITY[run.type] ?? 0.6 }}
        >
          {run.type}
        </span>
      </div>
    </motion.div>
  );
}

// ── Root ───────────────────────────────────────────────────────────────────────
export default function RunnerSection() {
  return (
    <div className={styles.runner}>

      {/* ── HERO ──────────────────────────────────────────────── */}
      <section className={styles.hero}>
        <motion.div
          className={styles.eyebrow}
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <span className={styles.eyebrowDot} />
          Dubai, UAE — Marathon Runner
        </motion.div>

        <motion.h2
          className={styles.title}
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.65, delay: 0.08 }}
        >
          {persona.title}
        </motion.h2>

        <motion.p
          className={styles.tagline}
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.55, delay: 0.18 }}
        >
          {persona.tagline}
        </motion.p>

        <motion.div
          className={styles.atmosphere}
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.28 }}
        >
          5:15 AM · Palm Jumeirah · 28°C
        </motion.div>
      </section>

      {/* ── STATS ─────────────────────────────────────────────── */}
      <section className={styles.statsRow}>
        <Stat raw={RUNNING_STATS.totalDistance} label="total distance" suffix=" km" delay={0} />
        <div className={styles.statsDivider} />
        <Stat raw={RUNNING_STATS.totalRuns} label="runs completed" delay={0.08} />
        <div className={styles.statsDivider} />
        <Stat raw={RUNNING_STATS.longestRun} label="longest run" suffix=" km" decimals={1} delay={0.16} />
        <div className={styles.statsDivider} />
        <Stat raw={RUNNING_STATS.avgPace} label="avg pace / km" delay={0.24} />
      </section>

      {/* ── RUNS LOG ──────────────────────────────────────────── */}
      <section className={styles.log}>
        <motion.div
          className={styles.logHeader}
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
        >
          <span className={styles.logTitle}>Recent Runs</span>
          <span className={styles.logSub}>Before the desert heat rises</span>
        </motion.div>

        <div className={styles.logList}>
          {RUNS.map((run, i) => (
            <RunRow key={run.day + run.month} run={run} index={i} />
          ))}
        </div>
      </section>

    </div>
  );
}
