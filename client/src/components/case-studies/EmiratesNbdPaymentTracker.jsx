import CaseStudyLayout from './CaseStudyLayout';

const URL = 'https://maheshinder.in/work/emirates-nbd-payment-tracker';

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'CreativeWork',
  name: 'Emirates NBD Real Time Payment Tracker',
  url: URL,
  author: { '@type': 'Person', name: 'Mahesh Inder', url: 'https://maheshinder.in' },
  about: 'Real time payment tracking on Rust, Kafka, and AWS Lambda at Emirates NBD.',
  keywords: 'Emirates NBD, Rust, Kafka, AWS Lambda, Payment Tracker, Full Stack Engineer Dubai',
  inLanguage: 'en',
};

export default function EmiratesNbdPaymentTracker() {
  return (
    <CaseStudyLayout
      seoKey="work/emirates-nbd-payment-tracker"
      eyebrow="Emirates NBD · 2024 to Present"
      title="Real Time Payment Tracker at Emirates NBD, by Mahesh Inder"
      subtitle="Tracking every dirham moving through the UAE in real time, on Rust and Kafka."
      stack={['Rust', 'Kafka', 'AWS Lambda', 'Node.js', 'PostgreSQL']}
      outcomes={[
        'Sub millisecond payment status reads',
        'Replaced a batch system that ran every 15 minutes',
        '10x faster document generation for statements',
      ]}
      jsonLd={jsonLd}
    >
      <h2>The problem</h2>
      <p>
        Banks move a lot of money around. When a payment goes from one account to another, it
        passes through clearing, fraud checks, sanctions screening, and ledger updates. Each of
        those is its own system. The customer wants to know one thing: where is my money right
        now.
      </p>
      <p>
        The old way to answer that was a nightly job that stitched logs together and produced a
        report. By the time the report was ready, the payment was already done. If something
        failed mid flight, the customer support team had no way to look it up live. They had to
        wait for the next batch.
      </p>

      <h2>What I built</h2>
      <p>
        The Payment Tracker is the system that listens to every event from every payment service,
        joins them by transaction id, and gives back the current state of any payment in sub
        millisecond. Each upstream system publishes to Kafka. A Rust consumer reads the topics,
        materialises a state machine per transaction, and writes the projection to a hot store.
      </p>
      <p>
        The Lambda layer exposes a small read API for the support team and the customer app. I
        also worked on a Rust document engine that pulls from the same projection to generate
        statements for accounts, fixed deposits, and credit cards. The old generator was a Java
        service that took close to a minute for a year long statement. The new one does it in
        under six seconds.
      </p>

      <h2>Why Rust</h2>
      <p>
        Three reasons. The first is throughput. The Kafka consumer has to keep up with bursty
        traffic and Rust gives me memory predictability that the JVM did not. The second is
        correctness. The borrow checker catches a whole class of bugs that used to slip past code
        review on the old stack. The third is footprint. A Rust binary on a small ECS task is
        cheaper to run than a JVM service that needs a gig of heap just to warm up.
      </p>

      <h2>The outcome</h2>
      <p>
        Support agents can answer where is my payment in real time. The fraud team gets alerts on
        stuck transactions in under a second. Statement generation went from a slow PDF builder
        to something that feels instant. The wider impact is harder to measure but easier to see,
        the team stopped getting paged at 3am about the nightly batch failing.
      </p>
    </CaseStudyLayout>
  );
}
