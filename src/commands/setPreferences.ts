import { PreferenceSchema, Preference } from '@/src/contracts/user';
import { AppAction } from '@/src/contexts/AppContext';

/**
 * Command: Set User Preferences
 * Validates preferences with Zod schema before dispatch
 */
export async function setPreferences(
  preferences: unknown,
  dispatch: React.Dispatch<AppAction>,
  userId?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // Validate with Zod
    const validated = PreferenceSchema.parse(preferences);

    // Optimistic update
    dispatch({ type: 'USER/SET_PREFERENCES', payload: validated });

    // Persist to API
    if (userId) {
      const response = await fetch('/api/user', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ preferences: validated }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to save preferences');
      }
    }

    return { success: true };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Invalid preferences';
    dispatch({ type: 'USER/ERROR', payload: errorMessage });
    return { success: false, error: errorMessage };
  }
}
