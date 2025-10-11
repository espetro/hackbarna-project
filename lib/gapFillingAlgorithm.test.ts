import { temporalFiltering, parseActivityDuration, spatialFiltering, EnhancedTimeGap, GapFillingOptions, GapSuggestion } from './gapFillingAlgorithm';
import { Recommendation, ItineraryEvent } from './types';

describe('parseActivityDuration', () => {
  test('parses hours correctly', () => {
    expect(parseActivityDuration('2 hours')).toBe(120);
    expect(parseActivityDuration('1.5 hours')).toBe(90);
    expect(parseActivityDuration('3h')).toBe(180);
  });

  test('parses minutes correctly', () => {
    expect(parseActivityDuration('45 minutes')).toBe(45);
    expect(parseActivityDuration('30 min')).toBe(30);
  });

  test('parses combined hours and minutes', () => {
    expect(parseActivityDuration('1h 30m')).toBe(90);
    expect(parseActivityDuration('2h 15min')).toBe(135);
  });

  test('defaults to 120 minutes if no input', () => {
    expect(parseActivityDuration(undefined)).toBe(120);
    expect(parseActivityDuration('')).toBe(120);
  });

  test('parses numeric string as hours', () => {
    expect(parseActivityDuration('2')).toBe(120);
    expect(parseActivityDuration('1.25')).toBe(75);
  });

  test('returns default for unrecognized format', () => {
    expect(parseActivityDuration('abc')).toBe(120);
  });
});

describe('temporalFiltering', () => {
  const mockGap: EnhancedTimeGap = {
    id: 'gap-1',
    start: new Date(),
    end: new Date(),
    durationMinutes: 120,
    context: 'morning',
  };

  const activities: Recommendation[] = [
    { id: 1, title: 'Short Activity', duration: '30 minutes', location: { lat: 0, lng: 0 } },
    { id: 2, title: 'Medium Activity', duration: '1 hour', location: { lat: 0, lng: 0 } },
    { id: 3, title: 'Long Activity', duration: '3 hours', location: { lat: 0, lng: 0 } },
    { id: 4, title: 'No Duration Activity', duration: undefined, location: { lat: 0, lng: 0 } },
  ];

  test('filters activities that fit within available time minus buffer', () => {
    const bufferTime = 20;
    const filtered = temporalFiltering(mockGap, activities, bufferTime);
    // Available time = 120 - 20 = 100 minutes
    // Activities with duration <= 100 minutes: id 1 (30m), id 2 (60m), id 4 (default 120m but filtered out)
    // id 4 defaults to 120 minutes which is > 100, so excluded
    expect(filtered.map(a => a.id)).toEqual([1, 2]);
  });

  test('returns empty array if available time is zero or negative', () => {
    const bufferTime = 130;
    const filtered = temporalFiltering(mockGap, activities, bufferTime);
    expect(filtered).toEqual([]);
  });
});

const mockOptions: GapFillingOptions = {
  bufferTimeMinutes: 20,
  minGapMinutes: 30,
  maxSuggestionsPerGap: 3,
  prioritizeDistance: false,
  enableCaching: false, // Disable caching for test predictability
};

const createMockActivity = (id: number, lat: number, lng: number, duration: string) => ({
  id,
  title: `Activity ${id}`,
  location: { lat, lng },
  duration,
});

const createMockEvent = (id: number, lat: number, lng: number, startTime: Date, endTime: Date): ItineraryEvent => ({
  id,
  title: `Event ${id}`,
  location: { lat, lng },
  startTime,
  endTime,
  description: '',
  source: 'test',
  image: '',
});

describe('spatialFiltering', () => {
  const now = new Date();
  const gap: EnhancedTimeGap = {
    id: 'gap-1',
    start: now,
    end: new Date(now.getTime() + 60 * 60 * 1000), // 1 hour gap
    durationMinutes: 60,
    context: 'morning',
    optimalDurationMinutes: 40,
    precedingActivity: createMockEvent(1, 40.7128, -74.0060, new Date(now.getTime() - 3600000), now), // NYC
    followingActivity: createMockEvent(2, 40.73061, -73.935242, new Date(now.getTime() + 3600000), new Date(now.getTime() + 7200000)), // NYC nearby
  };

  test('returns suggestions ranked by proximity and time utilization', () => {
    const activities = [
      createMockActivity(101, 40.7127, -74.0059, '30 minutes'), // Very close to preceding
      createMockActivity(102, 40.7306, -73.9352, '45 minutes'), // Very close to following
      createMockActivity(103, 41.0, -75.0, '60 minutes'), // Far away
    ];

    const suggestions = spatialFiltering(gap, activities, mockOptions);
    expect(suggestions.length).toBeLessThanOrEqual(mockOptions.maxSuggestionsPerGap);

    // The closest activities should have higher scores
    expect(suggestions[0].activity.id).toBe(102); // Closer to following
    expect(suggestions[1].activity.id).toBe(101); // Closer to preceding
    expect(suggestions[2].activity.id).toBe(103); // Furthest away
  });

  test('handles only preceding activity', () => {
    const gapOnlyPreceding = { ...gap, followingActivity: undefined };
    const activities = [
      createMockActivity(201, 40.7127, -74.0059, '30 minutes'), // Close to preceding
      createMockActivity(202, 41.0, -75.0, '45 minutes'), // Far away
    ];

    const suggestions = spatialFiltering(gapOnlyPreceding, activities, mockOptions);
    expect(suggestions.length).toBe(2);
    expect(suggestions[0].distanceToNext).toBe(0);
    expect(suggestions[0].distanceToPrevious).toBeLessThan(suggestions[1].distanceToPrevious);
  });

  test('handles only following activity', () => {
    const gapOnlyFollowing = { ...gap, precedingActivity: undefined };
    const activities = [
      createMockActivity(301, 40.7306, -73.9352, '30 minutes'), // Close to following
      createMockActivity(302, 41.0, -75.0, '45 minutes'), // Far away
    ];

    const suggestions = spatialFiltering(gapOnlyFollowing, activities, mockOptions);
    expect(suggestions.length).toBe(2);
    expect(suggestions[0].distanceToPrevious).toBe(0);
    expect(suggestions[0].distanceToNext).toBeLessThan(suggestions[1].distanceToNext);
  });

  test('handles no adjacent activities gracefully', () => {
    const gapNoAdjacents = { ...gap, precedingActivity: undefined, followingActivity: undefined };
    const activities = [
      createMockActivity(401, 40.7127, -74.0059, '30 minutes'),
      createMockActivity(402, 41.0, -75.0, '45 minutes'),
    ];

    const suggestions = spatialFiltering(gapNoAdjacents, activities, mockOptions);
    expect(suggestions.length).toBe(2);
    // Distances should be zero or Infinity but function should not throw
    suggestions.forEach(s => {
      expect(typeof s.distanceToNext).toBe('number');
      expect(typeof s.distanceToPrevious).toBe('number');
    });
  });
});