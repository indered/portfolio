import { useState, useCallback } from 'react';
import { PERSONAS, SKILLS, EXPERIENCE, PROJECTS } from '../../lib/constants';
import styles from './DeveloperSection.module.scss';

const persona = PERSONAS.developer;

// ─── Skill Filter Cloud ────────────────────────────────────────────────────────
const SKILL_CATEGORIES = [
  { key: 'all', label: 'All' },
  { key: 'languages', label: 'Languages' },
  { key: 'frontend', label: 'Frontend' },
  { key: 'backend', label: 'Backend' },
  { key: 'databases', label: 'Databases' },
  { key: 'devops', label: 'DevOps' },
];

const SKILL_LEVELS = {
  JavaScript: 95, TypeScript: 88, Python: 70, Rust: 60, Solidity: 58, 'C++': 55,
  React: 92, 'Next.js': 82, Redux: 85, 'Apollo Client': 88,
  HTML5: 95, CSS3: 90, Sass: 88,
  'Node.js': 93, Express: 90, 'Apollo Server': 87, GraphQL: 90,
  REST: 92, Kafka: 75, LangChain: 65, Ethereum: 62, ElasticSearch: 75, RabbitMQ: 72,
  MongoDB: 85, PostgreSQL: 80, MySQL: 75,
  'AWS EC2': 78, 'AWS ECS': 75, 'AWS SNS': 80, 'AWS SQS': 78,
  'AWS Lambda': 72, OpenSearch: 68, Docker: 82, Heroku: 70,
};

function SkillCloud({ activeCategory, setActiveCategory }) {
  const [hoveredSkill, setHoveredSkill] = useState(null);

  const getFilteredSkills = useCallback(() => {
    if (activeCategory === 'all') {
      return Object.entries(SKILLS).flatMap(([cat, skills]) =>
        skills.map((s) => ({ skill: s, category: cat }))
      );
    }
    return (SKILLS[activeCategory] || []).map((s) => ({
      skill: s,
      category: activeCategory,
    }));
  }, [activeCategory]);

  const filteredSkills = getFilteredSkills();

  return (
    <div className={styles.skillCloud}>
      {/* Filter tabs */}
      <div className={styles.skillFilters}>
        {SKILL_CATEGORIES.map((cat) => (
          <button
            key={cat.key}
            className={`${styles.filterBtn} ${activeCategory === cat.key ? styles.filterBtnActive : ''}`}
            onClick={() => setActiveCategory(cat.key)}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Tag cloud */}
      <div className={styles.tagCloud}>
        {filteredSkills.map(({ skill, category }) => {
          const level = SKILL_LEVELS[skill] || 70;
          const isHovered = hoveredSkill === skill;
          const sizeClass =
            level >= 90
              ? styles.tagLg
              : level >= 80
              ? styles.tagMd
              : styles.tagSm;

          return (
            <div
              key={skill}
              className={`${styles.skillTag} ${sizeClass}`}
              data-category={category}
              onMouseEnter={() => setHoveredSkill(skill)}
              onMouseLeave={() => setHoveredSkill(null)}
            >
              <span className={styles.tagName}>{skill}</span>
              {isHovered && (
                <div className={styles.tagTooltip}>
                  <div className={styles.tooltipBar}>
                    <div className={styles.tooltipFill} style={{ width: `${level}%` }} />
                  </div>
                  <span className={styles.tooltipPct}>{level}%</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Timeline Entry ────────────────────────────────────────────────────────────
const CODE_SNIPPETS = {
  emiratesnbd: `// Real-time payment tracking — Kafka + Lambda
consumer.subscribe({ topic: 'payment.events' });
consumer.run({
  eachMessage: async ({ message }) => {
    const event = JSON.parse(message.value);
    await tracker.propagate(event);
    // < 1ms end-to-end latency
  },
});`,
  noumena: `// Apollo Federation — microservices gateway
const gateway = new ApolloGateway({
  supergraphSdl: new IntrospectAndCompose({
    subgraphs: services.map(s => ({
      name: s.name, url: s.endpoint,
    })),
  }),
});`,
  tokopedia: `// Server-side rendering — featured at Google I/O
export async function getServerSideProps() {
  const data = await fetchDiscovery();
  return { props: { data } };
  // TTFB: 87ms
}`,
  ttn: `// RabbitMQ async processing pipeline
const channel = await conn.createChannel();
await channel.assertQueue('tasks', {
  durable: true,
});
// 2,000+ concurrent connections handled`,
  freelance: `// MERN stack — solo deployment
const app = express();
app.use('/api', router);
await mongoose.connect(MONGO_URI);
app.listen(PORT);`,
};

function TimelineEntry({ entry, isActive, onClick }) {
  const yearStart = entry.period.split('—')[0].trim().split(' ').pop();

  return (
    <div
      className={`${styles.timelineEntry} ${isActive ? styles.timelineEntryActive : ''}`}
      onClick={onClick}
    >
      {/* Year stamp */}
      <div className={styles.entryYear}>
        <span className={styles.yearText}>{yearStart}</span>
        {entry.featured && (
          <span className={styles.featuredBadge}>Featured</span>
        )}
      </div>

      {/* Connector */}
      <div className={styles.entryConnector}>
        <div className={styles.connectorDot} />
        <div className={styles.connectorLine} />
      </div>

      {/* Card */}
      <div className={styles.entryCard}>
        <div className={styles.entryHeader}>
          <div className={styles.entryMeta}>
            <span className={styles.entryRole}>{entry.role}</span>
            <span className={styles.entryPeriod}>{entry.period}</span>
          </div>
          <h4 className={styles.entryCompany}>{entry.company}</h4>
          <p className={styles.entryDesc}>{entry.description}</p>
        </div>

        {isActive && (
          <div className={styles.entryExpanded}>
            {/* Code block */}
            <div className={styles.codeBlock}>
              <div className={styles.codeBlockHeader}>
                <span className={styles.codeFileName}>{entry.id}.ts</span>
              </div>
              <pre className={styles.codeContent}>
                <code>{CODE_SNIPPETS[entry.id] || '// ...'}</code>
              </pre>
            </div>

            {/* Highlights */}
            <ul className={styles.highlights}>
              {entry.highlights.map((h, i) => (
                <li key={i} className={styles.highlight}>
                  <span className={styles.highlightArrow}>—</span>
                  {h}
                </li>
              ))}
            </ul>

            {/* Tech stack */}
            <div className={styles.entryTech}>
              {entry.tech.map((t) => (
                <span key={t} className={styles.techChip}>{t}</span>
              ))}
            </div>
          </div>
        )}

        <button
          className={styles.expandToggle}
          aria-label={isActive ? 'Collapse details' : 'Expand details'}
        >
          <span>{isActive ? '×' : '+'}</span>
        </button>
      </div>
    </div>
  );
}

// ─── Project Card ──────────────────────────────────────────────────────────────
const PROJECT_SNIPPETS = {
  1: `// Apollo Federation Gateway
const { url } = await startStandaloneServer(
  buildSubgraphSchema([resolvers]),
  { listen: { port: 4001 } }
);`,
  2: `// Discovery API — Google I/O Featured
export const handler = async (req, res) => {
  const items = await discovery.fetch({
    page: req.query.page, limit: 20,
  });
  // TTFB: 87ms
};`,
  3: `// ElasticSearch real-time query
const results = await client.search({
  index: 'recipes',
  query: { match: { title: q } },
  // 20ms average response
});`,
  4: `// Redux multilevel form state
const insuranceSlice = createSlice({
  name: 'form',
  initialState: { step: 0 },
  reducers: { nextStep, prevStep },
});`,
  5: `// MERN solo deployment
const app = express();
app.use('/api', apiRouter);
await mongoose.connect(MONGO_URI);
app.listen(PORT);`,
};

function ProjectCard({ project }) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <article
      className={`${styles.projectCard} ${project.featured ? styles.projectCardFeatured : ''}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Thin top accent line */}
      <div className={styles.cardAccentBar} />

      {/* Featured badge */}
      {project.featured && (
        <div className={styles.featuredLabel}>FEATURED</div>
      )}

      <div className={styles.cardBody}>
        {/* Left: content */}
        <div className={styles.cardContent}>
          <span className={styles.cardRole}>{project.role}</span>
          <h4 className={styles.cardTitle}>{project.title}</h4>
          <p className={styles.cardSubtitle}>{project.subtitle}</p>
          <p className={styles.cardDescription}>{project.description}</p>

          <div className={styles.cardFooter}>
            <div className={styles.impactRow}>
              <span className={styles.impactPill}>{project.impact}</span>
            </div>
            <div className={styles.cardTech}>
              {project.tech.slice(0, 5).map((t) => (
                <span key={t} className={styles.cardTechChip}>{t}</span>
              ))}
              {project.tech.length > 5 && (
                <span className={styles.cardTechMore}>+{project.tech.length - 5}</span>
              )}
            </div>
          </div>
        </div>

        {/* Right: code snippet panel */}
        <div className={styles.cardSnippet}>
          <div className={styles.snippetHeader}>
            <span className={styles.snippetFileName}>snippet.ts</span>
          </div>
          {isHovered ? (
            <pre className={styles.snippetCode}>
              <code>{PROJECT_SNIPPETS[project.id] || '// coming soon'}</code>
            </pre>
          ) : (
            <div className={styles.snippetIdle}>
              <span className={styles.snippetIdleText}>hover to inspect</span>
            </div>
          )}
        </div>
      </div>
    </article>
  );
}

// ─── Stats Bar ─────────────────────────────────────────────────────────────────
const STATS = [
  { label: 'Years experience', value: '7+' },
  { label: 'Google I/O features', value: '2×' },
  { label: 'Users served', value: '10K+' },
  { label: 'Full-stack layers', value: '∞' },
];

function StatsBar() {
  return (
    <div className={styles.statsBar}>
      {STATS.map((stat) => (
        <div key={stat.label} className={styles.statItem}>
          <span className={styles.statValue}>{stat.value}</span>
          <span className={styles.statLabel}>{stat.label}</span>
        </div>
      ))}
    </div>
  );
}

// ─── Dot Grid Background ───────────────────────────────────────────────────────
function DotGrid() {
  return (
    <svg
      className={styles.dotGrid}
      aria-hidden="true"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <pattern
          id="dot-pattern"
          x="0"
          y="0"
          width="24"
          height="24"
          patternUnits="userSpaceOnUse"
        >
          <circle cx="1" cy="1" r="1" fill="currentColor" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#dot-pattern)" />
    </svg>
  );
}

// ─── Section Label ─────────────────────────────────────────────────────────────
function SectionLabel({ children }) {
  return <span className={styles.sectionEyebrow}>{children}</span>;
}

// ─── Main Section ──────────────────────────────────────────────────────────────
export default function DeveloperSection() {
  const [activeEntry, setActiveEntry] = useState(null);
  const [skillCategory, setSkillCategory] = useState('all');

  const handleEntryClick = (id) => {
    setActiveEntry((prev) => (prev === id ? null : id));
  };

  return (
    <div className={styles.developer}>

      {/* ── DOT GRID BACKGROUND ── */}
      <div className={styles.dotGridWrap} aria-hidden="true">
        <DotGrid />
      </div>

      {/* ── HERO ── */}
      <section className={styles.hero}>
        <div className={styles.heroInner}>
          {/* Location / role badge */}
          <div className={styles.locationBadge}>
            <span className={styles.locationDot} />
            <span>Dubai, UAE</span>
            <span className={styles.locationSep}>·</span>
            <span>Full Stack Developer</span>
          </div>

          {/* Big title */}
          <h2 className={styles.heroTitle}>
            <span className={styles.heroTitleLine1}>The</span>
            <span className={styles.heroTitleLine2}>Architect</span>
          </h2>

          {/* Tagline */}
          <p className={styles.heroTagline}>
            {persona.tagline}
          </p>

          {/* Stats */}
          <StatsBar />

          {/* Download buttons */}
          <div className={styles.downloadRow}>
            <a
              href="/mahesh-inder-resume.pdf"
              download="Mahesh_Inder_Resume.pdf"
              className={styles.downloadBtn}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
              Resume
            </a>
            <a
              href="/mahesh-inder-cover-letter.pdf"
              download="Mahesh_Inder_Cover_Letter.pdf"
              className={`${styles.downloadBtn} ${styles.downloadBtnOutline}`}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
              Cover Letter
            </a>
          </div>
        </div>
      </section>

      {/* ── SKILLS ── */}
      <section className={styles.skillsSection}>
        <div className={styles.sectionHeader}>
          <SectionLabel>Tech Stack</SectionLabel>
          <h3 className={styles.sectionTitle}>Skills &amp; Tools</h3>
        </div>

        <SkillCloud
          activeCategory={skillCategory}
          setActiveCategory={setSkillCategory}
        />
      </section>

      {/* ── EXPERIENCE ── */}
      <section className={styles.experienceSection}>
        <div className={styles.sectionHeader}>
          <SectionLabel>Career History</SectionLabel>
          <h3 className={styles.sectionTitle}>Experience</h3>
        </div>

        <div className={styles.timeline}>
          {EXPERIENCE.map((entry) => (
            <TimelineEntry
              key={entry.id}
              entry={entry}
              isActive={activeEntry === entry.id}
              onClick={() => handleEntryClick(entry.id)}
            />
          ))}
        </div>
      </section>

      {/* ── PROJECTS ── */}
      <section className={styles.projectsSection}>
        <div className={styles.sectionHeader}>
          <SectionLabel>Selected Work</SectionLabel>
          <h3 className={styles.sectionTitle}>Projects</h3>
        </div>

        <div className={styles.projectsGrid}>
          {PROJECTS.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      </section>

      {/* ── FOOTER CTA ── */}
      <div className={styles.footerCta}>
        <p className={styles.footerCtaText}>
          Systems built to last. Let&apos;s build something together.
        </p>
        <a
          href="mailto:hi@indered.in"
          className={styles.footerCtaLink}
        >
          Get in touch
        </a>
      </div>
    </div>
  );
}
