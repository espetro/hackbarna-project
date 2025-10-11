'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Recommendation } from '../types';

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
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [selectedRecommendation, setSelectedRecommendation] = useState<Recommendation | null>(null);
  const [userQuery, setUserQuery] = useState<string>('');
  const [favoriteAttractions, setFavoriteAttractions] = useState<Attraction[]>([]);

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
