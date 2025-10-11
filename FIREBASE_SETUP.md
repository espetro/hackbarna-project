# Firebase Setup Guide

## Current Status

✅ **Fixed:** Firebase initialization errors have been resolved. The app now gracefully handles missing Firebase credentials and falls back to mock data.

## What Was Fixed

1. **"Failed to fetch" TypeError** - Fixed by updating Firebase config to check for environment variables
2. **"Cannot read properties of undefined (reading 'call')" Runtime TypeError** - Fixed by adding null safety checks in database functions

## To Enable Full Firebase Functionality

The app currently works with mock data, but to enable the full Firebase integration for suggested activities, you'll need to:

### 1. Create `.env.local` file in project root

Create a file named `.env.local` in the project root with these variables:

```bash
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id_here
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id_here
NEXT_PUBLIC_FIREBASE_APP_ID=your_firebase_app_id_here

# Optional: Other API keys
NEXT_PUBLIC_MAPBOX_KEY=your_mapbox_key_here
NEXT_PUBLIC_GOOGLE_API_KEY=your_google_api_key_here
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id_here
```

### 2. Get Firebase Credentials

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project (or create a new one)
3. Go to **Project Settings** → **General** → **Your apps**
4. Copy the config values to your `.env.local` file

### 3. Firestore Database Structure

Your Firestore should have this collection structure:

```
📁 suggestedactivities (collection)
  📄 activity1 (document)
    - id: 1
    - title: "Activity Name"
    - description: "Activity description"
    - image: "image_url"
    - locationLat: 48.8566 (or 488566 - will be auto-fixed)
    - locationLng: 2.3522 (or 23522 - will be auto-fixed)
    - duration: "2 hours"
    - price: "€25"
```

### 4. CSV Upload Reference

You mentioned uploading a CSV to Firebase. The expected CSV format should be:

```csv
id,title,description,image,locationLat,locationLng,duration,price
1,"Sagrada Familia Tour","Visit Gaudí's masterpiece","https://...",41.4036,2.1744,"2 hours","€25"
```

## Current App Behavior

- ✅ App loads without errors
- ✅ Uses mock data when Firebase is not configured
- ✅ Shows clear console warnings about missing Firebase config
- ✅ Gracefully falls back to mock data if Firebase fails
- ✅ All itinerary and map features work normally

## Console Messages

You should see these helpful messages in the browser console:

```
⚠️ Firebase not configured. Missing environment variables in .env.local:
- NEXT_PUBLIC_FIREBASE_API_KEY
- NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
- etc...
```

When Firebase is properly configured, you'll see:
```
✅ Firebase initialized successfully
📥 Loaded X suggested activities from Firebase
```

## Need Help?

If you have your Firebase credentials and need help setting them up, just share them and I can help you configure the `.env.local` file properly.