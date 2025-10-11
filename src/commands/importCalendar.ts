import { ItineraryItemSchema, ItineraryItem } from '@/src/contracts/itinerary';
import { AppAction } from '@/src/contexts/AppContext';
import { z } from 'zod';

/**
 * Command: Import Calendar Events
 * Validates calendar events and imports them as locked items
 */
export async function importCalendar(
  events: unknown[],
  dispatch: React.Dispatch<AppAction>,
  userId?: string
): Promise<{ success: boolean; error?: string; importedCount?: number }> {
  try {
    // Validate each event with Zod
    const validatedEvents: ItineraryItem[] = [];
    const errors: string[] = [];

    for (const event of events) {
      try {
        const validated = ItineraryItemSchema.parse({
          ...event,
          isLocked: true, // Calendar imports are immutable
          source: 'google_calendar',
        });
        validatedEvents.push(validated);
      } catch (error) {
        // Skip invalid events but collect errors
        if (error instanceof z.ZodError) {
          errors.push(`Invalid event: ${error.errors[0].message}`);
        }
      }
    }

    if (validatedEvents.length === 0) {
      throw new Error(
        errors.length > 0
          ? `No valid events to import. Errors: ${errors.join(', ')}`
          : 'No events to import'
      );
    }

    // Dispatch import action (contract enforcement happens in reducer)
    dispatch({ type: 'ITINERARY/IMPORT', payload: validatedEvents });

    // Persist to API
    if (userId) {
      const response = await fetch('/api/itinerary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ events: validatedEvents }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to import calendar events');
      }

      // Trigger map recalculation
      dispatch({ type: 'ITINERARY/RECALC' });
    }

    return {
      success: true,
      importedCount: validatedEvents.length,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to import calendar';
    dispatch({ type: 'ITINERARY/ERROR', payload: errorMessage });
    return { success: false, error: errorMessage };
  }
}
