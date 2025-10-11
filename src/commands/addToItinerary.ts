import { ItineraryItemSchema, ItineraryItem } from '@/src/contracts/itinerary';
import { AppAction, AppState } from '@/src/contexts/AppContext';
import { RankedActivity } from '@/src/contracts/activity';

/**
 * Command: Add Item to Itinerary
 * Validates item with Zod schema, checks for overlaps, and dispatches
 */
export async function addToItinerary(
  item: unknown,
  dispatch: React.Dispatch<AppAction>,
  currentState: AppState,
  userId?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // Validate with Zod
    const validated = ItineraryItemSchema.parse(item);

    // Contract enforcement happens in reducer (overlap check)
    dispatch({ type: 'ITINERARY/ADD', payload: validated });

    // Check if dispatch resulted in error
    // Note: This is a simplification - in production you'd want to check state after dispatch
    // or handle this differently to detect reducer errors

    // Persist to API
    if (userId) {
      const response = await fetch('/api/itinerary/items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ item: validated }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to add item to itinerary');
      }

      // Trigger map recalculation
      dispatch({ type: 'ITINERARY/RECALC' });
    }

    return { success: true };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Invalid itinerary item';
    dispatch({ type: 'ITINERARY/ERROR', payload: errorMessage });
    return { success: false, error: errorMessage };
  }
}

/**
 * Helper: Convert RankedActivity to ItineraryItem
 * Provides sensible defaults for time slots
 */
export function activityToItineraryItem(
  activity: RankedActivity,
  startTime?: Date,
  durationMinutes?: number
): Omit<ItineraryItem, 'id' | 'createdAt'> {
  // Default to next available hour if no start time provided
  const start = startTime || (() => {
    const now = new Date();
    now.setHours(now.getHours() + 1, 0, 0, 0);
    return now;
  })();

  // Parse duration from activity or use provided/default
  let duration = durationMinutes;
  if (!duration && activity.duration) {
    const match = activity.duration.match(/(\d+)/);
    duration = match ? parseInt(match[1]) * 60 : 120; // default 2 hours
  }
  if (!duration) {
    duration = 120; // default 2 hours
  }

  const end = new Date(start);
  end.setMinutes(end.getMinutes() + duration);

  return {
    title: activity.title,
    description: activity.description,
    location: activity.location,
    startTime: start,
    endTime: end,
    source: 'recommendation',
    recommendationId: activity.id,
    image: activity.image,
    isLocked: false,
  };
}
