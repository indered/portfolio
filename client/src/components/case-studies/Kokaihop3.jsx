import CaseStudyLayout from './CaseStudyLayout';

const URL = 'https://maheshinder.in/work/kokaihop-3';

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'CreativeWork',
  name: 'Kokaihop 3.0 API Rebuild',
  url: URL,
  author: { '@type': 'Person', name: 'Mahesh Inder', url: 'https://maheshinder.in' },
  about: 'A full API rebuild for the Kokaihop recipe platform while at To The New.',
  keywords: 'Kokaihop, To The New, GraphQL, ElasticSearch, RabbitMQ, Full Stack Engineer',
  inLanguage: 'en',
};

export default function Kokaihop3() {
  return (
    <CaseStudyLayout
      seoKey="work/kokaihop-3"
      eyebrow="To The New · 2019 to 2020"
      title="Kokaihop 3.0 API Rebuild, by Mahesh Inder"
      subtitle="A full backend rebuild that took search from sluggish to 20ms and made the platform usable again."
      stack={['Apollo Server', 'GraphQL', 'MongoDB', 'ElasticSearch', 'RabbitMQ', 'Node Cluster']}
      outcomes={[
        '2,000 concurrent users supported',
        'Search latency cut to 20ms',
        'Cleaner contract for the mobile and web clients',
      ]}
      jsonLd={jsonLd}
    >
      <h2>The problem</h2>
      <p>
        Kokaihop is a Nordic recipe platform with millions of recipes and a long history. By the
        time I came in, the API was on its second life and showing its age. Search was slow,
        endpoints were inconsistent across mobile and web, and traffic on weekend mornings would
        push the database hard enough that response times got embarrassing.
      </p>
      <p>
        The client wanted a 3.0. Not a rewrite for the sake of fashion, a real rebuild that the
        team could keep working on for years without flinching.
      </p>

      <h2>What I built</h2>
      <p>
        The new API is Apollo Server on top of GraphQL. The mobile and web clients now hit one
        endpoint and ask for exactly the fields they need. No more six round trips to load a
        recipe page.
      </p>
      <p>
        For search I moved off the database and onto ElasticSearch with a clean index per content
        type. Recipes, ingredients, authors. Re indexing is driven by RabbitMQ so changes in the
        write path queue up and a separate worker fans them out. The search endpoint settled at
        around 20ms p95 once we tuned the analyzer.
      </p>
      <p>
        On the runtime side I put the Node process in cluster mode behind a load balancer so we
        could use all the cores on each box. Memory was the bottleneck before, the new shape
        spread the load and gave us headroom for the morning spike.
      </p>

      <h2>The stack</h2>
      <p>
        Apollo Server, MongoDB for the source of truth, ElasticSearch for search, RabbitMQ for
        async fan out, Node cluster mode for parallelism. Everything containerised and deployable
        through the To The New CI.
      </p>

      <h2>The outcome</h2>
      <p>
        Sustained 2,000 concurrent users without strain. Search felt instant in the app. The
        ingestion pipeline could absorb large batches without blocking the user facing path.
        Maybe more importantly, the next engineer who joined could read the codebase end to end
        in a day. That is what 3.0 was supposed to be.
      </p>

      <h2>Side note</h2>
      <p>
        Same year I also built Bharti AXA&apos;s offline first insurance PWA. Different problem,
        different stack, but the same instinct, treat the network like it could go away and the
        app should still work.
      </p>
    </CaseStudyLayout>
  );
}
