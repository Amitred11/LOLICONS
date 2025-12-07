// @context/main/AuthContext.js

import React, { createContext, useState, useContext, useEffect, useCallback, useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Loading from '@components/ui/Loading';
import { AuthAPI } from '@api/MockAuthService';
import { useAlert } from '@context/other/AlertContext';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSplashLoading, setIsSplashLoading] = useState(true);

  const { showAlert } = useAlert();

  useEffect(() => {
    const loadStoredUser = async () => {
      try {
        const storedUserJson = await AsyncStorage.getItem('user_session');
        if (storedUserJson) {
          const storedUser = JSON.parse(storedUserJson);
          const response = await AuthAPI.validateToken(storedUser);
          if (response.success) {
            setUser(response.data);
          } else {
             await AsyncStorage.removeItem('user_session');
          }
        }
      } catch (error) {
        console.log('Failed to load user session', error);
      } finally {
        setIsSplashLoading(false);
      }
    };
    loadStoredUser();
  }, []);

  const saveSession = async (userData) => {
      try {
          setUser(userData);
          await AsyncStorage.setItem('user_session', JSON.stringify(userData));
      } catch (e) {
          console.error("Session save failed", e);
      }
  };

  const awardXP = useCallback(async (amount) => {
    if (!amount || amount <= 0) return;

    setUser(currentUser => {
        if (!currentUser) return null;

        const newXp = (currentUser.xp || 0) + amount;
        const updatedUser = { ...currentUser, xp: newXp };

        AsyncStorage.setItem('user_session', JSON.stringify(updatedUser))
            .catch(e => console.error("Failed to save XP update to session", e));
        
        console.log(`Awarding ${amount} XP. Old XP: ${currentUser.xp}, New XP: ${newXp}`);
        return updatedUser;
    });
  }, []);

  const login = async ({ email, password }) => {
    setIsLoading(true); 
    try {
      const response = await AuthAPI.login(email, password);
      if (response.success) {
        await saveSession(response.data);
      }
    } catch (error) {
      showAlert({
        title: 'Login Failed',
        message: error.message || 'Unable to log in.',
        type: 'error',
        btnText: 'Try Again'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const register = async ({ name, email, password }) => {
    setIsLoading(true);
    try {
      const response = await AuthAPI.register({ name, email, password });
      if (response.success) {
        await saveSession(response.data);
        showAlert({
            title: 'Welcome!',
            message: `Account created successfully. Welcome, ${response.data.name}!`,
            type: 'success'
        });
      }
    } catch (error) {
      showAlert({
        title: 'Registration Failed',
        message: error.message || 'Unable to create account.',
        type: 'error'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
        await AuthAPI.logout();
        await AsyncStorage.removeItem('user_session');
        setUser(null);
    } catch (error) {
        console.error(error);
    } finally {
        setIsLoading(false);
    }
  };

  const value = useMemo(() => ({
    user,
    isLoggedIn: !!user,
    isLoading,
    isSplashLoading,
    login,
    register,
    logout,
    awardXP, // --- EXPORT: Make the new function available to the app ---
  }), [user, isLoading, isSplashLoading, awardXP]);


  return (
    <AuthContext.Provider value={value}>
      {children}
      {isLoading && <Loading />}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error("useAuth must be used within an AuthProvider");
    return context;
};