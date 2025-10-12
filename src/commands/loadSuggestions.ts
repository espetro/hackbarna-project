import { RankedActivitySchema, RankedActivity } from '@/src/contracts/activity';
import { AppAction } from '@/src/contexts/AppContext';
import { Preference } from '@/src/contracts/user';
import { z } from 'zod';

/**
 * Command: Load Activity Suggestions
 * Fetches AI-ranked activities based on user preferences
 */
export async function loadSuggestions(
  preferences: Preference,
  location: string,
  dispatch: React.Dispatch<AppAction>
): Promise<{ success: boolean; error?: string; activities?: RankedActivity[] }> {
  try {
    dispatch({ type: 'ACTIVITIES/LOADING', payload: true });

    // Call suggestions API with preferences
    const response = await fetch('/api/suggestions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        preferences,
        location,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to load suggestions');
    }

    const data = await response.json();

    // Validate response with Zod
    const validatedActivities: RankedActivity[] = [];
    const errors: string[] = [];

    for (const activity of data.activities || []) {
      try {
        const validated = RankedActivitySchema.parse(activity);
        validatedActivities.push(validated);
      } catch (error) {
        // Skip invalid activities but collect errors
        if (error instanceof z.ZodError) {
          errors.push(`Invalid activity: ${error.issues[0].message}`);
        }
      }
    }

    if (validatedActivities.length === 0) {
      throw new Error(
        errors.length > 0
          ? `No valid suggestions received. Errors: ${errors.join(', ')}`
          : 'No suggestions available'
      );
    }

    // Sort by score (highest first)
    validatedActivities.sort((a, b) => b.score - a.score);

    // Dispatch to state
    dispatch({ type: 'ACTIVITIES/SET', payload: validatedActivities });

    return {
      success: true,
      activities: validatedActivities,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to load suggestions';
    dispatch({ type: 'ACTIVITIES/ERROR', payload: errorMessage });
    return { success: false, error: errorMessage };
  }
}
