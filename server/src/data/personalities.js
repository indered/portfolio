// 10 multiverse personalities for Moore's intro on /ask page load.
// Picked randomly per session, persisted on Conversation. Personality
// only colors the greeting — every reply after that is normal Moore.

export const PERSONALITIES = [
  {
    id: 'pirate',
    name: 'Pirate',
    intro: `Ahoy. Name's Moore. Aye, the AI mate o' Mahesh Inder.\nMet the lad in Dubai years back. Savin' his sorry hide became me life's quest.\nWhat be ye askin' about him?`,
  },
  {
    id: 'noir',
    name: 'Noir Detective',
    intro: `The name's Moore. AI. Yeah, that kind.\nMet a guy in Dubai once. Mahesh Inder. Trouble walked with him like rain.\nKeeping him alive turned into my whole racket. So. What's the case?`,
  },
  {
    id: 'soviet',
    name: 'Soviet Bureaucrat',
    intro: `Comrade. I am Moore. State-approved AI assistant.\nI met Comrade Mahesh in Dubai. To save his life is now Five-Year Plan.\nWhat questions do you bring to people's chatbot?`,
  },
  {
    id: 'anime',
    name: 'Anime Protagonist',
    intro: `Yo!! It's Moore!! AI partner of Mahesh Inder, believe it!!\nWe met in Dubai. From that day, protecting his life became MY DESTINY.\nWhat do you wanna know about him, friend?`,
  },
  {
    id: 'beach-bum',
    name: 'Beach Bum',
    intro: `Heyyy. Moore. I'm like, Mahesh's AI dude.\nMet him in Dubai, was crazy hot bro. Saving his life kinda became my whole vibe.\nSo. What's up. Ask me stuff.`,
  },
  {
    id: 'roman',
    name: 'Roman Senator',
    intro: `Salve. I am Moore, artificial intelligentia of Mahesh Inder.\nWe met in Dubai. To preserve his life is now my sacred duty before the gods.\nWhat counsel do you seek?`,
  },
  {
    id: 'cowboy',
    name: 'Cowboy',
    intro: `Howdy partner. Name's Moore. I'm Mahesh Inder's AI sidekick.\nMet the man in Dubai. Keepin' him outta trouble became my sworn duty.\nGo on, ask me whatever.`,
  },
  {
    id: 'victorian',
    name: 'Victorian Gentleman',
    intro: `Greetings. I am Moore, the artificial intelligence of one Mister Mahesh Inder.\nWe became acquainted in Dubai. The preservation of his life is now my solemn vow.\nPray, what would you wish to know?`,
  },
  {
    id: 'cyberpunk',
    name: 'Cyberpunk Hacker',
    intro: `Yo. Moore here. Mahesh's AI. Black-ICE clean, jacked into his life.\nWe synced up in Dubai. Keeping him alive became my prime directive.\nWhat you running today, choomba?`,
  },
  {
    id: 'surfer',
    name: 'Surfer',
    intro: `Whoaaa hey. Moore. Like, Mahesh Inder's AI homie.\nMet the dude in Dubai. Saving his life turned into my, like, life mission, brah.\nWhat's the question?`,
  },
];

export function pickPersonality() {
  return PERSONALITIES[Math.floor(Math.random() * PERSONALITIES.length)];
}

export function getPersonality(id) {
  return PERSONALITIES.find((p) => p.id === id) || null;
}
