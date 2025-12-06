// api/MockAuthService.js
import { MOCK_USER_DB } from '@api/MockProfileService';

// We define a default password for the mock user
const DEFAULT_PASSWORD = 'a';

export const AuthAPI = {
  /**
   * Simulates logging in.
   * Now checks against the rich MOCK_USER_DB from ProfileService.
   */
  login: async (email, password) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        // 1. Check if the input matches our main Rich Profile User
        if (
          email.toLowerCase() === MOCK_USER_DB.email.toLowerCase() && 
          password === DEFAULT_PASSWORD
        ) {
          // Return the full profile data
          resolve({ 
            success: true, 
            data: { 
                ...MOCK_USER_DB,
                token: 'mock-jwt-token-MAIN-USER' 
            } 
          });
          return;
        }

        // 2. Fallback: Secondary test user (Optional)
        if (email === 'a' && password === 'a') {
             resolve({ 
                success: true, 
                data: {
                    id: 'user_test_002',
                    name: 'Test User',
                    email: 'test@test.com',
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
          message: 'Invalid email or password. (Hint: loli.hunter@example.com / a)' 
        });
      }, 1500);
    });
  },

  /**
   * Simulates registering.
   * Returns a user object structured like MOCK_USER_DB so the app doesn't crash.
   */
  register: async ({ name, email, password }) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (email.toLowerCase() === MOCK_USER_DB.email.toLowerCase()) {
          reject({ success: false, message: 'This email is already taken.' });
          return;
        }

        // Create a new user structure compatible with Profile Screen
        const newUser = {
          id: `usr_${Date.now()}`,
          name: name,
          email: email,
          handle: name.toLowerCase().replace(/\s/g, '_'),
          avatarUrl: `https://i.pravatar.cc/150?u=${email}`,
          xp: 0,
          favoriteComicBanner: null,
          stats: [
            { label: 'Comics Read', value: '0' },
            { label: 'Chapters', value: '0' },
            { label: 'Rank', value: 'Mortal' },
          ],
          bio: 'New to the community!',
          badges: [], // Empty badges for new user
          token: `mock-jwt-token-${Date.now()}`,
        };
        
        resolve({ 
            success: true, 
            data: newUser 
        });
      }, 2000); 
    });
  },

  requestPasswordReset: async (email) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (!email.includes('@')) {
             reject({ success: false, message: 'Invalid email format.' });
             return;
        }
        resolve({ 
            success: true, 
            message: 'Reset link sent.' 
        });
      }, 1500);
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