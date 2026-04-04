import styles from './DatingSection.module.scss';

// ─── Profile data ─────────────────────────────────────────────────────────────

const PROFILE = {
  name: 'Mahesh Inder',
  age: 28,
  location: 'Dubai, UAE',
  occupation: 'Software engineer & blockchain architect',
  height: "5'11\"",
  religion: 'Sikh',
  education: 'Computer Science',
  hometown: 'Punjab, India',
};

const PHOTOS = [
  {
    id: 1,
    num: '01',
    caption: 'Running the Dubai Marathon at sunrise — certified pavement destroyer.',
  },
  {
    id: 2,
    num: '02',
    caption: 'The beach is my second office. Less productive, better views.',
  },
  {
    id: 3,
    num: '03',
    caption: 'Late-night sessions. Will play you a song if you ask nicely.',
  },
  {
    id: 4,
    num: '04',
    caption: 'DIFC: where the decisions cost more than therapy.',
  },
  {
    id: 5,
    num: '05',
    caption: '27 countries. Still deciding where home is.',
  },
];

const PROMPTS = [
  {
    question: 'My most controversial opinion',
    answer:
      'Pineapple belongs on pizza. Also: blockchain will reshape how value moves through the world — probably before we figure out the pizza debate.',
  },
  {
    question: 'A thought I cannot stop having',
    answer:
      'If I containerised my life the way I containerise my code, would the deployments be smoother? The honest answer is still no.',
  },
  {
    question: 'The way to win me over',
    answer:
      'Bring biryani. Debate philosophy. Push back on my code review. I respond well to people who have actual opinions and are not afraid to defend them.',
  },
  {
    question: 'My love language',
    answer:
      'Acts of service — specifically the kind where I deploy your app at 2 AM while you sleep completely unbothered. I consider this romantic.',
  },
  {
    question: 'What I geek out on',
    answer:
      'Zero-knowledge proofs, 432 Hz guitar tuning, marathon pacing strategy, and a perfectly timed, correctly contextualised meme. The overlap between these is rarer than you think.',
  },
];

const STATS = [
  { value: '42+', label: 'Marathons considered', sub: '2 actually finished' },
  { value: '∞',   label: 'Lines of code written', sub: 'and responsibly deleted' },
  { value: '27',  label: 'Countries visited', sub: 'home is still negotiable' },
  { value: '0',   label: 'Unsolicited opinions about your code', sub: 'unless you ship on Friday' },
  { value: '1',   label: 'Non-negotiable', sub: 'good biryani, always' },
  { value: '100%',label: 'Likelihood of reading your bio', sub: 'before responding to it' },
];

// ─── Sub-components ───────────────────────────────────────────────────────────

function PhotoSlot({ photo }) {
  const noiseUrl =
    "data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E";

  return (
    <figure className={styles.photoSlot}>
      <div
        className={styles.photoImage}
        style={{ backgroundImage: `url("${noiseUrl}")` }}
        aria-hidden="true"
      >
        <span className={styles.photoNum}>{photo.num}</span>
      </div>
      <figcaption className={styles.photoCaption}>{photo.caption}</figcaption>
    </figure>
  );
}

function PromptBlock({ question, answer }) {
  return (
    <article className={styles.promptBlock} aria-label={question}>
      <h3 className={styles.promptQuestion}>{question}</h3>
      <p className={styles.promptAnswer}>{answer}</p>
    </article>
  );
}

function StatCard({ stat }) {
  return (
    <div className={styles.statCard} role="listitem" aria-label={`${stat.label}: ${stat.value}, ${stat.sub}`}>
      <span className={styles.statValue}>{stat.value}</span>
      <span className={styles.statLabel}>{stat.label}</span>
      <span className={styles.statSub}>{stat.sub}</span>
    </div>
  );
}

// ─── Main section ─────────────────────────────────────────────────────────────

export default function DatingSection() {
  return (
    <div className={styles.container} role="main">

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <header className={styles.hero} aria-labelledby="dating-heading">
        <p className={styles.heroEyebrow}>The Eligible Bachelor</p>
        <h1 id="dating-heading" className={styles.heroName}>{PROFILE.name}</h1>
        <p className={styles.heroAge} aria-label={`Age: ${PROFILE.age}`}>{PROFILE.age}</p>
        <p className={styles.heroOccupation}>{PROFILE.occupation}</p>
        <p className={styles.heroLocation}>{PROFILE.location}</p>
        <div className={styles.heroPills} role="list" aria-label="Profile details">
          <span className={styles.pill} role="listitem">{PROFILE.height}</span>
          <span className={styles.pill} role="listitem">{PROFILE.hometown}</span>
          <span className={styles.pill} role="listitem">{PROFILE.education}</span>
          <span className={styles.pill} role="listitem">{PROFILE.religion}</span>
        </div>
      </header>

      <hr className={styles.divider} />

      {/* ── First prompt ─────────────────────────────────────────────────── */}
      <PromptBlock
        question={PROMPTS[0].question}
        answer={PROMPTS[0].answer}
      />

      {/* ── Photo grid row 1 ─────────────────────────────────────────────── */}
      <section className={styles.photoGrid} aria-label="Photo gallery">
        {PHOTOS.slice(0, 2).map((p) => (
          <PhotoSlot key={p.id} photo={p} />
        ))}
      </section>

      {/* ── Prompt 2 ─────────────────────────────────────────────────────── */}
      <PromptBlock
        question={PROMPTS[1].question}
        answer={PROMPTS[1].answer}
      />

      {/* ── Photo grid row 2 ─────────────────────────────────────────────── */}
      <section className={styles.photoGrid} aria-label="Photo gallery continued">
        {PHOTOS.slice(2, 4).map((p) => (
          <PhotoSlot key={p.id} photo={p} />
        ))}
      </section>

      {/* ── Prompt 3 ─────────────────────────────────────────────────────── */}
      <PromptBlock
        question={PROMPTS[2].question}
        answer={PROMPTS[2].answer}
      />

      {/* ── Photo 5 full-width ───────────────────────────────────────────── */}
      <section className={`${styles.photoGrid} ${styles.photoGridSingle}`} aria-label="Feature photo">
        <PhotoSlot photo={PHOTOS[4]} />
      </section>

      {/* ── Prompts 4 & 5 ────────────────────────────────────────────────── */}
      <PromptBlock
        question={PROMPTS[3].question}
        answer={PROMPTS[3].answer}
      />
      <PromptBlock
        question={PROMPTS[4].question}
        answer={PROMPTS[4].answer}
      />

      <hr className={styles.divider} />

      {/* ── People / compatibility prose ─────────────────────────────────── */}
      <section className={styles.compatSection}>
        <div className={styles.compatBlock}>
          <h2 className={styles.compatHeading}>People I connect with</h2>
          <p className={styles.compatBody}>
            Intellectually curious, independently ambitious, and comfortable with silence
            that is not awkward. Has a passport with actual stamps. Can laugh at themselves
            — which is different from not taking anything seriously. Knows the difference
            between your and you're, though I will not make this a dealbreaker.
          </p>
        </div>
        <hr className={styles.dividerThin} />
        <div className={styles.compatBlock}>
          <h2 className={styles.compatHeading}>We probably will not work if</h2>
          <p className={styles.compatBody}>
            You cannot hold a conversation about ideas for longer than a reel's attention span.
            You think blockchain is just Bitcoin, or that running at 5 AM is a personality
            disorder. You prefer background music to live music, or you say "just vibes" when
            asked what you are looking for.
          </p>
        </div>
      </section>

      <hr className={styles.divider} />

      {/* ── Stats ────────────────────────────────────────────────────────── */}
      <section className={styles.statsSection} aria-labelledby="stats-heading">
        <h2 id="stats-heading" className={styles.statsSectionLabel}>By the numbers</h2>
        <div className={styles.statsGrid} role="list" aria-label="Personal statistics">
          {STATS.map((s) => (
            <StatCard key={s.label} stat={s} />
          ))}
        </div>
      </section>

    </div>
  );
}
