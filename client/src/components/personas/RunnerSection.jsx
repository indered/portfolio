import { useRef, useEffect, useState } from 'react';
import { useInView } from 'motion/react';
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
function Stat({ raw, label, decimals = 0, prefix = '', suffix = '' }) {
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
    <div ref={ref} className={styles.stat}>
      <div className={styles.statNumber}>
        {prefix}<span className={styles.statCount}>{display}</span>
        {suffix && <span className={styles.statSuffix}>{suffix}</span>}
      </div>
      <div className={styles.statLabel}>{label}</div>
    </div>
  );
}

// ── Type badge color ───────────────────────────────────────────────────────────
const TYPE_OPACITY = { EASY: 0.5, RECOVERY: 0.45, LONG: 0.85, TEMPO: 0.7 };

// ── Run row ────────────────────────────────────────────────────────────────────
function RunRow({ run }) {
  return (
    <div className={styles.row}>
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
    </div>
  );
}

// ── Root ───────────────────────────────────────────────────────────────────────
export default function RunnerSection() {
  return (
    <div className={styles.runner}>

      {/* ── HERO */}
      <section className={styles.hero}>
        <div className={styles.eyebrow}>
          <span className={styles.eyebrowDot} />
          Dubai, UAE — Marathon Runner
        </div>

        <h2 className={styles.title}>
          {persona.title}
        </h2>

        <p className={styles.tagline}>
          {persona.tagline}
        </p>

        <div className={styles.atmosphere}>
          5:15 AM · Palm Jumeirah · 28°C
        </div>
      </section>

      {/* ── STATS */}
      <section className={styles.statsRow}>
        <Stat raw={RUNNING_STATS.totalDistance} label="total distance" suffix=" km" />
        <div className={styles.statsDivider} />
        <Stat raw={RUNNING_STATS.totalRuns} label="runs completed" />
        <div className={styles.statsDivider} />
        <Stat raw={RUNNING_STATS.longestRun} label="longest run" suffix=" km" decimals={1} />
        <div className={styles.statsDivider} />
        <Stat raw={RUNNING_STATS.avgPace} label="avg pace / km" />
      </section>

      {/* ── RUNS LOG */}
      <section className={styles.log}>
        <div className={styles.logHeader}>
          <span className={styles.logTitle}>Recent Runs</span>
          <span className={styles.logSub}>Before the desert heat rises</span>
        </div>

        <div className={styles.logList}>
          {RUNS.map((run) => (
            <RunRow key={run.day + run.month} run={run} />
          ))}
        </div>
      </section>

    </div>
  );
}
