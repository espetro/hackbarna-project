import { AppAction, AppState } from '@/src/contexts/AppContext';

/**
 * Command: Remove Item from Itinerary
 * Validates that item exists and is not locked before removal
 */
export async function removeItem(
  itemId: string,
  dispatch: React.Dispatch<AppAction>,
  currentState: AppState,
  userId?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // Find item to validate it exists
    const item = currentState.itinerary.items.find(item => item.id === itemId);

    if (!item) {
      throw new Error('Item not found in itinerary');
    }

    // Contract enforcement happens in reducer (locked check)
    dispatch({ type: 'ITINERARY/REMOVE', payload: itemId });

    // Persist to API
    if (userId) {
      const response = await fetch(`/api/itinerary/items?itemId=${itemId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to remove item from itinerary');
      }

      // Trigger map recalculation
      dispatch({ type: 'ITINERARY/RECALC' });
    }

    return { success: true };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to remove item';
    dispatch({ type: 'ITINERARY/ERROR', payload: errorMessage });
    return { success: false, error: errorMessage };
  }
}
