import { useEffect, useCallback } from 'react';

const BASE_URL = 'https://maheshinder.in';
const SITE_NAME = 'Mahesh Inder Portfolio';
const DEFAULT_IMAGE = `${BASE_URL}/og-image.jpg`;

const SEO_CONFIG = {
  default: {
    title: 'Mahesh Inder | Full Stack Developer Dubai, React, Node.js, Software Engineer UAE',
    description: 'Mahesh Inder is a Full Stack Developer based in Dubai, UAE. Specializing in React, Node.js, GraphQL, and cloud architecture. Featured twice at Google I/O. 7+ years building scalable systems.',
    keywords: 'Mahesh Inder, Full Stack Developer Dubai, Software Engineer UAE, React Developer, Node.js Developer',
    canonical: BASE_URL,
    ogType: 'website',
  },
  developer: {
    title: 'Mahesh Inder | Developer Portfolio, Full Stack Engineer Dubai',
    description: 'Senior Full Stack Developer at Emirates NBD with 7+ years experience. Expert in React, Node.js, GraphQL, Rust, and AWS. APIs featured twice at Google I/O.',
    keywords: 'Mahesh Inder Developer, Full Stack Portfolio, React Developer Dubai, Node.js Engineer UAE, GraphQL Expert',
    canonical: `${BASE_URL}/work`,
    ogType: 'profile',
  },
  runner: {
    title: 'Mahesh Inder | Marathon Runner Dubai, Burj2Burj Finisher',
    description: 'Marathon runner based in Dubai, UAE. Burj2Burj finisher. Training logs, race stats, and running routes across Dubai.',
    keywords: 'Mahesh Inder Runner, Dubai Marathon, Burj2Burj, Running Dubai, Marathon Runner UAE',
    canonical: `${BASE_URL}/runner`,
    ogType: 'profile',
  },
  blockchain: {
    title: 'Figuring Out | Electrolyte Brand Dubai, Founded by Mahesh Inder',
    description: 'Figuring Out is an electrolyte brand launching in Dubai. Founded by Mahesh Inder. We figured out the hydration.',
    keywords: 'Figuring Out, Electrolyte Brand Dubai, Hydration UAE, Mahesh Inder Startup',
    canonical: `${BASE_URL}/ventures`,
    ogType: 'business.business',
  },
  social: {
    title: 'Connect with Mahesh Inder | GitHub, LinkedIn, Contact',
    description: 'Connect with Mahesh Inder on GitHub, LinkedIn, Instagram. Open to senior engineering roles and consulting. Based in Dubai, UAE.',
    keywords: 'Mahesh Inder Contact, Mahesh Inder LinkedIn, Mahesh Inder GitHub, Hire Developer Dubai',
    canonical: `${BASE_URL}/connect`,
    ogType: 'profile',
  },
  thinker: {
    title: 'Mahesh Inder | Thoughts on Philosophy and Life',
    description: 'Personal reflections from Mahesh Inder on Guru Nanak, Stephen Hawking, faith, and reason.',
    keywords: 'Mahesh Inder Blog, Thoughts Philosophy, Personal Essays, Life Reflections',
    canonical: `${BASE_URL}/thoughts`,
    ogType: 'article',
  },
  dating: {
    title: 'About Mahesh Inder | Personal Profile, Dubai',
    description: 'Meet Mahesh Inder. 28, Software Engineer, Marathon Runner, based in Dubai.',
    keywords: 'Mahesh Inder Personal, About Mahesh Inder, Software Engineer Dubai',
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
