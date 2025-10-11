import { describe, it, expect, beforeEach, vi } from 'vitest';
import { addToItinerary } from './addToItinerary';
import { ItineraryItem } from '@/src/contracts/itinerary';
import { AppAction, AppState } from '@/src/contexts/AppContext';

// Mock dispatch function to capture dispatched actions
function createMockDispatch() {
  const actions: AppAction[] = [];
  const dispatch = (action: AppAction) => {
    actions.push(action);
  };
  return { dispatch, actions };
}

// Mock state for testing
const initialState: AppState = {
  user: { data: { id: 'test-user' }, loading: false, error: null },
  itinerary: { items: [], isLoading: false, error: null, lastUpdated: new Date() },
  recommendations: [],
  suggestedActivities: { items: [], isLoading: false, error: null, lastUpdated: new Date() },
  userPreferences: null,
  error: null,
  loading: false,
};

describe('addToItinerary command integration', () => {
  let dispatch: ReturnType<typeof createMockDispatch>['dispatch'];
  let actions: AppAction[];

  beforeEach(() => {
    const mock = createMockDispatch();
    dispatch = mock.dispatch;
    actions = mock.actions;
  });

  it('adds a valid itinerary item successfully', async () => {
    const item: ItineraryItem = {
      id: 'item-1',
      title: 'Test Event',
      description: 'A test event',
      location: { name: 'Test Location', lat: 40.0, lng: -74.0 },
      startTime: new Date('2025-10-12T10:00:00Z'),
      endTime: new Date('2025-10-12T12:00:00Z'),
      source: 'recommendation',
      recommendationId: 'rec-1',
      image: '',
      isLocked: false,
      createdAt: new Date(),
    };

    const result = await addToItinerary(item, dispatch, initialState, 'test-user');
    expect(result.success).toBe(true);

    // Check that ITINERARY/ADD action was dispatched
    const addAction = actions.find(a => a.type === 'ITINERARY/ADD');
    expect(addAction).toBeDefined();
    expect(addAction?.payload.id).toBe(item.id);

    // Check that ITINERARY/RECALC action was dispatched
    const recalcAction = actions.find(a => a.type === 'ITINERARY/RECALC');
    expect(recalcAction).toBeDefined();
  });

  it('does not add overlapping itinerary items', async () => {
    // Simulate existing event in state overlapping with new item
    const overlappingState: AppState = {
      ...initialState,
      itinerary: {
        ...initialState.itinerary,
        items: [
          {
            id: 'item-1',
            title: 'Existing Event',
            description: '',
            location: { name: 'Loc', lat: 40, lng: -74 },
            startTime: new Date('2025-10-12T10:00:00Z'),
            endTime: new Date('2025-10-12T12:00:00Z'),
            source: 'recommendation',
            recommendationId: 'rec-1',
            image: '',
            isLocked: false,
            createdAt: new Date(),
          },
        ],
      },
    };

    const newItem: ItineraryItem = {
      id: 'item-2',
      title: 'Overlapping Event',
      description: '',
      location: { name: 'Loc2', lat: 41, lng: -75 },
      startTime: new Date('2025-10-12T11:00:00Z'),
      endTime: new Date('2025-10-12T13:00:00Z'),
      source: 'recommendation',
      recommendationId: 'rec-2',
      image: '',
      isLocked: false,
      createdAt: new Date(),
    };

    const result = await addToItinerary(newItem, dispatch, overlappingState, 'test-user');
    expect(result.success).toBe(false);

    // Check that ITINERARY/ERROR action was dispatched
    const errorAction = actions.find(a => a.type === 'ITINERARY/ERROR');
    expect(errorAction).toBeDefined();
    expect(errorAction?.payload).toMatch(/overlaps/);
  });

  // Additional tests can be added here to simulate gap-filling integration,
  // e.g., adding an event and verifying gap-filling activities are added.

  it('adds a gap-filling activity successfully', async () => {
    const gapActivity = {
      id: 'gapfill-1',
      title: 'Gap Activity',
      description: 'Fills a gap',
      location: { name: 'Loc', lat: 40, lng: -74 },
      startTime: new Date('2025-10-12T08:00:00Z'),
      endTime: new Date('2025-10-12T09:00:00Z'),
      source: 'recommendation',
      recommendationId: 'rec-gap-1',
      image: '',
      isLocked: false,
      createdAt: new Date(),
    };

    const { dispatch, actions } = createMockDispatch();
    const result = await addToItinerary(gapActivity, dispatch, initialState, 'test-user');
    expect(result.success).toBe(true);
    const addAction = actions.find(a => a.type === 'ITINERARY/ADD');
    expect(addAction).toBeDefined();
    expect(addAction?.payload.id).toBe(gapActivity.id);
  
    it('rejects gap-filling activity that overlaps existing event', async () => {
      const existingEvent: ItineraryItem = {
        id: 'existing-1',
        title: 'Existing Event',
        description: '',
        location: { name: 'Loc', lat: 40, lng: -74 },
        startTime: new Date('2025-10-12T10:00:00Z'),
        endTime: new Date('2025-10-12T12:00:00Z'),
        source: 'recommendation',
        recommendationId: 'rec-1',
        image: '',
        isLocked: false,
        createdAt: new Date(),
      };
  
      const overlappingGapActivity: ItineraryItem = {
        id: 'gapfill-overlap',
        title: 'Overlapping Gap Activity',
        description: '',
        location: { name: 'Loc2', lat: 41, lng: -75 },
        startTime: new Date('2025-10-12T11:00:00Z'),
        endTime: new Date('2025-10-12T13:00:00Z'),
        source: 'recommendation',
        recommendationId: 'rec-gap-2',
        image: '',
        isLocked: false,
        createdAt: new Date(),
      };
  
      const { dispatch, actions } = createMockDispatch();
      const state: AppState = {
        ...initialState,
        itinerary: {
          ...initialState.itinerary,
          items: [existingEvent],
        },
      };
  
      const result = await addToItinerary(overlappingGapActivity, dispatch, state, 'test-user');
      expect(result.success).toBe(false);
  
      const errorAction = actions.find(a => a.type === 'ITINERARY/ERROR');
      expect(errorAction).toBeDefined();
      expect(errorAction?.payload).toMatch(/overlaps/);
    });
  
    it('validates itinerary consistency after multiple gap-filling activities', async () => {
      const gapActivities = [
        {
          id: 'gapfill-3',
          title: 'Gap Activity 3',
          description: 'Morning gap',
          location: { name: 'Loc3', lat: 40.5, lng: -74.5 },
          startTime: new Date('2025-10-12T07:00:00Z'),
          endTime: new Date('2025-10-12T08:00:00Z'),
          source: 'recommendation',
          recommendationId: 'rec-gap-3',
          image: '',
          isLocked: false,
          createdAt: new Date(),
        },
        {
          id: 'gapfill-4',
          title: 'Gap Activity 4',
          description: 'Evening gap',
          location: { name: 'Loc4', lat: 41.5, lng: -75.5 },
          startTime: new Date('2025-10-12T18:00:00Z'),
          endTime: new Date('2025-10-12T19:30:00Z'),
          source: 'recommendation',
          recommendationId: 'rec-gap-4',
          image: '',
          isLocked: false,
          createdAt: new Date(),
        },
      ];
  
      const { dispatch, actions } = createMockDispatch();
      let state = { ...initialState };
  
      for (const activity of gapActivities) {
        const result = await addToItinerary(activity, dispatch, state, 'test-user');
        expect(result.success).toBe(true);
        state = {
          ...state,
          itinerary: {
            ...state.itinerary,
            items: [...state.itinerary.items, activity],
          },
        };
      }
  
      // Validate no overlaps in itinerary
      const items = state.itinerary.items;
      for (let i = 0; i < items.length; i++) {
        for (let j = i + 1; j < items.length; j++) {
          const a = items[i];
          const b = items[j];
          const overlap = a.startTime < b.endTime && b.startTime < a.endTime;
          expect(overlap).toBe(false);
        }
      }
    });
  
    it('tests combined temporal and spatial filtering integration in gap-filling', async () => {
      const gap = {
        id: 'gap-1',
        startTime: new Date('2025-10-12T10:00:00Z'),
        endTime: new Date('2025-10-12T12:00:00Z'),
      };
  
      const activities = [
        {
          id: 'act-1',
          title: 'Nearby Short Activity',
          duration: '1 hour',
          location: { lat: 40.7128, lng: -74.0060 },
        },
        {
          id: 'act-2',
          title: 'Far Long Activity',
          duration: '3 hours',
          location: { lat: 41.0, lng: -75.0 },
        },
        {
          id: 'act-3',
          title: 'Nearby Medium Activity',
          duration: '1.5 hours',
          location: { lat: 40.7130, lng: -74.0050 },
        },
      ];
    });
});