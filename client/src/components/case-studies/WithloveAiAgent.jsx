import CaseStudyLayout from './CaseStudyLayout';

const URL = 'https://maheshinder.in/work/withlove-ai-agent';

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'CreativeWork',
  name: 'withlove.so AI Agent Platform',
  url: URL,
  author: { '@type': 'Person', name: 'Mahesh Inder', url: 'https://maheshinder.in' },
  about: 'A personal AI agent platform for solopreneurs, built solo by Mahesh Inder.',
  keywords: 'withlove.so, AI Agent, AI Engineer Dubai, RAG, Tool Calling, MCP, Founder',
  inLanguage: 'en',
};

export default function WithloveAiAgent() {
  return (
    <CaseStudyLayout
      seoKey="work/withlove-ai-agent"
      eyebrow="withlove.so · 2025 to Present"
      title="withlove.so, a Personal AI Agent for Solopreneurs, by Mahesh Inder"
      subtitle="One link that talks to your customers in your voice, books your calendar, takes payment in the chat."
      stack={['Next.js', 'OpenAI', 'Anthropic', 'Vector Search', 'Google Calendar', 'Stripe', 'MCP']}
      outcomes={[
        'Solo build, currently in private beta',
        'Callable from ChatGPT, Claude, and Gemini via /.well-known/agent.json',
        '132 languages supported in voice cloning',
      ]}
      jsonLd={jsonLd}
    >
      <h2>The problem</h2>
      <p>
        Solopreneurs end up answering the same questions all day. What do you charge, are you free
        next Tuesday, can I get the link to that thing you sent last week. There are tools for
        each piece. Linktree for the link, Calendly for the slot, ChatGPT for the chat. But they
        do not talk to each other and none of them sound like the person they are supposed to
        represent.
      </p>
      <p>
        I wanted to build the thing that sits at the front of a one person business. An AI agent
        that answers in their voice, reads their real calendar, quotes their real prices, takes
        the order, captures the lead. One link. One conversation. No swivel chair across five
        tabs.
      </p>

      <h2>What I built</h2>
      <p>
        withlove.so gives each creator a hosted AI agent at a shareable URL. The agent has three
        loops running underneath it. A voice cloning loop that ingests their Instagram captions,
        DMs, and comments, builds a style profile, and refreshes weekly so it always sounds
        current. A retrieval loop that pulls from their knowledge base when a question needs a
        real answer. A tool calling loop that hits deterministic engines for booking and pricing
        so the language model never invents a number.
      </p>
      <p>
        The agent is also callable from the outside. Every creator gets an{' '}
        <code>/.well-known/agent.json</code> manifest, an MCP server, and an OpenAPI document.
        Paste the URL into a ChatGPT custom GPT or a Claude Desktop connector and that AI can now
        book a slot on the creator&apos;s real calendar. Real meetings show up in the inbox.
      </p>

      <h2>The hard parts</h2>
      <p>
        Voice fidelity is the one most people underestimate. Out of the box, every LLM sounds
        like a customer service script. To make it sound like a specific person takes a lot of
        prompt engineering, a careful style profile, and a feedback loop where the creator can
        flag answers that sound off so the system learns.
      </p>
      <p>
        The second hard part is the deterministic boundary. The model is allowed to talk about
        slots and prices, but it is never allowed to return a slot or a price directly. Those go
        through tool calls into engines that read the real calendar and the real pricing rules.
        The day I let the LLM make up a slot is the day a customer shows up at a meeting that
        does not exist.
      </p>

      <h2>The stack</h2>
      <p>
        Next.js on the surface. OpenAI and Anthropic for the language layer with a router between
        them so I can pick the right model per turn. Vector search over a per creator knowledge
        store. Google Calendar for the source of truth on availability. Stripe for in chat
        payment. MCP and OpenAPI for cross LLM callability. Postgres for the rest.
      </p>

      <h2>Where it is now</h2>
      <p>
        Private beta with a small cohort of creators across coaching, baking, design, and
        consulting. The thing I keep hearing is that customers do not realise they are talking to
        a bot for the first few turns. That is the bar. If you can tell, I have not done my job.
      </p>
    </CaseStudyLayout>
  );
}
