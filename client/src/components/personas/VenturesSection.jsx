import styles from './VenturesSection.module.scss';

export default function FiguringOutSection() {
  return (
    <div className={styles.page} role="main">

      <h2 className={styles.pageTitle}>Ventures</h2>

      {/* ═══ FIGURING OUT ═══ */}
      <section className={styles.venture}>
        <div className={styles.ventureHeader}>
          <span className={styles.status}>Launching Soon</span>
          <h3 className={styles.ventureName}>
            <a href="https://figuringout.club" target="_blank" rel="noopener noreferrer">
              Figuring Out
            </a>
          </h3>
          <p className={styles.ventureType}>Electrolyte brand, Dubai</p>
        </div>

        <p className={styles.story}>
          Started running marathons in Dubai. Fell in love with the discipline, the heat, the sunrise
          routes. But every time I reached for hydration, it tasted like medicine or candy. Why can't
          staying hydrated taste good? Inspired by Humantra, I started figuring it out.
        </p>

        <div className={styles.cards}>
          <div className={styles.card}>
            <h4 className={styles.cardTitle}>Tastes Good</h4>
            <p className={styles.cardDesc}>Hydration that you actually look forward to drinking.</p>
          </div>
          <div className={styles.card}>
            <h4 className={styles.cardTitle}>Clean Label</h4>
            <p className={styles.cardDesc}>No sugar, no junk. Just real electrolytes.</p>
          </div>
          <div className={styles.card}>
            <h4 className={styles.cardTitle}>Born in Dubai</h4>
            <p className={styles.cardDesc}>Made for runners, by a runner, in the desert.</p>
          </div>
        </div>

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
      </section>

      {/* ═══ WREN ═══ */}
      <section className={styles.venture}>
        <div className={styles.ventureHeader}>
          <span className={styles.statusDev}>In Development</span>
          <h3 className={styles.ventureName}>Wren</h3>
          <p className={styles.ventureType}>Programming language for AI-assisted development</p>
        </div>

        <p className={styles.story}>
          Modern web development is increasingly driven by AI agents. But current languages were not
          built for that. Wren is a web development language designed from the ground up to work
          seamlessly with AI coding agents like Claude. Small, readable, opinionated.
        </p>

        <div className={styles.cards}>
          <div className={styles.card}>
            <h4 className={styles.cardTitle}>AI-Native</h4>
            <p className={styles.cardDesc}>Syntax that AI agents can read, write, and reason about naturally.</p>
          </div>
          <div className={styles.card}>
            <h4 className={styles.cardTitle}>Web-First</h4>
            <p className={styles.cardDesc}>Built for the web. Components, routing, state management built in.</p>
          </div>
          <div className={styles.card}>
            <h4 className={styles.cardTitle}>Opinionated</h4>
            <p className={styles.cardDesc}>One way to do things. Less decisions, faster shipping.</p>
          </div>
        </div>

        <span className={styles.comingSoon}>Coming 2026</span>
      </section>

    </div>
  );
}
