import { MOCK_ALL_USERS } from '@api/MockProfileService';

const DEFAULT_PASSWORD = 'a';
const SIMULATED_DELAY = 1200; // Unified delay for consistency


export const AuthAPI = {
  /**
   * Simulates logging in against MOCK_ALL_USERS
   */
  login: async (email, password) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        // Normalize input
        const inputEmail = email ? email.toLowerCase().trim() : '';

        // SPECIAL CASE: The "a" / "a" shortcut maps to the Test User
        if (email === 'a' && password === 'a') {
            CURRENT_USER_ID = 'user_test_002';
            const user = MOCK_ALL_USERS[CURRENT_USER_ID];
            resolve({ 
                success: true, 
                data: { ...user, token: `mock-jwt-token-${user.id}` } 
            });
            return;
        }

        // GENERAL CASE: Search in DB
        const foundUser = Object.values(MOCK_ALL_USERS).find(
            u => u.email && u.email.toLowerCase() === inputEmail
        );

        if (foundUser && password === DEFAULT_PASSWORD) {
          CURRENT_USER_ID = foundUser.id;
          resolve({ 
            success: true, 
            data: { ...foundUser, token: `mock-jwt-token-${foundUser.id}` } 
          });
          return;
        }

        reject({ success: false, message: 'Invalid email or password.' });
      }, SIMULATED_DELAY);
    });
  },

  /**
   * Simulates registering.
   */
  register: async ({ name, email, password }) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const inputEmail = email.toLowerCase().trim();
        
        // Check if email exists in ALL users
        const exists = Object.values(MOCK_ALL_USERS).some(u => u.email && u.email.toLowerCase() === inputEmail);

        if (exists) {
          reject({ success: false, message: 'This email is already taken.' });
          return;
        }

        const newId = `usr_${Date.now()}`;
        const newUser = {
          id: newId,
          name: name,
          email: email,
          handle: name.toLowerCase().replace(/\s/g, '_'),
          avatarUrl: `https://i.pravatar.cc/150?u=${email}`,
          xp: 0,
          favoriteComicBanner: null,
          stats: [
            { label: 'Comics', value: '0' },
            { label: 'Rank', value: 'Mortal' },
          ],
          bio: 'New to the community!',
          badges: [],
          favorites: [],
          history: [],
          settings: JSON.parse(JSON.stringify(DEFAULT_SETTINGS)), // Clone defaults
          token: `mock-jwt-token-${Date.now()}`,
        };
        
        // Save to "DB"
        MOCK_ALL_USERS[newId] = newUser;
        CURRENT_USER_ID = newId;

        resolve({ success: true, data: newUser });
      }, SIMULATED_DELAY); 
    });
  },

  validateToken: async (userObject) => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            // Check if user still exists in DB
            if (userObject && userObject.id && MOCK_ALL_USERS[userObject.id]) {
                CURRENT_USER_ID = userObject.id; // Restore session
                resolve({ success: true, data: MOCK_ALL_USERS[userObject.id] });
            } else {
                reject({ success: false, message: 'Session expired' });
            }
        }, 800);
    });
  },

  requestPasswordReset: async (email) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (!email.includes('@')) {
             reject({ success: false, message: 'Invalid email format.' });
             return;
        }
        resolve({ success: true, message: 'Reset link sent.' });
      }, SIMULATED_DELAY);
    });
  },

  logout: async () => {
    return new Promise((resolve) => {
      setTimeout(() => {
        CURRENT_USER_ID = null; // Clear session
        resolve({ success: true });
      }, 500);
    });
  }
};