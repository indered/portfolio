import { useRef } from 'react';
import { motion, useInView } from 'motion/react';
import { useTokens } from '../../context/TokenContext';
import styles from './SectionWrapper.module.scss';

export default function SectionWrapper({ id, children, className = '' }) {
  const sectionRef = useRef(null);
  const hasAwarded = useRef(false);
  const { earnTokens } = useTokens();
  const isInView = useInView(sectionRef, { once: true, amount: 0.3 });

  if (isInView && !hasAwarded.current) {
    hasAwarded.current = true;
    earnTokens('EXPLORE_SECTION');
  }

  return (
    <section id={id} ref={sectionRef} className={`${styles.section} ${className}`}>
      <motion.div
        className={styles.content}
        initial={{ opacity: 0, y: 60 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
      >
        {children}
      </motion.div>
    </section>
  );
}
