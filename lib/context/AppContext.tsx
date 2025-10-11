'use client';

import React, { createContext, useContext, useState, ReactNode, useCallback, useEffect } from 'react';
import { Recommendation, ItineraryEvent } from '../types';
import {
  saveFavorites,
  getFavorites,
  getItineraryEvents,
  addItineraryEvent as addItineraryEventToDb,
  removeItineraryEvent as removeItineraryEventFromDb,
  importItineraryEvents,
  clearItinerary as clearItineraryInDb,
} from '../firebase/db';
import { useAuth } from './AuthContext';

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
  // Soft delete - track which recommendations are in itinerary
  recommendationsInItinerary: Set<number>;
  availableRecommendations: Recommendation[];
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [recommendations, setRecommendationsState] = useState<Recommendation[]>([]);
  const [selectedRecommendation, setSelectedRecommendationState] = useState<Recommendation | null>(null);
  const [userQuery, setUserQueryState] = useState<string>('');
  const [favoriteAttractions, setFavoriteAttractionsState] = useState<Attraction[]>([]);
  const [itineraryEvents, setItineraryEvents] = useState<ItineraryEvent[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load data from Firebase when user changes
  useEffect(() => {
    async function loadData() {
      if (!user) {
        // Clear data when user logs out
        setFavoriteAttractionsState([]);
        setItineraryEvents([]);
        setIsLoaded(false);
        return;
      }

      try {
        console.log('📦 Loading data from Firebase for user:', user.uid);

        // Load favorites for this user
        const favorites = await getFavorites(user.uid);
        if (favorites && favorites.length > 0) {
          setFavoriteAttractionsState(favorites);
          console.log('⭐ Loaded', favorites.length, 'favorites from Firebase');
        }

        // Load itinerary for this user
        const events = await getItineraryEvents(user.uid);
        if (events && events.length > 0) {
          setItineraryEvents(events);
          console.log('📅 Loaded', events.length, 'events from Firebase');
        }

        setIsLoaded(true);
        console.log('✅ Data loaded successfully');
      } catch (error) {
        console.error('❌ Error loading data:', error);
        setIsLoaded(true); // Continue even if load fails
      }
    }

    loadData();
  }, [user]);

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

    // Persist to Firebase
    if (isLoaded && user) {
      saveFavorites(attractions, user.uid).catch(err => console.error('Failed to save favorites:', err));
    }
  }, [isLoaded, user]);

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

      // Persist to Firebase
      if (isLoaded && user) {
        addItineraryEventToDb(event, user.uid).catch(err => console.error('Failed to save event:', err));
      }

      return sorted;
    });
  }, [isLoaded, user]);

  // Remove event from itinerary
  const removeItineraryEvent = useCallback((eventId: string) => {
    console.log('🗑️ Removing from itinerary:', eventId);
    setItineraryEvents((prev) => {
      const filtered = prev.filter(e => e.id !== eventId);
      console.log('✅ Event removed. Total events:', filtered.length);

      // Persist to Firebase
      if (isLoaded && user) {
        removeItineraryEventFromDb(eventId, user.uid).catch(err => console.error('Failed to remove event:', err));
      }

      return filtered;
    });
  }, [isLoaded, user]);

  // Clear all itinerary events
  const clearItinerary = useCallback(() => {
    console.log('🧹 Clearing all itinerary events');
    setItineraryEvents([]);

    // Persist to Firebase
    if (user) {
      clearItineraryInDb(user.uid).catch(err => console.error('Failed to clear itinerary:', err));
    }
  }, [user]);

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

      // Persist to Firebase
      if (isLoaded && newEvents.length > 0 && user) {
        importItineraryEvents(newEvents, user.uid).catch(err => console.error('Failed to import events:', err));
      }

      return sorted;
    });
  }, [isLoaded, user]);

  // Track which recommendation IDs are currently in the itinerary (soft delete)
  const recommendationsInItinerary = React.useMemo(() => {
    const recIds = new Set<number>();
    itineraryEvents.forEach(event => {
      if (event.recommendationId !== undefined) {
        recIds.add(event.recommendationId);
      }
    });
    console.log('🔍 Recommendations in itinerary:', Array.from(recIds));
    return recIds;
  }, [itineraryEvents]);

  // Filter out recommendations that are already in the itinerary
  const availableRecommendations = React.useMemo(() => {
    const filtered = recommendations.filter(rec => !recommendationsInItinerary.has(rec.id));
    console.log('🎯 Available recommendations:', filtered.length, '/', recommendations.length);
    return filtered;
  }, [recommendations, recommendationsInItinerary]);

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
        recommendationsInItinerary,
        availableRecommendations,
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
