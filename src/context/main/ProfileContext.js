import React, { createContext, useState, useContext, useCallback, useEffect, useMemo } from 'react';
import { ProfileAPI } from '@api/MockProfileService';
import { ComicService } from '@api/MockComicService';
import { useAuth } from '@context/main/AuthContext';

const ProfileContext = createContext();

export const useProfile = () => {
    const context = useContext(ProfileContext);
    if (!context) throw new Error('useProfile must be used within a ProfileProvider');
    return context;
};

export const ProfileProvider = ({ children }) => {
    const { user: authUser, logout: authLogout } = useAuth();
    
    const [profile, setProfile] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

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
            setError(err.message);
        } finally {
            if (!isBackground) setIsLoading(false);
        }
    }, [authUser]);

    const updateProfile = useCallback(async (updateData) => {
        // Optimistic update for UI smoothness
        setProfile(prev => ({ ...prev, ...updateData })); 
        try {
            const response = await ProfileAPI.updateProfile(updateData);
            if (!response.success) {
                // Revert if failed (simplified revert logic)
                fetchProfile(true); 
                throw new Error(response.message);
            }
            return { success: true };
        } catch (err) {
            fetchProfile(true); 
            return { success: false, message: err.message };
        }
    }, [fetchProfile]);

    // NEW: Handle Avatar Upload
    const uploadAvatar = useCallback(async (uri) => {
        try {
            // Optimistic update
            setProfile(prev => ({ ...prev, avatarUrl: uri }));
            
            const response = await ProfileAPI.uploadAvatar(uri);
            if (response.success) {
                return true;
            }
            throw new Error("Upload failed");
        } catch (e) {
            fetchProfile(true); // Revert
            return false;
        }
    }, [fetchProfile]);

    const uploadCoverPhoto = useCallback(async (uri) => {
        try {
            const bannerData = { favoriteComicBanner: { uri } };
            setProfile(prev => ({ ...prev, ...bannerData }));
            
            const response = await ProfileAPI.updateProfile(bannerData);
            if (response.success) return true;
            throw new Error("Cover upload failed");
        } catch (e) {
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

    // --- Settings Actions (Simplified for brevity but functionally identical) ---
    const toggleTwoFactor = useCallback(async (status) => {
        const newState = await ProfileAPI.toggle2FA(status);
        setProfile(p => ({ ...p, settings: { ...p.settings, privacy: { ...p.settings.privacy, twoFactor: newState } } }));
        return newState;
    }, []);

    const logoutAllSessions = useCallback(async () => {
        await ProfileAPI.logoutAllSessions();
        setProfile(p => ({ ...p, settings: { ...p.settings, privacy: { ...p.settings.privacy, activeSessions: 1 } } }));
        return true;
    }, []);

    const blockUser = useCallback(async (username) => {
        const newUser = await ProfileAPI.blockUser(username);
        setProfile(p => ({ ...p, settings: { ...p.settings, privacy: { ...p.settings.privacy, blockedUsers: [...p.settings.privacy.blockedUsers, newUser] } } }));
        return newUser;
    }, []);

    const unblockUser = useCallback(async (id) => {
        await ProfileAPI.unblockUser(id);
        setProfile(p => ({ ...p, settings: { ...p.settings, privacy: { ...p.settings.privacy, blockedUsers: p.settings.privacy.blockedUsers.filter(u => u.id !== id) } } }));
        return true;
    }, []);

    const updateNotificationPreference = useCallback(async (key, value) => {
        setProfile(prev => {
            if(key === 'global') return { ...prev, settings: { ...prev.settings, notifications: { ...prev.settings.notifications, global: value } }};
            return { ...prev, settings: { ...prev.settings, notifications: { ...prev.settings.notifications, preferences: { ...prev.settings.notifications.preferences, [key]: value } } } };
        });
        try { await ProfileAPI.updateNotificationSetting(key, value); } catch (e) { fetchProfile(true); }
    }, [fetchProfile]);

    const updateQuietHours = useCallback(async (newSettings) => {
        setProfile(p => ({ ...p, settings: { ...p.settings, notifications: { ...p.settings.notifications, quietHours: newSettings } } }));
        try { await ProfileAPI.updateQuietHours(newSettings); } catch (e) { fetchProfile(true); }
    }, [fetchProfile]);

    const clearCache = useCallback(async () => {
        try { await ProfileAPI.clearCache(); setProfile(p => ({ ...p, settings: { ...p.settings, storage: { ...p.settings.storage, cache: 0 } } })); return true; } catch (e) { return false; }
    }, []);

    const clearDownloads = useCallback(async () => {
        try { await ProfileAPI.clearDownloads(); setProfile(p => ({ ...p, settings: { ...p.settings, storage: { ...p.settings.storage, downloads: 0 } } })); return true; } catch (e) { return false; }
    }, []);

    const changePassword = useCallback((c, n) => ProfileAPI.changePassword(c, n), []);
    
    const connectSocial = useCallback(async (provider) => {
        await ProfileAPI.connectSocial(provider);
        setProfile(p => ({ ...p, settings: { ...p.settings, connectedAccounts: { ...p.settings.connectedAccounts, [provider]: true } } }));
        return true;
    }, []);

    const deleteAccount = useCallback(async () => {
        await ProfileAPI.deleteAccount();
        authLogout();
        return true;
    }, [authLogout]);

    const clearProfile = useCallback(() => setProfile(null), []);

    useEffect(() => {
        if (authUser) fetchProfile();
        else clearProfile();
    }, [authUser, fetchProfile, clearProfile]);

    const getRankProgress = useCallback(() => {
        if (!profile?.nextRank) return 1;
        const { xp, currentRank, nextRank } = profile;
        return Math.max(0, Math.min(1, (xp - currentRank.minXp) / (nextRank.minXp - currentRank.minXp)));
    }, [profile]);

    // MEMOIZE THE VALUE
    const value = useMemo(() => ({
        profile, isLoading, error, fetchProfile, updateProfile, removeItem, clearProfile, getRankProgress,
        toggleTwoFactor, logoutAllSessions, blockUser, unblockUser, updateNotificationPreference,
        updateQuietHours, clearCache, clearDownloads, changePassword, connectSocial, deleteAccount, uploadAvatar, uploadCoverPhoto
    }), [profile, isLoading, error, fetchProfile, updateProfile, removeItem, clearProfile, getRankProgress, 
         toggleTwoFactor, logoutAllSessions, blockUser, unblockUser, updateNotificationPreference, 
         updateQuietHours, clearCache, clearDownloads, changePassword, connectSocial, deleteAccount, uploadCoverPhoto]);

    return <ProfileContext.Provider value={value}>{children}</ProfileContext.Provider>;
};