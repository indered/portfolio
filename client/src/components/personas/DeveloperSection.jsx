import { useState } from 'react';
import { PERSONAS } from '../../lib/constants';
import styles from './DeveloperSection.module.scss';

const persona = PERSONAS.developer;

// ─── Broad skills — 6 pillars ────────────────────────────────────────────────
const SKILLS = [
  { name: 'Frontend', tools: 'React · Next.js · Redux · TypeScript' },
  { name: 'Backend', tools: 'Node.js · Rust · GraphQL · REST' },
  { name: 'Cloud', tools: 'AWS · Lambda · ECS · Docker' },
  { name: 'Data', tools: 'Kafka · MongoDB · PostgreSQL · ElasticSearch' },
  { name: 'Architecture', tools: 'Microservices · DDD · Event-Driven · Federation' },
  { name: 'AI / Web3', tools: 'LangChain · Solidity · Ethereum' },
];

// ─── The Work — experience + projects, drunk-friend descriptions ─────────────
const WORK = [
  {
    id: 'enbd',
    company: 'Emirates NBD',
    role: 'Senior Full Stack / Backend Engineer',
    period: '2024 — Present',
    location: 'Dubai',
    featured: false,
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
    id: 'noumena',
    company: 'Noumena',
    role: 'Backend Developer',
    period: '2021 — 2023',
    location: 'Remote',
    projects: [
      {
        name: 'Microservices Platform',
        desc: "So Noumena was this freelancer platform and I basically built its entire nervous system. Twelve microservices, all talking through Amazon SNS, zero dropped messages, 50ms latency. I designed the Apollo Federation gateway — the thing that makes a dozen GraphQL schemas play nice. Oh and I also invented their in-app currency. Like literally designed a token economy. I created money, bro.",
        tech: ['Apollo Federation', 'GraphQL', 'AWS SNS/SQS', 'Docker', 'PostgreSQL'],
      },
    ],
  },
  {
    id: 'tokopedia',
    company: 'Tokopedia',
    role: 'Full Stack Developer',
    period: '2020 — 2021',
    location: 'Jakarta',
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
    id: 'ttn',
    company: 'To The New',
    role: 'Full Stack Developer',
    period: '2019 — 2020',
    location: 'Delhi',
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
    id: 'freelance',
    company: 'Freelance',
    role: 'Full Stack Developer',
    period: '2021 — 2022',
    location: 'Remote',
    projects: [
      {
        name: 'Man the Bay',
        desc: "Solo mission for Urban-Ed Academy — built their digital report card for a 4-year fellowship in the Bay Area. Full MERN stack, one-person army. When you believe in the cause, you become the entire engineering department.",
        tech: ['React', 'Node.js', 'Express', 'MongoDB'],
      },
    ],
  },
];

// ─── Main Section ─────────────────────────────────────────────────────────────
export default function DeveloperSection() {
  const [openWork, setOpenWork] = useState(null);

  return (
    <div className={styles.magazine} role="main">

      {/* ── MASTHEAD ── */}
      <header className={styles.masthead}>
        <div className={styles.mastheadMeta}>
          <span>Dubai, UAE</span>
          <span className={styles.dot}>·</span>
          <span>Est. 2019</span>
        </div>
        <h1 className={styles.title}>THE<br />ARCHITECT</h1>
        <div className={styles.rule} />
      </header>

      {/* ── DOSSIER BAR ── */}
      <div className={styles.dossierBar}>
        <div className={styles.dossierItem}><span className={styles.dLabel}>Current</span><span className={styles.dValue}>Emirates NBD</span></div>
        <div className={styles.dossierItem}><span className={styles.dLabel}>Stack</span><span className={styles.dValue}>React · Node · Rust</span></div>
        <div className={styles.dossierItem}><span className={styles.dLabel}>Featured</span><span className={styles.dValue}>2× Google I/O</span></div>
        <div className={styles.dossierItem}><span className={styles.dLabel}>Running</span><span className={styles.dValue}>Burj2Burj</span></div>
      </div>

      {/* ── DOWNLOADS ── */}
      <div className={styles.downloads}>
        <a href="/mahesh-inder-resume.pdf" download className={styles.dlLink}>Resume</a>
        <span className={styles.sep}>/</span>
        <a href="/mahesh-inder-cover-letter.pdf" download className={styles.dlLink}>Cover Letter</a>
      </div>

      {/* ── SKILLS — 6 broad pillars ── */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Skills</h2>
        <div className={styles.ruleLight} />
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
        <div className={styles.ruleLight} />

        <div className={styles.workList}>
          {WORK.map((entry) => {
            const isOpen = openWork === entry.id;
            return (
              <article key={entry.id} className={`${styles.workItem} ${isOpen ? styles.workOpen : ''}`}>
                <div
                  className={styles.workHead}
                  onClick={() => setOpenWork(isOpen ? null : entry.id)}
                >
                  <div className={styles.workLeft}>
                    <h4 className={styles.workCompany}>
                      {entry.company}
                      {entry.featured && <span className={styles.badge}>Google I/O</span>}
                    </h4>
                    <span className={styles.workRole}>{entry.role}</span>
                  </div>
                  <div className={styles.workRight}>
                    <span className={styles.workPeriod}>{entry.period}</span>
                    <span className={styles.workToggle}>{isOpen ? '−' : '+'}</span>
                  </div>
                </div>

                {isOpen && (
                  <div className={styles.workBody}>
                    {entry.projects.map((proj) => (
                      <div key={proj.name} className={styles.project}>
                        <h5 className={styles.projName}>{proj.name}</h5>
                        <p className={styles.projDesc}>{proj.desc}</p>
                        <div className={styles.projTech}>
                          {proj.tech.map((t) => (
                            <span key={t} className={styles.tag}>{t}</span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </article>
            );
          })}
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className={styles.footer}>
        <div className={styles.rule} />
        <p className={styles.footerText}>Systems built to last.</p>
        <a href="mailto:hello@maheshinder.in" className={styles.footerCta}>
          Get in touch &rarr;
        </a>
      </footer>
    </div>
  );
}
