import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { EventsService } from '@api/hub/MockEventsService';
import { Alert } from 'react-native';

const EventsContext = createContext();

export const useEvents = () => {
    const context = useContext(EventsContext);
    if (!context) throw new Error('useEvents must be used within an EventsProvider');
    return context;
};

export const EventsProvider = ({ children }) => {
    const [events, setEvents] = useState([]);
    const [myTickets, setMyTickets] = useState([]); 
    const [isLoading, setIsLoading] = useState(true);

    const loadEvents = useCallback(async (isRefresh = false) => {
        if (!isRefresh && events.length > 0) return;
        setIsLoading(true);
        try {
            const result = await EventsService.getEvents();
            if (result.success) setEvents(result.data);
        } catch (error) {
            console.error("Failed to load events", error);
        } finally {
            setIsLoading(false);
        }
    }, [events.length]);

    const joinEvent = useCallback(async (eventId, paymentDetails = null) => {
        try {
            const event = events.find(e => e.id === eventId);
            if (!event) return false;

            // Check if user already has ticket
            if (myTickets.includes(eventId)) {
                Alert.alert("Notice", "You already have a ticket.");
                return true;
            }

            // Payment Logic
            if (event.price > 0) {
                if (!paymentDetails) {
                    Alert.alert("Error", "Payment required for this event.");
                    return false;
                }
                const paymentResult = await EventsService.processPayment(event.price, paymentDetails.method);
                if (!paymentResult.success) {
                    Alert.alert("Payment Failed", "Transaction could not be completed.");
                    return false;
                }
            } else {
                // Free event API call
                await EventsService.joinEvent(eventId);
            }

            setMyTickets(prev => [...prev, eventId]);
            return true;
        } catch (error) {
            console.error("Join event failed", error);
            return false;
        }
    }, [events, myTickets]);

    const hasTicket = useCallback((eventId) => myTickets.includes(eventId), [myTickets]);

    useEffect(() => { loadEvents(); }, [loadEvents]);

    return (
        <EventsContext.Provider value={{ events, isLoading, loadEvents, joinEvent, hasTicket }}>
            {children}
        </EventsContext.Provider>
    );
};