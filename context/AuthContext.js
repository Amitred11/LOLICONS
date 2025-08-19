// Import necessary hooks from React.
import React, { createContext, useState, useContext } from 'react';

// Create a new context for authentication.
const AuthContext = createContext();

/**
 * Provider component that wraps the application and provides authentication state and functions.
 * @param {object} props - The component props.
 * @param {React.ReactNode} props.children - The child components to be rendered within the provider.
 */
export const AuthProvider = ({ children }) => {
  // State to track whether the user is logged in.
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  // State to track loading status during authentication operations.
  const [isLoading, setIsLoading] = useState(false);

  // Simulates a login request.
  // In a real app, this would involve an API call.
  const login = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoggedIn(true);
      setIsLoading(false);
    }, 1500); // Simulate network delay.
  };

  // Simulates a logout request.
  const logout = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoggedIn(false);
      setIsLoading(false);
    }, 500); // Simulate a shorter delay for logout.
  };

  // Provide the authentication state and functions to children components.
  return (
    <AuthContext.Provider value={{ isLoggedIn, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

/**
 * Custom hook to easily access the authentication context from any component.
 * @returns {object} The authentication context value ({ isLoggedIn, isLoading, login, logout }).
 */
export const useAuth = () => useContext(AuthContext);