import { useCallback, useState, useEffect } from 'react';
import Particles from '@tsparticles/react';
import { loadSlim } from '@tsparticles/slim';
import { useTheme } from '../../context/ThemeContext';
import {
  bigBangExplosion,
  ambientStarfield,
  ambientStarfieldLight,
} from '../../lib/particleConfigs';
import styles from './ParticleField.module.scss';

export default function ParticleField({ mode = 'ambient' }) {
  const { theme } = useTheme();
  const [init, setInit] = useState(false);

  const particlesInit = useCallback(async (engine) => {
    await loadSlim(engine);
    setInit(true);
  }, []);

  const getConfig = () => {
    if (mode === 'explosion') return bigBangExplosion;
    return theme === 'dark' ? ambientStarfield : ambientStarfieldLight;
  };

  if (!init && mode !== 'explosion') {
    // Pre-init on first render
  }

  return (
    <Particles
      className={styles.particles}
      id={`particles-${mode}`}
      init={particlesInit}
      options={getConfig()}
    />
  );
}
