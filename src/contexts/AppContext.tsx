'use client';

import React, { createContext, useContext, useReducer, ReactNode, useCallback } from 'react';
import { User, Preference } from '@/src/contracts/user';
import { RankedActivity } from '@/src/contracts/activity';
import { ItineraryItem, wouldOverlap } from '@/src/contracts/itinerary';

/**
 * AppState - Single source of truth for application state
 * Organized into three domain slices: user, suggestedActivities, itinerary
 */
export interface AppState {
  user: {
    data: User | null;
    preferences: Preference | null;
    isLoading: boolean;
    error: string | null;
  };
  suggestedActivities: {
    items: RankedActivity[];
    isLoading: boolean;
    error: string | null;
    lastUpdated: Date | null;
  };
  itinerary: {
    items: ItineraryItem[];
    isLoading: boolean;
    error: string | null;
    lastUpdated: Date | null;
  };
}

/**
 * Action Types - All possible state mutations
 */
export type AppAction =
  // User actions
  | { type: 'USER/SET'; payload: User }
  | { type: 'USER/SET_PREFERENCES'; payload: Preference }
  | { type: 'USER/LOADING'; payload: boolean }
  | { type: 'USER/ERROR'; payload: string | null }

  // Suggested Activities actions
  | { type: 'ACTIVITIES/SET'; payload: RankedActivity[] }
  | { type: 'ACTIVITIES/LOADING'; payload: boolean }
  | { type: 'ACTIVITIES/ERROR'; payload: string | null }

  // Itinerary actions
  | { type: 'ITINERARY/ADD'; payload: ItineraryItem }
  | { type: 'ITINERARY/REMOVE'; payload: string } // item id
  | { type: 'ITINERARY/SET'; payload: ItineraryItem[] }
  | { type: 'ITINERARY/IMPORT'; payload: ItineraryItem[] }
  | { type: 'ITINERARY/LOADING'; payload: boolean }
  | { type: 'ITINERARY/ERROR'; payload: string | null }
  | { type: 'ITINERARY/RECALC' } // Trigger map recalculation

  // Global actions
  | { type: 'RESET' };

/**
 * Initial State
 */
const initialState: AppState = {
  user: {
    data: null,
    preferences: null,
    isLoading: false,
    error: null,
  },
  suggestedActivities: {
    items: [],
    isLoading: false,
    error: null,
    lastUpdated: null,
  },
  itinerary: {
    items: [],
    isLoading: false,
    error: null,
    lastUpdated: null,
  },
};

/**
 * Reducer - Handles all state mutations with contract enforcement
 */
function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    // User mutations
    case 'USER/SET':
      return {
        ...state,
        user: {
          ...state.user,
          data: action.payload,
          isLoading: false,
          error: null,
        },
      };

    case 'USER/SET_PREFERENCES':
      return {
        ...state,
        user: {
          ...state.user,
          preferences: action.payload,
          data: state.user.data ? {
            ...state.user.data,
            preferences: action.payload,
            updatedAt: new Date(),
          } : null,
        },
      };

    case 'USER/LOADING':
      return {
        ...state,
        user: { ...state.user, isLoading: action.payload },
      };

    case 'USER/ERROR':
      return {
        ...state,
        user: { ...state.user, error: action.payload, isLoading: false },
      };

    // Suggested Activities mutations
    case 'ACTIVITIES/SET':
      return {
        ...state,
        suggestedActivities: {
          items: action.payload,
          isLoading: false,
          error: null,
          lastUpdated: new Date(),
        },
      };

    case 'ACTIVITIES/LOADING':
      return {
        ...state,
        suggestedActivities: {
          ...state.suggestedActivities,
          isLoading: action.payload,
        },
      };

    case 'ACTIVITIES/ERROR':
      return {
        ...state,
        suggestedActivities: {
          ...state.suggestedActivities,
          error: action.payload,
          isLoading: false,
        },
      };

    // Itinerary mutations with CONTRACT ENFORCEMENT
    case 'ITINERARY/ADD': {
      const newItem = action.payload;

      // CONTRACT: Cannot modify locked items (calendar imports)
      const lockedItems = state.itinerary.items.filter(item => item.isLocked);

      // CONTRACT: No overlapping events
      if (wouldOverlap([...state.itinerary.items], newItem)) {
        return {
          ...state,
          itinerary: {
            ...state.itinerary,
            error: 'Cannot add item: time slot overlaps with existing event',
          },
        };
      }

      // Add and sort by start time
      const newItems = [...state.itinerary.items, newItem].sort(
        (a, b) => a.startTime.getTime() - b.startTime.getTime()
      );

      return {
        ...state,
        itinerary: {
          items: newItems,
          isLoading: false,
          error: null,
          lastUpdated: new Date(),
        },
      };
    }

    case 'ITINERARY/REMOVE': {
      const itemId = action.payload;
      const itemToRemove = state.itinerary.items.find(item => item.id === itemId);

      // CONTRACT: Cannot remove locked items (calendar imports)
      if (itemToRemove?.isLocked) {
        return {
          ...state,
          itinerary: {
            ...state.itinerary,
            error: 'Cannot remove locked calendar events',
          },
        };
      }

      return {
        ...state,
        itinerary: {
          ...state.itinerary,
          items: state.itinerary.items.filter(item => item.id !== itemId),
          lastUpdated: new Date(),
        },
      };
    }

    case 'ITINERARY/SET':
      // Sort items by start time
      const sortedItems = [...action.payload].sort(
        (a, b) => a.startTime.getTime() - b.startTime.getTime()
      );

      return {
        ...state,
        itinerary: {
          items: sortedItems,
          isLoading: false,
          error: null,
          lastUpdated: new Date(),
        },
      };

    case 'ITINERARY/IMPORT': {
      // Import calendar events (marked as locked)
      const importedItems = action.payload.map(item => ({
        ...item,
        isLocked: true,
        source: 'google_calendar' as const,
      }));

      // Merge with existing items and sort
      const mergedItems = [...state.itinerary.items, ...importedItems].sort(
        (a, b) => a.startTime.getTime() - b.startTime.getTime()
      );

      return {
        ...state,
        itinerary: {
          items: mergedItems,
          isLoading: false,
          error: null,
          lastUpdated: new Date(),
        },
      };
    }

    case 'ITINERARY/LOADING':
      return {
        ...state,
        itinerary: {
          ...state.itinerary,
          isLoading: action.payload,
        },
      };

    case 'ITINERARY/ERROR':
      return {
        ...state,
        itinerary: {
          ...state.itinerary,
          error: action.payload,
          isLoading: false,
        },
      };

    case 'ITINERARY/RECALC':
      // Trigger for map recalculation (handled by useMapData hook)
      return state;

    // Global mutations
    case 'RESET':
      return initialState;

    default:
      return state;
  }
}

/**
 * Context Definition
 */
interface AppContextType {
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

/**
 * Provider Component
 */
export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
}

/**
 * Hook to access context
 */
export function useAppContext() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within AppProvider');
  }
  return context;
}

/**
 * Convenience Hooks for Domain Slices
 */
export function useUser() {
  const { state } = useAppContext();
  return state.user;
}

export function useSuggestedActivities() {
  const { state } = useAppContext();
  return state.suggestedActivities;
}

export function useItinerary() {
  const { state } = useAppContext();
  return state.itinerary;
}
