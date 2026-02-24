import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import PersonaPlanet from '../landing/PersonaPlanet';
import { PERSONAS } from '../../lib/constants';
import { useTokens } from '../../context/TokenContext';
import styles from './OrbitalNav.module.scss';

const personaList = Object.values(PERSONAS);

export default function OrbitalNav({ activeSection }) {
  const [isBarMode, setIsBarMode] = useState(false);
  const { earnTokens } = useTokens();

  useEffect(() => {
    const landingEl = document.getElementById('landing');
    if (!landingEl) return;

    const observer = new IntersectionObserver(
      ([entry]) => setIsBarMode(!entry.isIntersecting),
      { threshold: 0.1 }
    );

    observer.observe(landingEl);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const checkMobile = () => {
      if (window.innerWidth <= 768) setIsBarMode(true);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handlePlanetClick = (persona) => {
    const section = document.getElementById(persona.id);
    if (section) section.scrollIntoView({ behavior: 'smooth' });
    earnTokens('CLICK_PLANET');
  };

  return (
    <>
      {/* Orbital Mode */}
      <AnimatePresence>
        {!isBarMode && (
          <motion.nav
            className={styles.orbital}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            aria-label="Persona navigation"
          >
            <div className={styles.orbitPath} />

            <div className={styles.center}>
              <span className={styles.centerLetter}>M</span>
            </div>

            {personaList.map((persona) => (
              <div
                key={persona.id}
                className={styles.orbitSlot}
                style={{
                  '--orbit-duration': `${persona.orbitSpeed}s`,
                  '--orbit-offset': `${persona.orbitOffset}deg`,
                }}
              >
                <div className={styles.orbitCounter}>
                  <PersonaPlanet
                    persona={persona}
                    size={56}
                    isActive={activeSection === persona.id}
                    onClick={() => handlePlanetClick(persona)}
                  />
                </div>
              </div>
            ))}
          </motion.nav>
        )}
      </AnimatePresence>

      {/* Bar Mode */}
      <AnimatePresence>
        {isBarMode && (
          <motion.nav
            className={styles.bar}
            initial={{ y: -80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -80, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            aria-label="Persona navigation"
          >
            <div className={styles.barInner}>
              <span className={styles.barLogo}>M</span>
              <div className={styles.barPlanets}>
                {personaList.map((persona) => (
                  <PersonaPlanet
                    key={persona.id}
                    persona={persona}
                    size={40}
                    isActive={activeSection === persona.id}
                    onClick={() => handlePlanetClick(persona)}
                  />
                ))}
              </div>
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </>
  );
}
