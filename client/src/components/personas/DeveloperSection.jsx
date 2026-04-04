import { PERSONAS } from '../../lib/constants';
import styles from './DeveloperSection.module.scss';

// ─── Broad skills — 6 pillars ────────────────────────────────────────────────
const SKILLS = [
  { name: 'Frontend', tools: 'React · Next.js · Redux · TypeScript' },
  { name: 'Backend', tools: 'Node.js · Rust · GraphQL · REST' },
  { name: 'Cloud', tools: 'AWS · Lambda · ECS · Docker' },
  { name: 'Data', tools: 'Kafka · MongoDB · PostgreSQL · ElasticSearch' },
  { name: 'Architecture', tools: 'Microservices · DDD · Event-Driven · Federation' },
  { name: 'AI / Web3', tools: 'LangChain · Solidity · Ethereum' },
];

// ─── The Work — all visible, drunk-friend descriptions ───────────────────────
const WORK = [
  {
    company: 'Emirates NBD',
    role: 'Senior Full Stack / Backend Engineer',
    period: '2024 — Present',
    projects: [
      {
        name: 'Payment Tracker',
        desc: "Bro okay so imagine every time someone in the UAE sends money — like literally every dirham — my code touches it. Built this real-time payment tracker on Kafka and AWS Lambda that processes transactions in sub-millisecond time. The hot path? Rewrote it in Rust because Node wasn't cutting it. Yes, Rust at a bank. I'm that guy.",
        tech: ['Rust', 'Kafka', 'AWS Lambda', 'Node.js'],
      },
      {
        name: 'Statement Generator',
        desc: "You know those bank statements nobody reads? I built the engine that makes them. Accounts, FDs, credit cards — every statement the bank generates comes through this Rust-powered document engine I designed from scratch. It talks to like fifteen different systems, stitches your financial life together, and spits out pixel-perfect PDFs. The old system was from 2014. Mine does it in a tenth of the time.",
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
        desc: "So Noumena was this freelancer platform and I basically built its entire nervous system. Twelve microservices, all talking through Amazon SNS, zero dropped messages, 50ms latency. I designed the Apollo Federation gateway — the thing that makes a dozen GraphQL schemas play nice. Oh and I also invented their in-app currency. Like literally designed a token economy. I created money, bro.",
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
        desc: "This is the one I flex the hardest. Tokopedia is basically Indonesia's Amazon right? I built APIs for their product discovery engine — shows you stuff before you know you want it. The rendering was SO fast that Google featured it at I/O. And then they featured it AGAIN the next year. Two times at Google I/O. TTFB clocked at 87ms. I peaked at 23 and honestly I'm okay with that.",
        tech: ['React', 'Node.js', 'GraphQL', 'Go'],
      },
      {
        name: 'Intools',
        desc: "Admin weapon for managing Discovery sale pages. Every flash sale, every campaign page that moved millions in GMV — all managed through this tool I built. Content pipelines, live previews, the whole thing.",
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
        desc: "Where the Big Bang happened. First real gig, lead API dev, and they said 'handle 2,000 concurrent users.' So I plugged in ElasticSearch for 20ms search, RabbitMQ for async processing, ran Node in cluster mode like a madman. MongoDB schemas, Apollo Server, the full quantum stack. Everything from scratch.",
        tech: ['Apollo Server', 'GraphQL', 'MongoDB', 'ElasticSearch', 'RabbitMQ'],
      },
      {
        name: 'Bharti AXA PWA',
        desc: "Insurance forms so complex they needed their own dimension of Redux state. Multilevel form wizard, offline-first PWA, conditional logic branches everywhere. State management so clean it could've been a conference talk.",
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
        desc: "Solo mission for Urban-Ed Academy — built their digital report card for a 4-year fellowship in the Bay Area. Full MERN stack, one-person army. When you believe in the cause, you become the entire engineering department.",
        tech: ['React', 'Node.js', 'Express', 'MongoDB'],
      },
    ],
  },
];

export default function DeveloperSection() {
  return (
    <div className={styles.page} role="main">

      {/* ── DOSSIER BAR ── */}
      <div className={styles.dossierBar}>
        <div className={styles.dossierItem}><span className={styles.dLabel}>Current</span><span className={styles.dValue}>Emirates NBD</span></div>
        <div className={styles.dossierItem}><span className={styles.dLabel}>Stack</span><span className={styles.dValue}>React · Node · Rust</span></div>
        <div className={styles.dossierItem}><span className={styles.dLabel}>Featured</span><span className={styles.dValue}>2× Google I/O</span></div>
        <div className={styles.dossierItem}><span className={styles.dLabel}>Running</span><span className={styles.dValue}>Burj2Burj</span></div>
      </div>

      {/* ── DOWNLOADS — proper download buttons ── */}
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

      {/* ── SKILLS ── */}
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

      {/* ── THE WORK — all visible, no accordions ── */}
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
