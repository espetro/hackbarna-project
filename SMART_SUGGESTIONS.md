# Smart Activity Suggestions Feature

## Overview

The Smart Activity Suggestions feature intelligently recommends activities that fit perfectly into empty time slots between existing itinerary events. It uses geospatial distance calculations and time constraints to suggest the most optimal activities.

## 🎯 Key Features

### **Intelligent Slot Detection**
- Automatically finds empty time slots between itinerary activities
- Considers minimum slot duration (default: 30 minutes)
- Accounts for travel and buffer time

### **Smart Filtering**
- **Duration Matching**: Only suggests activities that fit within available time
- **Distance Optimization**: Uses Turf.js to calculate distances and suggests closest activities
- **Real-time Updates**: Regenerates suggestions when itinerary changes

### **User Experience**
- **Visual Integration**: Smart suggestions appear in the itinerary panel
- **Quick Actions**: One-click to add suggested activities
- **Smart Badges**: Clear indication of "Smart Fit" activities
- **Contextual Information**: Shows distance, duration, and timing details

## 🏗️ Architecture

### Core Components

1. **`lib/smartSuggestions.ts`**
   - Core logic for finding empty slots
   - Distance calculations using Turf.js
   - Activity filtering and ranking algorithms

2. **`components/SmartSuggestionCard.tsx`**
   - Individual suggestion display card
   - Shows activity details, distance, and timing
   - Quick add functionality

3. **`components/SmartSuggestionsPanel.tsx`**
   - Groups suggestions by time slots
   - Collapsible interface for each slot
   - Manages expanded/collapsed states

4. **Enhanced `AppContext`**
   - Manages smart suggestions state
   - Auto-generates suggestions when itinerary changes
   - Provides `addSmartSuggestion` functionality

## 📐 Algorithm Details

### Time Slot Detection
```typescript
// Finds gaps between consecutive events
for (let i = 0; i < sortedEvents.length - 1; i++) {
  const current = sortedEvents[i];
  const next = sortedEvents[i + 1];
  
  const slotStart = new Date(current.endTime);
  const slotEnd = new Date(next.startTime);
  const availableMinutes = (slotEnd.getTime() - slotStart.getTime()) / (1000 * 60);
  
  if (availableMinutes >= minSlotMinutes) {
    // Valid time slot found
  }
}
```

### Distance Calculation (Turf.js)
```typescript
export function calculateActivityDistance(
  activity1: { location: { lat: number; lng: number } },
  activity2: { location: { lat: number; lng: number } }
): number {
  const point1 = point([activity1.location.lng, activity1.location.lat]);
  const point2 = point([activity2.location.lng, activity2.location.lat]);
  
  return distance(point1, point2, { units: 'kilometers' });
}
```

### Activity Ranking
Activities are ranked by:
1. **Duration Fit**: Must fit within available time slot
2. **Distance**: Closest to previous or next activity gets highest priority
3. **Buffer Time**: 15-minute buffer included for travel/transitions

## 🎨 UI Components

### Smart Suggestion Card Features
- **Activity Image**: Visual preview
- **Smart Fit Badge**: Indicates algorithmic selection
- **Timing Information**: Suggested start/end times
- **Distance Metrics**: Shows distance to closest activity
- **Duration Validation**: Confirms activity fits in slot
- **Quick Add Button**: One-click integration

### Panel Organization
- **Slot Headers**: Show time range and available duration
- **Collapsible Sections**: Expandable suggestion groups
- **Activity Counters**: Number of suggestions per slot
- **Context Information**: Adjacent activity names

## 🔄 Integration Points

### Where Smart Suggestions Are Added to Itinerary

**Location**: `app/recommendations/page.tsx` → `handleAddToItinerary()`

**Process**:
1. User clicks "Add to Itinerary" on a recommendation card
2. `addItineraryEvent()` is called with new event
3. `AppContext` automatically regenerates smart suggestions
4. Smart suggestions update in real-time via `useMemo`

**Key Code**:
```typescript
// In handleAddToItinerary function
const itineraryEvent: ItineraryEvent = {
  id: `rec-${rec.id}-${Date.now()}`,
  title: rec.title,
  // ... other properties
  startTime,
  endTime,
  source: 'recommendation',
  recommendationId: rec.id,
};

addItineraryEvent(itineraryEvent); // This triggers smart suggestions update
```

### Smart Suggestions Integration Points

**AppContext Auto-Generation**:
```typescript
// Smart suggestions are automatically generated when itinerary changes
const smartSuggestions = React.useMemo(() => {
  if (itineraryEvents.length < 2 || availableRecommendations.length === 0) {
    return [];
  }
  
  const suggestions = generateSmartSuggestions(itineraryEvents, availableRecommendations);
  console.log('🧠 Generated smart suggestions:', suggestions.length);
  return suggestions;
}, [itineraryEvents, availableRecommendations]);
```

**ItineraryPanel Integration**:
```typescript
{/* Smart suggestions appear after events in itinerary */}
{events.length >= 2 && smartSuggestions.length > 0 && (
  <SmartSuggestionsPanel
    smartSuggestions={smartSuggestions}
    itineraryEvents={events}
    onAddSuggestion={onAddSmartSuggestion}
    onExpandSuggestion={onExpandSmartSuggestion}
  />
)}
```

## 📋 Requirements Met

### ✅ Duration Filtering
- **Implementation**: `parseDurationToMinutes()` function extracts duration from activity strings
- **Logic**: Only activities that fit within `slot.availableMinutes` are suggested
- **Buffer**: 15-minute buffer included for transitions

### ✅ Distance Optimization
- **Library**: Uses `@turf/turf` for precise geospatial calculations
- **Algorithm**: Calculates distance to both previous and next activities
- **Ranking**: Suggests activities with smallest distance to either adjacent activity

### ✅ Real-time Updates
- **Trigger**: Smart suggestions regenerate when `itineraryEvents` or `availableRecommendations` change
- **Performance**: Uses `React.useMemo` for efficient recalculation
- **UI**: Suggestions panel updates automatically without page refresh

## 🧪 Testing Scenarios

### Basic Functionality
1. **Add 2+ activities** to itinerary with gaps between them
2. **Check Smart Suggestions panel** appears at bottom of itinerary
3. **Verify distance calculations** show closest activities first
4. **Test quick add** functionality from suggestion cards

### Edge Cases
- **No gaps**: Should show no suggestions if activities are back-to-back
- **Short gaps**: Should filter out activities that don't fit
- **Single activity**: Should show no suggestions (need 2+ for gaps)
- **All activities used**: Should show no suggestions if all are in itinerary

## 🚀 Future Enhancements

### Potential Improvements
1. **Travel Mode Integration**: Consider walking, driving, public transit
2. **Preference Learning**: Remember user preferences for suggestion ranking
3. **Category Filtering**: Allow filtering suggestions by activity type
4. **Time Optimization**: Suggest optimal start times within slots
5. **Multi-day Support**: Handle suggestions across different days

### Performance Optimizations
1. **Memoization**: Cache distance calculations between sessions
2. **Virtualization**: Handle large numbers of suggestions efficiently
3. **Lazy Loading**: Load suggestion details on demand

## 📊 Console Logging

The feature includes comprehensive logging for debugging:

```
🧠 Generated smart suggestions: X for Y events
📅 Adding to itinerary: [Activity Name]
🔍 Recommendations in itinerary: [1, 2, 3]
🎯 Available recommendations: X / Y
```

## 🎛️ Configuration

### Customizable Parameters
- **Minimum slot duration**: `minSlotMinutes` (default: 30)
- **Buffer time**: `bufferMinutes` (default: 15)
- **Max suggestions per slot**: Currently 3, easily configurable
- **Distance units**: 'kilometers' (can be changed to 'miles')

### Environment Requirements
- **Turf.js**: Installed via `npm install @turf/turf @turf/distance`
- **React**: Uses `useMemo`, `useCallback` for performance
- **TypeScript**: Full type safety for all components

This feature transforms the static itinerary into an intelligent planning assistant that helps users optimize their travel experiences! 🎉
