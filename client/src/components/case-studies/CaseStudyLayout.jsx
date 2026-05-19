import { Link } from 'react-router-dom';
import { useEffect } from 'react';
import useSEO from '../../hooks/useSEO';
import styles from './CaseStudy.module.scss';

/**
 * Shared layout for the standalone case study pages under /work/<slug>.
 * Crawl-friendly, mobile-first, lightweight styling. These pages are linked
 * from the /work overview and from the sitemap. They are not part of the
 * solar-system shell because they need to load fast and be readable to
 * Googlebot and AI crawlers without a JS-heavy intro.
 */
export default function CaseStudyLayout({
  seoKey,
  eyebrow,
  title,
  subtitle,
  stack,
  outcomes,
  jsonLd,
  children,
}) {
  useSEO(seoKey);

  useEffect(() => {
    if (!jsonLd) return undefined;
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.text = JSON.stringify(jsonLd);
    script.setAttribute('data-case-study', seoKey);
    document.head.appendChild(script);
    return () => {
      script.remove();
    };
  }, [jsonLd, seoKey]);

  return (
    <main className={styles.page}>
      <article className={styles.article}>
        <p className={styles.eyebrow}>{eyebrow}</p>
        <h1 className={styles.title}>{title}</h1>
        <p className={styles.subtitle}>{subtitle}</p>

        <div className={styles.metaRow}>
          <div className={styles.metaBlock}>
            <h2 className={styles.metaLabel}>Stack</h2>
            <ul className={styles.metaList}>
              {stack.map((s) => (
                <li key={s}>{s}</li>
              ))}
            </ul>
          </div>
          <div className={styles.metaBlock}>
            <h2 className={styles.metaLabel}>Outcomes</h2>
            <ul className={styles.metaList}>
              {outcomes.map((o) => (
                <li key={o}>{o}</li>
              ))}
            </ul>
          </div>
        </div>

        <div className={styles.body}>{children}</div>

        <footer className={styles.footer}>
          <Link to="/work" className={styles.footerLink}>
            Back to all work
          </Link>
          <a href="mailto:mahesh.inder85@gmail.com" className={styles.footerCta}>
            Get in touch
          </a>
        </footer>
      </article>
    </main>
  );
}
