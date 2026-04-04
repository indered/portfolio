import { useState, useCallback } from 'react';
import { PERSONAS, SKILLS } from '../../lib/constants';
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

// ─── The Work — merged experience + projects, drunk-friend energy ─────────────
const WORK = [
  {
    id: 'enbd',
    company: 'Emirates NBD',
    role: 'Senior Full Stack / Backend Engineer',
    period: '2024 — Present',
    location: 'Dubai',
    headline: 'Building the money pipes for one of the biggest banks in the Middle East.',
    story: "Okay so picture this — every time someone in the UAE sends money, my code touches it. I built this real-time payment tracker that runs on Kafka and AWS Lambda, and the whole thing moves faster than you can blink. Like sub-millisecond fast. My manager once asked me 'can it be faster?' and I rewrote the hot path in Rust. Yes, Rust. At a bank. I'm that guy.",
    projects: [
      {
        name: 'Payment Tracker',
        desc: "Real-time payment tracking using event-driven architecture — Kafka consumers eating messages like it's an all-you-can-eat buffet, AWS Lambda triggers firing everywhere, and every single dirham accounted for in sub-millisecond time. The backend is polyglot — Rust for the bits that need to be stupidly fast, Node.js for everything else.",
        tech: ['Rust', 'Kafka', 'AWS Lambda', 'Node.js', 'TypeScript'],
      },
      {
        name: 'Statement Generator',
        desc: "A document engine built on Rust that generates statements for accounts, FDs, credit cards — basically every piece of paper the bank throws at you, but digitally. It talks to like fifteen different systems, stitches the data together, and renders pixel-perfect PDFs. Built the whole thing from scratch because the existing one was... let's just say it was from a different era.",
        tech: ['Rust', 'Document Engine', 'Node.js', 'AWS'],
      },
    ],
    tech: ['Rust', 'Node.js', 'Kafka', 'AWS Lambda', 'TypeScript', 'LangChain'],
  },
  {
    id: 'noumena',
    company: 'Noumena',
    role: 'Backend Developer',
    period: '2021 — 2023',
    location: 'Remote',
    headline: 'Architected the nervous system of a global freelancer platform.',
    story: "So Noumena was this wild ride where I basically built an entire microservices galaxy from scratch. Imagine like... 12 different services all talking to each other through Amazon SNS, and none of them are allowed to drop a single message. I designed the whole Apollo Federation gateway — you know, the thing that makes all these GraphQL schemas play nice together. Oh and I also invented their in-app currency. Like literally designed a token economy for freelancer transactions. I basically created money, bro.",
    projects: [
      {
        name: 'Microservices Galaxy',
        desc: "Apollo Federation gateway stitching together a dozen GraphQL schemas. Inter-service messaging via Amazon SNS with 50ms latency and zero dropped messages. Domain-Driven Design so clean that onboarding new devs went from 2 weeks to 3 days.",
        tech: ['Apollo Federation', 'GraphQL', 'AWS SNS/SQS', 'Docker', 'PostgreSQL'],
      },
    ],
    tech: ['Node.js', 'Apollo Federation', 'GraphQL', 'AWS SNS/SQS', 'Docker', 'PostgreSQL'],
  },
  {
    id: 'tokopedia',
    company: 'Tokopedia',
    role: 'Full Stack Developer',
    period: '2020 — 2021',
    location: 'Jakarta',
    featured: true,
    headline: 'Built APIs so fast, Google put them on stage. Twice.',
    story: "This is the one I flex the hardest. Tokopedia is basically Indonesia's Amazon, right? And I built APIs for their discovery engine — the thing that shows you products before you even know you want them. The rendering was SO fast that Google literally featured it at I/O. And then they featured it AGAIN the next year. Two times at Google I/O. I peaked at 23 and I'm okay with that. Also built this admin tool called Intools that managed sale pages worth millions in GMV. No big deal.",
    projects: [
      {
        name: 'Discovery Engine',
        desc: "Super-fast rendering APIs for product discovery. Featured twice at Google I/O as a case study in web performance. TTFB clocked at 87ms.",
        tech: ['React', 'Node.js', 'GraphQL', 'Go'],
      },
      {
        name: 'Intools',
        desc: "Admin weapon for managing Discovery sale pages. Moved millions in GMV through content management pipelines.",
        tech: ['React', 'Ant Design', 'Kubernetes'],
      },
    ],
    tech: ['React', 'Node.js', 'GraphQL', 'Go', 'Ant Design', 'Kubernetes'],
  },
  {
    id: 'ttn',
    company: 'To The New',
    role: 'Full Stack Developer',
    period: '2019 — 2020',
    location: 'Delhi',
    headline: 'Where the Big Bang happened. Two projects, 2,000+ concurrent users.',
    story: "This is where it all started, man. My first real gig and they threw me into the deep end — lead API dev on Kokaihop 3.0, a recipe platform that needed to handle 2,000 concurrent users without breaking a sweat. I plugged in ElasticSearch for search that returns in 20 milliseconds, RabbitMQ for async processing, and ran Node in cluster mode like a madman. Then they put me on Bharti AXA — a PWA for insurance forms so complex it needed its own dimension of Redux state management.",
    projects: [
      {
        name: 'Kokaihop 3.0',
        desc: "Full API architecture rebuild — MongoDB schemas, Apollo Server, ElasticSearch for 20ms search, RabbitMQ for async tasks, Node.js cluster mode handling 2,000+ concurrent users.",
        tech: ['React', 'Redux', 'Apollo Server', 'GraphQL', 'MongoDB', 'ElasticSearch'],
      },
      {
        name: 'Bharti AXA PWA',
        desc: "Progressive Web App with multilevel insurance forms. Redux state management so complex it could have its own conference talk.",
        tech: ['React', 'Redux', 'Apollo Client', 'PWA'],
      },
    ],
    tech: ['React', 'Redux', 'Apollo Server', 'GraphQL', 'MongoDB', 'ElasticSearch', 'RabbitMQ'],
  },
  {
    id: 'freelance',
    company: 'Freelancing',
    role: 'Full Stack Developer',
    period: '2021 — 2022',
    location: 'Remote',
    headline: 'Solo missions for causes that matter.',
    story: "Sometimes you gotta go solo. Built Man the Bay for Urban-Ed Academy — a digital report card for their 4-year fellowship in the Bay Area. Full MERN stack, one-person army. When you believe in the cause, you become the entire engineering department.",
    projects: [
      {
        name: 'Man the Bay',
        desc: "Digital report card for Urban-Ed Academy's fellowship program. Full MERN stack, solo deployment, real impact.",
        tech: ['React', 'Node.js', 'Express', 'MongoDB'],
      },
    ],
    tech: ['React', 'Node.js', 'Express', 'MongoDB'],
  },
];

// ─── Edition helpers ──────────────────────────────────────────────────────────
const EDITION_DATE = new Date().toLocaleDateString('en-GB', {
  year: 'numeric',
  month: 'long',
});

// ─── Main Section ─────────────────────────────────────────────────────────────
export default function DeveloperSection() {
  const [expandedWork, setExpandedWork] = useState(null);
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
    <div className={styles.magazine} role="main">

      {/* ── MASTHEAD ── */}
      <header className={styles.masthead}>
        <div className={styles.mastheadMeta}>
          <span>{EDITION_DATE}</span>
          <span className={styles.mastheadDot}>·</span>
          <span>Dubai, UAE</span>
        </div>
        <h1 className={styles.mastheadTitle}>THE<br />ARCHITECT</h1>
        <p className={styles.mastheadSub}>{persona.tagline}</p>
        <div className={styles.mastheadRule} />
      </header>

      {/* ── HERO SPREAD ── */}
      <section className={styles.heroSpread}>
        <div className={styles.heroMain}>
          <span className={styles.kicker}>Profile</span>
          <h2 className={styles.heroHeadline}>
            Mahesh Inder builds things<br />
            that move money, serve millions,<br />
            and occasionally impress Google.
          </h2>
          <p className={styles.heroDek}>
            Seven years. Four countries. From Kafka streams at Emirates NBD to APIs
            that got standing ovations at Google I/O — twice. Currently in Dubai,
            making sure every dirham in the UAE moves at sub-millisecond speed.
          </p>
          <div className={styles.downloadRow}>
            <a href="/mahesh-inder-resume.pdf" download className={styles.downloadLink}>
              Resume
            </a>
            <span className={styles.sep} aria-hidden="true">/</span>
            <a href="/mahesh-inder-cover-letter.pdf" download className={styles.downloadLink}>
              Cover Letter
            </a>
          </div>
        </div>

        {/* Dossier sidebar */}
        <aside className={styles.dossier}>
          <h3 className={styles.dossierTitle}>Dossier</h3>
          <dl className={styles.dossierList}>
            <div className={styles.dossierRow}><dt>Location</dt><dd>Dubai, UAE</dd></div>
            <div className={styles.dossierRow}><dt>Current</dt><dd>Emirates NBD</dd></div>
            <div className={styles.dossierRow}><dt>Stack</dt><dd>React · Node · Rust</dd></div>
            <div className={styles.dossierRow}><dt>Featured</dt><dd>2× Google I/O</dd></div>
            <div className={styles.dossierRow}><dt>Running</dt><dd>Burj2Burj · Marathons</dd></div>
            <div className={styles.dossierRow}><dt>Email</dt><dd>hello@maheshinder.in</dd></div>
          </dl>
        </aside>
      </section>

      {/* ── SKILLS — "The Toolkit" ── */}
      <section className={styles.section}>
        <div className={styles.sectionHead}>
          <span className={styles.sectionLabel}>The Toolkit</span>
          <div className={styles.sectionRule} />
        </div>

        <div className={styles.skillFilters}>
          {SKILL_CATEGORIES.map((cat) => (
            <button
              key={cat.key}
              className={`${styles.filterBtn} ${skillCategory === cat.key ? styles.filterActive : ''}`}
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

      {/* ── THE WORK — merged experience + projects ── */}
      <section className={styles.section}>
        <div className={styles.sectionHead}>
          <span className={styles.sectionLabel}>The Work</span>
          <div className={styles.sectionRule} />
        </div>

        <div className={styles.workStream}>
          {WORK.map((entry) => {
            const isOpen = expandedWork === entry.id;
            return (
              <article
                key={entry.id}
                className={`${styles.workCard} ${isOpen ? styles.workCardOpen : ''} ${entry.featured ? styles.workCardFeatured : ''}`}
              >
                {/* Header — always visible */}
                <div
                  className={styles.workHeader}
                  onClick={() => setExpandedWork(isOpen ? null : entry.id)}
                >
                  <div className={styles.workMeta}>
                    <span className={styles.workPeriod}>{entry.period}</span>
                    <span className={styles.workLocation}>{entry.location}</span>
                    {entry.featured && <span className={styles.workBadge}>2× Google I/O</span>}
                  </div>
                  <h4 className={styles.workCompany}>{entry.company}</h4>
                  <span className={styles.workRole}>{entry.role}</span>
                  <p className={styles.workHeadline}>{entry.headline}</p>
                  <span className={styles.workToggle}>{isOpen ? 'Less' : 'Read the story'}</span>
                </div>

                {/* Expanded — the drunk friend explanation */}
                {isOpen && (
                  <div className={styles.workBody}>
                    <p className={styles.workStory}>{entry.story}</p>

                    {/* Projects within this role */}
                    {entry.projects.map((proj) => (
                      <div key={proj.name} className={styles.projectBlock}>
                        <h5 className={styles.projectName}>{proj.name}</h5>
                        <p className={styles.projectDesc}>{proj.desc}</p>
                        <div className={styles.projectTech}>
                          {proj.tech.map((t) => (
                            <span key={t} className={styles.techTag}>{t}</span>
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
        <div className={styles.footerRule} />
        <p className={styles.footerQuote}>
          &ldquo;Systems built to last. Let&apos;s build something together.&rdquo;
        </p>
        <a href="mailto:hello@maheshinder.in" className={styles.footerCta}>
          Get in touch &rarr;
        </a>
        <div className={styles.footerMeta}>
          <span>© {new Date().getFullYear()} Mahesh Inder</span>
          <span>Dubai, UAE</span>
        </div>
      </footer>
    </div>
  );
}
