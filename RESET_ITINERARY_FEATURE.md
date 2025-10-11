# Reset Itinerary Feature

## Overview

Added a reset itinerary button near the Google Calendar import button that allows users to clear their entire itinerary and return to the preferences selection page.

## 🔴 Reset Button Location

The reset button appears in the **itinerary panel header**, positioned between the Google Calendar sync button and the close button.

### Visual Design
- **🔴 Red circular button** with reset/refresh icon
- **Red color scheme**: `bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400`
- **Hover effects**: `hover:bg-red-200 dark:hover:bg-red-800/40`
- **Tooltip**: "Clear all activities and go back to preferences"

## 🎯 Functionality

### When Reset Button Appears
- ✅ **Only when itinerary has events** (`events.length > 0`)
- ✅ **Only when `onResetItinerary` function is provided**
- ❌ **Hidden when itinerary is empty** (nothing to reset)

### Reset Workflow

1. **🔔 Confirmation Dialog**
   ```javascript
   const confirmReset = window.confirm(
     'Are you sure you want to reset your itinerary? This will clear all activities and take you back to preferences selection.'
   );
   ```

2. **🧹 Clear All Data**
   - Calls `clearItinerary()` from AppContext
   - Removes all itinerary events (recommendations + calendar imports)
   - Persists changes to localStorage/Firebase

3. **📱 UI Updates**
   - Closes itinerary panel immediately
   - Shows success toast: "Itinerary reset successfully"
   - Toast displays for 2 seconds

4. **🔄 Navigation**
   - Redirects to `/favorites` page after 1 second delay
   - User can re-select their preferences and start fresh

## 🏗️ Implementation Details

### Component Changes

**`components/ItineraryPanel.tsx`:**
```typescript
interface ItineraryPanelProps {
  // ... existing props
  onResetItinerary?: () => void; // New optional prop
}

// Reset button in header
{events.length > 0 && onResetItinerary && (
  <button
    onClick={onResetItinerary}
    className="p-2 rounded-full transition-all bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-800/40"
    aria-label="Reset itinerary"
    title="Clear all activities and go back to preferences"
  >
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
    </svg>
  </button>
)}
```

**`app/recommendations/page.tsx`:**
```typescript
// Added clearItinerary to context
const { clearItinerary, /* other context */ } = useAppContext();

// Reset function
const handleResetItinerary = () => {
  const confirmReset = window.confirm('...');
  
  if (confirmReset) {
    clearItinerary();
    setIsItineraryOpen(false);
    setToastMessage('Itinerary reset successfully');
    setShowToast(true);
    setTimeout(() => setShowToast(false), 2000);
    setTimeout(() => router.push('/favorites'), 1000);
  }
};

// Pass to ItineraryPanel
<ItineraryPanel
  onResetItinerary={handleResetItinerary}
  // ... other props
/>
```

## 🎨 Visual Design Details

### Button Positioning
```
[Calendar Sync] [Reset] [Close]
     🗓️         🔄      ✕
```

### Color Scheme
- **Background**: Light red (`red-100`) / Dark red (`red-900/30`)
- **Text/Icon**: Medium red (`red-600`) / Light red (`red-400`)
- **Hover**: Darker red background for feedback

### Icon
- **SVG**: Circular arrow refresh icon from Heroicons
- **Size**: `w-5 h-5` (20x20px)
- **Style**: Outlined stroke design

## 🔄 User Experience Flow

```
User Journey:
1. User builds itinerary with multiple activities
2. User opens itinerary panel 
3. User sees reset button (🔄) in header
4. User clicks reset button
5. Confirmation dialog appears
6. User confirms reset
7. Itinerary clears + success toast shows
8. User redirected to preferences page
9. User can start fresh with new preferences
```

## ✨ Benefits

### For Users
- ✅ **Easy Reset**: One-click access to start over
- ✅ **Safe Reset**: Confirmation prevents accidents  
- ✅ **Clear Feedback**: Toast notification confirms action
- ✅ **Logical Flow**: Returns to natural starting point (preferences)

### For UX
- ✅ **Discoverable**: Positioned near related actions
- ✅ **Recognizable**: Standard red color + refresh icon
- ✅ **Non-destructive**: Requires confirmation
- ✅ **Complete**: Handles all cleanup automatically

## 🧪 Testing Scenarios

### Functional Tests
1. **Empty itinerary**: Reset button should not appear
2. **With events**: Reset button should appear and be clickable
3. **Confirm reset**: Should clear itinerary and redirect
4. **Cancel reset**: Should do nothing and stay on page
5. **Toast display**: Success message should appear and disappear

### Edge Cases
- **Multiple event types**: Should clear recommendations + calendar events
- **Smart suggestions**: Should regenerate after reset
- **Local storage**: Should persist reset state
- **Navigation**: Should work from any itinerary state

## 🚀 Future Enhancements

### Potential Improvements
1. **Selective Reset**: Option to keep calendar events, reset only recommendations
2. **Backup/Restore**: Save itinerary before reset with restore option
3. **Export Before Reset**: Allow user to export itinerary before clearing
4. **Reset Reasons**: Track why users reset (analytics)
5. **Undo Reset**: Short-term undo functionality

This feature provides users with a clean, safe way to restart their itinerary planning process! 🎉
