// ============================================
// The Mahesh Multiverse - Content Bible
// All personas, projects, and configuration data
// ============================================

// --- Personas (Orbital Navigation) ---
export const PERSONAS = {
  developer: {
    id: 'developer',
    title: 'The Architect',
    icon: '💻',
    color: 'var(--color-persona-developer)',
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
  blockchain: {
    id: 'blockchain',
    title: 'Figuring Out',
    icon: '💧',
    color: 'var(--color-persona-blockchain)',
    tagline: "In the world where everyone is figuring out, at least we figured out the hydration right.",
    orbitRadius: 1,
    orbitSpeed: 30,
    orbitOffset: 103,
  },
  music: {
    id: 'music',
    title: 'Strings & Frequencies',
    icon: '🎵',
    color: 'var(--color-persona-music)',
    tagline: "Guitar on weekends. DJ decks on weeknights. Sleep is a work in progress.",
    orbitRadius: 1,
    orbitSpeed: 22,
    orbitOffset: 154,
  },
  dating: {
    id: 'dating',
    title: 'About Me',
    icon: '💘',
    color: 'var(--color-persona-dating)',
    tagline: "Schrödinger's Boyfriend: simultaneously perfect and a red flag until observed.",
    orbitRadius: 1,
    orbitSpeed: 16,
    orbitOffset: 230,
  },
  social: {
    id: 'social',
    title: 'The Network Node',
    icon: '🌐',
    color: 'var(--color-persona-social)',
    tagline: 'Every connection is a new dimension. The social fabric of spacetime.',
    orbitRadius: 1,
    orbitSpeed: 35,
    orbitOffset: 257,
  },
  thinker: {
    id: 'thinker',
    title: 'The Thinker',
    icon: '📖',
    color: 'var(--color-persona-thinker)',
    tagline: 'Guru Nanak taught me to question. Hawking showed me where questions lead.',
    orbitRadius: 1,
    orbitSpeed: 40,
    orbitOffset: 309,
  },
};

// --- Planet 3D Config (Solar System Scene) ---
// Planet visuals inspired by real solar system bodies
// Developer=Earth (blue, life), Runner=Mars (red, endurance), Blockchain=Neptune (deep purple, mystery)
// Music=Venus (hot pink, atmosphere), Fashion=Saturn (rings, golden), Social=Jupiter (massive, colorful)
// Thinker=Pluto (distant, quiet, small)
export const PLANET_CONFIG = {
  developer: {
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
  blockchain: {
    realName: 'Figuring Out',
    meshColor: '#8BA370', emissive: '#3D5C30', size: 0.92, orbitRadius: 7, orbitSpeed: 0.2,
    hasRing: false, hasAtmosphere: true, atmosphereColor: '#B8D4A8', atmosphereOpacity: 0.18,
    roughness: 0.55, metalness: 0.15,
  },
  music: {
    realName: 'Venus',
    meshColor: '#e8a855', emissive: '#7a4010', size: 0.72, orbitRadius: 8.5, orbitSpeed: 0.18,
    hasRing: false, hasAtmosphere: true, atmosphereColor: '#ffcc66', atmosphereOpacity: 0.25,
    roughness: 0.3, metalness: 0.25,
  },
  dating: {
    realName: 'Aphrodite',
    meshColor: '#e0527a', emissive: '#80102e', size: 0.68, orbitRadius: 10, orbitSpeed: 0.15,
    hasRing: false, hasAtmosphere: true, atmosphereColor: '#ff80ab', atmosphereOpacity: 0.28,
    roughness: 0.25, metalness: 0.3,
  },
  social: {
    realName: 'Jupiter',
    meshColor: '#c8a070', emissive: '#5a3e20', size: 0.98, orbitRadius: 11.5, orbitSpeed: 0.12,
    hasRing: false, hasAtmosphere: true, atmosphereColor: '#e0b888', atmosphereOpacity: 0.14,
    roughness: 0.4, metalness: 0.2,
  },
  thinker: {
    realName: 'Pluto',
    meshColor: '#8b7d6b', emissive: '#302820', size: 0.48, orbitRadius: 14, orbitSpeed: 0.08,
    hasRing: false, hasAtmosphere: false,
    roughness: 0.7, metalness: 0.12,
  },
};

// --- Ordered persona IDs — used for drift navigation sequencing ---
// Note: 'music' temporarily hidden, 'dating' moved to last position
export const PERSONA_IDS = ['developer', 'runner', 'blockchain', 'social', 'thinker', 'dating'];

// --- Gravitational Drift — horizontal lineup ---
// Planets align on the X-axis when drift activates.
// Camera performs a pure horizontal dolly (only x changes; y=5, z=16 fixed).
// Sun stays at origin. Each scroll/swipe step = one planet to the right.
export const DRIFT_POSITIONS = {
  developer:  { pos: [ 6, 0, 0], cam: [ 6, 5, 16] },
  runner:     { pos: [12, 0, 0], cam: [12, 5, 16] },
  blockchain: { pos: [18, 0, 0], cam: [18, 5, 16] },
  social:     { pos: [24, 0, 0], cam: [24, 5, 16] },
  thinker:    { pos: [30, 0, 0], cam: [30, 5, 16] },
  dating:     { pos: [36, 0, 0], cam: [36, 5, 16] },
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
    period: 'Mar 2024 — Present',
    duration: '2 years',
    description: "Building the financial backbone of one of the UAE's largest banks — real-time payment tracking where every dirham moves with sub-millisecond precision.",
    highlights: [
      'Built real-time payment tracking using event-driven architecture — Kafka consumers, AWS Lambda triggers, sub-millisecond propagation',
      'Developed Statement Manager module for Business Online — secure downloads of account, credit card, loan and FD statements',
      'Polyglot backend in Rust and Node.js: Rust for performance-critical paths, Node.js for service orchestration',
      'Designed AI-powered document parsing pipelines using LangChain for financial compliance automation',
    ],
    tech: ['Rust', 'Node.js', 'Kafka', 'AWS Lambda', 'TypeScript', 'LangChain', 'Event-driven architecture'],
  },
  {
    id: 'noumena',
    company: 'Noumena',
    role: 'Backend Developer',
    period: 'Dec 2021 — Dec 2023',
    duration: '2 years',
    description: 'Architected the neural pathways of a global social platform for freelancers — microservices that talk to each other like neurons in a distributed brain.',
    highlights: [
      'Engineered a microservices constellation using Apollo Federation — because monoliths are so last universe',
      'Built an inter-service messaging nervous system with Amazon SNS — 50ms latency, zero dropped thoughts',
      'Designed an in-app token economy for transactions — basically invented money, but digitally',
      'Implemented Domain-Driven Design in Node.js — turning chaos into elegantly bounded contexts',
    ],
    tech: ['Node.js', 'Apollo Federation', 'GraphQL', 'AWS SNS/SQS', 'Docker', 'PostgreSQL', 'DDD'],
  },
  {
    id: 'tokopedia',
    company: 'Tokopedia',
    role: 'Full Stack Developer',
    period: 'Dec 2020 — Nov 2021',
    duration: '1 year',
    description: "Built APIs for Indonesia's largest marketplace — the kind of fast that got featured twice at Google I/O. Yes, twice. Google noticed.",
    highlights: [
      'Crafted APIs for a super-fast rendering engine — so fast, Google showcased it at I/O. Twice.',
      'Built Intools — an admin weapon for managing Discovery sale pages that moved millions in GMV',
      'Engineered content management pipelines for tokopedia.com/discovery with ant-design UI',
    ],
    tech: ['React', 'Node.js', 'GraphQL', 'Go', 'Ant Design', 'Kubernetes'],
    featured: true,
    featuredLabel: '2x Google I/O',
  },
  {
    id: 'ttn',
    company: 'To The New',
    role: 'Full Stack Developer',
    period: 'Jan 2019 — Nov 2020',
    duration: '2 years',
    description: 'Where the Big Bang of this career happened. Two projects, 2,000+ concurrent users, and the realization that RabbitMQ is basically a quantum message broker.',
    highlights: [
      'Led Kokaihop 3.0 — API architecture, MongoDB schemas, GraphQL with Apollo Server. The whole quantum stack.',
      'Built React components with Redux + Apollo Client — state management so clean it violated entropy',
      'Integrated ElasticSearch for real-time search — find anything in the data universe in 0.02s',
      'Deployed RabbitMQ for async processing + NodeJS cluster mode — handling 2,000+ concurrent users like parallel universes',
      'Shipped Bharti Axa PWA — a multilevel insurance form with Redux state so complex it needed its own dimension',
    ],
    tech: ['React', 'Redux', 'Apollo Client/Server', 'GraphQL', 'MongoDB', 'ElasticSearch', 'RabbitMQ', 'Node.js'],
  },
  {
    id: 'freelance',
    company: 'Freelancing',
    role: 'Full Stack Developer',
    period: 'Nov 2021 — Apr 2022',
    duration: '6 months',
    description: 'Solo missions across the developer multiverse. Building for causes that matter.',
    highlights: [
      'Built Man the Bay (manthebay.org) — a digital report card for Urban-Ed Academy\'s 4-year fellowship in the Bay Area',
      'Full MERN stack deployment — because when you\'re a one-person army, you ARE the full stack',
    ],
    tech: ['React', 'Node.js', 'Express', 'MongoDB', 'MERN'],
  },
];

// --- Projects (derived from experience, made sexy) ---
export const PROJECTS = [
  {
    id: 1,
    title: 'Noumena Platform',
    subtitle: 'The Freelancer\'s Universe',
    description: 'A global social platform where freelancers orbit in their own microservice galaxy. Apollo Federation stitching GraphQL schemas like cosmic threads, Amazon SNS firing synaptic messages between services, and a token economy that makes in-app transactions feel like trading quasars.',
    longDescription: 'Architected a distributed microservices backend using Apollo Federation — each service a self-contained universe with its own bounded context (DDD). Built inter-service communication via Amazon SNS, designed token/currency systems for in-app transactions, and ensured the whole constellation scaled gracefully.',
    tech: ['Node.js', 'Apollo Federation', 'GraphQL', 'AWS SNS', 'AWS SQS', 'Docker', 'PostgreSQL', 'DDD'],
    role: 'Backend Architect',
    impact: 'Microservices handling 10K+ daily active freelancers',
    link: '#',
    github: '#',
    color: 'var(--color-persona-blockchain)',
  },
  {
    id: 2,
    title: 'Tokopedia Discovery',
    subtitle: 'Featured at Google I/O — Twice',
    description: 'APIs for Indonesia\'s e-commerce titan, so blazingly fast that Google put them on stage at I/O. Not once — twice. Built the admin arsenal (Intools) that powered Discovery sale pages moving millions in GMV.',
    longDescription: 'Developed high-performance APIs for Tokopedia\'s super-fast rendering web application. Built Intools — an internal admin tool for managing content on Discovery sale pages (tokopedia.com/discovery/kejar-disk). The rendering performance was showcased twice at Google I/O as a case study in web speed.',
    tech: ['React', 'Node.js', 'GraphQL', 'Go', 'Ant Design', 'Kubernetes'],
    role: 'Full Stack Developer',
    impact: '2x Google I/O featured, millions in GMV',
    link: 'https://tokopedia.com/discovery/kejar-disk',
    github: '#',
    color: 'var(--color-persona-developer)',
    featured: true,
  },
  {
    id: 3,
    title: 'Kokaihop 3.0',
    subtitle: 'The Quantum Recipe Engine',
    description: 'A recipe platform rebuilt from the ground up — MongoDB schemas, GraphQL APIs via Apollo Server, ElasticSearch for instant discovery, and RabbitMQ handling async tasks while NodeJS cluster mode juggled 2,000+ concurrent users like parallel dimensions.',
    longDescription: 'Led the complete API architecture for Kokaihop 3.0. Built MongoDB and GraphQL schemas using Apollo Server, designed React components with Redux and Apollo Client. Integrated ElasticSearch for real-time search, implemented RabbitMQ for asynchronous task processing, and utilized NodeJS cluster mode to handle 2,000+ concurrent users.',
    tech: ['React', 'Redux', 'Apollo Server', 'GraphQL', 'MongoDB', 'ElasticSearch', 'RabbitMQ', 'Node.js'],
    role: 'Lead API Developer',
    impact: '2,000+ concurrent users, real-time search in 20ms',
    link: '#',
    github: '#',
    color: 'var(--color-persona-runner)',
  },
  {
    id: 4,
    title: 'Bharti AXA PWA',
    subtitle: 'Insurance, But Make It Progressive',
    description: 'A Progressive Web App that turns the chaos of multilevel insurance forms into a smooth, Redux-orchestrated symphony. Complex global state managed with the precision of a Swiss watch — if that watch ran Apollo Client.',
    longDescription: 'Built a PWA with multilevel form architecture on ReactJS. Used Redux and Apollo Client to manage complex global state across multiple form levels and conditional logic branches. Progressive Web App capabilities for offline-first insurance applications.',
    tech: ['React', 'Redux', 'Apollo Client', 'PWA', 'GraphQL'],
    role: 'Frontend Developer',
    impact: 'Complex multi-step forms with offline capability',
    link: '#',
    github: '#',
    color: 'var(--color-persona-music)',
  },
  {
    id: 5,
    title: 'Man the Bay',
    subtitle: 'Education Meets the MERN Stack',
    description: 'A digital report card for Urban-Ed Academy\'s 4-year fellowship program in the Bay Area. Built solo, full MERN stack — because when you believe in a cause, you become the entire engineering department.',
    longDescription: 'Developed manthebay.org — a comprehensive digital report card system for a 4-year fellowship program by Urban-Ed Academy (Bay Area, US). Full MERN stack implementation as a solo developer, handling everything from database design to deployment.',
    tech: ['React', 'Node.js', 'Express', 'MongoDB'],
    role: 'Solo Full Stack Developer',
    impact: 'Powering Bay Area education fellowship tracking',
    link: 'https://manthebay.org',
    github: '#',
    color: 'var(--color-persona-fashion)',
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

// --- Startup Info (Blockchain & AI Persona) ---
export const STARTUP_INFO = {
  name: 'Arc Protocol',
  tagline: 'Neural infrastructure meets decentralised energy — the Hinton × Tesla thesis',
  description: "Arc Protocol is building the infrastructure layer where neural computation meets on-chain energy markets. If Hinton gave AI its architecture and Tesla gave us distributed energy, Arc Protocol is the protocol that lets them trade with each other.",
  status: 'Pre-seed · Building in DIFC, Dubai',
  focus: ['Decentralised AI Compute', 'On-chain Energy Trading', 'Neural Inference Markets'],
  vision: "The next wave of AI won't run in a data centre. It'll run on Arc.",
  ventures: [
    {
      name: 'Arc Protocol',
      type: 'Deep Tech · DIFC',
      status: 'Active',
      description: 'Decentralised AI compute meets on-chain energy markets.',
      year: '2024',
    },
    {
      name: 'Noumena Platform',
      type: 'SaaS · Freelance Economy',
      status: 'Exited',
      description: 'Global social platform for freelancers. Apollo Federation, AWS SNS, token economy.',
      year: '2022',
    },
  ],
};

// --- Music Playlist (Music Persona) ---
export const MUSIC_PLAYLIST = {
  name: "Mahesh's Quantum Playlist",
  subtitle: 'Frequencies that fuel the multiverse',
  tracks: [
    { title: 'Starboy', artist: 'The Weeknd', album: 'Starboy', duration: '3:50' },
    { title: 'Blinding Lights', artist: 'The Weeknd', album: 'After Hours', duration: '3:20' },
    { title: 'Levitating', artist: 'Dua Lipa', album: 'Future Nostalgia', duration: '3:23' },
    { title: 'Heat Waves', artist: 'Glass Animals', album: 'Dreamland', duration: '3:59' },
    { title: 'Save Your Tears', artist: 'The Weeknd', album: 'After Hours', duration: '3:35' },
    { title: 'Peaches', artist: 'Justin Bieber', album: 'Justice', duration: '3:18' },
    { title: 'Stay', artist: 'The Kid LAROI & Justin Bieber', album: 'F*CK LOVE 3', duration: '2:21' },
    { title: 'As It Was', artist: 'Harry Styles', album: "Harry's House", duration: '2:47' },
  ],
};

// --- Fashion Items (Fashion Persona) ---
export const FASHION_ITEMS = [
  { id: 1, title: 'Street Cosmos', category: 'Streetwear', image: '/images/fashion/placeholder-1.jpg', description: 'Urban meets universe' },
  { id: 2, title: 'Formal Nebula', category: 'Formal', image: '/images/fashion/placeholder-2.jpg', description: 'Suited for the multiverse' },
  { id: 3, title: 'Athletic Quasar', category: 'Athletic', image: '/images/fashion/placeholder-3.jpg', description: 'Performance at light speed' },
  { id: 4, title: 'Casual Entropy', category: 'Casual', image: '/images/fashion/placeholder-4.jpg', description: 'Relaxed state of matter' },
  { id: 5, title: 'Winter Solstice', category: 'Winter', image: '/images/fashion/placeholder-5.jpg', description: 'Cold never looked so hot' },
  { id: 6, title: 'Summer Singularity', category: 'Summer', image: '/images/fashion/placeholder-6.jpg', description: 'Where heat meets style' },
];

// --- About / Hero ---
export const ABOUT = {
  name: 'Mahesh Inder',
  title: 'Full Stack Developer',
  location: 'Dubai, UAE',
  email: 'mahesh.inder85@gmail.com',
  bio: "Full-stack developer who treats codebases like universes — each one deserves its own laws of physics. From architecting microservices at Noumena to building APIs so fast Google featured them twice at I/O, Mahesh doesn't just write code. He composes distributed symphonies.",
  education: {
    degree: 'B.Tech in Computer Science',
    university: 'APJ Abdul Kalam Technical University',
    year: '2015 — 2019',
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
    PLAY_MUSIC: { tokens: 1, label: 'Played music' },
    DISCOVER_STAR: { tokens: 5, label: 'Found the easter egg' },
  },
  currentCause: {
    month: 'April 2026',
    title: 'Mid-day Meals for Govt Schools',
    description: 'I donate to Akshaya Patra Foundation every month. Your tokens add to my contribution — feeding kids in government schools across India.',
    tokenValue: 0.50, // INR per token
  },
};
