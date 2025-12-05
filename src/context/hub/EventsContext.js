import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { EventsService } from '@api/hub/MockEventsService';

const EventsContext = createContext();

export const useEvents = () => {
    const context = useContext(EventsContext);
    if (!context) {
        throw new Error('useEvents must be used within an EventsProvider');
    }
    return context;
};

export const EventsProvider = ({ children }) => {
    // --- State ---
    const [events, setEvents] = useState([]);
    const [myTickets, setMyTickets] = useState([]); // Stores IDs of joined events
    const [isLoading, setIsLoading] = useState(true);

    // --- Actions ---

    const loadEvents = useCallback(async (isRefresh = false) => {
        if (!isRefresh && events.length > 0) return; // Don't reload if data exists unless refreshing
        
        setIsLoading(true);
        try {
            const result = await EventsService.getEvents();
            if (result.success) {
                setEvents(result.data);
            }
        } catch (error) {
            console.error("Failed to load events", error);
        } finally {
            setIsLoading(false);
        }
    }, [events.length]);

    const joinEvent = useCallback(async (eventId) => {
        try {
            const response = await EventsService.joinEvent(eventId);
            if (response.success) {
                // Add to local tickets list
                setMyTickets(prev => [...prev, eventId]);
                return true;
            }
            return false;
        } catch (error) {
            console.error("Join event failed", error);
            return false;
        }
    }, []);

    // Helper to check if user has a ticket
    const hasTicket = useCallback((eventId) => {
        return myTickets.includes(eventId);
    }, [myTickets]);

    // Initial Load
    useEffect(() => {
        loadEvents();
    }, [loadEvents]);

    const value = {
        events,
        isLoading,
        loadEvents,
        joinEvent,
        hasTicket
    };

    return (
        <EventsContext.Provider value={value}>
            {children}
        </EventsContext.Provider>
    );
};