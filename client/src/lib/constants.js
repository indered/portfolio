// ============================================
// The Mahesh Multiverse - Content Bible
// All personas, projects, and configuration data
// ============================================

// --- Personas (Orbital Navigation) ---
export const PERSONAS = {
  work: {
    id: 'work',
    title: 'Work',
    icon: '💻',
    color: 'var(--color-persona-work)',
    tagline: "Systems built to last. Code written to be read. Architecture that doesn't apologise.",
    orbitRadius: 1,
    orbitSpeed: 20,
    orbitOffset: 0,
  },
  runner: {
    id: 'runner',
    title: 'The Long Run',
    icon: '🏃',
    color: 'var(--color-persona-runner)',
    tagline: "Km 32 is where the body quits and the mind takes over. Dubai taught me that.",
    orbitRadius: 1,
    orbitSpeed: 25,
    orbitOffset: 51,
  },
  ventures: {
    id: 'ventures',
    title: 'Ventures',
    icon: '🚀',
    color: 'var(--color-persona-ventures)',
    tagline: "Building things outside of work. Hydration brand and a programming language.",
    orbitRadius: 1,
    orbitSpeed: 30,
    orbitOffset: 103,
  },
  about: {
    id: 'about',
    title: 'About',
    icon: '💘',
    color: 'var(--color-persona-about)',
    tagline: "Schrödinger's Boyfriend: simultaneously perfect and a red flag until observed.",
    orbitRadius: 1,
    orbitSpeed: 16,
    orbitOffset: 230,
  },
  connect: {
    id: 'connect',
    title: 'The Network Node',
    icon: '🌐',
    color: 'var(--color-persona-connect)',
    tagline: 'Every good opportunity started as a conversation. Reach out, say hi.',
    orbitRadius: 1,
    orbitSpeed: 35,
    orbitOffset: 257,
  },
  thoughts: {
    id: 'thoughts',
    title: 'The Thinker',
    icon: '📖',
    color: 'var(--color-persona-thoughts)',
    tagline: 'Guru Nanak taught me to question. Hawking showed me where questions lead.',
    orbitRadius: 1,
    orbitSpeed: 40,
    orbitOffset: 309,
  },
};

// --- Planet 3D Config (Solar System Scene) ---
// Planet visuals inspired by real solar system bodies
// Work=Earth (blue, life), Runner=Mars (red, endurance), Ventures=Neptune (green, growth)
// Music=Venus (hot pink, atmosphere), About=Aphrodite (pink, personal), Connect=Jupiter (massive, colorful)
// Thoughts=Pluto (distant, quiet, small), Ask=Nebula (violet, AI chat)
export const PLANET_CONFIG = {
  work: {
    realName: 'Earth',
    meshColor: '#2a7fe0', emissive: '#0d3a80', size: 1.35, orbitRadius: 4, orbitSpeed: 0.3,
    hasRing: false, hasAtmosphere: true, atmosphereColor: '#4ab0ff', atmosphereOpacity: 0.18,
    secondaryColor: '#1a8a3a', roughness: 0.3, metalness: 0.25,
  },
  runner: {
    realName: 'Mars',
    meshColor: '#c44b28', emissive: '#6a1e08', size: 0.62, orbitRadius: 5.5, orbitSpeed: 0.25,
    hasRing: false, hasAtmosphere: true, atmosphereColor: '#ff6633', atmosphereOpacity: 0.1,
    roughness: 0.55, metalness: 0.2,
  },
  ventures: {
    realName: 'Ventures',
    meshColor: '#8BA370', emissive: '#3D5C30', size: 0.92, orbitRadius: 7, orbitSpeed: 0.2,
    hasRing: false, hasAtmosphere: true, atmosphereColor: '#B8D4A8', atmosphereOpacity: 0.18,
    roughness: 0.55, metalness: 0.15,
  },
  about: {
    realName: 'Aphrodite',
    meshColor: '#e0527a', emissive: '#80102e', size: 0.68, orbitRadius: 10, orbitSpeed: 0.15,
    hasRing: false, hasAtmosphere: true, atmosphereColor: '#ff80ab', atmosphereOpacity: 0.28,
    roughness: 0.25, metalness: 0.3,
  },
  connect: {
    realName: 'Jupiter',
    meshColor: '#c8a070', emissive: '#5a3e20', size: 0.98, orbitRadius: 11.5, orbitSpeed: 0.12,
    hasRing: false, hasAtmosphere: true, atmosphereColor: '#e0b888', atmosphereOpacity: 0.14,
    roughness: 0.4, metalness: 0.2,
  },
  thoughts: {
    realName: 'Pluto',
    meshColor: '#8b7d6b', emissive: '#302820', size: 0.48, orbitRadius: 14, orbitSpeed: 0.08,
    hasRing: false, hasAtmosphere: false,
    roughness: 0.7, metalness: 0.12,
  },
};

// --- Ordered persona IDs — used for drift navigation sequencing ---
export const PERSONA_IDS = ['about', 'work', 'connect', 'runner', 'ventures', 'thoughts'];

// --- Gravitational Drift — horizontal lineup ---
// Planets align on the X-axis when drift activates.
// Camera performs a pure horizontal dolly (only x changes; y=5, z=16 fixed).
// Sun stays at origin. Each scroll/swipe step = one planet to the right.
export const DRIFT_POSITIONS = {
  about:      { pos: [ 6, 0, 0], cam: [ 6, 5, 16] },
  work:       { pos: [12, 0, 0], cam: [12, 5, 16] },
  connect:    { pos: [18, 0, 0], cam: [18, 5, 16] },
  runner:     { pos: [24, 0, 0], cam: [24, 5, 16] },
  ventures:   { pos: [30, 0, 0], cam: [30, 5, 16] },
  thoughts:   { pos: [36, 0, 0], cam: [36, 5, 16] },
};

// Derived — camera X positions in persona order. CameraController uses these
// for its self-contained drift lerp (no React round-trips in the hot path).
export const DRIFT_CAM_XS = PERSONA_IDS.map(id => DRIFT_POSITIONS[id].cam[0]); // [6,12,18,24,30,36,42]
export const DRIFT_MIN_X  = DRIFT_CAM_XS[0];
export const DRIFT_MAX_X  = DRIFT_CAM_XS[DRIFT_CAM_XS.length - 1];

// --- Experience Timeline ---
export const EXPERIENCE = [
  {
    id: 'emiratesnbd',
    company: 'Emirates NBD',
    role: 'Senior Full Stack / Backend Engineer',
    period: 'Mar 2024 - Present',
    duration: '2 years',
    description: "Building payment systems at one of the UAE's biggest banks. Real-time tracking, secure statements, AI document pipelines. Every transaction has to land right, every time.",
    highlights: [
      'Built real-time payment tracking on Kafka and AWS Lambda. Sub-millisecond propagation across services.',
      'Shipped the Statement Manager module in Business Online. Secure downloads for accounts, credit cards, loans and FDs.',
      'Polyglot backend: Rust for the hot paths, Node.js for orchestration.',
      'Wired up LangChain pipelines for AI document parsing on the compliance side.',
    ],
    tech: ['Rust', 'Node.js', 'Kafka', 'AWS Lambda', 'TypeScript', 'LangChain', 'Event-driven architecture'],
  },
  {
    id: 'noumena',
    company: 'Noumena',
    role: 'Backend Developer',
    period: 'Dec 2021 - Dec 2023',
    duration: '2 years',
    description: 'Social platform for freelancers, global. Backend architect. Took a monolith and broke it into services that actually behaved.',
    highlights: [
      'Stitched the services with Apollo Federation so each team could own its own schema.',
      'Wired inter-service messaging on Amazon SNS. 50ms latency, zero dropped events.',
      'Designed an in-app token economy for platform transactions.',
      'Pushed Domain-Driven Design across the Node.js codebase. Real bounded contexts, not imaginary ones.',
    ],
    tech: ['Node.js', 'Apollo Federation', 'GraphQL', 'AWS SNS/SQS', 'Docker', 'PostgreSQL', 'DDD'],
  },
  {
    id: 'tokopedia',
    company: 'Tokopedia',
    role: 'Full Stack Developer',
    period: 'Dec 2020 - Nov 2021',
    duration: '1 year',
    description: "APIs for Indonesia's biggest marketplace. The rendering got featured at Google I/O two years running.",
    highlights: [
      'Shipped APIs for the Discovery super-fast rendering engine. Google put it on the I/O stage, twice.',
      'Built Intools, the internal admin for Discovery sale pages moving millions in GMV.',
      'Owned the content pipelines for tokopedia.com/discovery on Ant Design.',
    ],
    tech: ['React', 'Node.js', 'GraphQL', 'Go', 'Ant Design', 'Kubernetes'],
    featured: true,
    featuredLabel: '2x Google I/O',
  },
  {
    id: 'ttn',
    company: 'To The New',
    role: 'Full Stack Developer',
    period: 'Jan 2019 - Nov 2020',
    duration: '2 years',
    description: 'Where I learned to ship at scale. Two projects, 2,000+ concurrent users, and a healthy respect for RabbitMQ.',
    highlights: [
      'Led Kokaihop 3.0: API architecture, MongoDB schemas, GraphQL on Apollo Server.',
      'Built React components on Redux + Apollo Client. Clean state, no magic.',
      'Plugged in ElasticSearch for real-time search. Results in ~20ms.',
      'Ran RabbitMQ for async jobs plus Node cluster mode. Held 2,000+ concurrent users without drama.',
      'Shipped the Bharti Axa PWA, a multilevel insurance form with proper Redux-managed state.',
    ],
    tech: ['React', 'Redux', 'Apollo Client/Server', 'GraphQL', 'MongoDB', 'ElasticSearch', 'RabbitMQ', 'Node.js'],
  },
  {
    id: 'freelance',
    company: 'Freelancing',
    role: 'Full Stack Developer',
    period: 'Nov 2021 - Apr 2022',
    duration: '6 months',
    description: 'Solo builds while the world was shut. Picked projects that mattered.',
    highlights: [
      "Built manthebay.org, a digital report card for Urban-Ed Academy's 4-year Bay Area fellowship.",
      'MERN stack, solo. From schema to deploy.',
    ],
    tech: ['React', 'Node.js', 'Express', 'MongoDB', 'MERN'],
  },
];

// --- Projects (derived from experience) ---
export const PROJECTS = [
  {
    id: 1,
    title: 'Noumena Platform',
    subtitle: 'Freelancer social platform, at scale',
    description: 'Global social platform for freelancers. Microservices on Apollo Federation, message bus on Amazon SNS, an in-app token economy, and Domain-Driven Design across the board.',
    longDescription: 'Architected the backend. Services split by bounded context, each with its own GraphQL schema stitched through Apollo Federation. Inter-service communication via Amazon SNS. Token and currency systems for platform transactions. Built to scale from day one.',
    tech: ['Node.js', 'Apollo Federation', 'GraphQL', 'AWS SNS', 'AWS SQS', 'Docker', 'PostgreSQL', 'DDD'],
    role: 'Backend Architect',
    impact: 'Handled 10K+ daily active freelancers',
    link: '#',
    github: '#',
    color: 'var(--color-persona-ventures)',
  },
  {
    id: 2,
    title: 'Tokopedia Discovery',
    subtitle: 'Featured at Google I/O two years running',
    description: "APIs for Indonesia's biggest marketplace. The rendering was fast enough that Google showcased it at I/O twice. Also built Intools, the admin powering Discovery sale pages with millions in GMV.",
    longDescription: "Developed high-performance APIs for Tokopedia's super-fast rendering web app. Built Intools, the internal admin for managing content on Discovery sale pages (tokopedia.com/discovery/kejar-disk). The rendering work got featured twice at Google I/O as a case study in web speed.",
    tech: ['React', 'Node.js', 'GraphQL', 'Go', 'Ant Design', 'Kubernetes'],
    role: 'Full Stack Developer',
    impact: '2x Google I/O featured, millions in GMV',
    link: 'https://tokopedia.com/discovery/kejar-disk',
    github: '#',
    color: 'var(--color-persona-work)',
    featured: true,
  },
  {
    id: 3,
    title: 'Kokaihop 3.0',
    subtitle: 'Recipe platform, rebuilt from scratch',
    description: 'Full rebuild. MongoDB schemas, GraphQL on Apollo Server, ElasticSearch for instant search, RabbitMQ for async work, and Node cluster mode holding 2,000+ concurrent users.',
    longDescription: 'Led the API architecture end to end. Designed MongoDB and GraphQL schemas, built the React front-end on Redux + Apollo Client, plugged in ElasticSearch for real-time search, set up RabbitMQ for async processing, and used Node cluster mode to hold 2,000+ concurrent users.',
    tech: ['React', 'Redux', 'Apollo Server', 'GraphQL', 'MongoDB', 'ElasticSearch', 'RabbitMQ', 'Node.js'],
    role: 'Lead API Developer',
    impact: '2,000+ concurrent users, real-time search in ~20ms',
    link: '#',
    github: '#',
    color: 'var(--color-persona-runner)',
  },
  {
    id: 4,
    title: 'Bharti AXA PWA',
    subtitle: 'Multilevel insurance forms, progressive',
    description: 'A PWA for complex insurance forms. Redux + Apollo Client managing state across branches and conditionals. Offline-first so agents could work with no signal.',
    longDescription: 'Built a PWA with a multilevel form architecture on React. Used Redux and Apollo Client to manage complex global state across form levels and conditional logic. Shipped as a PWA so it kept working offline.',
    tech: ['React', 'Redux', 'Apollo Client', 'PWA', 'GraphQL'],
    role: 'Frontend Developer',
    impact: 'Complex multi-step forms with offline capability',
    link: '#',
    github: '#',
    color: 'var(--color-persona-thoughts)',
  },
  {
    id: 5,
    title: 'Man the Bay',
    subtitle: 'Report card for a 4-year fellowship',
    description: "Digital report card for Urban-Ed Academy's fellowship in the Bay Area. Solo, MERN, end to end.",
    longDescription: 'Built manthebay.org, a report card system for a 4-year fellowship run by Urban-Ed Academy (Bay Area, US). Full MERN stack, solo developer, from database design through deployment.',
    tech: ['React', 'Node.js', 'Express', 'MongoDB'],
    role: 'Solo Full Stack Developer',
    impact: 'Powering a Bay Area education fellowship',
    link: 'https://manthebay.org',
    github: '#',
    color: 'var(--color-persona-about)',
  },
];

// --- Skills Cloud ---
export const SKILLS = {
  languages: ['JavaScript', 'TypeScript', 'Python', 'Rust', 'Solidity', 'C++'],
  frontend: ['React', 'Next.js', 'Redux', 'Apollo Client', 'HTML5', 'CSS3', 'Sass'],
  backend: ['Node.js', 'Express', 'Apollo Server', 'GraphQL', 'REST', 'Kafka', 'LangChain', 'Ethereum', 'ElasticSearch', 'RabbitMQ'],
  databases: ['MongoDB', 'PostgreSQL', 'MySQL'],
  devops: ['AWS EC2', 'AWS ECS', 'AWS SNS', 'AWS SQS', 'AWS Lambda', 'OpenSearch', 'Docker', 'Heroku'],
};

// --- Social Links ---
export const SOCIAL_LINKS = [
  { name: 'GitHub', url: 'https://github.com/indered', icon: 'github' },
  { name: 'LinkedIn', url: 'https://www.linkedin.com/in/mahesh-inder/', icon: 'linkedin' },
  { name: 'Instagram', url: 'https://www.instagram.com/mahesh.inder_/', icon: 'instagram' },
  { name: 'Email', url: 'mailto:mahesh.inder85@gmail.com', icon: 'mail' },
];

// --- Running Stats (Runner Persona) ---
export const RUNNING_STATS = {
  totalDistance: '2,847 km',
  totalRuns: 312,
  longestRun: '42.2 km',
  avgPace: "5'32\"/km",
  recentActivities: [
    { date: '2026-02-14', distance: '10.5 km', duration: '58:22', pace: "5'33\"/km", title: 'Valentine Day Run' },
    { date: '2026-02-12', distance: '5.2 km', duration: '27:45', pace: "5'20\"/km", title: 'Morning Recovery' },
    { date: '2026-02-10', distance: '21.1 km', duration: '1:52:30', pace: "5'19\"/km", title: 'Half Marathon Prep' },
    { date: '2026-02-08', distance: '8.0 km', duration: '43:12', pace: "5'24\"/km", title: 'Tempo Run' },
  ],
};

// --- About / Hero ---
export const ABOUT = {
  name: 'Mahesh Inder',
  title: 'Full Stack Developer',
  location: 'Dubai, UAE',
  email: 'mahesh.inder85@gmail.com',
  bio: "Senior full-stack engineer, 7+ years. Payment systems at Emirates NBD now. Built APIs at Tokopedia that got featured at Google I/O two years running. Microservices architect at Noumena before that. Lives in Dubai, runs marathons on Kite Beach, codes in Rust when the path is hot.",
  education: {
    degree: 'B.Tech in Computer Science',
    university: 'APJ Abdul Kalam Technical University',
    year: '2015 - 2019',
    gpa: '7.5',
  },
};

// --- Token / Gamification Config ---
export const TOKEN_CONFIG = {
  actions: {
    EXPLORE_SECTION: { tokens: 1, label: 'Explored a section' },
    TOGGLE_THEME: { tokens: 2, label: 'Changed theme' },
    LEAVE_SIGNATURE: { tokens: 5, label: 'Left a signature' },
    CLICK_PLANET: { tokens: 1, label: 'Clicked a planet' },
    VIEW_PROJECT: { tokens: 1, label: 'Viewed a project' },
    DISCOVER_STAR: { tokens: 5, label: 'Found the easter egg' },
  },
  causes: [
    {
      month: 'April 2026',
      title: 'Books Over Brooms',
      description: 'Supporting education for children of household helpers, washermen, and daily wage workers. The people who take care of us deserve to see their kids in classrooms, not following the same cycle.',
    },
    {
      month: 'May 2026',
      title: 'Learn Without Limits',
      description: 'Funding education and learning tools for people with Down syndrome. Every mind deserves a chance to grow, no matter how it is wired.',
    },
  ],
  tokenValue: 1,
};
