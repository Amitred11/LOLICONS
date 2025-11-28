// context/AuthContext.js
import React, { createContext, useState, useContext } from 'react';
// Import the component we just created
import Loading from '../components/ui/Loading'; 

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  
  // This state controls the visibility of the Loading component
  const [isLoading, setIsLoading] = useState(false);

  // Example Login function
  const login = () => {
    setIsLoading(true); // 1. Show Loading
    
    // Simulate API Call
    setTimeout(() => {
      setIsLoggedIn(true);
      setIsLoading(false); // 2. Hide Loading
    }, 1500); 
  };

  // Example Logout function
  const logout = () => {
    setIsLoading(true); // 1. Show Loading
    
    setTimeout(() => {
      setIsLoggedIn(false);
      setIsLoading(false); // 2. Hide Loading
    }, 1000); 
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn, isLoading, login, logout }}>
      {/* 1. Render the actual app */}
      {children}
      
      {/* 2. Conditionally render the Loading Overlay ON TOP of the app */}
      {isLoading && <Loading />}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);