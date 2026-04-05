import styles from './FiguringOutSection.module.scss';

export default function FiguringOutSection() {
  return (
    <section className={styles.section} aria-labelledby="figuring-out-heading">
      <div className={styles.inner}>

        {/* Origin story */}
        <div className={styles.origin}>
          <span className={styles.originLabel}>The Origin</span>
          <p className={styles.originText}>
            I was running 10K in Dubai heat. 42 degrees. Drenched. Stopped at a store,
            picked up a sports drink. Sugar, artificial colors, chemicals I couldn't pronounce.
            Thought to myself: there has to be something better. There wasn't. So I decided to make it.
          </p>
        </div>

        {/* Brand */}
        <div className={styles.brand}>
          <span className={styles.badge}>Launching Soon</span>
          <h1 id="figuring-out-heading" className={styles.brandName}>
            <a href="https://figuringout.club" target="_blank" rel="noopener noreferrer">
              Figuring Out
            </a>
          </h1>
          <p className={styles.brandSub}>
            Clean hydration for people who move.
          </p>
        </div>

        {/* What it is */}
        <div className={styles.pitch}>
          <div className={styles.pitchCard}>
            <h3 className={styles.pitchTitle}>0g Sugar</h3>
            <p className={styles.pitchDesc}>No added sugar. No artificial sweeteners. Just electrolytes.</p>
          </div>
          <div className={styles.pitchCard}>
            <h3 className={styles.pitchTitle}>Real Minerals</h3>
            <p className={styles.pitchDesc}>Sodium, potassium, magnesium. What your body actually needs.</p>
          </div>
          <div className={styles.pitchCard}>
            <h3 className={styles.pitchTitle}>Made in Dubai</h3>
            <p className={styles.pitchDesc}>Designed for desert heat. Tested on marathon runners.</p>
          </div>
        </div>

        {/* Tagline */}
        <p className={styles.tagline}>
          In the world where everyone is figuring out,
          <span className={styles.highlight}> we figured out the hydration.</span>
        </p>

        {/* CTA */}
        <a
          href="https://figuringout.club"
          target="_blank"
          rel="noopener noreferrer"
          className={styles.cta}
        >
          figuringout.club
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M7 17L17 7M17 7H7M17 7v10"/>
          </svg>
        </a>

      </div>
    </section>
  );
}
