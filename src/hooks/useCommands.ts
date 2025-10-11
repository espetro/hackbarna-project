'use client';

import { useCallback } from 'react';
import { useAppContext } from '@/src/contexts/AppContext';
import { Preference } from '@/src/contracts/user';
import { RankedActivity } from '@/src/contracts/activity';
import { ItineraryItem } from '@/src/contracts/itinerary';

import { setPreferences } from '@/src/commands/setPreferences';
import { addToItinerary, activityToItineraryItem } from '@/src/commands/addToItinerary';
import { removeItem } from '@/src/commands/removeItem';
import { importCalendar } from '@/src/commands/importCalendar';
import { loadSuggestions } from '@/src/commands/loadSuggestions';

/**
 * useSetPreferences Hook
 * Command to update user preferences
 */
export function useSetPreferences() {
  const { state, dispatch } = useAppContext();

  return useCallback(
    async (preferences: Preference) => {
      const userId = state.user.data?.id;
      return setPreferences(preferences, dispatch, userId);
    },
    [state.user.data?.id, dispatch]
  );
}

/**
 * useAddToItinerary Hook
 * Command to add item to itinerary with validation
 */
export function useAddToItinerary() {
  const { state, dispatch } = useAppContext();

  return useCallback(
    async (item: Omit<ItineraryItem, 'id' | 'createdAt'>) => {
      const fullItem: ItineraryItem = {
        ...item,
        id: `item-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        createdAt: new Date(),
      };

      const userId = state.user.data?.id;
      return addToItinerary(fullItem, dispatch, state, userId);
    },
    [state, dispatch]
  );
}

/**
 * useAddRecommendation Hook
 * Convenience wrapper to add a recommendation activity to itinerary
 */
export function useAddRecommendation() {
  const { state, dispatch } = useAppContext();

  return useCallback(
    async (activity: RankedActivity, startTime?: Date, durationMinutes?: number) => {
      const itemData = activityToItineraryItem(activity, startTime, durationMinutes);
      const fullItem: ItineraryItem = {
        ...itemData,
        id: `rec-${activity.id}-${Date.now()}`,
        createdAt: new Date(),
      };

      const userId = state.user.data?.id;
      return addToItinerary(fullItem, dispatch, state, userId);
    },
    [state, dispatch]
  );
}

/**
 * useRemoveItem Hook
 * Command to remove item from itinerary
 */
export function useRemoveItem() {
  const { state, dispatch } = useAppContext();

  return useCallback(
    async (itemId: string) => {
      const userId = state.user.data?.id;
      return removeItem(itemId, dispatch, state, userId);
    },
    [state, dispatch]
  );
}

/**
 * useImportCalendar Hook
 * Command to import Google Calendar events
 */
export function useImportCalendar() {
  const { state, dispatch } = useAppContext();

  return useCallback(
    async (events: unknown[]) => {
      const userId = state.user.data?.id;
      return importCalendar(events, dispatch, userId);
    },
    [state.user.data?.id, dispatch]
  );
}

/**
 * useLoadSuggestions Hook
 * Command to load AI-ranked activity suggestions
 */
export function useLoadSuggestions() {
  const { state, dispatch } = useAppContext();

  return useCallback(
    async (location: string) => {
      const preferences = state.user.preferences;
      if (!preferences) {
        return {
          success: false,
          error: 'User preferences not set',
        };
      }

      return loadSuggestions(preferences, location, dispatch);
    },
    [state.user.preferences, dispatch]
  );
}
