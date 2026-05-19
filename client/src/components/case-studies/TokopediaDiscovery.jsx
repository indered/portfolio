import CaseStudyLayout from './CaseStudyLayout';

const URL = 'https://maheshinder.in/work/tokopedia-discovery';

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'CreativeWork',
  name: 'Tokopedia Discovery Engine',
  url: URL,
  author: { '@type': 'Person', name: 'Mahesh Inder', url: 'https://maheshinder.in' },
  about: 'Product discovery APIs at Tokopedia featured at Google I/O twice.',
  keywords: 'Tokopedia, Discovery Engine, Google I/O, Full Stack Engineer, GraphQL',
  inLanguage: 'en',
};

export default function TokopediaDiscovery() {
  return (
    <CaseStudyLayout
      seoKey="work/tokopedia-discovery"
      eyebrow="Tokopedia · 2020 to 2021"
      title="Tokopedia Discovery Engine, by Mahesh Inder"
      subtitle="Product discovery APIs so fast Google put them on the I/O stage. Twice."
      stack={['React', 'Node.js', 'GraphQL', 'Go', 'Kubernetes']}
      outcomes={[
        '87ms TTFB at peak',
        'Featured at Google I/O 2020 and 2021',
        'Powered sale pages moving millions in GMV',
      ]}
      jsonLd={jsonLd}
    >
      <h2>The problem</h2>
      <p>
        Tokopedia is one of the largest e commerce platforms in Southeast Asia. Discovery is the
        surface where shoppers land first, the sale page, the category page, the curated rail.
        These pages had to load fast under heavy load and they had to be flexible enough for the
        operations team to ship new layouts without a deploy.
      </p>
      <p>
        The old setup leaned on a chain of services that each did a little, then handed off to the
        next. Latency stacked up and the frontend was stuck waiting. Sale events would spike traffic
        five to ten times normal and the tail latency would get ugly.
      </p>

      <h2>What I built</h2>
      <p>
        I worked on the Discovery Engine, the layer that takes a page config and turns it into a
        single GraphQL response the frontend can render in one shot. The trick was caching at the
        right boundaries, batching reads to the catalog service, and writing the hot paths in Go
        so the per request overhead stayed flat.
      </p>
      <p>
        On the admin side I built Intools, the dashboard the content team used to lay out sale
        pages. Drag a component on, set a query, preview it, ship it. No deploy needed. That part
        was React with Ant Design, wired up to a content pipeline that fanned changes out to
        production caches in seconds.
      </p>

      <h2>The stack</h2>
      <p>
        React on the frontend, Node and Go on the backend, GraphQL as the contract between them.
        The hot read paths were Go services. The orchestration layer was Node. Everything ran on
        Kubernetes with horizontal autoscaling tied to request rate.
      </p>

      <h2>The outcome</h2>
      <p>
        TTFB held at 87ms under normal load and stayed under 200ms during sale spikes. Google
        featured Tokopedia at I/O twice while I was there, once for the Discovery work and once
        for the broader product surface. Sale pages built in Intools moved millions of dollars in
        GMV per event.
      </p>
      <p>
        The bit I am most proud of is not the latency number. It is that the ops team could ship a
        new sale page on a Friday afternoon without paging an engineer. That is the real measure
        of a good platform.
      </p>
    </CaseStudyLayout>
  );
}
