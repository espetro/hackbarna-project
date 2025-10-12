/**
 * Itinerary Intelligence System
 *
 * This module provides advanced filtering, scheduling, and conflict detection
 * for building the perfect itinerary with zero overlaps and optimal timing.
 */

import { ItineraryEvent, Recommendation } from './types';
import { parseDurationToMinutes, calculateActivityDistance } from './smartSuggestions';

export interface TimeGap {
  startTime: Date;
  endTime: Date;
  durationMinutes: number;
  previousEvent?: ItineraryEvent;
  nextEvent?: ItineraryEvent;
  isStartOfDay: boolean;
  isEndOfDay: boolean;
}

export interface RecommendationFit {
  recommendation: Recommendation;
  fitScore: number; // 0-100
  durationFit: 'perfect' | 'good' | 'tight' | 'too-long';
  suggestedStartTime: Date;
  suggestedEndTime: Date;
  distanceFromPrevious?: number;
  distanceFromNext?: number;
  proximityScore: number;
  timeOfDayScore: number;
  canFit: boolean;
}

export interface OverlapCheck {
  hasOverlap: boolean;
  conflictingEvents: ItineraryEvent[];
  message?: string;
}

/**
 * Detect all time gaps in the itinerary for a specific day
 */
export function detectTimeGaps(
  events: ItineraryEvent[],
  date: Date,
  dayStartHour: number = 8,
  dayEndHour: number = 22
): TimeGap[] {
  const gaps: TimeGap[] = [];

  // Filter events for this specific day and sort chronologically
  const dayEvents = events
    .filter(event => {
      const eventDate = new Date(event.startTime);
      return (
        eventDate.getFullYear() === date.getFullYear() &&
        eventDate.getMonth() === date.getMonth() &&
        eventDate.getDate() === date.getDate()
      );
    })
    .sort((a, b) => a.startTime.getTime() - b.startTime.getTime());

  if (dayEvents.length === 0) {
    // Entire day is free
    const dayStart = new Date(date);
    dayStart.setHours(dayStartHour, 0, 0, 0);
    const dayEnd = new Date(date);
    dayEnd.setHours(dayEndHour, 0, 0, 0);

    gaps.push({
      startTime: dayStart,
      endTime: dayEnd,
      durationMinutes: (dayEnd.getTime() - dayStart.getTime()) / (1000 * 60),
      isStartOfDay: true,
      isEndOfDay: true,
    });
    return gaps;
  }

  const dayStart = new Date(date);
  dayStart.setHours(dayStartHour, 0, 0, 0);
  const dayEnd = new Date(date);
  dayEnd.setHours(dayEndHour, 0, 0, 0);

  // Gap before first event
  if (dayEvents[0].startTime.getTime() > dayStart.getTime()) {
    const durationMinutes = (dayEvents[0].startTime.getTime() - dayStart.getTime()) / (1000 * 60);
    if (durationMinutes >= 30) {
      gaps.push({
        startTime: dayStart,
        endTime: dayEvents[0].startTime,
        durationMinutes,
        nextEvent: dayEvents[0],
        isStartOfDay: true,
        isEndOfDay: false,
      });
    }
  }

  // Gaps between events
  for (let i = 0; i < dayEvents.length - 1; i++) {
    const currentEnd = dayEvents[i].endTime;
    const nextStart = dayEvents[i + 1].startTime;
    const durationMinutes = (nextStart.getTime() - currentEnd.getTime()) / (1000 * 60);

    if (durationMinutes >= 30) {
      gaps.push({
        startTime: currentEnd,
        endTime: nextStart,
        durationMinutes,
        previousEvent: dayEvents[i],
        nextEvent: dayEvents[i + 1],
        isStartOfDay: false,
        isEndOfDay: false,
      });
    }
  }

  // Gap after last event
  const lastEvent = dayEvents[dayEvents.length - 1];
  if (lastEvent.endTime.getTime() < dayEnd.getTime()) {
    const durationMinutes = (dayEnd.getTime() - lastEvent.endTime.getTime()) / (1000 * 60);
    if (durationMinutes >= 30) {
      gaps.push({
        startTime: lastEvent.endTime,
        endTime: dayEnd,
        durationMinutes,
        previousEvent: lastEvent,
        isStartOfDay: false,
        isEndOfDay: true,
      });
    }
  }

  return gaps;
}

/**
 * Calculate how well a recommendation fits in a time gap
 */
function calculateDurationFit(
  activityDurationMinutes: number,
  gapDurationMinutes: number
): { fit: RecommendationFit['durationFit']; score: number } {
  const bufferMinutes = 15; // Minimum buffer time
  const availableMinutes = gapDurationMinutes - bufferMinutes;

  if (activityDurationMinutes > availableMinutes) {
    return { fit: 'too-long', score: 0 };
  }

  const utilizationRatio = activityDurationMinutes / availableMinutes;

  if (utilizationRatio >= 0.85 && utilizationRatio <= 1.0) {
    return { fit: 'perfect', score: 100 };
  } else if (utilizationRatio >= 0.65 && utilizationRatio < 0.85) {
    return { fit: 'good', score: 80 };
  } else {
    return { fit: 'tight', score: 60 };
  }
}

/**
 * Calculate proximity score based on distance to adjacent activities
 */
function calculateProximityScore(
  recommendation: Recommendation,
  gap: TimeGap
): { score: number; distanceFromPrevious?: number; distanceFromNext?: number } {
  let totalScore = 0;
  let count = 0;
  let distanceFromPrevious: number | undefined;
  let distanceFromNext: number | undefined;

  if (gap.previousEvent) {
    const distance = calculateActivityDistance(recommendation, gap.previousEvent);
    distanceFromPrevious = distance;
    // Score: closer is better (< 1km = 100, < 2km = 75, < 5km = 50, > 5km = 25)
    if (distance < 1) {
      totalScore += 100;
    } else if (distance < 2) {
      totalScore += 75;
    } else if (distance < 5) {
      totalScore += 50;
    } else {
      totalScore += 25;
    }
    count++;
  }

  if (gap.nextEvent) {
    const distance = calculateActivityDistance(recommendation, gap.nextEvent);
    distanceFromNext = distance;
    if (distance < 1) {
      totalScore += 100;
    } else if (distance < 2) {
      totalScore += 75;
    } else if (distance < 5) {
      totalScore += 50;
    } else {
      totalScore += 25;
    }
    count++;
  }

  const score = count > 0 ? totalScore / count : 50; // Default 50 if no adjacent events

  return { score, distanceFromPrevious, distanceFromNext };
}

/**
 * Calculate time-of-day appropriateness score
 */
function calculateTimeOfDayScore(
  recommendation: Recommendation,
  startTime: Date
): number {
  const hour = startTime.getHours();
  const title = recommendation.title.toLowerCase();
  const description = recommendation.description.toLowerCase();

  // Morning activities (8-12): Outdoor, markets, tours, breakfast
  if (hour >= 8 && hour < 12) {
    if (
      title.includes('market') ||
      title.includes('breakfast') ||
      title.includes('morning') ||
      description.includes('morning')
    ) {
      return 100;
    }
    if (title.includes('tour') || title.includes('walk')) {
      return 90;
    }
    return 70;
  }

  // Afternoon (12-18): Museums, workshops, lunch, experiences
  if (hour >= 12 && hour < 18) {
    if (
      title.includes('lunch') ||
      title.includes('museum') ||
      title.includes('workshop') ||
      title.includes('class')
    ) {
      return 100;
    }
    if (title.includes('food') || title.includes('culinary')) {
      return 85;
    }
    return 75;
  }

  // Evening (18-22): Dining, entertainment, nightlife
  if (hour >= 18 && hour <= 22) {
    if (
      title.includes('dinner') ||
      title.includes('wine') ||
      title.includes('jazz') ||
      title.includes('club') ||
      title.includes('bar') ||
      title.includes('evening') ||
      title.includes('night') ||
      description.includes('evening') ||
      description.includes('night')
    ) {
      return 100;
    }
    if (title.includes('food') || title.includes('restaurant')) {
      return 90;
    }
    return 70;
  }

  return 60; // Default score
}

/**
 * Filter and rank recommendations for a specific time gap
 */
export function filterRecommendationsForGap(
  gap: TimeGap,
  allRecommendations: Recommendation[],
  alreadyInItinerary: Set<number>
): RecommendationFit[] {
  const fits: RecommendationFit[] = [];

  for (const rec of allRecommendations) {
    // Skip if already in itinerary
    if (alreadyInItinerary.has(rec.id)) {
      continue;
    }

    const activityDurationMinutes = parseDurationToMinutes(rec.duration);
    const bufferMinutes = 15;

    // Calculate suggested timing
    const suggestedStartTime = new Date(gap.startTime.getTime() + bufferMinutes * 60 * 1000);
    const suggestedEndTime = new Date(suggestedStartTime.getTime() + activityDurationMinutes * 60 * 1000);

    // Check if it fits at all
    const canFit = suggestedEndTime <= gap.endTime;

    // Calculate duration fit
    const { fit: durationFit, score: durationScore } = calculateDurationFit(
      activityDurationMinutes,
      gap.durationMinutes
    );

    // Calculate proximity score
    const { score: proximityScore, distanceFromPrevious, distanceFromNext } =
      calculateProximityScore(rec, gap);

    // Calculate time-of-day score
    const timeOfDayScore = calculateTimeOfDayScore(rec, suggestedStartTime);

    // Overall fit score (weighted average)
    const fitScore = canFit
      ? durationScore * 0.4 + proximityScore * 0.3 + timeOfDayScore * 0.3
      : 0;

    fits.push({
      recommendation: rec,
      fitScore: Math.round(fitScore),
      durationFit,
      suggestedStartTime,
      suggestedEndTime,
      distanceFromPrevious,
      distanceFromNext,
      proximityScore,
      timeOfDayScore,
      canFit,
    });
  }

  // Sort by fit score (highest first) and return top candidates
  return fits
    .filter(fit => fit.canFit) // Only return activities that can fit
    .sort((a, b) => b.fitScore - a.fitScore);
}

/**
 * Check if adding an event would cause overlaps
 */
export function checkForOverlaps(
  proposedEvent: { startTime: Date; endTime: Date },
  existingEvents: ItineraryEvent[]
): OverlapCheck {
  const conflicts: ItineraryEvent[] = [];

  for (const event of existingEvents) {
    // Check if time ranges overlap
    const startsBeforeEnds = proposedEvent.startTime < event.endTime;
    const endsAfterStarts = proposedEvent.endTime > event.startTime;

    if (startsBeforeEnds && endsAfterStarts) {
      conflicts.push(event);
    }
  }

  const hasOverlap = conflicts.length > 0;
  const message = hasOverlap
    ? `Conflicts with ${conflicts.length} existing event(s): ${conflicts.map(e => e.title).join(', ')}`
    : undefined;

  return {
    hasOverlap,
    conflictingEvents: conflicts,
    message,
  };
}

/**
 * Find the best time slot for an activity across all days
 */
export function findBestTimeSlot(
  recommendation: Recommendation,
  allEvents: ItineraryEvent[],
  preferredDate?: Date
): RecommendationFit | null {
  const dates = preferredDate ? [preferredDate] : getUniqueDates(allEvents);

  if (dates.length === 0) {
    // No existing events, suggest today
    dates.push(new Date());
  }

  let bestFit: RecommendationFit | null = null;

  for (const date of dates) {
    const gaps = detectTimeGaps(allEvents, date);

    for (const gap of gaps) {
      const fits = filterRecommendationsForGap(gap, [recommendation], new Set());

      if (fits.length > 0 && (!bestFit || fits[0].fitScore > bestFit.fitScore)) {
        bestFit = fits[0];
      }
    }
  }

  return bestFit;
}

/**
 * Get unique dates from events
 */
function getUniqueDates(events: ItineraryEvent[]): Date[] {
  const uniqueTimestamps = new Set(
    events.map(event =>
      new Date(
        event.startTime.getFullYear(),
        event.startTime.getMonth(),
        event.startTime.getDate()
      ).getTime()
    )
  );

  return Array.from(uniqueTimestamps)
    .map(ts => new Date(ts))
    .sort((a, b) => a.getTime() - b.getTime());
}

/**
 * Format duration fit for display
 */
export function formatDurationFit(fit: RecommendationFit['durationFit']): {
  label: string;
  color: string;
  badgeColor: string;
} {
  switch (fit) {
    case 'perfect':
      return {
        label: 'Perfect fit',
        color: 'text-green-700 dark:text-green-300',
        badgeColor: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300',
      };
    case 'good':
      return {
        label: 'Good fit',
        color: 'text-blue-700 dark:text-blue-300',
        badgeColor: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300',
      };
    case 'tight':
      return {
        label: 'Tight fit',
        color: 'text-yellow-700 dark:text-yellow-300',
        badgeColor: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300',
      };
    case 'too-long':
      return {
        label: 'Too long',
        color: 'text-red-700 dark:text-red-300',
        badgeColor: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300',
      };
  }
}

/**
 * Format distance for display
 */
export function formatDistance(kilometers: number | undefined): string {
  if (kilometers === undefined) return '';
  if (kilometers < 1) {
    return `${Math.round(kilometers * 1000)}m away`;
  }
  return `${kilometers.toFixed(1)}km away`;
}
