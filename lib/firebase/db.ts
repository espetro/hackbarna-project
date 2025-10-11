import {
  collection,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  query,
  where,
  orderBy,
  Timestamp,
  writeBatch,
} from 'firebase/firestore';
import { db } from './config';
import type { ItineraryEvent, Recommendation } from '../types';
import type { Attraction } from '../context/AppContext';

const DEFAULT_USER_ID = 'default-user';

/**
 * Collections in Firestore:
 * - users/{userId}
 * - users/{userId}/favorites/{favoriteId}
 * - users/{userId}/itinerary/{eventId}
 * - suggestedactivities/{activityId} (global collection)
 */

// ==================== USER ====================

/**
 * Get or create user document
 */
export async function getOrCreateUser(userId: string = DEFAULT_USER_ID) {
  const userRef = doc(db, 'users', userId);
  const userSnap = await getDoc(userRef);

  if (!userSnap.exists()) {
    await setDoc(userRef, {
      id: userId,
      name: 'Demo User',
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });
  }

  return userRef;
}

// ==================== FAVORITES ====================

/**
 * Save user favorites (replaces all)
 */
export async function saveFavorites(
  attractions: Attraction[],
  userId: string = DEFAULT_USER_ID
): Promise<void> {
  try {
    // Ensure user exists
    await getOrCreateUser(userId);

    const favoritesRef = collection(db, 'users', userId, 'favorites');

    // Use batch to delete all and create new ones
    const batch = writeBatch(db);

    // Delete all existing favorites
    const existingFavorites = await getDocs(favoritesRef);
    existingFavorites.forEach((doc) => {
      batch.delete(doc.ref);
    });

    // Add new favorites
    attractions.forEach((attraction) => {
      const favoriteRef = doc(favoritesRef, attraction.id.toString());
      batch.set(favoriteRef, {
        id: attraction.id,
        src: attraction.src,
        alt: attraction.alt,
        createdAt: Timestamp.now(),
      });
    });

    await batch.commit();
    console.log('✅ Saved', attractions.length, 'favorites to Firebase');
  } catch (error) {
    console.error('❌ Error saving favorites:', error);
    throw error;
  }
}

/**
 * Get user favorites
 */
export async function getFavorites(
  userId: string = DEFAULT_USER_ID
): Promise<Attraction[]> {
  try {
    const favoritesRef = collection(db, 'users', userId, 'favorites');
    const snapshot = await getDocs(favoritesRef);

    const favorites: Attraction[] = [];
    snapshot.forEach((doc) => {
      const data = doc.data();
      favorites.push({
        id: data.id,
        src: data.src,
        alt: data.alt,
      });
    });

    console.log('📥 Loaded', favorites.length, 'favorites from Firebase');
    return favorites;
  } catch (error) {
    console.error('❌ Error loading favorites:', error);
    return [];
  }
}

// ==================== ITINERARY ====================

/**
 * Get all itinerary events for user
 */
export async function getItineraryEvents(
  userId: string = DEFAULT_USER_ID
): Promise<ItineraryEvent[]> {
  try {
    const itineraryRef = collection(db, 'users', userId, 'itinerary');
    const q = query(itineraryRef, orderBy('startTime', 'asc'));
    const snapshot = await getDocs(q);

    const events: ItineraryEvent[] = [];
    snapshot.forEach((doc) => {
      const data = doc.data();
      events.push({
        id: data.id,
        title: data.title,
        description: data.description || '',
        location: {
          name: data.locationName,
          lat: data.locationLat,
          lng: data.locationLng,
        },
        startTime: data.startTime.toDate(),
        endTime: data.endTime.toDate(),
        source: data.source,
        recommendationId: data.recommendationId,
        image: data.image,
      });
    });

    console.log('📥 Loaded', events.length, 'events from Firebase');
    return events;
  } catch (error) {
    console.error('❌ Error loading itinerary:', error);
    return [];
  }
}

/**
 * Add single event to itinerary
 */
export async function addItineraryEvent(
  event: ItineraryEvent,
  userId: string = DEFAULT_USER_ID
): Promise<void> {
  try {
    // Ensure user exists
    await getOrCreateUser(userId);

    const eventRef = doc(db, 'users', userId, 'itinerary', event.id);

    await setDoc(eventRef, {
      id: event.id,
      title: event.title,
      description: event.description || '',
      locationName: event.location.name,
      locationLat: event.location.lat,
      locationLng: event.location.lng,
      startTime: Timestamp.fromDate(event.startTime),
      endTime: Timestamp.fromDate(event.endTime),
      source: event.source,
      recommendationId: event.recommendationId || null,
      image: event.image || null,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });

    console.log('✅ Added event to Firebase:', event.title);
  } catch (error) {
    console.error('❌ Error adding event:', error);
    throw error;
  }
}

/**
 * Remove event from itinerary
 */
export async function removeItineraryEvent(
  eventId: string,
  userId: string = DEFAULT_USER_ID
): Promise<void> {
  try {
    const eventRef = doc(db, 'users', userId, 'itinerary', eventId);
    await deleteDoc(eventRef);
    console.log('✅ Removed event from Firebase:', eventId);
  } catch (error) {
    console.error('❌ Error removing event:', error);
    throw error;
  }
}

/**
 * Import multiple events (batch)
 */
export async function importItineraryEvents(
  events: ItineraryEvent[],
  userId: string = DEFAULT_USER_ID
): Promise<void> {
  try {
    // Ensure user exists
    await getOrCreateUser(userId);

    const batch = writeBatch(db);

    events.forEach((event) => {
      const eventRef = doc(db, 'users', userId, 'itinerary', event.id);
      batch.set(eventRef, {
        id: event.id,
        title: event.title,
        description: event.description || '',
        locationName: event.location.name,
        locationLat: event.location.lat,
        locationLng: event.location.lng,
        startTime: Timestamp.fromDate(event.startTime),
        endTime: Timestamp.fromDate(event.endTime),
        source: event.source,
        recommendationId: event.recommendationId || null,
        image: event.image || null,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });
    });

    await batch.commit();
    console.log('✅ Imported', events.length, 'events to Firebase');
  } catch (error) {
    console.error('❌ Error importing events:', error);
    throw error;
  }
}

/**
 * Clear all itinerary events
 */
export async function clearItinerary(
  userId: string = DEFAULT_USER_ID
): Promise<void> {
  try {
    const itineraryRef = collection(db, 'users', userId, 'itinerary');
    const snapshot = await getDocs(itineraryRef);

    const batch = writeBatch(db);
    snapshot.forEach((doc) => {
      batch.delete(doc.ref);
    });

    await batch.commit();
    console.log('✅ Cleared itinerary in Firebase');
  } catch (error) {
    console.error('❌ Error clearing itinerary:', error);
    throw error;
  }
}

// ==================== SUGGESTED ACTIVITIES ====================

/**
 * Get all suggested activities from the global collection
 */
export async function getSuggestedActivities(): Promise<Recommendation[]> {
  try {
    // Check if Firebase is properly initialized
    if (!db) {
      console.warn('⚠️ Firebase not initialized. Cannot fetch suggested activities.');
      throw new Error('Firebase not configured - missing environment variables');
    }

    const activitiesRef = collection(db, 'suggestedactivities');
    const q = query(activitiesRef, orderBy('id', 'asc'));
    const snapshot = await getDocs(q);

    const activities: Recommendation[] = [];
    snapshot.forEach((doc) => {
      const data = doc.data();
      
      // Helper function to fix coordinates with missing decimal points
      const fixCoordinate = (coordStr: string | number, isLatitude: boolean): number | null => {
        if (typeof coordStr === 'number') {
          coordStr = coordStr.toString();
        }
        
        if (typeof coordStr !== 'string') {
          return null;
        }
        
        // Remove any whitespace
        coordStr = coordStr.trim();
        
        // Try parsing as-is first
        let coord = parseFloat(coordStr);
        
        if (isNaN(coord)) {
          return null;
        }
        
        // Check if coordinate is already in valid range
        if (isLatitude && coord >= -90 && coord <= 90) {
          return coord;
        }
        if (!isLatitude && coord >= -180 && coord <= 180) {
          return coord;
        }
        
        // If coordinate is out of range, try to fix by adding decimal point
        const coordString = Math.abs(coord).toString();
        
        if (isLatitude) {
          // For latitude: expected format like 48.xxxx (Paris), so 488589 → 48.8589
          if (coordString.length >= 3) {
            const fixed = parseFloat(coordString.slice(0, 2) + '.' + coordString.slice(2));
            if (fixed >= -90 && fixed <= 90) {
              return coord < 0 ? -fixed : fixed;
            }
          }
        } else {
          // For longitude: expected format like 2.xxxx (Paris), so 23469 → 2.3469
          if (coordString.length >= 2) {
            let decimalPos = 1;
            // For larger numbers, might need decimal after 2 digits (e.g., European coords)
            if (coordString.length >= 4 && coordString.startsWith('1')) {
              decimalPos = 2; // e.g., 123456 → 12.3456 
            }
            
            const fixed = parseFloat(coordString.slice(0, decimalPos) + '.' + coordString.slice(decimalPos));
            if (fixed >= -180 && fixed <= 180) {
              return coord < 0 ? -fixed : fixed;
            }
          }
        }
        
        return null; // Could not fix coordinate
      };
      
      // Parse and fix coordinates
      const lat = fixCoordinate(data.locationLat, true);
      const lng = fixCoordinate(data.locationLng, false);
      
      // Validate coordinates before adding to activities
      if (
        lat !== null && 
        lng !== null &&
        lat >= -90 && lat <= 90 &&
        lng >= -180 && lng <= 180
      ) {
        activities.push({
          id: data.id,
          title: data.title,
          description: data.description,
          image: data.image,
          location: {
            lat: lat,
            lng: lng,
          },
          duration: data.duration,
          price: data.price,
        });
        
        // Debug log successful coordinate parsing
        if (data.locationLat !== lat || data.locationLng !== lng) {
          console.log(`✅ Fixed coordinates for "${data.title}": ${data.locationLat},${data.locationLng} → ${lat},${lng}`);
        }
      } else {
        console.warn('⚠️ Skipping activity with invalid coordinates:', {
          id: data.id,
          title: data.title,
          originalLat: data.locationLat,
          originalLng: data.locationLng,
          parsedLat: lat,
          parsedLng: lng
        });
      }
    });

    console.log('📥 Loaded', activities.length, 'suggested activities from Firebase');
    return activities;
  } catch (error) {
    console.error('❌ Error loading suggested activities:', error);
    return [];
  }
}

/**
 * Add a new suggested activity (admin function)
 */
export async function addSuggestedActivity(activity: Recommendation): Promise<void> {
  try {
    const activityRef = doc(db, 'suggestedactivities', activity.id.toString());
    
    await setDoc(activityRef, {
      id: activity.id,
      title: activity.title,
      description: activity.description,
      image: activity.image,
      locationLat: activity.location.lat,
      locationLng: activity.location.lng,
      duration: activity.duration || '',
      price: activity.price || '',
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });

    console.log('✅ Added suggested activity to Firebase:', activity.title);
  } catch (error) {
    console.error('❌ Error adding suggested activity:', error);
    throw error;
  }
}

/**
 * Batch import suggested activities from CSV data (admin function)
 */
export async function importSuggestedActivities(activities: Recommendation[]): Promise<void> {
  try {
    const batch = writeBatch(db);

    activities.forEach((activity) => {
      const activityRef = doc(db, 'suggestedactivities', activity.id.toString());
      batch.set(activityRef, {
        id: activity.id,
        title: activity.title,
        description: activity.description,
        image: activity.image,
        locationLat: activity.location.lat,
        locationLng: activity.location.lng,
        duration: activity.duration || '',
        price: activity.price || '',
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });
    });

    await batch.commit();
    console.log('✅ Imported', activities.length, 'suggested activities to Firebase');
  } catch (error) {
    console.error('❌ Error importing suggested activities:', error);
    throw error;
  }
}

// ==================== WEBHOOK ACTIVITIES ====================

/**
 * Save webhook-generated activities to user's collection
 * This allows persistence of AI-generated recommendations
 */
export async function saveWebhookActivities(
  activities: Recommendation[],
  userId: string,
  sessionId: string
): Promise<void> {
  try {
    if (!db) {
      console.warn('⚠️ Firebase not initialized. Cannot save webhook activities.');
      return;
    }

    // Ensure user exists
    await getOrCreateUser(userId);

    const batch = writeBatch(db);

    // Save to user's webhook activities collection
    activities.forEach((activity) => {
      const activityRef = doc(
        db,
        'users',
        userId,
        'webhookactivities',
        `${sessionId}-${activity.id}`
      );
      batch.set(activityRef, {
        id: activity.id,
        sessionId: activity.sessionId || sessionId, // Use sessionId from activity or fallback
        title: activity.title,
        description: activity.description,
        image: activity.image,
        locationLat: activity.location.lat,
        locationLng: activity.location.lng,
        duration: activity.duration || '',
        price: activity.price || '',
        createdAt: Timestamp.now(),
      });
    });

    await batch.commit();
    console.log('✅ Saved', activities.length, 'webhook activities to Firebase for user:', userId, 'session:', sessionId);
  } catch (error) {
    console.error('❌ Error saving webhook activities:', error);
    // Don't throw - allow the app to continue even if Firebase save fails
  }
}

/**
 * Get webhook activities for a user session
 */
export async function getWebhookActivities(
  userId: string,
  sessionId?: string
): Promise<Recommendation[]> {
  try {
    if (!db) {
      console.warn('⚠️ Firebase not initialized. Cannot fetch webhook activities.');
      return [];
    }

    const activitiesRef = collection(db, 'users', userId, 'webhookactivities');

    let q;
    if (sessionId) {
      q = query(
        activitiesRef,
        where('sessionId', '==', sessionId),
        orderBy('createdAt', 'desc')
      );
    } else {
      q = query(activitiesRef, orderBy('createdAt', 'desc'));
    }

    const snapshot = await getDocs(q);

    const activities: Recommendation[] = [];
    snapshot.forEach((doc) => {
      const data = doc.data();
      activities.push({
        id: data.id,
        title: data.title,
        description: data.description,
        image: data.image,
        location: {
          lat: data.locationLat,
          lng: data.locationLng,
        },
        duration: data.duration,
        price: data.price,
        sessionId: data.sessionId, // Include sessionId for filtering
      });
    });

    console.log('📥 Loaded', activities.length, 'webhook activities from Firebase');
    return activities;
  } catch (error) {
    console.error('❌ Error loading webhook activities:', error);
    return [];
  }
}
