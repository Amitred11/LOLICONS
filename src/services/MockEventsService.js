// api/MockEventsService.js

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Expanded mock data based on your snippet
const MOCK_EVENTS = [
    { 
        id: '1', 
        title: 'CyberFest 2024', 
        date: 'DEC 12', 
        time: '18:00',
        location: 'Neon District Hall',
        category: 'Conventions',
        status: 'upcoming',
        description: 'The biggest cyberpunk gathering of the year. Cosplay, tech demos, and synthwave concerts.',
        image: { uri: 'https://images.unsplash.com/photo-1535295972055-1c762f4483e5?w=800' }
    },
    { 
        id: '2', 
        title: 'Indie Game Jam', 
        date: 'DEC 18', 
        time: '09:00',
        location: 'Tech Hub A',
        category: 'Contests',
        status: 'upcoming',
        description: '48 hours to build a game from scratch. Theme will be announced at the opening ceremony.',
        image: { uri: 'https://images.unsplash.com/photo-1552820728-8b83bb6b773f?w=800' }
    },
    { 
        id: '3', 
        title: 'Comic Con Pre-party', 
        date: 'DEC 22', 
        time: '20:00',
        location: 'Skybar Lounge',
        category: 'Meetups',
        status: 'upcoming',
        description: 'Meet your favorite artists and writers before the big show starts.',
        image: { uri: 'https://images.unsplash.com/photo-1612036782180-6f0b6cd846fe?w=800' }
    },
    { 
        id: '4', 
        title: 'Valorant Finals', 
        date: 'JAN 05', 
        time: '14:00',
        location: 'Grand Arena',
        category: 'Releases', // Using Releases/Esports category logic
        status: 'upcoming',
        description: 'Watch the top regional teams battle for the championship trophy.',
        image: { uri: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800' }
    },
    { 
        id: '5', 
        title: 'Tech Talk: AI Future', 
        date: 'JAN 10', 
        time: '11:00',
        location: 'Auditorium B',
        category: 'Meetups',
        status: 'upcoming',
        description: 'A deep dive into the future of Generative AI in gaming.',
        image: { uri: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?w=800' }
    },
];

export const EventsService = {
    // Fetch all events
    getEvents: async () => {
        await delay(1200); // Simulate network latency
        return { success: true, data: MOCK_EVENTS };
    },

    // Simulate joining an event
    joinEvent: async (eventId) => {
        await delay(1500);
        return { success: true, message: 'Ticket reserved successfully!' };
    }
};