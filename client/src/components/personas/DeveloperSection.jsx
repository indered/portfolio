import { useRef, useState, useCallback } from 'react';
import { motion, useInView, useScroll, useTransform, AnimatePresence } from 'motion/react';
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
        <AnimatePresence mode="popLayout">
          {filteredSkills.map(({ skill, category }, i) => {
            const level = SKILL_LEVELS[skill] || 70;
            const isHovered = hoveredSkill === skill;
            const sizeClass =
              level >= 90
                ? styles.tagLg
                : level >= 80
                ? styles.tagMd
                : styles.tagSm;

            return (
              <motion.div
                key={skill}
                className={`${styles.skillTag} ${sizeClass}`}
                data-category={category}
                layout
                initial={{ opacity: 0, scale: 0.85 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.85 }}
                transition={{ duration: 0.2, delay: i * 0.012 }}
                onHoverStart={() => setHoveredSkill(skill)}
                onHoverEnd={() => setHoveredSkill(null)}
              >
                <span className={styles.tagName}>{skill}</span>
                <AnimatePresence>
                  {isHovered && (
                    <motion.div
                      className={styles.tagTooltip}
                      initial={{ opacity: 0, y: 4, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 4, scale: 0.95 }}
                      transition={{ duration: 0.12 }}
                    >
                      <div className={styles.tooltipBar}>
                        <motion.div
                          className={styles.tooltipFill}
                          initial={{ width: 0 }}
                          animate={{ width: `${level}%` }}
                          transition={{ duration: 0.35, ease: 'easeOut' }}
                        />
                      </div>
                      <span className={styles.tooltipPct}>{level}%</span>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </AnimatePresence>
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

function TimelineEntry({ entry, index, isActive, onClick }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.2 });
  const yearStart = entry.period.split('—')[0].trim().split(' ').pop();

  return (
    <motion.div
      ref={ref}
      className={`${styles.timelineEntry} ${isActive ? styles.timelineEntryActive : ''}`}
      initial={{ opacity: 0, y: 24 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.45, delay: index * 0.07, ease: [0.25, 0.46, 0.45, 0.94] }}
      onClick={onClick}
    >
      {/* Year stamp */}
      <div className={styles.entryYear}>
        <span className={styles.yearText}>{yearStart}</span>
        {entry.featured && (
          <motion.span
            className={styles.featuredBadge}
            initial={{ scale: 0 }}
            animate={isInView ? { scale: 1 } : {}}
            transition={{ delay: 0.35, type: 'spring', stiffness: 280 }}
          >
            Featured
          </motion.span>
        )}
      </div>

      {/* Connector */}
      <div className={styles.entryConnector}>
        <motion.div
          className={styles.connectorDot}
          initial={{ scale: 0 }}
          animate={isInView ? { scale: 1 } : {}}
          transition={{ delay: index * 0.07 + 0.18, type: 'spring' }}
        />
        <div className={styles.connectorLine} />
      </div>

      {/* Card */}
      <motion.div
        className={styles.entryCard}
        whileHover={{ borderColor: 'rgba(94, 106, 210, 0.45)', y: -2 }}
        transition={{ duration: 0.18 }}
      >
        <div className={styles.entryHeader}>
          <div className={styles.entryMeta}>
            <span className={styles.entryRole}>{entry.role}</span>
            <span className={styles.entryPeriod}>{entry.period}</span>
          </div>
          <h4 className={styles.entryCompany}>{entry.company}</h4>
          <p className={styles.entryDesc}>{entry.description}</p>
        </div>

        <AnimatePresence>
          {isActive && (
            <motion.div
              className={styles.entryExpanded}
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.32, ease: 'easeInOut' }}
            >
              {/* Code block — no traffic light dots */}
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
                  <motion.li
                    key={i}
                    className={styles.highlight}
                    initial={{ opacity: 0, x: -6 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <span className={styles.highlightArrow}>—</span>
                    {h}
                  </motion.li>
                ))}
              </ul>

              {/* Tech stack */}
              <div className={styles.entryTech}>
                {entry.tech.map((t) => (
                  <span key={t} className={styles.techChip}>{t}</span>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <button
          className={styles.expandToggle}
          aria-label={isActive ? 'Collapse details' : 'Expand details'}
        >
          <motion.span
            animate={{ rotate: isActive ? 45 : 0 }}
            transition={{ duration: 0.18 }}
          >
            +
          </motion.span>
        </button>
      </motion.div>
    </motion.div>
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

function ProjectCard({ project, index }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.15 });
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.article
      ref={ref}
      className={`${styles.projectCard} ${project.featured ? styles.projectCardFeatured : ''}`}
      initial={{ opacity: 0, y: 32 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay: index * 0.08, ease: [0.25, 0.46, 0.45, 0.94] }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      whileHover={{ y: -4 }}
    >
      {/* Thin top accent line — no glow */}
      <div className={styles.cardAccentBar} />

      {/* Featured badge */}
      {project.featured && (
        <div className={styles.featuredLabel}>
          FEATURED
        </div>
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
          <AnimatePresence>
            {isHovered ? (
              <motion.pre
                key="snippet"
                className={styles.snippetCode}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.18 }}
              >
                <code>{PROJECT_SNIPPETS[project.id] || '// coming soon'}</code>
              </motion.pre>
            ) : (
              <motion.div
                key="idle"
                className={styles.snippetIdle}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <span className={styles.snippetIdleText}>hover to inspect</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.article>
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
      {STATS.map((stat, i) => (
        <motion.div
          key={stat.label}
          className={styles.statItem}
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: i * 0.08, duration: 0.38 }}
        >
          <span className={styles.statValue}>{stat.value}</span>
          <span className={styles.statLabel}>{stat.label}</span>
        </motion.div>
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
  const containerRef = useRef(null);
  const heroRef = useRef(null);
  const [activeEntry, setActiveEntry] = useState(null);
  const [skillCategory, setSkillCategory] = useState('all');

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end start'],
  });

  const heroOpacity = useTransform(scrollYProgress, [0, 0.18], [1, 0]);
  const heroY = useTransform(scrollYProgress, [0, 0.18], [0, -36]);

  const handleEntryClick = (id) => {
    setActiveEntry((prev) => (prev === id ? null : id));
  };

  return (
    <div className={styles.developer} ref={containerRef}>

      {/* ── DOT GRID BACKGROUND ── */}
      <div className={styles.dotGridWrap} aria-hidden="true">
        <DotGrid />
      </div>

      {/* ── HERO ── */}
      <motion.section
        ref={heroRef}
        className={styles.hero}
        style={{ opacity: heroOpacity, y: heroY }}
      >
        <div className={styles.heroInner}>
          {/* Location / role badge */}
          <motion.div
            className={styles.locationBadge}
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
          >
            <span className={styles.locationDot} />
            <span>Dubai, UAE</span>
            <span className={styles.locationSep}>·</span>
            <span>Full Stack Developer</span>
          </motion.div>

          {/* Big title */}
          <motion.h2
            className={styles.heroTitle}
            initial={{ opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          >
            <span className={styles.heroTitleLine1}>The</span>
            <span className={styles.heroTitleLine2}>Architect</span>
          </motion.h2>

          {/* Tagline */}
          <motion.p
            className={styles.heroTagline}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            {persona.tagline}
          </motion.p>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            <StatsBar />
          </motion.div>
        </div>
      </motion.section>

      {/* ── SKILLS ── */}
      <section className={styles.skillsSection}>
        <motion.div
          className={styles.sectionHeader}
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
        >
          <SectionLabel>Tech Stack</SectionLabel>
          <h3 className={styles.sectionTitle}>Skills &amp; Tools</h3>
        </motion.div>

        <SkillCloud
          activeCategory={skillCategory}
          setActiveCategory={setSkillCategory}
        />
      </section>

      {/* ── EXPERIENCE ── */}
      <section className={styles.experienceSection}>
        <motion.div
          className={styles.sectionHeader}
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
        >
          <SectionLabel>Career History</SectionLabel>
          <h3 className={styles.sectionTitle}>Experience</h3>
        </motion.div>

        <div className={styles.timeline}>
          {EXPERIENCE.map((entry, i) => (
            <TimelineEntry
              key={entry.id}
              entry={entry}
              index={i}
              isActive={activeEntry === entry.id}
              onClick={() => handleEntryClick(entry.id)}
            />
          ))}
        </div>
      </section>

      {/* ── PROJECTS ── */}
      <section className={styles.projectsSection}>
        <motion.div
          className={styles.sectionHeader}
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
        >
          <SectionLabel>Selected Work</SectionLabel>
          <h3 className={styles.sectionTitle}>Projects</h3>
        </motion.div>

        <div className={styles.projectsGrid}>
          {PROJECTS.map((project, i) => (
            <ProjectCard key={project.id} project={project} index={i} />
          ))}
        </div>
      </section>

      {/* ── FOOTER CTA ── */}
      <motion.div
        className={styles.footerCta}
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
      >
        <p className={styles.footerCtaText}>
          Systems built to last. Let&apos;s build something together.
        </p>
        <a
          href="mailto:hi@indered.in"
          className={styles.footerCtaLink}
        >
          Get in touch
        </a>
      </motion.div>
    </div>
  );
}
