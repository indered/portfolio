import { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { useTokens } from '../../context/TokenContext';
import { TOKEN_CONFIG } from '../../lib/constants';
import styles from './TokenWallet.module.scss';

const HIDDEN_ROUTES = ['/ask', '/inbox'];

function AnimatedCounter({ value }) {
  const [displayed, setDisplayed] = useState(0);
  const prevRef = useRef(0);

  useEffect(() => {
    const start = prevRef.current;
    const end = value;
    if (start === end) return;

    const duration = 600;
    const startTime = performance.now();

    function animate(now) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayed(Math.round(start + (end - start) * eased));
      if (progress < 1) requestAnimationFrame(animate);
    }

    requestAnimationFrame(animate);
    prevRef.current = end;
  }, [value]);

  return <span>{displayed}</span>;
}

function CoinIcon() {
  return (
    <svg
      className={styles.coinIcon}
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M12 6v12" />
      <path d="M15.5 9.4a3.5 3.5 0 1 0 0 5.2" />
    </svg>
  );
}

export default function TokenWallet() {
  const location = useLocation();
  const { sessionTokens, totalTokens, recentAction } = useTokens();

  if (HIDDEN_ROUTES.includes(location.pathname)) return null;
  const [expanded, setExpanded] = useState(false);
  const [floatingPlus, setFloatingPlus] = useState(null);
  const [coinParticles, setCoinParticles] = useState([]);
  const prevTokensRef = useRef(sessionTokens);
  const walletRef = useRef(null);

  // Close on outside click
  useEffect(() => {
    if (!expanded) return;
    const handleClick = (e) => {
      if (walletRef.current && !walletRef.current.contains(e.target)) {
        setExpanded(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [expanded]);

  const { causes, tokenValue: tokenValueINR } = TOKEN_CONFIG;
  const currentCause = causes[0];

  // Detect token earning — trigger floating +N and coin burst animation
  useEffect(() => {
    if (recentAction && sessionTokens > prevTokensRef.current) {
      const diff = sessionTokens - prevTokensRef.current;

      // Floating +N label
      setFloatingPlus({ amount: diff, id: recentAction.timestamp });
      const t1 = setTimeout(() => setFloatingPlus(null), 1200);

      // Coin particles — 3 to 5 depending on amount earned
      const count = Math.min(Math.max(diff + 2, 3), 5);
      const particles = Array.from({ length: count }, (_, i) => ({
        id: `${recentAction.timestamp}-${i}`,
        // Start scattered around the pill, converge to coin icon
        startX: (Math.random() - 0.5) * 80,
        startY: -(30 + Math.random() * 60),
        delay: i * 0.07,
      }));
      setCoinParticles(particles);
      const t2 = setTimeout(() => setCoinParticles([]), 900);

      prevTokensRef.current = sessionTokens;
      return () => { clearTimeout(t1); clearTimeout(t2); };
    }
    prevTokensRef.current = sessionTokens;
  }, [sessionTokens, recentAction]);

  const actionLabel = recentAction
    ? TOKEN_CONFIG.actions[recentAction.action]?.label || ''
    : '';

  // Calculate equivalent donation in INR
  const equivalentINR = totalTokens * tokenValueINR;
  const formattedINR = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
  }).format(equivalentINR);

  return (
    <div className={styles.wrapper} ref={walletRef}>
      {/* Collapsed Pill */}
      <motion.button
        className={styles.pill}
        onClick={() => setExpanded((v) => !v)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.97 }}
        layout
      >
        <CoinIcon />
        <span className={styles.pillCount}>
          <AnimatedCounter value={sessionTokens} />
        </span>

        {/* Coin burst — particles fly in from above and converge to the coin icon */}
        <AnimatePresence>
          {coinParticles.map((p) => (
            <motion.span
              key={p.id}
              className={styles.coinParticle}
              aria-hidden="true"
              initial={{ x: p.startX, y: p.startY, scale: 1, opacity: 1 }}
              animate={{ x: 0, y: 0, scale: 0, opacity: 0 }}
              transition={{ duration: 0.55, delay: p.delay, ease: [0.4, 0, 0.6, 1] }}
            />
          ))}
        </AnimatePresence>

        {/* Floating +N indicator */}
        <AnimatePresence>
          {floatingPlus && (
            <motion.span
              key={floatingPlus.id}
              className={styles.floatingPlus}
              initial={{ opacity: 1, y: 0 }}
              animate={{ opacity: 0, y: -30 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1, ease: 'easeOut' }}
            >
              +{floatingPlus.amount}
            </motion.span>
          )}
        </AnimatePresence>
      </motion.button>

      {/* Expanded Card */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            className={styles.card}
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
          >
            <h3 className={styles.cardTitle}>Inder Tokens</h3>

            {/* Single big number — total tokens */}
            <div className={styles.totalRow}>
              <span className={styles.totalNumber}>
                <AnimatedCounter value={totalTokens} />
              </span>
              <span className={styles.totalCaption}>tokens · {formattedINR} pledged</span>
            </div>

            {/* Causes — minimal stacked */}
            <div className={styles.causes}>
              {causes.map((cause, i) => (
                <div key={i} className={styles.causeRow}>
                  <div className={styles.causeMeta}>
                    <span className={styles.causeMonth}>{cause.month}</span>
                    <span className={styles.causeTitle}>{cause.title}</span>
                  </div>
                  <p className={styles.causeDesc}>{cause.description}</p>
                </div>
              ))}
            </div>

            <p className={styles.exploreNote}>The more you explore, the more you collect.</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
