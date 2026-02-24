// ============================================
// tsparticles configurations
// ============================================

export const bigBangExplosion = {
  fullScreen: false,
  fpsLimit: 60,
  particles: {
    number: { value: 0 },
    color: {
      value: ['#00ffcc', '#39ff14', '#bf5af2', '#ff2d95', '#ffc800', '#ff00ff'],
    },
    shape: { type: 'circle' },
    opacity: {
      value: { min: 0.6, max: 1 },
      animation: {
        enable: true,
        speed: 1.5,
        minimumValue: 0,
        destroy: 'min',
      },
    },
    size: {
      value: { min: 1, max: 4 },
      animation: {
        enable: true,
        speed: 3,
        minimumValue: 0.5,
        destroy: 'min',
      },
    },
    move: {
      enable: true,
      speed: { min: 4, max: 10 },
      direction: 'none',
      outModes: { default: 'destroy' },
      straight: false,
    },
    life: {
      duration: { value: { min: 0.8, max: 2 } },
      count: 1,
    },
  },
  emitters: {
    position: { x: 50, y: 50 },
    rate: { quantity: 80, delay: 0 },
    size: { width: 0, height: 0 },
    life: { count: 1, duration: 0.4 },
  },
  detectRetina: true,
};

export const ambientStarfield = {
  fullScreen: false,
  fpsLimit: 30,
  particles: {
    number: { value: 60, density: { enable: true, area: 1000 } },
    color: { value: '#ffffff' },
    shape: { type: 'circle' },
    opacity: {
      value: { min: 0.2, max: 0.8 },
      animation: {
        enable: true,
        speed: 0.5,
        minimumValue: 0.1,
        sync: false,
      },
    },
    size: {
      value: { min: 0.5, max: 2 },
    },
    move: {
      enable: true,
      speed: { min: 0.1, max: 0.5 },
      direction: 'none',
      outModes: { default: 'out' },
      random: true,
      straight: false,
    },
  },
  detectRetina: true,
};

export const ambientStarfieldLight = {
  ...ambientStarfield,
  particles: {
    ...ambientStarfield.particles,
    color: { value: ['#7c3aed', '#ec4899', '#f59e0b', '#06b6d4'] },
    opacity: {
      value: { min: 0.1, max: 0.4 },
      animation: {
        enable: true,
        speed: 0.3,
        minimumValue: 0.05,
        sync: false,
      },
    },
    size: {
      value: { min: 1, max: 3 },
    },
  },
};
