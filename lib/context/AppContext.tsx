'use client';

import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import { Recommendation, ItineraryEvent } from '../types';

export interface Attraction {
  id: number;
  src: string;
  alt: string;
}

interface AppContextType {
  recommendations: Recommendation[];
  setRecommendations: (recommendations: Recommendation[]) => void;
  selectedRecommendation: Recommendation | null;
  setSelectedRecommendation: (recommendation: Recommendation | null) => void;
  userQuery: string;
  setUserQuery: (query: string) => void;
  favoriteAttractions: Attraction[];
  setFavoriteAttractions: (attractions: Attraction[]) => void;
  // Itinerary management
  itineraryEvents: ItineraryEvent[];
  addItineraryEvent: (event: ItineraryEvent) => void;
  removeItineraryEvent: (eventId: string) => void;
  clearItinerary: () => void;
  importGoogleCalendarEvents: (events: ItineraryEvent[]) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [selectedRecommendation, setSelectedRecommendation] = useState<Recommendation | null>(null);
  const [userQuery, setUserQuery] = useState<string>('');
  const [favoriteAttractions, setFavoriteAttractions] = useState<Attraction[]>([]);
  const [itineraryEvents, setItineraryEvents] = useState<ItineraryEvent[]>([]);

  // Add a single event to itinerary
  const addItineraryEvent = useCallback((event: ItineraryEvent) => {
    setItineraryEvents((prev) => {
      // Check if event already exists
      const exists = prev.some(e => e.id === event.id);
      if (exists) return prev;
      
      // Add and sort by startTime
      const updated = [...prev, event];
      return updated.sort((a, b) => a.startTime.getTime() - b.startTime.getTime());
    });
  }, []);

  // Remove event from itinerary
  const removeItineraryEvent = useCallback((eventId: string) => {
    setItineraryEvents((prev) => prev.filter(e => e.id !== eventId));
  }, []);

  // Clear all itinerary events
  const clearItinerary = useCallback(() => {
    setItineraryEvents([]);
  }, []);

  // Import multiple events from Google Calendar
  const importGoogleCalendarEvents = useCallback((events: ItineraryEvent[]) => {
    setItineraryEvents((prev) => {
      // Merge with existing, avoiding duplicates
      const existingIds = new Set(prev.map(e => e.id));
      const newEvents = events.filter(e => !existingIds.has(e.id));
      const merged = [...prev, ...newEvents];
      
      // Sort by startTime
      return merged.sort((a, b) => a.startTime.getTime() - b.startTime.getTime());
    });
  }, []);

  return (
    <AppContext.Provider
      value={{
        recommendations,
        setRecommendations,
        selectedRecommendation,
        setSelectedRecommendation,
        userQuery,
        setUserQuery,
        favoriteAttractions,
        setFavoriteAttractions,
        itineraryEvents,
        addItineraryEvent,
        removeItineraryEvent,
        clearItinerary,
        importGoogleCalendarEvents,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
}
