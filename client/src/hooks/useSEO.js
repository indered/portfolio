import { useEffect, useCallback } from 'react';

const BASE_URL = 'https://maheshinder.in';
const SITE_NAME = 'Mahesh Inder Portfolio';
const DEFAULT_IMAGE = `${BASE_URL}/og-image.jpg`;

const SEO_CONFIG = {
  default: {
    title: 'Mahesh Inder | Full Stack & AI Engineer in Dubai',
    description: 'Mahesh Inder is a Full Stack Engineer and AI Engineer in Dubai. Building AI agents, real time payment systems, and scalable web platforms. Featured twice at Google I/O.',
    keywords: 'Mahesh Inder, Full Stack Engineer Dubai, AI Engineer Dubai, Full Stack Developer Dubai, Software Engineer Dubai, AI Engineer, Full Stack Engineer, Engineer Dubai',
    canonical: BASE_URL,
    ogType: 'website',
  },
  work: {
    title: 'Mahesh Inder | Full Stack & AI Engineer, Work',
    description: 'Senior Full Stack and AI Engineer in Dubai. 7+ years across Emirates NBD, Tokopedia, Noumena, and withlove.so. APIs featured twice at Google I/O.',
    keywords: 'Mahesh Inder Work, Full Stack Engineer Dubai, AI Engineer Dubai, React Engineer, Node.js Engineer UAE, Rust Engineer',
    canonical: `${BASE_URL}/work`,
    ogType: 'profile',
  },
  resume: {
    title: 'Mahesh Inder Resume | Full Stack & AI Engineer',
    description: 'View or download the resume for Mahesh Inder, a Full Stack and AI Engineer based in Dubai.',
    keywords: 'Mahesh Inder Resume, Mahesh Inder CV, Full Stack Engineer Resume Dubai, AI Engineer Resume',
    canonical: `${BASE_URL}/resume`,
    ogType: 'profile',
  },
  'waterlily-video': {
    title: 'Waterlily Interview Video | Mahesh Inder',
    description: 'Watch Mahesh Inder’s interview video prepared for Waterlily.',
    keywords: 'Mahesh Inder Waterlily interview video',
    canonical: `${BASE_URL}/waterlily-video`,
    ogType: 'video.other',
  },
  'video-stats': {
    title: 'Waterlily Video Stats | Mahesh Inder',
    description: 'Private analytics for the Waterlily interview video.',
    keywords: 'Mahesh Inder private video analytics',
    canonical: `${BASE_URL}/video-stats`,
    ogType: 'website',
  },
  'work/tokopedia-discovery': {
    title: 'Tokopedia Discovery Engine | Mahesh Inder',
    description: 'How I helped build product discovery APIs at Tokopedia that got featured at Google I/O twice. 87ms TTFB, React, Node, GraphQL, Go.',
    keywords: 'Tokopedia Discovery, Mahesh Inder Tokopedia, Google I/O Tokopedia, Discovery APIs, Full Stack Engineer',
    canonical: `${BASE_URL}/work/tokopedia-discovery`,
    ogType: 'article',
  },
  'work/emirates-nbd-payment-tracker': {
    title: 'Emirates NBD Payment Tracker | Mahesh Inder',
    description: 'Real time payment tracking for the UAE on Rust, Kafka, and AWS Lambda. Sub millisecond paths, every dirham accounted for.',
    keywords: 'Emirates NBD, Payment Tracker, Rust Kafka, AWS Lambda, Mahesh Inder, AI Engineer Dubai',
    canonical: `${BASE_URL}/work/emirates-nbd-payment-tracker`,
    ogType: 'article',
  },
  'work/withlove-ai-agent': {
    title: 'withlove.so AI Agent | Mahesh Inder',
    description: 'A personal AI agent that lives on your link, books your calendar, takes payment in the chat, and sounds like you. Solo build by Mahesh Inder.',
    keywords: 'withlove.so, AI Agent, AI Engineer Dubai, RAG, Tool Calling, Mahesh Inder Founder',
    canonical: `${BASE_URL}/work/withlove-ai-agent`,
    ogType: 'article',
  },
  'work/kokaihop-3': {
    title: 'Kokaihop 3.0 API Rebuild | Mahesh Inder',
    description: 'Full API rebuild at To The New. 2,000 concurrent users, 20ms ElasticSearch search, RabbitMQ, Node cluster mode. Apollo Server + GraphQL.',
    keywords: 'Kokaihop, To The New, Mahesh Inder, GraphQL Engineer, ElasticSearch, RabbitMQ, Full Stack Engineer',
    canonical: `${BASE_URL}/work/kokaihop-3`,
    ogType: 'article',
  },
  runner: {
    title: 'Mahesh Inder | Marathon Runner Dubai, Burj2Burj Finisher',
    description: 'Marathon runner based in Dubai, UAE. Burj2Burj finisher. Training logs, race stats, and running routes across Dubai.',
    keywords: 'Mahesh Inder Runner, Dubai Marathon, Burj2Burj, Running Dubai, Marathon Runner UAE',
    canonical: `${BASE_URL}/runner`,
    ogType: 'profile',
  },
  ventures: {
    title: 'Figuring Out | Electrolyte Brand Dubai, Founded by Mahesh Inder',
    description: 'Figuring Out is an electrolyte brand launching in Dubai. Founded by Mahesh Inder. We figured out the hydration.',
    keywords: 'Figuring Out, Electrolyte Brand Dubai, Hydration UAE, Mahesh Inder Startup',
    canonical: `${BASE_URL}/ventures`,
    ogType: 'business.business',
  },
  connect: {
    title: 'Connect with Mahesh Inder | GitHub, LinkedIn, Contact',
    description: 'Connect with Mahesh Inder on GitHub, LinkedIn, Instagram. Open to senior engineering roles and consulting. Based in Dubai, UAE.',
    keywords: 'Mahesh Inder Contact, Mahesh Inder LinkedIn, Mahesh Inder GitHub, Hire Developer Dubai',
    canonical: `${BASE_URL}/connect`,
    ogType: 'profile',
  },
  thoughts: {
    title: 'Mahesh Inder | Thoughts on Philosophy and Life',
    description: 'Personal reflections from Mahesh Inder on Guru Nanak, Stephen Hawking, faith, and reason.',
    keywords: 'Mahesh Inder Blog, Thoughts Philosophy, Personal Essays, Life Reflections',
    canonical: `${BASE_URL}/thoughts`,
    ogType: 'article',
  },
  ask: {
    title: 'Ask the Cosmos | Chat with Mahesh Inder AI',
    description: 'Ask anything about Mahesh Inder. AI-powered chat that knows his work, projects, and story.',
    keywords: 'Ask Mahesh Inder, AI Chat Portfolio, Chat with Developer',
    canonical: `${BASE_URL}/ask`,
    ogType: 'website',
  },
  about: {
    title: 'About Mahesh Inder | Dubai, Software Engineer',
    description: 'Meet Mahesh Inder. 28, Software Engineer, Marathon Runner, based in Dubai.',
    keywords: 'About Mahesh Inder, Software Engineer Dubai, Ayodhya, Marathon Runner',
    canonical: `${BASE_URL}/about`,
    ogType: 'profile',
  },
};

function updateMetaTag(selector, attribute, value) {
  let element = document.querySelector(selector);
  if (!element) {
    element = document.createElement('meta');
    if (selector.startsWith('meta[property=')) {
      const property = selector.match(/property="([^"]+)"/)?.[1];
      element.setAttribute('property', property);
    } else if (selector.startsWith('meta[name=')) {
      const name = selector.match(/name="([^"]+)"/)?.[1];
      element.setAttribute('name', name);
    }
    document.head.appendChild(element);
  }
  element.setAttribute(attribute, value);
}

function updateCanonicalLink(url) {
  let link = document.querySelector('link[rel="canonical"]');
  if (!link) {
    link = document.createElement('link');
    link.setAttribute('rel', 'canonical');
    document.head.appendChild(link);
  }
  link.setAttribute('href', url);
}

export function useSEO(sectionId = null) {
  const updateSEO = useCallback((id) => {
    if (id === false) return; // skip mode
    const config = SEO_CONFIG[id] || SEO_CONFIG.default;
    document.title = config.title;
    updateMetaTag('meta[name="description"]', 'content', config.description);
    updateMetaTag('meta[name="keywords"]', 'content', config.keywords);
    updateMetaTag('meta[property="og:title"]', 'content', config.title);
    updateMetaTag('meta[property="og:description"]', 'content', config.description);
    updateMetaTag('meta[property="og:url"]', 'content', config.canonical);
    updateMetaTag('meta[property="og:type"]', 'content', config.ogType);
    updateMetaTag('meta[name="twitter:title"]', 'content', config.title);
    updateMetaTag('meta[name="twitter:description"]', 'content', config.description);
    updateMetaTag('meta[name="twitter:url"]', 'content', config.canonical);
    updateCanonicalLink(config.canonical);
  }, []);

  useEffect(() => {
    updateSEO(sectionId);
    return () => { if (sectionId) updateSEO(null); };
  }, [sectionId, updateSEO]);

  return { updateSEO };
}

export default useSEO;
