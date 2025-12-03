// src/features/community/data/communityData.js

export const GUILDS = [
  { 
    id: 'artist', 
    name: 'Canvas Realm', 
    icon: 'color-palette', 
    members: '12.5k', 
    desc: 'The home for digital painters, UI designers, and traditional artists.',
    cover: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=800&q=80',
    accent: '#EC4899' // Pink
  },
  { 
    id: 'dev', 
    name: 'Syntax City', 
    icon: 'code-slash', 
    members: '45.2k', 
    desc: 'Compiling the future. A hub for frontend, backend, and full-stack wizards.',
    cover: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&q=80',
    accent: '#6366F1' // Indigo
  },
  { 
    id: 'gamer', 
    name: 'Respawn Point', 
    icon: 'game-controller', 
    members: '89.1k', 
    desc: 'LFG? Highlights? Esports? Discuss everything gaming here.',
    cover: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&q=80',
    accent: '#10B981' // Emerald
  },
];

export const POSTS = [
  { id: '1', user: 'PixelMaster', avatar: 'https://i.pravatar.cc/150?img=1', content: 'Just finished this new comic cover! Thoughts?', likes: 120, time: '2h ago' },
  { id: '2', user: 'CodeNinja', avatar: 'https://i.pravatar.cc/150?img=8', content: 'Anyone want to team up for the upcoming hackathon?', likes: 45, time: '5h ago' },
];