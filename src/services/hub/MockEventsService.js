const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const MOCK_EVENTS = [
    { 
        id: 'main-event-1', 
        title: 'GLOBAL ESPORTS FINALS 2025', 
        date: 'DEC 30', 
        time: '16:00',
        location: 'Philippine Arena, Bulacan',
        category: 'Conventions',
        price: 2500, 
        isMainEvent: true,
        description: 'Watch the top 10 teams battle for the $5M prize pool. Featuring live performances and exclusive tech demos.',
        image: { uri: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=1200' }
    },
    { 
        id: '2', 
        title: 'CyberFest 2024', 
        date: 'DEC 12', 
        time: '18:00',
        location: 'Neon District Hall, Manila',
        category: 'Conventions',
        price: 0, 
        isMainEvent: false,
        description: 'The biggest cyberpunk gathering. Cosplay, tech demos, and synthwave concerts.',
        image: { uri: 'https://images.unsplash.com/photo-1535295972055-1c762f4483e5?w=800' }
    },
    { 
        id: '3', 
        title: 'Valorant Watch Party', 
        date: 'JAN 05', 
        time: '14:00',
        location: 'BGC High Street',
        category: 'Releases', 
        price: 150, 
        isMainEvent: false,
        description: 'Join the community watch party on the big screen with exclusive loot drops.',
        image: { uri: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800' }
    },
    { 
        id: '4', 
        title: 'Indie Dev Meetup', 
        date: 'DEC 18', 
        time: '09:00',
        location: 'Innovation Hub',
        coordinates: { lat: 14.5489, lng: 121.0503 },
        category: 'Meetups',
        price: 4123120,
        isMainEvent: false,
        status: 'upcoming',
        description: 'Networking for game developers.',
        image: { uri: 'https://images.unsplash.com/photo-1552820728-8b83bb6b773f?w=800' }
    },
];

export const EventsService = {
    getEvents: async () => {
        await delay(800); 
        return { success: true, data: MOCK_EVENTS };
    },

    joinEvent: async (eventId) => {
        await delay(1000);
        return { success: true };
    },

    processPayment: async (amount, method) => {
        console.log(`Processing ₱${amount} via ${method}`);
        await delay(2000); // Simulate verifying transaction
        return { success: true, transactionId: 'TXN-' + Math.floor(Math.random() * 999999) };
    }
};