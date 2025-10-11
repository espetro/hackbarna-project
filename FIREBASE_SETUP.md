# Firebase Setup for TetrisTravel

This guide explains how to set up Firebase and import suggested activities data for the TetrisTravel app.

## 🔥 Firebase Configuration

### 1. Create Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a project" or select existing project
3. Enable Firestore Database in your project

### 2. Get Configuration Keys
1. In Firebase Console, go to Project Settings (⚙️ icon)
2. Scroll down to "Your apps" section
3. Click "Web app" (</>) to create a web app
4. Copy the configuration object

### 3. Environment Variables
Add these to your `.env.local` file:

```bash
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# Optional: Google Calendar API (for calendar import feature)
NEXT_PUBLIC_GOOGLE_API_KEY=your_google_api_key_here

# Optional: Mapbox (for map display)
NEXT_PUBLIC_MAPBOX_KEY=your_mapbox_token_here
```

## 📊 Import Suggested Activities Data

### Option 1: Firebase Console (Recommended for beginners)
1. Open [Firebase Console](https://console.firebase.google.com/)
2. Go to Firestore Database
3. Click "Start collection"
4. Collection ID: `suggestedactivities`
5. Add documents manually using the data from `suggested-activities-sample.csv`

### Option 2: Import Script (Advanced users)
1. **Install Firebase Admin SDK:**
   ```bash
   npm install firebase-admin
   ```

2. **Get Service Account Key:**
   - Go to Firebase Console > Project Settings > Service Accounts
   - Click "Generate new private key"
   - Save as `firebase-admin-key.json` in project root

3. **Run Import Script:**
   ```bash
   node scripts/import-suggested-activities.js
   ```

### Option 3: Firestore Import Tool
1. **Install Firebase CLI:**
   ```bash
   npm install -g firebase-tools
   firebase login
   ```

2. **Convert CSV to JSON** (use online converter or script)

3. **Import to Firestore:**
   ```bash
   firebase firestore:delete --all-collections
   firebase firestore:import ./firestore-export
   ```

## 📝 Sample Data Structure

The CSV file contains 15 suggested activities with the following fields:

| Field | Description | Example |
|-------|-------------|---------|
| id | Unique identifier | 1, 2, 3... |
| title | Activity name | "Hidden City Food Tour" |
| description | Detailed description | "Explore local markets..." |
| image | Unsplash image URL | "https://images.unsplash.com/..." |
| locationLat | Latitude coordinate | 48.8566 |
| locationLng | Longitude coordinate | 2.3522 |
| duration | Activity duration | "3 hours" |
| price | Cost in euros | "€45" |

## 🗺️ Location Data

All sample locations are based in **Paris, France** with coordinates around:
- **Center**: 48.8566° N, 2.3522° E
- **Radius**: ~2km around central Paris
- **Areas covered**: Louvre, Marais, Saint-Germain, Montmartre

## 🔄 How It Works

1. **User searches** on inspiration page
2. **App loads** suggested activities from Firebase collection `suggestedactivities`
3. **Activities display** as swipeable cards on recommendations page
4. **User can add** activities to their personal itinerary
5. **Data persists** in localStorage (user-specific data)

## 🛠️ Firestore Security Rules

Add these security rules to allow read access to suggested activities:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow read access to suggested activities (public data)
    match /suggestedactivities/{document} {
      allow read: if true;
      allow write: if false; // Only admins can write
    }
    
    // User-specific data (if you add Firebase auth later)
    match /users/{userId}/{document=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

## 📱 Testing

After setup:
1. Start your Next.js app: `npm run dev`
2. Go to inspiration page and search for activities
3. App should load activities from Firebase instead of mock data
4. Check browser console for Firebase loading logs

## 🐛 Troubleshooting

**"Firebase not initialized" error:**
- Check your environment variables are correct
- Verify Firebase project settings
- Make sure Firestore is enabled

**"Permission denied" error:**
- Update Firestore security rules
- Make sure suggestedactivities collection exists

**"No activities loaded" error:**
- Check if documents exist in suggestedactivities collection
- Verify document structure matches the expected format
- Check browser network tab for Firebase API calls
