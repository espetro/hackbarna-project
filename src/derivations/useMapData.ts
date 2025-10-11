'use client';

import { useEffect, useState } from 'react';
import { useItinerary } from '@/src/contexts/AppContext';
import { ItineraryItem } from '@/src/contracts/itinerary';

export interface MapMarker {
  id: string;
  lat: number;
  lng: number;
  title: string;
  type: 'itinerary' | 'recommendation';
  isLocked?: boolean;
}

export interface MapRoute {
  coordinates: [number, number][]; // [lng, lat] pairs for Mapbox
  duration?: string;
  distance?: string;
}

export interface MapData {
  markers: MapMarker[];
  route: MapRoute | null;
  isCalculating: boolean;
}

/**
 * useMapData Hook
 * Derives map markers and route from itinerary state
 * Automatically recalculates when itinerary changes
 */
export function useMapData(): MapData {
  const itinerary = useItinerary();
  const [mapData, setMapData] = useState<MapData>({
    markers: [],
    route: null,
    isCalculating: false,
  });

  useEffect(() => {
    // Derive markers from itinerary items
    const markers: MapMarker[] = itinerary.items.map(item => ({
      id: item.id,
      lat: item.location.lat,
      lng: item.location.lng,
      title: item.title,
      type: 'itinerary' as const,
      isLocked: item.isLocked,
    }));

    // Calculate route if there are 2+ markers
    if (markers.length >= 2) {
      setMapData(prev => ({ ...prev, isCalculating: true }));
      calculateRoute(itinerary.items).then(route => {
        setMapData({
          markers,
          route,
          isCalculating: false,
        });
      });
    } else {
      setMapData({
        markers,
        route: null,
        isCalculating: false,
      });
    }
  }, [itinerary.items, itinerary.lastUpdated]); // Recalc on ITINERARY/RECALC

  return mapData;
}

/**
 * Calculate route between itinerary items
 * Uses Mapbox Directions API
 * TODO: Implement actual Mapbox API call
 */
async function calculateRoute(items: ItineraryItem[]): Promise<MapRoute | null> {
  if (items.length < 2) return null;

  try {
    // Sort by start time
    const sorted = [...items].sort((a, b) => a.startTime.getTime() - b.startTime.getTime());

    // Extract coordinates
    const coordinates: [number, number][] = sorted.map(item => [
      item.location.lng,
      item.location.lat,
    ]);

    // TODO: Call Mapbox Directions API
    // const response = await fetch(
    //   `https://api.mapbox.com/directions/v5/mapbox/walking/${coordinates.join(';')}?geometries=geojson&access_token=${MAPBOX_TOKEN}`
    // );
    // const data = await response.json();

    // For now, return simple straight-line route
    return {
      coordinates,
      duration: 'Calculating...',
      distance: 'Calculating...',
    };
  } catch (error) {
    console.error('Failed to calculate route:', error);
    return null;
  }
}

/**
 * Helper hook to check if location is on current route
 */
export function useIsOnRoute(lat: number, lng: number, threshold: number = 0.01): boolean {
  const { route } = useMapData();

  if (!route) return false;

  return route.coordinates.some(([routeLng, routeLat]) => {
    const latDiff = Math.abs(routeLat - lat);
    const lngDiff = Math.abs(routeLng - lng);
    return latDiff < threshold && lngDiff < threshold;
  });
}
