import { z } from 'zod';
import { LocationSchema } from './activity';

/**
 * Itinerary Item Schema
 * Single event/activity in the itinerary with time bounds
 */
export const ItineraryItemSchema = z.object({
  id: z.string(),
  title: z.string().min(1),
  description: z.string().optional(),
  location: LocationSchema,
  startTime: z.date(),
  endTime: z.date(),
  source: z.enum(['recommendation', 'google_calendar', 'manual']),
  recommendationId: z.string().optional(), // Link back to original recommendation
  image: z.string().url().optional(),
  isLocked: z.boolean().default(false), // Immutable calendar imports
  createdAt: z.date().default(() => new Date()),
}).refine(
  (data) => data.endTime > data.startTime,
  {
    message: "End time must be after start time",
    path: ["endTime"],
  }
);

export type ItineraryItem = z.infer<typeof ItineraryItemSchema>;

/**
 * Itinerary Schema
 * Full user itinerary with validation rules
 */
export const ItinerarySchema = z.object({
  userId: z.string().uuid(),
  items: z.array(ItineraryItemSchema),
  createdAt: z.date().default(() => new Date()),
  updatedAt: z.date().default(() => new Date()),
}).refine(
  (data) => {
    // CONTRACT: No overlapping events
    const sorted = [...data.items].sort((a, b) => a.startTime.getTime() - b.startTime.getTime());
    for (let i = 0; i < sorted.length - 1; i++) {
      const current = sorted[i];
      const next = sorted[i + 1];
      if (current.endTime > next.startTime) {
        return false;
      }
    }
    return true;
  },
  {
    message: "Itinerary items cannot overlap in time",
    path: ["items"],
  }
);

export type Itinerary = z.infer<typeof ItinerarySchema>;

/**
 * Helper function to detect time gaps in itinerary
 * Returns gaps of specified minimum duration (default 30 minutes)
 */
export interface TimeGap {
  start: Date;
  end: Date;
  durationMinutes: number;
}

export function detectTimeGaps(
  items: ItineraryItem[],
  date: Date,
  minGapMinutes: number = 30,
  dayStartHour: number = 8,
  dayEndHour: number = 22
): TimeGap[] {
  const gaps: TimeGap[] = [];

  // Filter items for the specific date and sort by start time
  const dayItems = items
    .filter(item => {
      const itemDate = new Date(item.startTime);
      return (
        itemDate.getFullYear() === date.getFullYear() &&
        itemDate.getMonth() === date.getMonth() &&
        itemDate.getDate() === date.getDate()
      );
    })
    .sort((a, b) => a.startTime.getTime() - b.startTime.getTime());

  if (dayItems.length === 0) {
    // Entire day is free
    const dayStart = new Date(date);
    dayStart.setHours(dayStartHour, 0, 0, 0);
    const dayEnd = new Date(date);
    dayEnd.setHours(dayEndHour, 0, 0, 0);

    return [{
      start: dayStart,
      end: dayEnd,
      durationMinutes: (dayEnd.getTime() - dayStart.getTime()) / 60000,
    }];
  }

  const dayStart = new Date(date);
  dayStart.setHours(dayStartHour, 0, 0, 0);
  const dayEnd = new Date(date);
  dayEnd.setHours(dayEndHour, 0, 0, 0);

  // Gap before first event
  const firstEventStart = new Date(dayItems[0].startTime);
  if (firstEventStart > dayStart) {
    const gapMinutes = (firstEventStart.getTime() - dayStart.getTime()) / 60000;
    if (gapMinutes >= minGapMinutes) {
      gaps.push({
        start: dayStart,
        end: firstEventStart,
        durationMinutes: gapMinutes,
      });
    }
  }

  // Gaps between events
  for (let i = 0; i < dayItems.length - 1; i++) {
    const currentEnd = new Date(dayItems[i].endTime);
    const nextStart = new Date(dayItems[i + 1].startTime);
    const gapMinutes = (nextStart.getTime() - currentEnd.getTime()) / 60000;

    if (gapMinutes >= minGapMinutes) {
      gaps.push({
        start: currentEnd,
        end: nextStart,
        durationMinutes: gapMinutes,
      });
    }
  }

  // Gap after last event
  const lastEventEnd = new Date(dayItems[dayItems.length - 1].endTime);
  if (lastEventEnd < dayEnd) {
    const gapMinutes = (dayEnd.getTime() - lastEventEnd.getTime()) / 60000;
    if (gapMinutes >= minGapMinutes) {
      gaps.push({
        start: lastEventEnd,
        end: dayEnd,
        durationMinutes: gapMinutes,
      });
    }
  }

  return gaps;
}

/**
 * Helper function to check if adding an item would create overlap
 */
export function wouldOverlap(
  existingItems: ItineraryItem[],
  newItem: Pick<ItineraryItem, 'startTime' | 'endTime'>
): boolean {
  return existingItems.some(item => {
    const itemStart = item.startTime.getTime();
    const itemEnd = item.endTime.getTime();
    const newStart = newItem.startTime.getTime();
    const newEnd = newItem.endTime.getTime();

    // Check if there's any overlap
    return (newStart < itemEnd && newEnd > itemStart);
  });
}
