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
      <div className={styles.intro}>
        <p>7+ years of full stack development across India, Indonesia and UAE.</p>
        <p>Worked in finance, e-commerce, social platforms and AI.</p>
      </div>

      {/* ── DOWNLOADS + SOCIALS ── */}
      <div className={styles.downloads}>
        <a href="/mahesh-inder-resume.pdf" download="Mahesh_Inder_Resume.pdf" className={styles.dlBtn}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
          Resume
        </a>
        <a href="/mahesh-inder-cover-letter.pdf" download="Mahesh_Inder_Cover_Letter.pdf" className={styles.dlBtn}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
          Cover Letter
        </a>
        <a href="https://www.linkedin.com/in/mahesh-inder/" target="_blank" rel="noopener noreferrer" className={styles.dlBtn}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
          LinkedIn
        </a>
        <a href="https://github.com/indered" target="_blank" rel="noopener noreferrer" className={styles.dlBtn}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/></svg>
          GitHub
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
        <a href="mailto:mahesh.inder85@gmail.com" className={styles.footerCta}>
          Get in touch &rarr;
        </a>
      </footer>
    </div>
  );
}
