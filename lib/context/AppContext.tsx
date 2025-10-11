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
  const [recommendations, setRecommendationsState] = useState<Recommendation[]>([]);
  const [selectedRecommendation, setSelectedRecommendationState] = useState<Recommendation | null>(null);
  const [userQuery, setUserQueryState] = useState<string>('');
  const [favoriteAttractions, setFavoriteAttractionsState] = useState<Attraction[]>([]);
  const [itineraryEvents, setItineraryEvents] = useState<ItineraryEvent[]>([]);

  // Wrapped setters with logging
  const setRecommendations = useCallback((recs: Recommendation[]) => {
    console.log('🎯 Recommendations updated:', recs.length, 'items');
    setRecommendationsState(recs);
  }, []);

  const setSelectedRecommendation = useCallback((rec: Recommendation | null) => {
    console.log('👆 Selected recommendation:', rec?.title || 'None');
    setSelectedRecommendationState(rec);
  }, []);

  const setUserQuery = useCallback((query: string) => {
    console.log('🔍 User query set:', query);
    setUserQueryState(query);
  }, []);

  const setFavoriteAttractions = useCallback((attractions: Attraction[]) => {
    console.log('⭐ Favorite attractions updated:', attractions.length, 'items');
    setFavoriteAttractionsState(attractions);
  }, []);

  // Add a single event to itinerary
  const addItineraryEvent = useCallback((event: ItineraryEvent) => {
    console.log('📅 Adding to itinerary:', event.title);
    setItineraryEvents((prev) => {
      // Check if event already exists
      const exists = prev.some(e => e.id === event.id);
      if (exists) {
        console.log('⚠️ Event already exists in itinerary');
        return prev;
      }
      
      // Add and sort by startTime
      const updated = [...prev, event];
      const sorted = updated.sort((a, b) => a.startTime.getTime() - b.startTime.getTime());
      console.log('✅ Itinerary updated. Total events:', sorted.length);
      return sorted;
    });
  }, []);

  // Remove event from itinerary
  const removeItineraryEvent = useCallback((eventId: string) => {
    console.log('🗑️ Removing from itinerary:', eventId);
    setItineraryEvents((prev) => {
      const filtered = prev.filter(e => e.id !== eventId);
      console.log('✅ Event removed. Total events:', filtered.length);
      return filtered;
    });
  }, []);

  // Clear all itinerary events
  const clearItinerary = useCallback(() => {
    console.log('🧹 Clearing all itinerary events');
    setItineraryEvents([]);
  }, []);

  // Import multiple events from Google Calendar
  const importGoogleCalendarEvents = useCallback((events: ItineraryEvent[]) => {
    console.log('📥 Importing events from calendar:', events.length, 'events');
    setItineraryEvents((prev) => {
      // Merge with existing, avoiding duplicates
      const existingIds = new Set(prev.map(e => e.id));
      const newEvents = events.filter(e => !existingIds.has(e.id));
      const merged = [...prev, ...newEvents];
      
      // Sort by startTime
      const sorted = merged.sort((a, b) => a.startTime.getTime() - b.startTime.getTime());
      console.log('✅ Calendar import complete. New events:', newEvents.length, '| Total:', sorted.length);
      return sorted;
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
