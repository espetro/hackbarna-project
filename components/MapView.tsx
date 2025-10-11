'use client';

import React, { useState, useCallback, useEffect, useRef } from 'react';
import Map, { Marker, NavigationControl, Source, Layer } from 'react-map-gl/mapbox';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Recommendation } from '@/lib/types';
import type { MapRef } from 'react-map-gl/mapbox';

interface MapViewProps {
  recommendations: Recommendation[];
  selectedId: number | null;
  onMarkerClick: (id: number) => void;
}

export default function MapView({ recommendations, selectedId, onMarkerClick }: MapViewProps) {
  const mapRef = useRef<MapRef>(null);

  // Default to Paris coordinates
  const [viewState, setViewState] = useState({
    longitude: 2.3522,
    latitude: 48.8566,
    zoom: 12
  });

  const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_KEY;

  // Auto-zoom to fit all markers when recommendations change
  useEffect(() => {
    if (recommendations.length > 0 && mapRef.current) {
      const bounds = recommendations.reduce(
        (bounds, rec) => {
          return bounds.extend([rec.location.lng, rec.location.lat]);
        },
        new mapboxgl.LngLatBounds(
          [recommendations[0].location.lng, recommendations[0].location.lat],
          [recommendations[0].location.lng, recommendations[0].location.lat]
        )
      );

      mapRef.current.fitBounds(bounds, {
        padding: { top: 100, bottom: 100, left: 100, right: 100 },
        duration: 1000
      });
    }
  }, [recommendations]);

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
    </Map>
  );
}
