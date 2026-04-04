import { useState, useCallback } from 'react';
import { PERSONAS, SKILLS, EXPERIENCE, PROJECTS } from '../../lib/constants';
import styles from './DeveloperSection.module.scss';

const persona = PERSONAS.developer;

// ─── Skill categories ─────────────────────────────────────────────────────────
const SKILL_CATEGORIES = [
  { key: 'all', label: 'All' },
  { key: 'languages', label: 'Languages' },
  { key: 'frontend', label: 'Frontend' },
  { key: 'backend', label: 'Backend' },
  { key: 'databases', label: 'Databases' },
  { key: 'devops', label: 'DevOps' },
];

// ─── Stats ────────────────────────────────────────────────────────────────────
const STATS = [
  { label: 'Years', value: '7+' },
  { label: 'Google I/O', value: '2×' },
  { label: 'Users', value: '10K+' },
  { label: 'Stack depth', value: '∞' },
];

// ─── Edition helpers ──────────────────────────────────────────────────────────
const EDITION_DATE = new Date().toLocaleDateString('en-GB', {
  weekday: 'long',
  year: 'numeric',
  month: 'long',
  day: 'numeric',
});

const ISSUE_NUM = `Vol. VII · No. ${new Date().getDate()}`;

// ─── Main Section ─────────────────────────────────────────────────────────────
export default function DeveloperSection() {
  const [activeEntry, setActiveEntry] = useState(null);
  const [skillCategory, setSkillCategory] = useState('all');

  const getFilteredSkills = useCallback(() => {
    if (skillCategory === 'all') {
      return Object.entries(SKILLS).flatMap(([cat, skills]) =>
        skills.map((s) => ({ skill: s, category: cat }))
      );
    }
    return (SKILLS[skillCategory] || []).map((s) => ({
      skill: s,
      category: skillCategory,
    }));
  }, [skillCategory]);

  const filteredSkills = getFilteredSkills();

  return (
    <div className={styles.newspaper} role="main">

      {/* ── MASTHEAD — newspaper header ── */}
      <header className={styles.masthead}>
        <div className={styles.mastheadTop}>
          <span className={styles.edition}>{ISSUE_NUM}</span>
          <span className={styles.editionDate}>{EDITION_DATE}</span>
          <span className={styles.edition}>Dubai, UAE</span>
        </div>
        <div className={styles.mastheadRule} aria-hidden="true" />
        <h1 className={styles.mastheadTitle}>The Architect</h1>
        <div className={styles.mastheadRule} aria-hidden="true" />
        <p className={styles.mastheadSub}>
          {persona.tagline}
        </p>
      </header>

      {/* ── STATS TICKER ── */}
      <div className={styles.statsTicker}>
        {STATS.map((s) => (
          <div key={s.label} className={styles.tickerItem}>
            <span className={styles.tickerValue}>{s.value}</span>
            <span className={styles.tickerLabel}>{s.label}</span>
          </div>
        ))}
      </div>

      {/* ── HEADLINE + LEDE — the "front page" ── */}
      <section className={styles.frontPage}>
        <div className={styles.ledeCol}>
          <div className={styles.ledeKicker}>Senior Full Stack Engineer · Emirates NBD</div>
          <h2 className={styles.ledeHeadline}>
            From Kafka Streams to Google I/O:
            Seven Years Building Systems That Scale
          </h2>
          <p className={styles.ledeBody}>
            A full stack developer who has built real-time payment systems for one of the UAE&apos;s largest banks,
            architected microservice constellations for global platforms, and shipped APIs so fast that Google
            showcased them on stage — twice. Based in Dubai, currently engineering at Emirates NBD,
            where every dirham moves with sub-millisecond precision.
          </p>

          {/* Download links */}
          <div className={styles.downloadRow}>
            <a
              href="/mahesh-inder-resume.pdf"
              download="Mahesh_Inder_Resume.pdf"
              className={styles.downloadLink}
            >
              Download Resume (PDF)
            </a>
            <span className={styles.downloadSep}>|</span>
            <a
              href="/mahesh-inder-cover-letter.pdf"
              download="Mahesh_Inder_Cover_Letter.pdf"
              className={styles.downloadLink}
            >
              Cover Letter
            </a>
          </div>
        </div>

        {/* Sidebar — location & quick facts */}
        <aside className={styles.sidebar}>
          <div className={styles.sidebarCard}>
            <h3 className={styles.sidebarTitle}>Quick Dossier</h3>
            <dl className={styles.dossier}>
              <div className={styles.dossierRow}>
                <dt>Location</dt>
                <dd>Dubai, UAE</dd>
              </div>
              <div className={styles.dossierRow}>
                <dt>Current</dt>
                <dd>Emirates NBD</dd>
              </div>
              <div className={styles.dossierRow}>
                <dt>Stack</dt>
                <dd>React · Node · Rust</dd>
              </div>
              <div className={styles.dossierRow}>
                <dt>Featured</dt>
                <dd>2× Google I/O</dd>
              </div>
              <div className={styles.dossierRow}>
                <dt>Hobby</dt>
                <dd>Marathon Runner</dd>
              </div>
              <div className={styles.dossierRow}>
                <dt>Email</dt>
                <dd>hello@maheshinder.in</dd>
              </div>
            </dl>
          </div>
        </aside>
      </section>

      {/* ── EXPERIENCE — "career dispatch" articles ── */}
      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionEyebrow}>Career Dispatch</span>
          <h3 className={styles.sectionTitle}>Experience</h3>
          <div className={styles.headerRule} aria-hidden="true" />
        </div>

        <div className={styles.experienceGrid}>
          {EXPERIENCE.map((entry) => {
            const isActive = activeEntry === entry.id;
            return (
              <article
                key={entry.id}
                className={`${styles.expArticle} ${isActive ? styles.expArticleActive : ''} ${entry.featured ? styles.expArticleFeatured : ''}`}
                onClick={() => setActiveEntry(isActive ? null : entry.id)}
                role="listitem"
                aria-expanded={isActive}
              >
                <div className={styles.expMeta}>
                  <span className={styles.expPeriod}>{entry.period}</span>
                  {entry.featured && <span className={styles.expBadge}>Featured</span>}
                </div>
                <h4 className={styles.expCompany}>{entry.company}</h4>
                <span className={styles.expRole}>{entry.role}</span>
                <p className={styles.expDesc}>{entry.description}</p>

                {isActive && (
                  <div className={styles.expExpanded}>
                    <ul className={styles.expHighlights}>
                      {entry.highlights.map((h, i) => (
                        <li key={i}>{h}</li>
                      ))}
                    </ul>
                    <div className={styles.expTech}>
                      {entry.tech.map((t) => (
                        <span key={t} className={styles.techTag}>{t}</span>
                      ))}
                    </div>
                  </div>
                )}

                <button
                  className={styles.readMore}
                  aria-label={isActive ? 'Show less' : 'Read full story'}
                >
                  {isActive ? 'Show less' : 'Read full story'} {isActive ? '−' : '+'}
                </button>
              </article>
            );
          })}
        </div>
      </section>

      {/* ── PROJECTS — "selected works" ── */}
      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionEyebrow}>Selected Works</span>
          <h3 className={styles.sectionTitle}>Projects</h3>
          <div className={styles.headerRule} aria-hidden="true" />
        </div>

        <div className={styles.projectsGrid}>
          {PROJECTS.map((project) => (
            <article
              key={project.id}
              className={`${styles.projectArticle} ${project.featured ? styles.projectFeatured : ''}`}
            >
              {project.featured && (
                <div className={styles.projectBadge}>Featured at Google I/O</div>
              )}
              <span className={styles.projectRole}>{project.role}</span>
              <h4 className={styles.projectTitle}>{project.title}</h4>
              <p className={styles.projectSub}>{project.subtitle}</p>
              <p className={styles.projectDesc}>{project.description}</p>
              <div className={styles.projectFooter}>
                <span className={styles.projectImpact}>{project.impact}</span>
                <div className={styles.projectTech}>
                  {project.tech.slice(0, 4).map((t) => (
                    <span key={t} className={styles.techTag}>{t}</span>
                  ))}
                  {project.tech.length > 4 && (
                    <span className={styles.techMore}>+{project.tech.length - 4}</span>
                  )}
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* ── SKILLS — "the toolkit" ── */}
      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionEyebrow}>The Toolkit</span>
          <h3 className={styles.sectionTitle}>Skills &amp; Technologies</h3>
          <div className={styles.headerRule} aria-hidden="true" />
        </div>

        <div className={styles.skillFilters}>
          {SKILL_CATEGORIES.map((cat) => (
            <button
              key={cat.key}
              className={`${styles.filterBtn} ${skillCategory === cat.key ? styles.filterBtnActive : ''}`}
              onClick={() => setSkillCategory(cat.key)}
            >
              {cat.label}
            </button>
          ))}
        </div>

        <div className={styles.skillGrid}>
          {filteredSkills.map(({ skill, category }) => (
            <span key={skill} className={styles.skillChip} data-category={category}>
              {skill}
            </span>
          ))}
        </div>
      </section>

      {/* ── FOOTER — contact CTA ── */}
      <footer className={styles.footer}>
        <div className={styles.footerRule} aria-hidden="true" />
        <p className={styles.footerText}>
          Systems built to last. Let&apos;s build something together.
        </p>
        <a href="mailto:hello@maheshinder.in" className={styles.footerCta}>
          Get in touch &rarr;
        </a>
        <div className={styles.footerColophon}>
          <span>© {new Date().getFullYear()} Mahesh Inder</span>
          <span>·</span>
          <span>Dubai, UAE</span>
        </div>
      </footer>
    </div>
  );
}
