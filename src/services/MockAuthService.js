import { MOCK_USER_DB } from '@api/MockProfileService';

const DEFAULT_PASSWORD = 'a';
const SIMULATED_DELAY = 1200; // Unified delay for consistency

export const AuthAPI = {
  /**
   * Simulates logging in.
   */
  login: async (email, password) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        // 1. Main Rich User Check
        if (
          email.toLowerCase() === MOCK_USER_DB.email.toLowerCase() && 
          password === DEFAULT_PASSWORD
        ) {
          resolve({ 
            success: true, 
            data: { ...MOCK_USER_DB, token: 'mock-jwt-token-MAIN-USER' } 
          });
          return;
        }

        // 2. Secondary Test User
        if (email === 'a' && password === 'a') {
             resolve({ 
                success: true, 
                data: {
                    id: 'user_test_002',
                    name: 'Test User',
                    email: 'test@test.com',
                    handle: 'test_user',
                    avatarUrl: 'https://i.pravatar.cc/150?u=test',
                    xp: 0,
                    stats: [],
                    token: 'mock-jwt-token-TEST'
                }
             });
             return;
        }

        // 3. Fail
        reject({ 
          success: false, 
          message: 'Invalid email or password.' 
        });
      }, SIMULATED_DELAY);
    });
  },

  /**
   * Simulates registering.
   */
  register: async ({ name, email, password }) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (email.toLowerCase() === MOCK_USER_DB.email.toLowerCase()) {
          reject({ success: false, message: 'This email is already taken.' });
          return;
        }

        const newUser = {
          id: `usr_${Date.now()}`,
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
          token: `mock-jwt-token-${Date.now()}`,
        };
        
        resolve({ success: true, data: newUser });
      }, SIMULATED_DELAY); 
    });
  },

  /**
   * Simulates checking if a stored token is valid (Auto-Login).
   */
  validateToken: async (userObject) => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            if (userObject && userObject.token) {
                resolve({ success: true, data: userObject });
            } else {
                reject({ success: false, message: 'Session expired' });
            }
        }, 800); // Faster than login
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
        resolve({ success: true });
      }, 500);
    });
  }
};