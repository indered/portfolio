import styles from './DeveloperSection.module.scss';

// ─── The Work — all visible, casual but professional ─────────────────────────
const WORK = [
  {
    company: 'Emirates NBD',
    role: 'Senior Full Stack / Backend Engineer',
    period: '2024 — Present',
    projects: [
      {
        name: 'Payment Tracker',
        desc: "Every time someone in the UAE sends money — every single dirham — this system tracks it in real time. Built on Kafka and AWS Lambda, processing transactions in sub-millisecond time. The performance-critical path runs on Rust because sometimes Node just isn't fast enough. Event-driven architecture, zero tolerance for latency.",
        tech: ['Rust', 'Kafka', 'AWS Lambda', 'Node.js'],
      },
      {
        name: 'Statement Generator',
        desc: "A document engine built from scratch in Rust that generates every statement the bank produces — accounts, fixed deposits, credit cards, the lot. Pulls data from fifteen different systems, stitches it together, and renders pixel-perfect PDFs. Replaced a legacy system from 2014 and does the job ten times faster.",
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
        desc: "Built the entire backend nervous system of a global freelancer platform. Twelve microservices communicating through Amazon SNS — zero dropped messages, 50ms latency. Designed the Apollo Federation gateway that makes a dozen GraphQL schemas work as one. Also designed their in-app token economy for freelancer transactions. Literally created a currency.",
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
        desc: "APIs for Indonesia's largest e-commerce platform — the product discovery engine that shows you things before you know you want them. The rendering was fast enough that Google featured it at I/O. Then featured it again the next year. Two appearances at Google I/O off the same work. TTFB clocked at 87ms.",
        tech: ['React', 'Node.js', 'GraphQL', 'Go'],
      },
      {
        name: 'Intools',
        desc: "Internal admin tool for managing Discovery sale pages. Every flash sale, every campaign page that moved millions in GMV — all orchestrated through this. Content pipelines, live previews, real-time publishing.",
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
        desc: "First real gig, lead API developer. They said handle 2,000 concurrent users — so the answer was ElasticSearch for 20ms search, RabbitMQ for async processing, Node in cluster mode. MongoDB schemas, Apollo Server, everything from scratch. The full stack, built ground up.",
        tech: ['Apollo Server', 'GraphQL', 'MongoDB', 'ElasticSearch', 'RabbitMQ'],
      },
      {
        name: 'Bharti AXA PWA',
        desc: "Progressive Web App for insurance — multilevel form wizard with conditional logic branches everywhere. Offline-first, Redux state management complex enough to be its own conference talk.",
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
        desc: "Solo build for Urban-Ed Academy — a digital report card for their 4-year fellowship program in the Bay Area. Full MERN stack, one-person engineering department. When the cause matters, you ship the whole thing yourself.",
        tech: ['React', 'Node.js', 'Express', 'MongoDB'],
      },
    ],
  },
];

// ─── Skills — 6 broad pillars ────────────────────────────────────────────────
const SKILLS = [
  { name: 'Frontend', tools: 'React · Next.js · Redux · TypeScript' },
  { name: 'Backend', tools: 'Node.js · Rust · GraphQL · REST' },
  { name: 'Cloud', tools: 'AWS · Lambda · ECS · Docker' },
  { name: 'Data', tools: 'Kafka · MongoDB · PostgreSQL · ElasticSearch' },
  { name: 'Architecture', tools: 'Microservices · DDD · Event-Driven · Federation' },
  { name: 'AI / Web3', tools: 'LangChain · Solidity · Ethereum' },
];

export default function DeveloperSection() {
  return (
    <div className={styles.page} role="main">

      {/* ── DOSSIER BAR ── */}
      <div className={styles.dossierBar}>
        <div className={styles.dossierItem}><span className={styles.dLabel}>Current</span><span className={styles.dValue}>Emirates NBD</span></div>
        <div className={styles.dossierItem}><span className={styles.dLabel}>Stack</span><span className={styles.dValue}>React · Node · Rust</span></div>
        <div className={styles.dossierItem}><span className={styles.dLabel}>Featured</span><span className={styles.dValue}>2× Google I/O</span></div>
        <div className={styles.dossierItem}><span className={styles.dLabel}>B2B</span><span className={styles.dValue}>Burj2Burj Finisher</span></div>
      </div>

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

      {/* ── THE WORK — all visible ── */}
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

      {/* ── SKILLS — after work ── */}
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
