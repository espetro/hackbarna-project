// Itinerary utility functions
// Calculate distances and travel times between locations

import { ItineraryEvent } from './types';

/**
 * Calculate distance between two coordinates using Haversine formula
 * Returns distance in kilometers
 */
export function calculateDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371; // Earth's radius in km
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(degrees: number): number {
  return degrees * (Math.PI / 180);
}

/**
 * Calculate travel time based on distance
 * Assumes average speed of 4 km/h (walking) or 20 km/h (transit) depending on distance
 */
export function calculateTravelTime(distanceKm: number): number {
  // If distance is < 2km, assume walking at 4 km/h
  if (distanceKm < 2) {
    return (distanceKm / 4) * 60; // Convert to minutes
  }
  // Otherwise assume transit/taxi at 20 km/h
  return (distanceKm / 20) * 60; // Convert to minutes
}

/**
 * Format distance for display
 */
export function formatDistance(distanceKm: number): string {
  if (distanceKm < 1) {
    return `${Math.round(distanceKm * 1000)}m`;
  }
  return `${distanceKm.toFixed(1)}km`;
}

/**
 * Format travel time for display
 */
export function formatTravelTime(minutes: number): string {
  if (minutes < 1) {
    return 'Less than 1 min';
  }
  if (minutes < 60) {
    return `${Math.round(minutes)} min`;
  }
  const hours = Math.floor(minutes / 60);
  const mins = Math.round(minutes % 60);
  if (mins === 0) {
    return `${hours}h`;
  }
  return `${hours}h ${mins}m`;
}

/**
 * Get travel mode based on distance
 */
export function getTravelMode(distanceKm: number): 'walking' | 'transit' {
  return distanceKm < 2 ? 'walking' : 'transit';
}

/**
 * Calculate gap between two events (in minutes)
 */
export function calculateGapBetweenEvents(
  event1: ItineraryEvent,
  event2: ItineraryEvent
): number {
  const gap = event2.startTime.getTime() - event1.endTime.getTime();
  return gap / (1000 * 60); // Convert to minutes
}

/**
 * Check if events have enough time for travel
 */
export function hasEnoughTravelTime(
  event1: ItineraryEvent,
  event2: ItineraryEvent
): boolean {
  const distance = calculateDistance(
    event1.location.lat,
    event1.location.lng,
    event2.location.lat,
    event2.location.lng
  );
  const requiredTime = calculateTravelTime(distance);
  const availableTime = calculateGapBetweenEvents(event1, event2);
  
  return availableTime >= requiredTime;
}

