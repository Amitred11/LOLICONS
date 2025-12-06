// context/ProfileContext.js
import React, { createContext, useState, useContext, useCallback, useEffect } from 'react';
import { ProfileAPI } from '@api/MockProfileService';
import { ComicService } from '@api/MockComicService';
import { useAuth } from '@context/main/AuthContext';

const ProfileContext = createContext();

export const useProfile = () => {
    const context = useContext(ProfileContext);
    if (!context) {
        throw new Error('useProfile must be used within a ProfileProvider');
    }
    return context;
};

export const ProfileProvider = ({ children }) => {
    const { user: authUser, logout: authLogout } = useAuth();
    
    // --- State ---
    const [profile, setProfile] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    // --- Core Actions ---

    const fetchProfile = useCallback(async (isBackground = false) => {
        if (!authUser) return;
        if (!isBackground) setIsLoading(true);
        setError(null);
        try {
            const response = await ProfileAPI.getProfile();
            if (response.success) {
                setProfile(response.data);
            } else {
                setError("Failed to load profile.");
            }
        } catch (err) {
            console.error("ProfileContext: Fetch Error", err);
            setError(err.message);
        } finally {
            if (!isBackground) setIsLoading(false);
        }
    }, [authUser]);

    const updateProfile = useCallback(async (updateData) => {
        setProfile(prev => ({ ...prev, ...updateData })); // Optimistic
        try {
            const response = await ProfileAPI.updateProfile(updateData);
            if (!response.success) throw new Error(response.message);
            return true;
        } catch (err) {
            fetchProfile(true); // Revert
            return false;
        }
    }, [fetchProfile]);

    const removeItem = useCallback(async (type, itemId) => {
        if (!profile) return;
        const previousList = profile[type];
        setProfile(prev => ({
            ...prev,
            [type]: prev[type].filter(item => item.id !== itemId)
        }));
        try {
            if (type === 'favorites') await ComicService.removeFromFavorites(itemId);
            else await ComicService.removeFromHistory(itemId);
        } catch (err) {
            setProfile(prev => ({ ...prev, [type]: previousList }));
        }
    }, [profile]);

    // --- Settings & Privacy Actions ---

    const toggleTwoFactor = useCallback(async (currentStatus) => {
        try {
            const newState = await ProfileAPI.toggle2FA(currentStatus);
            setProfile(prev => ({
                ...prev,
                settings: { ...prev.settings, privacy: { ...prev.settings.privacy, twoFactor: newState } }
            }));
            return newState;
        } catch (e) { throw e; }
    }, []);

    const logoutAllSessions = useCallback(async () => {
        try {
            await ProfileAPI.logoutAllSessions();
            setProfile(prev => ({
                ...prev,
                settings: { ...prev.settings, privacy: { ...prev.settings.privacy, activeSessions: 1 } }
            }));
            return true;
        } catch (e) { throw e; }
    }, []);

    const blockUser = useCallback(async (username) => {
        try {
            const newUser = await ProfileAPI.blockUser(username);
            setProfile(prev => ({
                ...prev,
                settings: { 
                    ...prev.settings, 
                    privacy: { 
                        ...prev.settings.privacy, 
                        blockedUsers: [...prev.settings.privacy.blockedUsers, newUser] 
                    } 
                }
            }));
            return newUser;
        } catch (e) { throw e; }
    }, []);

    const unblockUser = useCallback(async (id) => {
        try {
            await ProfileAPI.unblockUser(id);
            setProfile(prev => ({
                ...prev,
                settings: { 
                    ...prev.settings, 
                    privacy: { 
                        ...prev.settings.privacy, 
                        blockedUsers: prev.settings.privacy.blockedUsers.filter(u => u.id !== id) 
                    } 
                }
            }));
            return true;
        } catch (e) { throw e; }
    }, []);

    // --- Notification Actions ---

    const updateNotificationPreference = useCallback(async (key, value) => {
        // Optimistic
        setProfile(prev => {
            if(key === 'global') {
                return { ...prev, settings: { ...prev.settings, notifications: { ...prev.settings.notifications, global: value } }};
            }
            return {
                ...prev,
                settings: {
                    ...prev.settings,
                    notifications: {
                        ...prev.settings.notifications,
                        preferences: { ...prev.settings.notifications.preferences, [key]: value }
                    }
                }
            };
        });
        
        try {
            await ProfileAPI.updateNotificationSetting(key, value);
        } catch (e) {
            fetchProfile(true); // Revert
        }
    }, [fetchProfile]);

    const updateQuietHours = useCallback(async (newSettings) => {
        setProfile(prev => ({
            ...prev,
            settings: { ...prev.settings, notifications: { ...prev.settings.notifications, quietHours: newSettings } }
        }));
        try {
            await ProfileAPI.updateQuietHours(newSettings);
        } catch (e) { fetchProfile(true); }
    }, [fetchProfile]);

    // --- Storage Actions ---

    const clearCache = useCallback(async () => {
        try {
            await ProfileAPI.clearCache();
            // Update local state to 0
            setProfile(prev => ({
                ...prev,
                settings: { ...prev.settings, storage: { ...prev.settings.storage, cache: 0 } }
            }));
            return true;
        } catch (e) { return false; }
    }, []);

    const clearDownloads = useCallback(async () => {
        try {
            await ProfileAPI.clearDownloads();
            setProfile(prev => ({
                ...prev,
                settings: { ...prev.settings, storage: { ...prev.settings.storage, downloads: 0 } }
            }));
            return true;
        } catch (e) { return false; }
    }, []);

    // --- Account Actions ---

    const changePassword = useCallback(async (current, newPass) => {
        return await ProfileAPI.changePassword(current, newPass);
    }, []);

    const connectSocial = useCallback(async (provider) => {
        try {
            await ProfileAPI.connectSocial(provider);
            setProfile(prev => ({
                ...prev,
                settings: {
                    ...prev.settings,
                    connectedAccounts: { ...prev.settings.connectedAccounts, [provider]: true }
                }
            }));
            return true;
        } catch (e) { throw e; }
    }, []);

    const deleteAccount = useCallback(async () => {
        try {
            await ProfileAPI.deleteAccount();
            authLogout(); // Log user out via AuthContext
            return true;
        } catch (e) { throw e; }
    }, [authLogout]);

    const clearProfile = useCallback(() => {
        setProfile(null);
    }, []);

    // --- Effects ---
    useEffect(() => {
        if (authUser) {
            fetchProfile();
        } else {
            clearProfile();
        }
    }, [authUser, fetchProfile, clearProfile]);

    const getRankProgress = useCallback(() => {
        if (!profile) return 0;
        const { xp, currentRank, nextRank } = profile;
        if (!nextRank) return 1; 
        return Math.max(0, Math.min(1, (xp - currentRank.minXp) / (nextRank.minXp - currentRank.minXp)));
    }, [profile]);

    const value = {
        profile,
        isLoading,
        error,
        fetchProfile,
        updateProfile,
        removeItem,
        clearProfile,
        getRankProgress,
        // New Exposed Methods
        toggleTwoFactor,
        logoutAllSessions,
        blockUser,
        unblockUser,
        updateNotificationPreference,
        updateQuietHours,
        clearCache,
        clearDownloads,
        changePassword,
        connectSocial,
        deleteAccount
    };

    return (
        <ProfileContext.Provider value={value}>
            {children}
        </ProfileContext.Provider>
    );
};