import { motion } from 'motion/react';
import styles from './DubaiSkyline.module.scss';

// ── Skyline silhouette data ───────────────────────────────────────────────────
const BUILDINGS = [
  { x: 2,  w: 8,  h: 55, rx: 1 },   // Short tower left
  { x: 12, w: 6,  h: 40, rx: 0 },   // Cube building
  { x: 20, w: 10, h: 70, rx: 1 },   // Emirates Tower 1
  { x: 32, w: 9,  h: 65, rx: 1 },   // Emirates Tower 2
  { x: 43, w: 7,  h: 50, rx: 0 },   // Mid building
  { x: 52, w: 5,  h: 85, rx: 0 },   // Thin tall tower
  { x: 59, w: 12, h: 45, rx: 1 },   // Wide low
  { x: 73, w: 4,  h: 100, rx: 0 },  // Burj Khalifa spire base
  { x: 78, w: 8,  h: 60, rx: 1 },   // Adjacent tower
  { x: 88, w: 6,  h: 35, rx: 0 },   // Small right
  { x: 96, w: 10, h: 50, rx: 1 },   // Right cluster
];

const BURJ_KHALIFA_PATH =
  'M75 180 L75 40 L73.5 38 L73 30 L72.8 20 L73.5 8 L75 2 L76.5 8 L77.2 20 L77 30 L76.5 38 L75 40 Z';

const BURJ_AL_ARAB_PATH =
  'M15 180 L15 120 Q15 100 20 90 Q28 75 30 70 L30 180 Z';

// Deep Dubai-night blue — calm, no neon
const DEEP_BLUE = '#1C2438';

export default function DubaiSkyline() {
  return (
    <div className={styles.skylineWrap}>
      <svg
        className={styles.skyline}
        viewBox="0 0 110 180"
        preserveAspectRatio="xMidYMax slice"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="skyGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="rgba(28,36,56,0.0)" />
            <stop offset="100%" stopColor="rgba(28,36,56,0.05)" />
          </linearGradient>
          <linearGradient id="buildingGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="rgba(28,36,56,0.90)" />
            <stop offset="100%" stopColor="rgba(28,36,56,0.65)" />
          </linearGradient>
        </defs>

        {/* Ground line */}
        <motion.line
          x1="0" y1="180" x2="110" y2="180"
          stroke="rgba(28,36,56,0.25)"
          strokeWidth="0.5"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1.5, ease: 'easeOut' }}
        />

        {/* Burj Al Arab (sail shape, left side) */}
        <motion.path
          d={BURJ_AL_ARAB_PATH}
          fill="url(#buildingGrad)"
          stroke="rgba(28,36,56,0.35)"
          strokeWidth="0.3"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.2 }}
        />

        {/* Buildings */}
        {BUILDINGS.map((b, i) => (
          <motion.rect
            key={i}
            x={b.x}
            y={180 - b.h}
            width={b.w}
            height={b.h}
            rx={b.rx}
            fill="url(#buildingGrad)"
            stroke="rgba(28,36,56,0.25)"
            strokeWidth="0.3"
            initial={{ scaleY: 0, opacity: 0 }}
            animate={{ scaleY: 1, opacity: 1 }}
            transition={{
              duration: 0.6,
              delay: 0.3 + i * 0.08,
              ease: 'easeOut',
            }}
            style={{ transformOrigin: `${b.x + b.w / 2}px 180px` }}
          />
        ))}

        {/* Burj Khalifa (custom spire) */}
        <motion.path
          d={BURJ_KHALIFA_PATH}
          fill="url(#buildingGrad)"
          stroke="rgba(28,36,56,0.40)"
          strokeWidth="0.4"
          initial={{ scaleY: 0, opacity: 0 }}
          animate={{ scaleY: 1, opacity: 1 }}
          transition={{ duration: 1, delay: 0.8, ease: 'easeOut' }}
          style={{ transformOrigin: '75px 180px' }}
        />

        {/* Window lights — amber warm dots, subtle */}
        {[
          [22, 125], [24, 135], [26, 145], [22, 155],
          [54, 105], [54, 115], [54, 125], [54, 145],
          [74, 50],  [74, 70],  [74, 90],  [74, 110], [74, 130], [74, 150],
          [80, 135], [82, 145], [80, 155],
          [98, 145], [100, 155], [102, 145],
          [34, 130], [36, 140], [34, 150],
        ].map(([cx, cy], i) => (
          <motion.circle
            key={`light-${i}`}
            cx={cx}
            cy={cy}
            r="0.5"
            fill="rgba(200,133,63,0.55)"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.7, 0.35, 0.7] }}
            transition={{
              duration: 3.5,
              delay: 1.5 + i * 0.1,
              repeat: Infinity,
              repeatType: 'reverse',
            }}
          />
        ))}
      </svg>

      {/* Label */}
      <motion.span
        className={styles.label}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 2 }}
      >
        Dubai, UAE
      </motion.span>
    </div>
  );
}
