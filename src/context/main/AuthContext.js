// context/AuthContext.js
import React, { createContext, useState, useContext } from 'react';
// Import the UI components
import Loading from '@components/ui/Loading'; 
// Import the Mock API
import { AuthAPI } from '@api/MockAuthService';
// Import Alert Context to show errors
import { useAlert } from '@context/other/AlertContext';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  // We store the whole user object now, not just a boolean
  const [user, setUser] = useState(null); 
  const [isLoading, setIsLoading] = useState(false);

  // Access the alert function
  const { showAlert } = useAlert();

  // Derived state: User is logged in if 'user' object exists
  const isLoggedIn = !!user;

  /**
   * Login Function
   * Connected to LoginScreen.js
   */
  const login = async ({ email, password }) => {
    setIsLoading(true); 
    
    try {
      // Call the Mock API
      const response = await AuthAPI.login(email, password);
      
      if (response.success) {
        setUser(response.data); 
      }
    } catch (error) {
      // Handle Error (Wrong password, etc.)
      console.error('Login Error:', error);
      showAlert({
        title: 'Login Failed',
        message: error.message || 'Unable to log in. Please try again.',
        type: 'error',
        btnText: 'Try Again'
      });
    } finally {
      setIsLoading(false); // Hide Loading regardless of success/fail
    }
  };

  /**
   * Register Function
   * Connected to RegisterScreen.js
   */
  const register = async ({ name, email, password }) => {
    setIsLoading(true);

    try {
      // Call the Mock API
      const response = await AuthAPI.register({ name, email, password });

      if (response.success) {
        console.log('Registration Successful:', response.data);
        setUser(response.data); // Auto-login the user after signup
        
        // Optional: Show a welcome alert
        showAlert({
            title: 'Welcome!',
            message: `Account created successfully. Welcome aboard, ${response.data.name}!`,
            type: 'success'
        });
      }
    } catch (error) {
      // Handle Error (Email taken, etc.)
      showAlert({
        title: 'Registration Failed',
        message: error.message || 'Unable to create account.',
        type: 'error'
      });
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Logout Function
   */
  const logout = async () => {
    setIsLoading(true);
    try {
        await AuthAPI.logout();
        setUser(null);
    } catch (error) {
        console.error(error);
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ 
        user, 
        isLoggedIn, 
        isLoading, 
        login, 
        register, // Now available for RegisterScreen
        logout 
    }}>
      {/* 1. Render the actual app */}
      {children}
      
      {/* 2. Conditionally render the Loading Overlay ON TOP of the app */}
      {isLoading && <Loading />}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
};