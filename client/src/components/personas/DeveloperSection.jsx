import styles from './DeveloperSection.module.scss';

// ─── Skills — 6 broad pillars ────────────────────────────────────────────────
const SKILLS = [
  { name: 'Frontend', tools: 'React · Next.js · Redux · TypeScript' },
  { name: 'Backend', tools: 'Node.js · Rust · GraphQL · REST' },
  { name: 'Cloud', tools: 'AWS · Lambda · ECS · Docker' },
  { name: 'Data', tools: 'Kafka · MongoDB · PostgreSQL · ElasticSearch' },
  { name: 'Architecture', tools: 'Microservices · DDD · Event-Driven · Federation' },
  { name: 'AI / Web3', tools: 'LangChain · Solidity · Ethereum' },
];

// ─── The Work ────────────────────────────────────────────────────────────────
const WORK = [
  {
    company: 'Emirates NBD',
    role: 'Senior Full Stack / Backend Engineer',
    period: '2024 — Present',
    projects: [
      {
        name: 'Payment Tracker',
        desc: "Real-time payment tracking for every dirham in the UAE, sub-millisecond on Kafka, Lambda and Rust.",
        tech: ['Rust', 'Kafka', 'AWS Lambda', 'Node.js'],
      },
      {
        name: 'Statement Generator',
        desc: "Rust-powered document engine that generates bank statements for accounts, FDs and credit cards 10x faster than the legacy system.",
        tech: ['Rust', 'Document Engine', 'Node.js', 'AWS'],
      },
    ],
  },
  {
    company: 'Noumena',
    role: 'Backend Developer',
    period: '2021 — 2023',
    projects: [
      {
        name: 'Microservices Platform',
        desc: "Twelve microservices, Apollo Federation gateway, in-app token economy, zero dropped messages at 50ms latency.",
        tech: ['Apollo Federation', 'GraphQL', 'AWS SNS/SQS', 'Docker', 'PostgreSQL'],
      },
    ],
  },
  {
    company: 'Tokopedia',
    role: 'Full Stack Developer',
    period: '2020 — 2021',
    featured: true,
    projects: [
      {
        name: 'Discovery Engine',
        desc: "Product discovery APIs so fast Google featured them at I/O twice. TTFB at 87ms.",
        tech: ['React', 'Node.js', 'GraphQL', 'Go'],
      },
      {
        name: 'Intools',
        desc: "Admin tool for Discovery sale pages that moved millions in GMV through content pipelines and live previews.",
        tech: ['React', 'Ant Design', 'Kubernetes'],
      },
    ],
  },
  {
    company: 'To The New',
    role: 'Full Stack Developer',
    period: '2019 — 2020',
    projects: [
      {
        name: 'Kokaihop 3.0',
        desc: "Full API rebuild handling 2,000 concurrent users with ElasticSearch (20ms search), RabbitMQ and Node cluster mode.",
        tech: ['Apollo Server', 'GraphQL', 'MongoDB', 'ElasticSearch', 'RabbitMQ'],
      },
      {
        name: 'Bharti AXA PWA',
        desc: "Offline-first insurance PWA with multilevel form wizard and Redux state management.",
        tech: ['React', 'Redux', 'Apollo Client', 'PWA'],
      },
    ],
  },
  {
    company: 'Freelance',
    role: 'Full Stack Developer',
    period: '2021 — 2022',
    projects: [
      {
        name: 'Man the Bay',
        desc: "Solo MERN build for Urban-Ed Academy's 4-year fellowship program in the Bay Area.",
        tech: ['React', 'Node.js', 'Express', 'MongoDB'],
      },
    ],
  },
];

export default function DeveloperSection() {
  return (
    <div className={styles.page} role="main">

      {/* ── INTRO LINE ── */}
      <p className={styles.intro}>
        7 years across 4 countries. Finance, e-commerce, social and AI.
      </p>

      {/* ── DOWNLOADS ── */}
      <div className={styles.downloads}>
        <a href="/mahesh-inder-resume.pdf" download="Mahesh_Inder_Resume.pdf" className={styles.dlBtn}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
          Resume
        </a>
        <a href="/mahesh-inder-cover-letter.pdf" download="Mahesh_Inder_Cover_Letter.pdf" className={styles.dlBtn}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
          Cover Letter
        </a>
      </div>

      {/* ── SKILLS — on top ── */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Skills</h2>
        <div className={styles.skillGrid}>
          {SKILLS.map((s) => (
            <div key={s.name} className={styles.skillCard}>
              <h3 className={styles.skillName}>{s.name}</h3>
              <p className={styles.skillTools}>{s.tools}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── THE WORK ── */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>The Work</h2>

        {WORK.map((entry, idx) => (
          <div key={idx} className={styles.workEntry}>
            <div className={styles.workHead}>
              <div>
                <h3 className={styles.workCompany}>
                  {entry.company}
                  {entry.featured && <span className={styles.badge}>2× Google I/O</span>}
                </h3>
                <span className={styles.workRole}>{entry.role}</span>
              </div>
              <span className={styles.workPeriod}>{entry.period}</span>
            </div>

            {entry.projects.map((proj) => (
              <div key={proj.name} className={styles.project}>
                <h4 className={styles.projName}>{proj.name}</h4>
                <p className={styles.projDesc}>{proj.desc}</p>
                <div className={styles.projTech}>
                  {proj.tech.map((t) => (
                    <span key={t} className={styles.tag}>{t}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ))}
      </section>

      {/* ── FOOTER ── */}
      <footer className={styles.footer}>
        <a href="mailto:hello@maheshinder.in" className={styles.footerCta}>
          Get in touch &rarr;
        </a>
        <p className={styles.colophon}>
          dreamt up at 3am by <span className={styles.colName}>mahesh inder</span>
          <span className={styles.colDot}>·</span>
          wired together by <span className={styles.colClaude}>claude</span>
        </p>
      </footer>
    </div>
  );
}
