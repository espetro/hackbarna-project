import { distance, point } from '@turf/turf';
import { ItineraryEvent, Recommendation } from './types';

export interface TimeSlot {
  startTime: Date;
  endTime: Date;
  availableMinutes: number;
  previousActivity?: ItineraryEvent;
  nextActivity?: ItineraryEvent;
}

export interface SmartSuggestion {
  activity: Recommendation;
  slot: TimeSlot;
  distanceToClosest: number; // in kilometers
  fitsInSlot: boolean;
  suggestedStartTime: Date;
  suggestedEndTime: Date;
  closestActivity: 'previous' | 'next';
}

/**
 * Find empty time slots between activities in the itinerary
 */
export function findEmptySlots(
  itineraryEvents: ItineraryEvent[], 
  minSlotMinutes: number = 30
): TimeSlot[] {
  if (itineraryEvents.length === 0) return [];
  
  // Sort events by start time
  const sortedEvents = [...itineraryEvents].sort(
    (a, b) => a.startTime.getTime() - b.startTime.getTime()
  );
  
  const slots: TimeSlot[] = [];
  
  // Check slots between consecutive events
  for (let i = 0; i < sortedEvents.length - 1; i++) {
    const current = sortedEvents[i];
    const next = sortedEvents[i + 1];
    
    const slotStart = new Date(current.endTime);
    const slotEnd = new Date(next.startTime);
    const availableMinutes = (slotEnd.getTime() - slotStart.getTime()) / (1000 * 60);
    
    // Only include slots with enough time
    if (availableMinutes >= minSlotMinutes) {
      slots.push({
        startTime: slotStart,
        endTime: slotEnd,
        availableMinutes,
        previousActivity: current,
        nextActivity: next,
      });
    }
  }
  
  return slots;
}

/**
 * Calculate distance between two activities using turf.js
 */
export function calculateActivityDistance(
  activity1: { location: { lat: number; lng: number } },
  activity2: { location: { lat: number; lng: number } }
): number {
  const point1 = point([activity1.location.lng, activity1.location.lat]);
  const point2 = point([activity2.location.lng, activity2.location.lat]);
  
  return distance(point1, point2, { units: 'kilometers' });
}

/**
 * Parse duration from string (e.g., "2 hours", "90 minutes") to minutes
 */
export function parseDurationToMinutes(duration: string | undefined): number {
  if (!duration) return 120; // default 2 hours
  
  const hoursMatch = duration.match(/(\d+)\s*h/i);
  const minutesMatch = duration.match(/(\d+)\s*m/i);
  
  let totalMinutes = 0;
  
  if (hoursMatch) {
    totalMinutes += parseInt(hoursMatch[1]) * 60;
  }
  
  if (minutesMatch) {
    totalMinutes += parseInt(minutesMatch[1]);
  }
  
  // If no specific format found, try to extract any number and assume hours
  if (totalMinutes === 0) {
    const numberMatch = duration.match(/(\d+)/);
    if (numberMatch) {
      totalMinutes = parseInt(numberMatch[1]) * 60; // assume hours
    }
  }
  
  return totalMinutes > 0 ? totalMinutes : 120; // default 2 hours if parsing fails
}

/**
 * Generate smart suggestions for empty slots in the itinerary
 */
export function generateSmartSuggestions(
  itineraryEvents: ItineraryEvent[],
  availableActivities: Recommendation[],
  minSlotMinutes: number = 30
): SmartSuggestion[] {
  const emptySlots = findEmptySlots(itineraryEvents, minSlotMinutes);
  const suggestions: SmartSuggestion[] = [];
  
  for (const slot of emptySlots) {
    // For each slot, find activities that could fit
    const slotSuggestions: SmartSuggestion[] = [];
    
    for (const activity of availableActivities) {
      const activityDurationMinutes = parseDurationToMinutes(activity.duration);
      const fitsInSlot = activityDurationMinutes <= slot.availableMinutes;
      
      if (!fitsInSlot) continue; // Skip if doesn't fit
      
      // Calculate distance to closest adjacent activity
      let distanceToClosest = Infinity;
      let closestActivity: 'previous' | 'next' = 'previous';
      
      if (slot.previousActivity) {
        const distToPrev = calculateActivityDistance(activity, slot.previousActivity);
        if (distToPrev < distanceToClosest) {
          distanceToClosest = distToPrev;
          closestActivity = 'previous';
        }
      }
      
      if (slot.nextActivity) {
        const distToNext = calculateActivityDistance(activity, slot.nextActivity);
        if (distToNext < distanceToClosest) {
          distanceToClosest = distToNext;
          closestActivity = 'next';
        }
      }
      
      // Calculate suggested timing
      const bufferMinutes = 15; // 15 min buffer after previous activity
      const suggestedStartTime = new Date(slot.startTime.getTime() + bufferMinutes * 60 * 1000);
      const suggestedEndTime = new Date(suggestedStartTime.getTime() + activityDurationMinutes * 60 * 1000);
      
      // Make sure it still fits with buffer
      if (suggestedEndTime <= slot.endTime) {
        slotSuggestions.push({
          activity,
          slot,
          distanceToClosest,
          fitsInSlot: true,
          suggestedStartTime,
          suggestedEndTime,
          closestActivity,
        });
      }
    }
    
    // Sort by distance (closest first) and take top suggestions
    slotSuggestions.sort((a, b) => a.distanceToClosest - b.distanceToClosest);
    
    // Add top 3 suggestions for this slot
    suggestions.push(...slotSuggestions.slice(0, 3));
  }
  
  return suggestions;
}

/**
 * Create an ItineraryEvent from a SmartSuggestion
 */
export function createEventFromSuggestion(suggestion: SmartSuggestion): ItineraryEvent {
  return {
    id: `smart-${suggestion.activity.id}-${Date.now()}`,
    title: suggestion.activity.title,
    description: suggestion.activity.description,
    location: {
      name: suggestion.activity.title,
      lat: suggestion.activity.location.lat,
      lng: suggestion.activity.location.lng,
    },
    startTime: suggestion.suggestedStartTime,
    endTime: suggestion.suggestedEndTime,
    source: 'recommendation',
    recommendationId: suggestion.activity.id,
    image: suggestion.activity.image,
  };
}

/**
 * Format distance for display
 */
export function formatDistance(kilometers: number): string {
  if (kilometers < 1) {
    return `${Math.round(kilometers * 1000)}m`;
  }
  return `${kilometers.toFixed(1)}km`;
}

/**
 * Format time slot duration for display
 */
export function formatSlotDuration(minutes: number): string {
  if (minutes < 60) {
    return `${Math.round(minutes)}min`;
  }
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = Math.round(minutes % 60);
  
  if (remainingMinutes === 0) {
    return `${hours}h`;
  }
  return `${hours}h ${remainingMinutes}min`;
}
