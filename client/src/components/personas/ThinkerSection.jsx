import styles from './ThinkerSection.module.scss';

function SectionDivider() {
  return (
    <div className={styles.dividerWrapper} aria-hidden="true">
      <div className={styles.dividerLine} />
      <div className={styles.dividerOrnament}>
        <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
          <circle cx="6" cy="6" r="2" />
          <line x1="6" y1="0" x2="6" y2="4" stroke="currentColor" strokeWidth="1" />
          <line x1="6" y1="8" x2="6" y2="12" stroke="currentColor" strokeWidth="1" />
          <line x1="0" y1="6" x2="4" y2="6" stroke="currentColor" strokeWidth="1" />
          <line x1="8" y1="6" x2="12" y2="6" stroke="currentColor" strokeWidth="1" />
        </svg>
      </div>
      <div className={styles.dividerLine} />
    </div>
  );
}

function PullQuote({ children, attribution }) {
  return (
    <blockquote className={styles.pullQuote}>
      <span className={styles.pullQuoteMark} aria-hidden="true">&ldquo;</span>
      <p className={styles.pullQuoteText}>{children}</p>
      <footer className={styles.pullQuoteAttribution}>{attribution}</footer>
    </blockquote>
  );
}

const READING_LIST = [
  {
    title: 'The God of Small Things',
    author: 'Arundhati Roy',
    note: 'Every sentence a world.',
  },
  {
    title: 'A Brief History of Time',
    author: 'Stephen Hawking',
    note: 'Made the infinite feel personal.',
  },
  {
    title: 'Sapiens',
    author: 'Yuval Noah Harari',
    note: 'History as pattern recognition.',
  },
  {
    title: 'The Alchemist',
    author: 'Paulo Coelho',
    note: 'Read at 18. Still true.',
  },
  {
    title: 'Thinking, Fast and Slow',
    author: 'Daniel Kahneman',
    note: 'The operating manual for the mind.',
  },
  {
    title: 'Meditations',
    author: 'Marcus Aurelius',
    note: 'Philosophy as daily practice.',
  },
];

function ReadingList() {
  return (
    <section className={styles.readingList} aria-labelledby="reading-list-heading">
      <h3 id="reading-list-heading" className={styles.readingListHeading}>
        What shaped this mind
      </h3>
      <div className={styles.readingListGrid}>
        {READING_LIST.map((book) => (
          <div key={book.title} className={styles.bookEntry}>
            <p className={styles.bookTitle}>{book.title}</p>
            <p className={styles.bookAuthor}>{book.author}</p>
            <p className={styles.bookNote}>{book.note}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

export default function ThinkerSection() {
  return (
    <div className={styles.thinker} role="main">

      {/* ── Magazine dateline ── */}
      <div className={styles.dateline} aria-label="Publication dateline" role="banner">
        <span>Vol.&thinsp;I</span>
        <span className={styles.datelineSep}>·</span>
        <span>Dubai, UAE</span>
        <span className={styles.datelineSep}>·</span>
        <span>February 2026</span>
      </div>
      <div className={styles.datelineRule} aria-hidden="true" />

      {/* ── Header ── */}
      <header className={styles.header} aria-labelledby="thinker-heading">
        <h2 id="thinker-heading" className={styles.title}>
          From the Gurudwara
          <br className={styles.titleBreak} aria-hidden="true" />
          to the Cosmos
        </h2>

        <p className={styles.subtitle}>
          How Guru Nanak and Stephen Hawking helped me find my own answers.
        </p>

        <div className={styles.headerRule} aria-hidden="true" />
      </header>

      {/* ── Essay body ── */}
      <article className={styles.essay}>

        <p className={styles.dropCap}>
          I grew up in a Sikh family. We went to gurudwara every day before school. I wear a kada.
          I folded my hands and closed my eyes when everyone else did. I believed because
          everyone around me believed. That was enough for a long time.
        </p>

        <p>
          Then I started reading. Not what people told me about Guru Nanak — but what he
          actually said. And the first thing that hit me was this:
        </p>

        <PullQuote attribution="— Guru Nanak, his first words after enlightenment">
          There is no Hindu. There is no Muslim.
        </PullQuote>

        <p>
          He was not picking a side. He was saying — stop picking sides. Think for yourself.
          Ask your own questions. Do not just believe because someone told you to. That was
          500 years ago. And here I was, doing exactly what he told people not to do — believing
          without asking.
        </p>

        <SectionDivider />

        <p>
          Then I found Stephen Hawking. I picked up <em>A Brief History of Time</em> because
          the cover looked cool. I stayed because the words made my head spin in the best way.
        </p>

        <PullQuote attribution="— Stephen Hawking, A Brief History of Time">
          The universe doesn&apos;t need a creator. It can and will create itself from nothing.
        </PullQuote>

        <p>
          That line changed something in me. Not overnight. Slowly. Like a tap dripping until
          the glass is full. I started looking at the sky differently. Not as something someone
          made — but as something that just is. And that felt more beautiful to me than any story
          I was told as a kid.
        </p>

        <SectionDivider />

        <p>
          I am not angry at religion. I am grateful. Sikhism taught me good things. Be kind, work
          hard, share your food, treat everyone equal, and sewa. Guru Nanak was a rebel. He questioned the
          Brahmins. He questioned the Mullahs. He sat with the poor when kings invited him to dinner.
        </p>

        <p>
          He gave me the courage to question. Hawking showed me where questions lead.
        </p>

        <p className={styles.pivotLine}>
          One gave me the heart. The other gave me the head.
        </p>

        <p>
          Today I call myself an atheist. But not the angry kind. The grateful kind. I don&apos;t think
          there&apos;s a god watching me. But I think Guru Nanak would be okay with that. Because he never
          asked anyone to follow him. He asked everyone to think.
        </p>

        <p className={styles.closingLine}>And I did.</p>

      </article>

      {/* ── Reading list colophon ── */}
      <ReadingList />

      {/* ── Footer colophon ── */}
      <footer className={styles.colophon}>
        <div className={styles.colophonRule} aria-hidden="true" />
        <p className={styles.colophonText}>
          Written in simple words, because big ideas don&apos;t need big words.
        </p>
      </footer>

    </div>
  );
}
