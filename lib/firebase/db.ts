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
    const activitiesRef = collection(db, 'suggestedactivities');
    const q = query(activitiesRef, orderBy('id', 'asc'));
    const snapshot = await getDocs(q);

    const activities: Recommendation[] = [];
    snapshot.forEach((doc) => {
      const data = doc.data();
      
      // Ensure coordinates are valid numbers
      const lat = typeof data.locationLat === 'string' ? parseFloat(data.locationLat) : data.locationLat;
      const lng = typeof data.locationLng === 'string' ? parseFloat(data.locationLng) : data.locationLng;
      
      // Validate coordinates before adding to activities
      if (
        typeof lat === 'number' && 
        typeof lng === 'number' && 
        !isNaN(lat) && 
        !isNaN(lng) &&
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
      } else {
        console.warn('⚠️ Skipping activity with invalid coordinates:', {
          id: data.id,
          title: data.title,
          lat: data.locationLat,
          lng: data.locationLng
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
