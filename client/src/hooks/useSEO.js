/**
 * useSEO - Dynamic SEO metadata management for React SPA
 * Updates document title and meta tags when sections change
 *
 * This hook enables section-specific SEO without server-side rendering
 * by dynamically updating meta tags that search engine crawlers can read
 * when JavaScript is executed (which most modern crawlers do).
 */

import { useEffect, useCallback } from 'react';

// Base SEO configuration
const BASE_URL = 'https://maheshinder.in';
const SITE_NAME = 'Mahesh Inder Portfolio';
const DEFAULT_IMAGE = `${BASE_URL}/og-image.jpg`;

// Section-specific SEO metadata
const SEO_CONFIG = {
  // Default/Hub view
  default: {
    title: 'Mahesh Inder | Full Stack Developer Dubai - React, Node.js, Software Engineer UAE',
    description: 'Mahesh Inder is a Full Stack Developer based in Dubai, UAE. Specializing in React, Node.js, GraphQL, and cloud architecture. Featured twice at Google I/O. 7+ years building scalable systems.',
    keywords: 'Mahesh Inder, Full Stack Developer Dubai, Software Engineer UAE, React Developer, Node.js Developer',
    canonical: BASE_URL,
    ogType: 'website',
  },

  // Developer section
  developer: {
    title: 'Mahesh Inder - Developer Portfolio | Full Stack Engineer Dubai',
    description: 'Senior Full Stack Developer at Emirates NBD with 7+ years experience. Expert in React, Node.js, GraphQL, Rust, and AWS. APIs featured twice at Google I/O. View my projects and experience.',
    keywords: 'Mahesh Inder Developer, Full Stack Portfolio, React Developer Dubai, Node.js Engineer UAE, GraphQL Expert, Emirates NBD Developer',
    canonical: `${BASE_URL}/#developer`,
    ogType: 'profile',
  },

  // Runner section
  runner: {
    title: 'Mahesh Inder - Marathon Runner Dubai | The Long Run',
    description: 'Marathon runner based in Dubai, UAE. Training logs, race statistics, and running routes across Dubai. Palm Jumeirah, Al Qudra, JBR Beach runs. 2,800+ km total distance.',
    keywords: 'Mahesh Inder Runner, Dubai Marathon, Running Dubai, Palm Jumeirah Run, Al Qudra Trail Running',
    canonical: `${BASE_URL}/#runner`,
    ogType: 'profile',
  },

  // Figuring Out / Blockchain section
  blockchain: {
    title: 'Figuring Out - Electrolyte Brand Dubai | Founded by Mahesh Inder',
    description: 'Figuring Out is an electrolyte brand launching in Dubai. Founded by Mahesh Inder. In the world where everyone is figuring out, at least we figured out the hydration right.',
    keywords: 'Figuring Out, Electrolyte Brand Dubai, Hydration UAE, Mahesh Inder Startup, Dubai Startup',
    canonical: `${BASE_URL}/#blockchain`,
    ogType: 'business.business',
  },

  // Social links section
  social: {
    title: 'Connect with Mahesh Inder | Social Links & Contact',
    description: 'Connect with Mahesh Inder on GitHub, LinkedIn, Instagram. Open to senior engineering roles and consulting opportunities. Based in Dubai, UAE.',
    keywords: 'Mahesh Inder Contact, Mahesh Inder LinkedIn, Mahesh Inder GitHub, Hire Full Stack Developer Dubai',
    canonical: `${BASE_URL}/#social`,
    ogType: 'profile',
  },

  // Thinker section
  thinker: {
    title: 'The Thinker - Mahesh Inder | Thoughts on Philosophy & Life',
    description: 'Personal reflections from Mahesh Inder on Guru Nanak, Stephen Hawking, faith, and reason. From the Gurudwara to the Cosmos - how questioning shaped my worldview.',
    keywords: 'Mahesh Inder Blog, Thoughts Philosophy, Guru Nanak Hawking, Personal Essays, Life Reflections',
    canonical: `${BASE_URL}/#thinker`,
    ogType: 'article',
  },

  // Dating section
  dating: {
    title: 'The Eligible Bachelor - Mahesh Inder | Personal Profile Dubai',
    description: 'Meet Mahesh Inder - 28, Software Engineer, Marathon Runner, based in Dubai. A personal profile with prompts, photos, and personality insights.',
    keywords: 'Mahesh Inder Personal, Dubai Single Professional, Software Engineer Dating Profile',
    canonical: `${BASE_URL}/#dating`,
    ogType: 'profile',
  },
};

/**
 * Updates a meta tag in the document head
 * Creates the tag if it doesn't exist
 */
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

/**
 * Updates the canonical link in the document head
 */
function updateCanonicalLink(url) {
  let link = document.querySelector('link[rel="canonical"]');
  if (!link) {
    link = document.createElement('link');
    link.setAttribute('rel', 'canonical');
    document.head.appendChild(link);
  }
  link.setAttribute('href', url);
}

/**
 * Custom hook for managing SEO metadata
 * @param {string} sectionId - The current section/persona ID
 */
export function useSEO(sectionId = null) {
  const updateSEO = useCallback((id) => {
    const config = SEO_CONFIG[id] || SEO_CONFIG.default;

    // Update document title
    document.title = config.title;

    // Update standard meta tags
    updateMetaTag('meta[name="description"]', 'content', config.description);
    updateMetaTag('meta[name="keywords"]', 'content', config.keywords);

    // Update Open Graph tags
    updateMetaTag('meta[property="og:title"]', 'content', config.title);
    updateMetaTag('meta[property="og:description"]', 'content', config.description);
    updateMetaTag('meta[property="og:url"]', 'content', config.canonical);
    updateMetaTag('meta[property="og:type"]', 'content', config.ogType);

    // Update Twitter Card tags
    updateMetaTag('meta[name="twitter:title"]', 'content', config.title);
    updateMetaTag('meta[name="twitter:description"]', 'content', config.description);
    updateMetaTag('meta[name="twitter:url"]', 'content', config.canonical);

    // Update canonical URL
    updateCanonicalLink(config.canonical);
  }, []);

  useEffect(() => {
    updateSEO(sectionId);

    // Cleanup: reset to default when unmounting
    return () => {
      // Only reset if we're navigating away from a section
      if (sectionId) {
        updateSEO(null);
      }
    };
  }, [sectionId, updateSEO]);

  return { updateSEO };
}

export default useSEO;
