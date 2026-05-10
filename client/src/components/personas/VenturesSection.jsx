import styles from './VenturesSection.module.scss';

export default function FiguringOutSection() {
  return (
    <div className={styles.page} role="main">

      <h2 className={styles.pageTitle}>Ventures</h2>

      {/* ═══ WITHLOVE ═══ */}
      <section className={styles.venture}>
        <div className={styles.ventureHeader}>
          <span className={styles.statusDev}>Private Beta</span>
          <h3 className={styles.ventureName}>
            <a href="https://withlove.so" target="_blank" rel="noopener noreferrer">
              withlove.so
            </a>
          </h3>
          <p className={styles.ventureType}>A personal AI agent for your link in bio</p>
        </div>

        <p className={styles.story}>
          Let your link in bio do the talking. In your voice. Creators, coaches and solopreneurs get
          a personal AI that learns how they actually sound, then handles inquiries, bookings and
          sales while they sleep. Signed, with love.
        </p>

        <div className={styles.cards}>
          <div className={styles.card}>
            <h4 className={styles.cardTitle}>Sounds Like You</h4>
            <p className={styles.cardDesc}>Learns from 90 days of your posts, DMs and voice notes. Replies the way you would.</p>
          </div>
          <div className={styles.card}>
            <h4 className={styles.cardTitle}>60 Second Setup</h4>
            <p className={styles.cardDesc}>Claim a link, connect your calendar, done. No prompts, no funnels, no setup wizard.</p>
          </div>
          <div className={styles.card}>
            <h4 className={styles.cardTitle}>Closes The Loop</h4>
            <p className={styles.cardDesc}>Answers questions, quotes prices, books calls and takes payment. All inside the chat.</p>
          </div>
        </div>

        <a
          href="https://withlove.so"
          target="_blank"
          rel="noopener noreferrer"
          className={styles.cta}
        >
          withlove.so
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M7 17L17 7M17 7H7M17 7v10"/>
          </svg>
        </a>
      </section>

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

    </div>
  );
}
