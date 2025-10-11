'use client';

import React, { createContext, useContext, useState, ReactNode, useCallback, useEffect } from 'react';
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
  // Soft delete - track which recommendations are in itinerary
  recommendationsInItinerary: Set<number>;
  availableRecommendations: Recommendation[];
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const DEFAULT_USER_ID = 'default-user';

export function AppProvider({ children }: { children: ReactNode }) {
  const [recommendations, setRecommendationsState] = useState<Recommendation[]>([]);
  const [selectedRecommendation, setSelectedRecommendationState] = useState<Recommendation | null>(null);
  const [userQuery, setUserQueryState] = useState<string>('');
  const [favoriteAttractions, setFavoriteAttractionsState] = useState<Attraction[]>([]);
  const [itineraryEvents, setItineraryEvents] = useState<ItineraryEvent[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load data from database on mount
  useEffect(() => {
    async function loadData() {
      try {
        console.log('📦 Loading data from database...');

        // Load favorites
        const favoritesRes = await fetch('/api/favorites');
        if (favoritesRes.ok) {
          const data = await favoritesRes.json();
          if (data.favorites && data.favorites.length > 0) {
            setFavoriteAttractionsState(data.favorites);
            console.log('⭐ Loaded', data.favorites.length, 'favorites from database');
          }
        }

        // Load itinerary
        const itineraryRes = await fetch('/api/itinerary');
        if (itineraryRes.ok) {
          const data = await itineraryRes.json();
          if (data.events && data.events.length > 0) {
            // Convert date strings back to Date objects
            const events = data.events.map((e: any) => ({
              ...e,
              startTime: new Date(e.startTime),
              endTime: new Date(e.endTime),
            }));
            setItineraryEvents(events);
            console.log('📅 Loaded', events.length, 'events from database');
          }
        }

        setIsLoaded(true);
        console.log('✅ Data loaded successfully');
      } catch (error) {
        console.error('❌ Error loading data:', error);
        setIsLoaded(true); // Continue even if load fails
      }
    }

    loadData();
  }, []);

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

    // Persist to database
    if (isLoaded) {
      fetch('/api/favorites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ favorites: attractions }),
      }).catch(err => console.error('Failed to save favorites:', err));
    }
  }, [isLoaded]);

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

      // Persist to database
      if (isLoaded) {
        fetch('/api/itinerary/add', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ event }),
        }).catch(err => console.error('Failed to save event:', err));
      }

      return sorted;
    });
  }, [isLoaded]);

  // Remove event from itinerary
  const removeItineraryEvent = useCallback((eventId: string) => {
    console.log('🗑️ Removing from itinerary:', eventId);
    setItineraryEvents((prev) => {
      const filtered = prev.filter(e => e.id !== eventId);
      console.log('✅ Event removed. Total events:', filtered.length);

      // Persist to database
      if (isLoaded) {
        fetch('/api/itinerary/remove', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ eventId }),
        }).catch(err => console.error('Failed to remove event:', err));
      }

      return filtered;
    });
  }, [isLoaded]);

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

      // Persist to database
      if (isLoaded && newEvents.length > 0) {
        fetch('/api/itinerary/import', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ events: newEvents }),
        }).catch(err => console.error('Failed to import events:', err));
      }

      return sorted;
    });
  }, [isLoaded]);

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
