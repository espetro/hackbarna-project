// Webhook service for TetrisTravel

import { Recommendation } from './types';

export interface WebhookRequest {
  chatInput: string;
  sessionID: string;
}

export interface WebhookActivity {
  id?: number;
  title: string;
  description: string;
  image?: string;
  location?: {
    lat: number;
    lng: number;
  };
  locationLat?: number;
  locationLng?: number;
  duration?: string;
  price?: string;
}

/**
 * Generate a random session ID
 */
export function generateSessionId(): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 10);
  return `${timestamp}-${random}`;
}

/**
 * Send user query and preferences to webhook
 */
export async function sendWebhookRequest(
  userQuery: string,
  favoriteActivities: string[]
): Promise<any> {
  const webhookUrl = process.env.NEXT_PUBLIC_WEBHOOK;
  const webhookUser = process.env.NEXT_PUBLIC_WEBHOOK_USER;
  const webhookPassword = process.env.NEXT_PUBLIC_WEBHOOK_PASSWORD;

  if (!webhookUrl) {
    throw new Error('Webhook URL not configured');
  }

  // Generate session ID
  const sessionID = generateSessionId();

  // Format the chat input with user query and preferences
  let chatInput = userQuery;

  if (favoriteActivities.length > 0) {
    chatInput += `. The user's selected favorite movies are: ${favoriteActivities.join(', ')}. Use these preferences to personalize the recommendations.`;
  }

  const requestBody: WebhookRequest = {
    chatInput,
    sessionID,
  };

  console.log('🚀 Sending webhook request:', { sessionID, chatInput });

  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(webhookUser && webhookPassword && {
          'Authorization': `Basic ${btoa(`${webhookUser}:${webhookPassword}`)}`
        }),
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      throw new Error(`Webhook request failed: ${response.status} ${response.statusText}`);
    }

    const responseData = await response.json();
    console.log('✅ Webhook response received:', responseData);

    return responseData;
  } catch (error) {
    console.error('❌ Webhook request failed:', error);
    throw error;
  }
}

/**
 * Parse webhook response to extract and normalize recommendations
 * Handles the new format with output.stations structure
 */
export function parseWebhookResponse(webhookResponse: any, sessionId: string): Recommendation[] {
  try {
    console.log('📋 Parsing webhook response...', webhookResponse);

    const recommendations: Recommendation[] = [];

    // Handle single object with output.stations structure
    if (webhookResponse?.output?.stations && Array.isArray(webhookResponse.output.stations)) {
      const stations = webhookResponse.output.stations;
      const location = webhookResponse.output.location || 'Unknown Location';

      console.log(`📍 Processing ${stations.length} stations for ${location}`);

      // Filter and process only attraction and restaurant stations
      stations.forEach((station: any, stationIndex: number) => {
        if (station.type === 'attraction' || station.type === 'restaurant') {
          // Generate unique ID
          const id = Date.now() + stationIndex;

          // Extract coordinates from array [lat, lng]
          let lat = 0;
          let lng = 0;

          if (Array.isArray(station.coordinates) && station.coordinates.length >= 2) {
            lat = station.coordinates[0];
            lng = station.coordinates[1];
          }

          // Validate required fields
          if (!station.title || !station.description) {
            console.warn('⚠️ Skipping station with missing title or description:', station);
            return;
          }

          // Validate coordinates
          if (lat === 0 || lng === 0 || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
            console.warn('⚠️ Station has invalid coordinates:', {
              title: station.title,
              lat,
              lng
            });
          }

          // Calculate duration from start and end times
          const durationHours = station.end - station.start;
          const durationMinutes = Math.round(durationHours * 60);
          const duration = durationMinutes < 60
            ? `${durationMinutes} minutes`
            : `${durationHours.toFixed(1)} hours`;

          // Validate and normalize image URL
          let imageUrl = '/assets/placeholder.jpg';
          if (station.image && typeof station.image === 'string') {
            const img = station.image.trim();
            // Check if it's a valid HTTP/HTTPS URL and not a transport type
            if (img.startsWith('http://') || img.startsWith('https://')) {
              if (img !== 'taxi' && img !== 'walking') {
                imageUrl = img;
                console.log(`✅ Valid image URL for "${station.title}":`, imageUrl);
              } else {
                console.log(`⚠️ Skipping transport image for "${station.title}":`, img);
              }
            } else {
              console.log(`⚠️ Invalid image URL for "${station.title}":`, img);
            }
          } else {
            console.log(`📷 No image provided for "${station.title}", using placeholder`);
          }

          recommendations.push({
            id,
            title: station.title,
            description: station.description,
            image: imageUrl,
            location: {
              lat,
              lng,
            },
            duration,
            price: '$$', // Default price since not provided in new format
            sessionId, // Include session ID for filtering
          });
        }
      });
    }
    // Handle array of responses with output.stations structure
    else if (Array.isArray(webhookResponse)) {
      webhookResponse.forEach((item, responseIndex) => {
        // Check if item has output.stations structure
        if (item?.output?.stations && Array.isArray(item.output.stations)) {
          const stations = item.output.stations;
          const location = item.output.location || 'Unknown Location';

          console.log(`📍 Processing ${stations.length} stations for ${location}`);

          // Filter and process only attraction and restaurant stations
          stations.forEach((station: any, stationIndex: number) => {
            if (station.type === 'attraction' || station.type === 'restaurant') {
              // Generate unique ID
              const id = Date.now() + (responseIndex * 1000) + stationIndex;

              // Extract coordinates from array [lat, lng]
              let lat = 0;
              let lng = 0;

              if (Array.isArray(station.coordinates) && station.coordinates.length >= 2) {
                lat = station.coordinates[0];
                lng = station.coordinates[1];
              }

              // Validate required fields
              if (!station.title || !station.description) {
                console.warn('⚠️ Skipping station with missing title or description:', station);
                return;
              }

              // Validate coordinates
              if (lat === 0 || lng === 0 || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
                console.warn('⚠️ Station has invalid coordinates:', {
                  title: station.title,
                  lat,
                  lng
                });
              }

              // Calculate duration from start and end times
              const durationHours = station.end - station.start;
              const durationMinutes = Math.round(durationHours * 60);
              const duration = durationMinutes < 60
                ? `${durationMinutes} minutes`
                : `${durationHours.toFixed(1)} hours`;

              // Validate and normalize image URL
              let imageUrl = '/assets/placeholder.jpg';
              if (station.image && typeof station.image === 'string') {
                const img = station.image.trim();
                // Check if it's a valid HTTP/HTTPS URL and not a transport type
                if (img.startsWith('http://') || img.startsWith('https://')) {
                  if (img !== 'taxi' && img !== 'walking') {
                    imageUrl = img;
                  }
                }
              }

              recommendations.push({
                id,
                title: station.title,
                description: station.description,
                image: imageUrl,
                location: {
                  lat,
                  lng,
                },
                duration,
                price: '$$', // Default price since not provided in new format
                sessionId, // Include session ID for filtering
              });
            }
          });
        }
      });
    }

    // Fallback: Try legacy format if no recommendations found
    if (recommendations.length === 0) {
      console.log('⚠️ No stations found, trying legacy format...');
      return parseLegacyFormat(webhookResponse, sessionId);
    }

    console.log(`✅ Parsed ${recommendations.length} recommendations from webhook response`);
    return recommendations;
  } catch (error) {
    console.error('❌ Error parsing webhook response:', error);
    return [];
  }
}

/**
 * Legacy parser for backward compatibility
 */
function parseLegacyFormat(webhookResponse: any, sessionId: string): Recommendation[] {
  let activities: WebhookActivity[] = [];

  // If response is directly an array
  if (Array.isArray(webhookResponse)) {
    activities = webhookResponse;
  }
  // If response has an 'activities' property
  else if (webhookResponse?.activities && Array.isArray(webhookResponse.activities)) {
    activities = webhookResponse.activities;
  }
  // If response has a 'data' property
  else if (webhookResponse?.data && Array.isArray(webhookResponse.data)) {
    activities = webhookResponse.data;
  }
  // If response has a 'recommendations' property
  else if (webhookResponse?.recommendations && Array.isArray(webhookResponse.recommendations)) {
    activities = webhookResponse.recommendations;
  }
  // If response has a 'results' property
  else if (webhookResponse?.results && Array.isArray(webhookResponse.results)) {
    activities = webhookResponse.results;
  }
  else {
    console.warn('⚠️ Unexpected webhook response format:', webhookResponse);
    return [];
  }

  if (!activities || activities.length === 0) {
    console.warn('⚠️ No activities found in webhook response');
    return [];
  }

  // Map webhook activities to Recommendation format
  const recommendations: Recommendation[] = activities
    .map((activity, index) => {
      // Determine ID - use existing or generate
      const id = activity.id || (Date.now() + index);

      // Extract location coordinates
      let lat = 0;
      let lng = 0;

      if (activity.location?.lat && activity.location?.lng) {
        lat = activity.location.lat;
        lng = activity.location.lng;
      } else if (activity.locationLat && activity.locationLng) {
        lat = activity.locationLat;
        lng = activity.locationLng;
      }

      // Validate required fields
      if (!activity.title || !activity.description) {
        console.warn('⚠️ Skipping activity with missing title or description:', activity);
        return null;
      }

      // Validate coordinates
      if (lat === 0 || lng === 0 || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
        console.warn('⚠️ Activity has invalid coordinates:', {
          title: activity.title,
          lat,
          lng
        });
      }

      // Validate and normalize image URL
      let imageUrl = '/assets/placeholder.jpg';
      if (activity.image && typeof activity.image === 'string') {
        const img = activity.image.trim();
        // Check if it's a valid HTTP/HTTPS URL
        if (img.startsWith('http://') || img.startsWith('https://')) {
          imageUrl = img;
        }
      }

      return {
        id,
        title: activity.title,
        description: activity.description,
        image: imageUrl,
        location: {
          lat,
          lng,
        },
        duration: activity.duration || '1-2 hours',
        price: activity.price || '$$',
        sessionId,
      } as Recommendation;
    })
    .filter((rec): rec is Recommendation => rec !== null);

  console.log(`✅ Parsed ${recommendations.length} recommendations from legacy format`);
  return recommendations;
}
