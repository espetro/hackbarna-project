'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppContext } from '@/lib/context/AppContext';
import MapView from '@/components/MapView';
import SwipeableCardStack from '@/components/SwipeableCardStack';
import ItineraryPanel from '@/components/ItineraryPanel';
import ItineraryMenu from '@/components/ItineraryMenu';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { Recommendation, ItineraryEvent } from '@/lib/types';
import { initGoogleCalendarAPI, importGoogleCalendarEvents } from '@/lib/googleCalendar';

export default function RecommendationsPage() {
  const router = useRouter();
  const { 
    recommendations, 
    setSelectedRecommendation,
    itineraryEvents,
    addItineraryEvent,
    removeItineraryEvent,
    importGoogleCalendarEvents: importToContext,
  } = useAppContext();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [expandedCard, setExpandedCard] = useState<Recommendation | null>(null);
  const [isItineraryOpen, setIsItineraryOpen] = useState(false);
  const [isImporting, setIsImporting] = useState(false);

  // Redirect to inspiration page if no recommendations
  useEffect(() => {
    if (recommendations.length === 0) {
      router.push('/inspiration');
    }
  }, [recommendations, router]);

  const handleBook = (rec: Recommendation) => {
    setSelectedRecommendation(rec);
    router.push('/thank-you');
  };

  // Add recommendation to itinerary
  const handleAddToItinerary = (rec: Recommendation) => {
    // Create a time slot - default to next available hour
    const now = new Date();
    const startTime = new Date(now);
    startTime.setHours(now.getHours() + 1, 0, 0, 0);
    
    // Parse duration if available (e.g., "3 hours" -> 3)
    let durationHours = 2; // default
    if (rec.duration) {
      const match = rec.duration.match(/(\d+)/);
      if (match) {
        durationHours = parseInt(match[1]);
      }
    }
    
    const endTime = new Date(startTime);
    endTime.setHours(startTime.getHours() + durationHours);

    const itineraryEvent: ItineraryEvent = {
      id: `rec-${rec.id}-${Date.now()}`,
      title: rec.title,
      description: rec.description,
      location: {
        name: rec.title,
        lat: rec.location.lat,
        lng: rec.location.lng,
      },
      startTime,
      endTime,
      source: 'recommendation',
      recommendationId: rec.id,
      image: rec.image,
    };

    addItineraryEvent(itineraryEvent);
    
    // Show success feedback
    alert(`✓ "${rec.title}" added to your itinerary!`);
  };

  // Import events from Google Calendar
  const handleImportCalendar = async () => {
    if (isImporting) return;

    setIsImporting(true);
    try {
      // Initialize Google Calendar API
      const initialized = await initGoogleCalendarAPI();
      if (!initialized) {
        alert('Failed to initialize Google Calendar. Please check your API credentials.');
        return;
      }

      // Import events from next 7 days
      const events = await importGoogleCalendarEvents();
      
      if (events.length === 0) {
        alert('No events found in your calendar for the next 7 days.');
        return;
      }

      // Add events to context
      importToContext(events);
      
      // Show success message
      alert(`✓ Successfully imported ${events.length} event(s) from Google Calendar!`);
      
      // Open itinerary to show imported events
      setIsItineraryOpen(true);
    } catch (error) {
      console.error('Error importing calendar:', error);
      alert('Failed to import Google Calendar events. Please make sure you have granted the necessary permissions.');
    } finally {
      setIsImporting(false);
    }
  };

  // Handle clicking on an itinerary event marker
  const handleItineraryMarkerClick = (event: ItineraryEvent) => {
    setIsItineraryOpen(true);
  };

  if (recommendations.length === 0) {
    return null; // Will redirect
  }

  const currentRecommendation = recommendations[currentIndex];

  return (
    <div className="relative min-h-screen w-full overflow-hidden">
      {/* Map Background - Full screen */}
      <div className="absolute inset-0 z-0">
        <MapView
          recommendations={recommendations}
          selectedId={currentRecommendation?.id || null}
          onMarkerClick={(id) => {
            const index = recommendations.findIndex(r => r.id === id);
            if (index !== -1) {
              setCurrentIndex(index);
              setExpandedCard(recommendations[index]);
            }
          }}
          itineraryEvents={itineraryEvents}
          onItineraryMarkerClick={handleItineraryMarkerClick}
        />
        {/* Overlay to dim the map slightly - allows pointer events to pass through */}
        <div className="absolute inset-0 bg-black/20 dark:bg-black/40 pointer-events-none" />
      </div>

      {/* Swipeable Card Stack */}
      <SwipeableCardStack
        recommendations={recommendations}
        currentIndex={currentIndex}
        onIndexChange={setCurrentIndex}
        onCardClick={(rec) => setExpandedCard(rec)}
        onBook={handleBook}
        onAddToItinerary={handleAddToItinerary}
      />

      {/* Itinerary Button - Top Left */}
      <ItineraryMenu
        onOpenItinerary={() => setIsItineraryOpen(true)}
        eventCount={itineraryEvents.length}
      />

      {/* Itinerary Panel - Slide-out */}
      <ItineraryPanel
        isOpen={isItineraryOpen}
        onClose={() => setIsItineraryOpen(false)}
        events={itineraryEvents}
        onRemoveEvent={removeItineraryEvent}
        onEventClick={(event) => {
          // Could expand event details here
          console.log('Event clicked:', event);
        }}
        onImportCalendar={handleImportCalendar}
      />

      {/* Expanded Detail Card - Bottom Sheet */}
      <AnimatePresence>
        {expandedCard && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
              onClick={() => setExpandedCard(null)}
            />

            {/* Draggable Bottom Sheet */}
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              drag="y"
              dragConstraints={{ top: 0, bottom: 0 }}
              dragElastic={{ top: 0, bottom: 0.5 }}
              onDragEnd={(_, info) => {
                if (info.offset.y > 150) {
                  setExpandedCard(null);
                }
              }}
              className="fixed bottom-0 left-0 right-0 z-50 h-[90vh]"
            >
              <div className="bg-white dark:bg-gray-800 rounded-t-3xl shadow-2xl overflow-hidden h-full flex flex-col">
                {/* Drag Handle */}
                <div className="flex-shrink-0 py-3 flex justify-center cursor-grab active:cursor-grabbing">
                  <div className="w-12 h-1.5 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
                </div>

                {/* Image */}
                <div className="relative h-[45vh] flex-shrink-0">
                  <Image
                    src={expandedCard.image || '/assets/barceloneta.png'}
                    alt={expandedCard.title}
                    fill
                    className="object-cover"
                    sizes="100vw"
                    priority
                  />
                  <div className="absolute top-4 right-4 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm px-3 py-2 rounded-full text-sm font-medium text-gray-800 dark:text-white">
                    {expandedCard.duration}
                  </div>
                  <button
                    onClick={() => setExpandedCard(null)}
                    className="absolute top-4 left-4 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm p-2 rounded-full hover:bg-white dark:hover:bg-gray-700 transition-colors"
                  >
                    <svg className="w-6 h-6 text-gray-800 dark:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                </div>

                {/* Content */}
                <div className="flex-1 p-6 overflow-y-auto">
                  <h2 className="text-3xl font-bold mb-3 text-gray-800 dark:text-white">
                    {expandedCard.title}
                  </h2>
                  <p className="text-gray-600 dark:text-gray-300 mb-6 text-base leading-relaxed">
                    {expandedCard.description}
                  </p>
                  <div className="flex items-center gap-3 mb-6">
                    <span className="text-2xl font-bold text-gray-900 dark:text-white">
                      {expandedCard.price}
                    </span>
                  </div>
                  {expandedCard.location && (
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <span>
                        Lat: {expandedCard.location.lat.toFixed(4)}, Lng: {expandedCard.location.lng.toFixed(4)}
                      </span>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex-shrink-0">
                  <div className="flex gap-3">
                    <button
                      onClick={() => {
                        handleAddToItinerary(expandedCard);
                      }}
                      className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-4 rounded-full font-semibold transition-all duration-200 text-base flex items-center justify-center gap-2"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      Add to Itinerary
                    </button>
                    <button
                      onClick={() => {
                        handleBook(expandedCard);
                      }}
                      className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white py-4 rounded-full font-semibold transition-all duration-200 text-base"
                    >
                      Book Now
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
