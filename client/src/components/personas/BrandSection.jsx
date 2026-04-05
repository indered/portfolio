import styles from './BrandSection.module.scss';

export default function BrandSection() {
  return (
    <div className={styles.page} role="main">

      <h2 className={styles.title}>Brand</h2>

      {/* Logo */}
      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>Logo</h3>
        <div className={styles.logoGrid}>
          <div className={styles.logoCard} style={{ background: '#0a0a0f' }}>
            <img src="/logo.svg" alt="Mahesh Inder logo (light)" className={styles.logoImg} />
            <span className={styles.logoLabel}>Primary (dark bg)</span>
            <a href="/logo.svg" download="mahesh-inder-logo.svg" className={styles.download}>SVG</a>
            <a href="/logo.png" download="mahesh-inder-logo.png" className={styles.download}>PNG</a>
          </div>
          <div className={styles.logoCard} style={{ background: '#f5f5f5' }}>
            <img src="/logo-dark.svg" alt="Mahesh Inder logo (dark)" className={styles.logoImg} />
            <span className={styles.logoLabel} style={{ color: '#333' }}>Secondary (light bg)</span>
            <a href="/logo-dark.svg" download="mahesh-inder-logo-dark.svg" className={styles.download}>SVG</a>
            <a href="/logo-dark.png" download="mahesh-inder-logo-dark.png" className={styles.download}>PNG</a>
          </div>
          <div className={styles.logoCard} style={{ background: '#0a0a0f' }}>
            <img src="/logo-horizontal.svg" alt="Mahesh Inder horizontal logo" className={styles.logoImgWide} />
            <span className={styles.logoLabel}>Horizontal</span>
            <a href="/logo-horizontal.svg" download="mahesh-inder-logo-horizontal.svg" className={styles.download}>Download SVG</a>
          </div>
        </div>
      </section>

      {/* Favicon */}
      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>Favicon</h3>
        <div className={styles.faviconRow}>
          <div className={styles.faviconCard}>
            <img src="/favicon.svg" alt="MI favicon" className={styles.faviconImg} />
            <span className={styles.faviconLabel}>MI monogram</span>
          </div>
          <a href="/favicon.svg" download="mahesh-inder-favicon.svg" className={styles.download}>Download SVG</a>
        </div>
      </section>

      {/* Colors */}
      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>Colors</h3>
        <div className={styles.colorGrid}>
          <div className={styles.colorCard}>
            <div className={styles.colorSwatch} style={{ background: '#0a0a0f' }} />
            <span className={styles.colorName}>Space Black</span>
            <span className={styles.colorHex}>#0A0A0F</span>
          </div>
          <div className={styles.colorCard}>
            <div className={styles.colorSwatch} style={{ background: '#4a9eff' }} />
            <span className={styles.colorName}>Inder Blue</span>
            <span className={styles.colorHex}>#4A9EFF</span>
          </div>
          <div className={styles.colorCard}>
            <div className={styles.colorSwatch} style={{ background: '#ffffff', border: '1px solid #ddd' }} />
            <span className={styles.colorName}>White</span>
            <span className={styles.colorHex}>#FFFFFF</span>
          </div>
          <div className={styles.colorCard}>
            <div className={styles.colorSwatch} style={{ background: '#2a7fe0' }} />
            <span className={styles.colorName}>Developer</span>
            <span className={styles.colorHex}>#2A7FE0</span>
          </div>
          <div className={styles.colorCard}>
            <div className={styles.colorSwatch} style={{ background: '#14B8A6' }} />
            <span className={styles.colorName}>Figuring Out</span>
            <span className={styles.colorHex}>#14B8A6</span>
          </div>
        </div>
      </section>

      {/* Typography */}
      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>Typography</h3>
        <div className={styles.typeGrid}>
          <div className={styles.typeCard}>
            <span className={styles.typePreview} style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', fontWeight: 700 }}>Plus Jakarta Sans</span>
            <span className={styles.typeRole}>Display / Headings</span>
          </div>
          <div className={styles.typeCard}>
            <span className={styles.typePreview} style={{ fontFamily: 'Inter, sans-serif', fontWeight: 400 }}>Inter</span>
            <span className={styles.typeRole}>Body text</span>
          </div>
          <div className={styles.typeCard}>
            <span className={styles.typePreview} style={{ fontFamily: 'IBM Plex Mono, monospace', fontWeight: 400 }}>IBM Plex Mono</span>
            <span className={styles.typeRole}>Code / Labels</span>
          </div>
        </div>
      </section>

      {/* Links */}
      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>Links</h3>
        <div className={styles.links}>
          <a href="https://maheshinder.in" className={styles.link}>maheshinder.in</a>
          <a href="https://github.com/indered" target="_blank" rel="noopener noreferrer" className={styles.link}>github.com/indered</a>
          <a href="https://linkedin.com/in/mahesh-inder" target="_blank" rel="noopener noreferrer" className={styles.link}>linkedin.com/in/mahesh-inder</a>
        </div>
      </section>

    </div>
  );
}
