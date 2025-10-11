'use client';

import React, { createContext, useContext, useState, ReactNode, useCallback, useEffect } from 'react';
import { Recommendation, ItineraryEvent } from '../types';
// Firebase disabled - using localStorage as fallback
const saveFavorites = async (attractions: any[], userId?: string) => {
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem('tetris_favorites', JSON.stringify(attractions));
      console.log('✅ Saved favorites to localStorage');
    } catch (error) {
      console.error('❌ Error saving favorites:', error);
    }
  }
};

const getFavorites = async (userId?: string) => {
  if (typeof window !== 'undefined') {
    try {
      const stored = localStorage.getItem('tetris_favorites');
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('❌ Error loading favorites:', error);
      return [];
    }
  }
  return [];
};

const getItineraryEvents = async (userId?: string) => {
  if (typeof window !== 'undefined') {
    try {
      const stored = localStorage.getItem('tetris_itinerary');
      if (!stored) return [];
      
      const events = JSON.parse(stored);
      return events.map((e: any) => ({
        ...e,
        startTime: new Date(e.startTime),
        endTime: new Date(e.endTime)
      }));
    } catch (error) {
      console.error('❌ Error loading itinerary:', error);
      return [];
    }
  }
  return [];
};

const addItineraryEventToDb = async (event: any, userId?: string) => {
  if (typeof window !== 'undefined') {
    try {
      const stored = localStorage.getItem('tetris_itinerary');
      const events = stored ? JSON.parse(stored) : [];
      events.push(event);
      localStorage.setItem('tetris_itinerary', JSON.stringify(events));
      console.log('✅ Added event to localStorage');
    } catch (error) {
      console.error('❌ Error adding event:', error);
    }
  }
};

const removeItineraryEventFromDb = async (eventId: string, userId?: string) => {
  if (typeof window !== 'undefined') {
    try {
      const stored = localStorage.getItem('tetris_itinerary');
      if (stored) {
        const events = JSON.parse(stored).filter((e: any) => e.id !== eventId);
        localStorage.setItem('tetris_itinerary', JSON.stringify(events));
        console.log('✅ Removed event from localStorage');
      }
    } catch (error) {
      console.error('❌ Error removing event:', error);
    }
  }
};

const importItineraryEvents = async (events: any[], userId?: string) => {
  if (typeof window !== 'undefined') {
    try {
      const stored = localStorage.getItem('tetris_itinerary');
      const existingEvents = stored ? JSON.parse(stored) : [];
      const allEvents = [...existingEvents, ...events];
      localStorage.setItem('tetris_itinerary', JSON.stringify(allEvents));
      console.log('✅ Imported events to localStorage');
    } catch (error) {
      console.error('❌ Error importing events:', error);
    }
  }
};

const clearItineraryInDb = async (userId?: string) => {
  if (typeof window !== 'undefined') {
    try {
      localStorage.removeItem('tetris_itinerary');
      console.log('✅ Cleared itinerary from localStorage');
    } catch (error) {
      console.error('❌ Error clearing itinerary:', error);
    }
  }
};

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
  const [recommendations, setRecommendationsState] = useState<Recommendation[]>([]);
  const [selectedRecommendation, setSelectedRecommendationState] = useState<Recommendation | null>(null);
  const [userQuery, setUserQueryState] = useState<string>('');
  const [favoriteAttractions, setFavoriteAttractionsState] = useState<Attraction[]>([]);
  const [itineraryEvents, setItineraryEvents] = useState<ItineraryEvent[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load data from localStorage on mount
  useEffect(() => {
    async function loadData() {
      try {
        console.log('📦 Loading data from localStorage...');

        // Clear any potentially corrupted data first
        if (typeof window !== 'undefined') {
          // Check if localStorage items can be parsed
          const favoriteKeys = ['tetris_favorites', 'favorites'];
          const itineraryKeys = ['tetris_itinerary', 'itinerary'];
          
          for (const key of favoriteKeys) {
            try {
              const item = localStorage.getItem(key);
              if (item) JSON.parse(item);
            } catch (e) {
              console.warn(`Clearing corrupted localStorage item: ${key}`);
              localStorage.removeItem(key);
            }
          }
          
          for (const key of itineraryKeys) {
            try {
              const item = localStorage.getItem(key);
              if (item) JSON.parse(item);
            } catch (e) {
              console.warn(`Clearing corrupted localStorage item: ${key}`);
              localStorage.removeItem(key);
            }
          }
        }

        // Load favorites
        const favorites = await getFavorites();
        if (favorites && favorites.length > 0) {
          setFavoriteAttractionsState(favorites);
          console.log('⭐ Loaded', favorites.length, 'favorites from localStorage');
        }

        // Load itinerary
        const events = await getItineraryEvents();
        if (events && events.length > 0) {
          setItineraryEvents(events);
          console.log('📅 Loaded', events.length, 'events from localStorage');
        }

        setIsLoaded(true);
        console.log('✅ Data loaded successfully');
      } catch (error) {
        console.error('❌ Error loading data:', error);
        // Clear all localStorage data if there's still an error
        if (typeof window !== 'undefined') {
          localStorage.removeItem('tetris_favorites');
          localStorage.removeItem('tetris_itinerary');
          localStorage.removeItem('favorites');
          localStorage.removeItem('itinerary');
        }
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

    // Persist to localStorage
    if (isLoaded) {
      saveFavorites(attractions).catch(err => console.error('Failed to save favorites:', err));
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

      // Persist to localStorage
      if (isLoaded) {
        addItineraryEventToDb(event).catch(err => console.error('Failed to save event:', err));
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

      // Persist to localStorage
      if (isLoaded) {
        removeItineraryEventFromDb(eventId).catch(err => console.error('Failed to remove event:', err));
      }

      return filtered;
    });
  }, [isLoaded]);

  // Clear all itinerary events
  const clearItinerary = useCallback(() => {
    console.log('🧹 Clearing all itinerary events');
    setItineraryEvents([]);

    // Persist to localStorage
    clearItineraryInDb().catch(err => console.error('Failed to clear itinerary:', err));
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

      // Persist to localStorage
      if (isLoaded && newEvents.length > 0) {
        importItineraryEvents(newEvents).catch(err => console.error('Failed to import events:', err));
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
