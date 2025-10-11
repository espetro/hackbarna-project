'use client';

import React, { useState, useCallback, useEffect, useRef } from 'react';
import Map, { Marker, NavigationControl, Source, Layer } from 'react-map-gl/mapbox';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Recommendation, ItineraryEvent } from '@/lib/types';
import type { MapRef } from 'react-map-gl/mapbox';

interface MapViewProps {
  recommendations: Recommendation[];
  selectedId: number | null;
  onMarkerClick: (id: number) => void;
  itineraryEvents?: ItineraryEvent[];
  onItineraryMarkerClick?: (event: ItineraryEvent) => void;
}

export default function MapView({ 
  recommendations, 
  selectedId, 
  onMarkerClick,
  itineraryEvents = [],
  onItineraryMarkerClick 
}: MapViewProps) {
  const mapRef = useRef<MapRef>(null);

  // Default to Paris coordinates
  const [viewState, setViewState] = useState({
    longitude: 2.3522,
    latitude: 48.8566,
    zoom: 12
  });

  const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_KEY;

  // Helper function to validate coordinates
  const isValidCoordinate = (lat: number, lng: number): boolean => {
    return (
      typeof lat === 'number' && 
      typeof lng === 'number' && 
      !isNaN(lat) && 
      !isNaN(lng) && 
      lat >= -90 && 
      lat <= 90 && 
      lng >= -180 && 
      lng <= 180
    );
  };

  // Filter out recommendations with invalid coordinates
  const validRecommendations = recommendations.filter(rec => 
    isValidCoordinate(rec.location.lat, rec.location.lng)
  );

  // Filter out itinerary events with invalid coordinates
  const validItineraryEvents = itineraryEvents.filter(event => 
    isValidCoordinate(event.location.lat, event.location.lng)
  );

  // Log any invalid coordinates for debugging
  React.useEffect(() => {
    const invalidRecs = recommendations.filter(rec => 
      !isValidCoordinate(rec.location.lat, rec.location.lng)
    );
    const invalidEvents = itineraryEvents.filter(event => 
      !isValidCoordinate(event.location.lat, event.location.lng)
    );

    if (invalidRecs.length > 0) {
      console.warn('⚠️ Found recommendations with invalid coordinates:', invalidRecs.map(r => ({
        id: r.id,
        title: r.title,
        lat: r.location.lat,
        lng: r.location.lng
      })));
    }

    if (invalidEvents.length > 0) {
      console.warn('⚠️ Found itinerary events with invalid coordinates:', invalidEvents.map(e => ({
        id: e.id,
        title: e.title,
        lat: e.location.lat,
        lng: e.location.lng
      })));
    }
  }, [recommendations, itineraryEvents]);

  // Auto-zoom to fit all markers when recommendations or itinerary events change
  useEffect(() => {
    // Use only valid coordinates for map bounds
    const allValidLocations = [
      ...validRecommendations.map(r => ({ lng: r.location.lng, lat: r.location.lat })),
      ...validItineraryEvents.map(e => ({ lng: e.location.lng, lat: e.location.lat }))
    ];

    if (allValidLocations.length > 0 && mapRef.current) {
      const bounds = allValidLocations.reduce(
        (bounds, loc) => {
          return bounds.extend([loc.lng, loc.lat]);
        },
        new mapboxgl.LngLatBounds(
          [allValidLocations[0].lng, allValidLocations[0].lat],
          [allValidLocations[0].lng, allValidLocations[0].lat]
        )
      );

      // Offset map center 20% above midpoint by adding more bottom padding
      // This prevents cards from covering the markers and itinerary pins
      const viewportHeight = mapRef.current.getMap().getContainer().clientHeight;
      const offsetPadding = viewportHeight * 0.2; // 20% offset
      
      mapRef.current.fitBounds(bounds, {
        padding: { 
          top: 100, 
          bottom: 100 + offsetPadding, // Extra padding at bottom to shift view up
          left: 100, 
          right: 100 
        },
        duration: 1000
      });
    }
  }, [validRecommendations, validItineraryEvents]);

  // Itinerary hook - re-render when itinerary changes
  useEffect(() => {
    // Force map to update when itinerary changes
    if (mapRef.current) {
      mapRef.current.getMap().triggerRepaint();
    }
  }, [itineraryEvents]);

  // Create GeoJSON for the itinerary route line (connecting valid itinerary events in order)
  const itineraryRouteGeoJSON = {
    type: 'Feature' as const,
    geometry: {
      type: 'LineString' as const,
      coordinates: validItineraryEvents.map(event => [event.location.lng, event.location.lat])
    },
    properties: {}
  };


  // If no Mapbox token, show error message
  if (!mapboxToken) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-200">
        <div className="text-center p-8 bg-white rounded-lg shadow-lg max-w-md">
          <svg className="w-16 h-16 text-yellow-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Mapbox Token Required</h3>
          <p className="text-gray-600 text-sm mb-4">
            To display the map, please add your Mapbox access token to the .env.local file.
          </p>
          <code className="block bg-gray-100 p-2 rounded text-xs text-left">
            NEXT_PUBLIC_MAPBOX_KEY=your_token_here
          </code>
          <p className="text-gray-500 text-xs mt-4">
            Get your free token at <a href="https://account.mapbox.com/" target="_blank" rel="noopener noreferrer" className="text-primary underline">mapbox.com</a>
          </p>
        </div>
      </div>
    );
  }

  return (
    <Map
      ref={mapRef}
      {...viewState}
      onMove={evt => setViewState(evt.viewState)}
      mapStyle="mapbox://styles/mapbox/streets-v12"
      mapboxAccessToken={mapboxToken}
      style={{ width: '100%', height: '100%' }}
    >
      <NavigationControl position="top-right" />

          {/* Route line connecting itinerary events in order */}
          {validItineraryEvents.length > 1 && (
            <Source id="itinerary-route" type="geojson" data={itineraryRouteGeoJSON}>
              <Layer
                id="itinerary-route-line"
                type="line"
                paint={{
                  'line-color': '#3b82f6',
                  'line-width': 4,
                  'line-opacity': 0.8
                }}
              />
            </Source>
          )}

          {/* Grey pin markers for suggested activities (recommendations) - no numbers */}
          {validRecommendations.map((rec) => (
        <Marker
          key={rec.id}
          longitude={rec.location.lng}
          latitude={rec.location.lat}
          anchor="bottom"
          onClick={(e) => {
            e.originalEvent.stopPropagation();
            onMarkerClick(rec.id);
          }}
        >
          <div
            className={`cursor-pointer transition-all duration-300 ${
              selectedId === rec.id ? 'scale-125' : 'hover:scale-110'
            }`}
          >
            {/* Grey pin for suggestions */}
            <div className="relative">
              <svg 
                width="32" 
                height="42" 
                viewBox="0 0 32 42" 
                fill="none" 
                className={`drop-shadow-lg ${
                  selectedId === rec.id ? 'filter brightness-110' : ''
                }`}
              >
                {/* Pin shape */}
                <path
                  d="M16 0C7.163 0 0 7.163 0 16c0 12 16 26 16 26s16-14 16-26c0-8.837-7.163-16-16-16z"
                  fill={selectedId === rec.id ? '#60a5fa' : '#9ca3af'}
                  stroke="white"
                  strokeWidth="2"
                />
                {/* Inner dot */}
                <circle cx="16" cy="16" r="5" fill="white" />
              </svg>
            </div>
          </div>
        </Marker>
      ))}

          {/* Numbered markers for itinerary events - connected in order */}
          {validItineraryEvents.map((event, index) => (
        <Marker
          key={event.id}
          longitude={event.location.lng}
          latitude={event.location.lat}
          anchor="bottom"
          onClick={(e) => {
            e.originalEvent.stopPropagation();
            if (onItineraryMarkerClick) {
              onItineraryMarkerClick(event);
            }
          }}
        >
          <div className="cursor-pointer transition-all duration-300 hover:scale-110">
            {/* Numbered circular marker for itinerary items */}
            <div className="relative">
              <div className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-white shadow-xl bg-gradient-to-r from-blue-600 to-indigo-600 border-4 border-white">
                {index + 1}
              </div>
              {/* Time label below marker */}
              <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 px-3 py-1 bg-blue-600/95 text-white text-xs font-semibold rounded-full whitespace-nowrap shadow-lg">
                {event.startTime.toLocaleTimeString('en-US', { 
                  hour: 'numeric', 
                  minute: '2-digit',
                  hour12: true 
                })}
              </div>
            </div>
          </div>
        </Marker>
      ))}
    </Map>
  );
}
