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

  // Auto-zoom to fit all markers when recommendations or itinerary events change
  useEffect(() => {
    const allLocations = [
      ...recommendations.map(r => ({ lng: r.location.lng, lat: r.location.lat })),
      ...itineraryEvents.map(e => ({ lng: e.location.lng, lat: e.location.lat }))
    ];

    if (allLocations.length > 0 && mapRef.current) {
      const bounds = allLocations.reduce(
        (bounds, loc) => {
          return bounds.extend([loc.lng, loc.lat]);
        },
        new mapboxgl.LngLatBounds(
          [allLocations[0].lng, allLocations[0].lat],
          [allLocations[0].lng, allLocations[0].lat]
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
  }, [recommendations, itineraryEvents]);

  // Create GeoJSON for the route line
  const routeGeoJSON = {
    type: 'Feature' as const,
    geometry: {
      type: 'LineString' as const,
      coordinates: recommendations.map(rec => [rec.location.lng, rec.location.lat])
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

      {/* Route line connecting all points */}
      {recommendations.length > 1 && (
        <Source id="route" type="geojson" data={routeGeoJSON}>
          <Layer
            id="route-line"
            type="line"
            paint={{
              'line-color': '#667eea',
              'line-width': 4,
              'line-opacity': 0.8,
              'line-dasharray': [2, 2]
            }}
          />
        </Source>
      )}

      {/* Markers for each recommendation */}
      {recommendations.map((rec, index) => (
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
              selectedId === rec.id ? 'scale-150' : 'hover:scale-110'
            }`}
          >
            {/* Numbered marker with gradient for active state */}
            <div
              className={`relative w-10 h-10 rounded-full flex items-center justify-center font-bold text-white shadow-lg ${
                selectedId === rec.id
                  ? 'bg-gradient-to-r from-purple-500 to-blue-500 ring-4 ring-white'
                  : 'bg-red-500'
              }`}
            >
              {index + 1}
            </div>
          </div>
        </Marker>
      ))}

      {/* Markers for itinerary events - Grey markers in time order */}
      {itineraryEvents.map((event, index) => (
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
            {/* Grey circular marker with time order number */}
            <div className="relative">
              <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-white shadow-lg bg-gray-600 border-2 border-gray-400">
                {index + 1}
              </div>
              {/* Time label below marker */}
              <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-1 px-2 py-0.5 bg-gray-800/90 text-white text-xs rounded whitespace-nowrap">
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
