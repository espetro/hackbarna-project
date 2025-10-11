import { distance as turfDistance } from '@turf/distance';
import { point } from '@turf/helpers';
import { Recommendation, ItineraryEvent } from './types';
import { TimeGap } from '../src/contracts/itinerary';
import { calculateDistance as haversineDistance } from './itineraryUtils';

// Configuration options for the gap-filling algorithm
export interface GapFillingOptions {
  bufferTimeMinutes: number; // Default: 20
  minGapMinutes: number; // Default: 30
  maxSuggestionsPerGap: number; // Default: 3
  prioritizeDistance: boolean; // Default: false (duration-first)
  enableCaching: boolean; // Default: true
}

// Default configuration
export const DEFAULT_GAP_FILLING_OPTIONS: GapFillingOptions = {
  bufferTimeMinutes: 20,
  minGapMinutes: 30,
  maxSuggestionsPerGap: 3,
  prioritizeDistance: false,
  enableCaching: true,
};

// Enhanced time gap with context information
export interface EnhancedTimeGap extends TimeGap {
  id: string;
  precedingActivity?: ItineraryEvent;
  followingActivity?: ItineraryEvent;
  optimalDurationMinutes: number;
  context: 'morning' | 'afternoon' | 'evening';
}

// Gap suggestion with scoring information
export interface GapSuggestion {
  activity: Recommendation;
  gap: EnhancedTimeGap;
  distanceToNext: number;
  distanceToPrevious: number;
  timeUtilization: number; // Percentage of gap used (0-1)
  confidence: number; // Algorithm confidence score (0-1)
  score: number; // Overall ranking score
}

// Result of gap-filling analysis
export interface GapFillingResult {
  gapId: string;
  suggestions: GapSuggestion[];
  processingTimeMs: number;
  confidence: 'high' | 'medium' | 'low';
  totalActivitiesAnalyzed: number;
}

// Distance calculation cache
class DistanceCache {
  private cache = new Map<string, number>();
  private maxSize = 1000;

  private generateKey(from: { lat: number; lng: number }, to: { lat: number; lng: number }): string {
    return `${from.lat.toFixed(6)},${from.lng.toFixed(6)}-${to.lat.toFixed(6)},${to.lng.toFixed(6)}`;
  }

  get(from: { lat: number; lng: number }, to: { lat: number; lng: number }): number | undefined {
    return this.cache.get(this.generateKey(from, to));
  }

  set(from: { lat: number; lng: number }, to: { lat: number; lng: number }, distance: number): void {
    if (this.cache.size >= this.maxSize) {
      // Remove oldest entry (simple LRU approximation)
      const firstKey = this.cache.keys().next().value;
      if (firstKey) {
        this.cache.delete(firstKey);
      }
    }
    this.cache.set(this.generateKey(from, to), distance);
  }

  clear(): void {
    this.cache.clear();
  }
}

// Global distance cache instance
const distanceCache = new DistanceCache();

/**
 * Parse activity duration from various string formats
 * Supports: "2 hours", "1.5 hours", "45 minutes", "1h 30m"
 */
export function parseActivityDuration(durationString?: string): number {
  if (!durationString) return 120; // Default 2 hours

  const normalizedDuration = durationString.toLowerCase().trim();
  
  // Match patterns like "2 hours", "1.5 hours"
  const hourMatch = normalizedDuration.match(/(\d+(?:\.\d+)?)\s*h(?:ours?)?/);
  // Match patterns like "45 minutes", "30 min"
  const minuteMatch = normalizedDuration.match(/(\d+)\s*m(?:in(?:utes?)?)?/);
  
  let totalMinutes = 0;
  
  if (hourMatch) {
    totalMinutes += parseFloat(hourMatch[1]) * 60;
  }
  
  if (minuteMatch) {
    totalMinutes += parseInt(minuteMatch[1]);
  }
  
  // If no matches found, try to extract any number and assume hours
  if (totalMinutes === 0) {
    const numberMatch = normalizedDuration.match(/(\d+(?:\.\d+)?)/);
    if (numberMatch) {
      totalMinutes = parseFloat(numberMatch[1]) * 60; // Assume hours
    }
  }
  
  return totalMinutes || 120; // Fallback to 2 hours
}

/**
 * Calculate distance between two points using turf.js with fallback to Haversine
 */
export function calculateCachedDistance(
  from: { lat: number; lng: number },
  to: { lat: number; lng: number },
  useCache: boolean = true
): number {
  // Validate input coordinates
  if (!isValidCoordinate(from) || !isValidCoordinate(to)) {
    console.warn('Invalid coordinates provided to calculateCachedDistance:', { from, to });
    return Infinity; // Return high distance for invalid coordinates
  }

  // Check cache first
  if (useCache) {
    const cached = distanceCache.get(from, to);
    if (cached !== undefined) {
      return cached;
    }
  }

  let distance: number;
  
  try {
    // Use turf.js for precise calculation
    const fromPoint = point([from.lng, from.lat]);
    const toPoint = point([to.lng, to.lat]);
    distance = distance(fromPoint, toPoint, { units: 'kilometers' });
    
    // Validate result
    if (!isFinite(distance) || distance < 0) {
      throw new Error(`Invalid distance calculated: ${distance}`);
    }
  } catch (error) {
    // Fallback to Haversine implementation
    console.warn('Turf.js distance calculation failed, using Haversine fallback:', error);
    try {
      distance = haversineDistance(from.lat, from.lng, to.lat, to.lng);
      if (!isFinite(distance) || distance < 0) {
        throw new Error(`Invalid Haversine distance: ${distance}`);
      }
    } catch (fallbackError) {
      console.error('Both turf.js and Haversine distance calculations failed:', fallbackError);
      return Infinity; // Return high distance as last resort
    }
  }

  // Cache the result
  if (useCache) {
    distanceCache.set(from, to, distance);
  }

  return distance;
}

/**
 * Validate coordinate object
 */
function isValidCoordinate(coord: { lat: number; lng: number }): boolean {
  return (
    coord &&
    typeof coord.lat === 'number' &&
    typeof coord.lng === 'number' &&
    isFinite(coord.lat) &&
    isFinite(coord.lng) &&
    coord.lat >= -90 &&
    coord.lat <= 90 &&
    coord.lng >= -180 &&
    coord.lng <= 180
  );
}

/**
 * Determine time context based on hour of day
 */
function getTimeContext(date: Date): 'morning' | 'afternoon' | 'evening' {
  const hour = date.getHours();
  if (hour < 12) return 'morning';
  if (hour < 18) return 'afternoon';
  return 'evening';
}

/**
 * Stage 1: Temporal Filtering
 * Filter activities that can fit within the time gap including buffer time
 */
function temporalFiltering(
  gap: EnhancedTimeGap,
  activities: Recommendation[],
  bufferTimeMinutes: number
): Recommendation[] {
  const availableMinutes = gap.durationMinutes - bufferTimeMinutes;
  
  if (availableMinutes <= 0) {
    return [];
  }

  return activities.filter(activity => {
    const activityDuration = parseActivityDuration(activity.duration);
    return activityDuration <= availableMinutes;
  });
}

/**
 * Stage 2: Spatial Filtering
 * Rank activities by proximity to adjacent activities and time utilization
 */
function spatialFiltering(
  gap: EnhancedTimeGap,
  activities: Recommendation[],
  options: GapFillingOptions
): GapSuggestion[] {
  const suggestions: GapSuggestion[] = [];

  for (const activity of activities) {
    const activityDuration = parseActivityDuration(activity.duration);
    const timeUtilization = activityDuration / (gap.durationMinutes - options.bufferTimeMinutes);

    // Calculate distances to adjacent activities
    let distanceToPrevious = 0;
    let distanceToNext = 0;

    if (gap.precedingActivity) {
      distanceToPrevious = calculateCachedDistance(
        gap.precedingActivity.location,
        activity.location,
        options.enableCaching
      );
    }

    if (gap.followingActivity) {
      distanceToNext = calculateCachedDistance(
        activity.location,
        gap.followingActivity.location,
        options.enableCaching
      );
    }

    // Calculate minimum distance to either adjacent activity
    const minDistance = Math.min(
      distanceToPrevious || Infinity,
      distanceToNext || Infinity
    );

    // Calculate confidence score based on time utilization and distance
    let confidence = 0;
    if (timeUtilization > 0.8) confidence += 0.4; // Good time usage
    else if (timeUtilization > 0.5) confidence += 0.2;
    
    if (minDistance < 1) confidence += 0.4; // Very close
    else if (minDistance < 3) confidence += 0.2; // Reasonably close
    
    confidence += Math.min(0.2, (1 - minDistance / 10)); // Distance bonus

    // Calculate overall score
    let score: number;
    if (options.prioritizeDistance) {
      // Distance-first scoring
      score = (1 / (minDistance + 1)) * 0.7 + timeUtilization * 0.3;
    } else {
      // Duration-first scoring (default)
      score = timeUtilization * 0.7 + (1 / (minDistance + 1)) * 0.3;
    }

    suggestions.push({
      activity,
      gap,
      distanceToNext,
      distanceToPrevious,
      timeUtilization,
      confidence: Math.min(1, confidence),
      score,
    });
  }

  // Sort by score (descending) and return top suggestions
  return suggestions
    .sort((a, b) => b.score - a.score)
    .slice(0, options.maxSuggestionsPerGap);
}

/**
 * Convert basic TimeGap to EnhancedTimeGap with context information
 */
function enhanceTimeGap(
  gap: TimeGap,
  index: number,
  itineraryEvents: ItineraryEvent[]
): EnhancedTimeGap {
  // Find adjacent activities
  const sortedEvents = [...itineraryEvents].sort((a, b) => a.startTime.getTime() - b.startTime.getTime());
  
  let precedingActivity: ItineraryEvent | undefined;
  let followingActivity: ItineraryEvent | undefined;

  // Find the activities immediately before and after this gap
  for (let i = 0; i < sortedEvents.length - 1; i++) {
    const current = sortedEvents[i];
    const next = sortedEvents[i + 1];
    
    if (current.endTime.getTime() <= gap.start.getTime() && 
        next.startTime.getTime() >= gap.end.getTime()) {
      precedingActivity = current;
      followingActivity = next;
      break;
    }
  }

  // If no following activity found, check if gap is after last event
  if (!followingActivity && sortedEvents.length > 0) {
    const lastEvent = sortedEvents[sortedEvents.length - 1];
    if (lastEvent.endTime.getTime() <= gap.start.getTime()) {
      precedingActivity = lastEvent;
    }
  }

  // If no preceding activity found, check if gap is before first event
  if (!precedingActivity && sortedEvents.length > 0) {
    const firstEvent = sortedEvents[0];
    if (firstEvent.startTime.getTime() >= gap.end.getTime()) {
      followingActivity = firstEvent;
    }
  }

  return {
    ...gap,
    id: `gap-${index}-${gap.start.getTime()}`,
    precedingActivity,
    followingActivity,
    optimalDurationMinutes: gap.durationMinutes - 20, // Account for buffer time
    context: getTimeContext(gap.start),
  };
}

/**
 * Main function: Find optimal activities for time gaps
 */
export function findOptimalActivitiesForGaps(
  gaps: TimeGap[],
  availableActivities: Recommendation[],
  itineraryEvents: ItineraryEvent[],
  options: GapFillingOptions = DEFAULT_GAP_FILLING_OPTIONS
): Map<string, GapFillingResult> {
  const startTime = Date.now();
  const results = new Map<string, GapFillingResult>();

  // Filter gaps by minimum duration
  const validGaps = gaps.filter(gap => gap.durationMinutes >= options.minGapMinutes);

  for (let i = 0; i < validGaps.length; i++) {
    const gap = validGaps[i];
    const enhancedGap = enhanceTimeGap(gap, i, itineraryEvents);

    // Stage 1: Temporal Filtering
    const temporallyCompatible = temporalFiltering(
      enhancedGap,
      availableActivities,
      options.bufferTimeMinutes
    );

    // Stage 2: Spatial Filtering
    const suggestions = spatialFiltering(
      enhancedGap,
      temporallyCompatible,
      options
    );

    // Determine overall confidence
    let overallConfidence: 'high' | 'medium' | 'low' = 'low';
    if (suggestions.length > 0) {
      const avgConfidence = suggestions.reduce((sum, s) => sum + s.confidence, 0) / suggestions.length;
      if (avgConfidence > 0.7) overallConfidence = 'high';
      else if (avgConfidence > 0.4) overallConfidence = 'medium';
    }

    const gapResult: GapFillingResult = {
      gapId: enhancedGap.id,
      suggestions,
      processingTimeMs: Date.now() - startTime,
      confidence: overallConfidence,
      totalActivitiesAnalyzed: availableActivities.length,
    };

    results.set(enhancedGap.id, gapResult);
  }

  return results;
}

/**
 * Clear the distance cache (useful for testing or memory management)
 */
export function clearDistanceCache(): void {
  distanceCache.clear();
}

/**
 * Get cache statistics for debugging
 */
export function getCacheStats(): { size: number; maxSize: number } {
  return {
    size: distanceCache['cache'].size,
    maxSize: 1000,
  };
}