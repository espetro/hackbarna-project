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
import { importFromCalendarUrl } from '@/lib/googleCalendarPublic';
import { generateMockItineraryEvents } from '@/lib/mockItineraryData';
import CalendarImportModal from '@/components/CalendarImportModal';

export default function RecommendationsPage() {
  const router = useRouter();
  const { 
    recommendations,
    availableRecommendations, // Filtered recommendations (excluding those in itinerary)
    setSelectedRecommendation,
    itineraryEvents,
    addItineraryEvent,
    removeItineraryEvent,
    clearItinerary,
    importGoogleCalendarEvents: importToContext,
    loadSuggestedActivities,
    suggestedActivitiesLoading,
    smartSuggestions,
    addSmartSuggestion,
  } = useAppContext();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [expandedCard, setExpandedCard] = useState<Recommendation | null>(null);
  const [isItineraryOpen, setIsItineraryOpen] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [isCalendarModalOpen, setIsCalendarModalOpen] = useState(false);

  // Load suggested activities from Firebase if none are loaded
  useEffect(() => {
    const loadActivitiesIfNeeded = async () => {
      if (recommendations.length === 0 && !suggestedActivitiesLoading) {
        console.log('No recommendations loaded, fetching from Firebase...');
        await loadSuggestedActivities();
      }
    };

    loadActivitiesIfNeeded();
  }, [recommendations.length, loadSuggestedActivities, suggestedActivitiesLoading]);

  // Redirect to inspiration page if no available recommendations after loading
  useEffect(() => {
    if (availableRecommendations.length === 0 && recommendations.length === 0 && !suggestedActivitiesLoading) {
      router.push('/inspiration');
    }
  }, [availableRecommendations, recommendations, router, suggestedActivitiesLoading]);

  // Booking functionality removed - commented out
  // const handleBook = (rec: Recommendation) => {
  //   setSelectedRecommendation(rec);
  //   router.push('/thank-you');
  // };

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

    // Generate a truly unique ID with random component to avoid collisions
    const uniqueId = `rec-${rec.id}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    const itineraryEvent: ItineraryEvent = {
      id: uniqueId,
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
    
    // Show success feedback with enhanced animation
    setToastMessage(rec.title);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 4000);

    // Auto-swipe to next card after 1 second
    // Use availableRecommendations since the current one will be filtered out
    setTimeout(() => {
      if (availableRecommendations.length > 1) {
        // If there are still cards left, stay at current index or wrap
        const nextIndex = currentIndex >= availableRecommendations.length - 1 ? 0 : currentIndex;
        setCurrentIndex(nextIndex);
      } else if (availableRecommendations.length === 1) {
        // This was the last card - redirect to inspiration
        router.push('/inspiration');
      }
    }, 1000);
  };

  // Open calendar import modal
  const handleImportCalendar = () => {
    setIsCalendarModalOpen(true);
  };

  // Reset itinerary and go back to preferences
  const handleResetItinerary = () => {
    // Show confirmation dialog
    const confirmReset = window.confirm(
      'Are you sure you want to reset your itinerary? This will clear all activities and take you back to preferences selection.'
    );
    
    if (confirmReset) {
      // Clear all itinerary events
      clearItinerary();
      
      // Close the itinerary panel
      setIsItineraryOpen(false);
      
      // Show success message briefly
      setToastMessage('Itinerary reset successfully');
      setShowToast(true);
      setTimeout(() => setShowToast(false), 2000);
      
      // Navigate back to favorites selection after a short delay
      setTimeout(() => {
        router.push('/favorites');
      }, 1000);
    }
  };

  // Import events from Google Calendar URL
  const handleCalendarImport = async (calendarUrl: string) => {
    setIsImporting(true);
    try {
      console.log('Importing calendar from URL:', calendarUrl);
      
      // Import events from the public calendar
      const events = await importFromCalendarUrl(calendarUrl);
      
      // Add events to context
      importToContext(events);
      
      // Show success message
      setToastMessage(`✓ Successfully imported ${events.length} event(s) from calendar!`);
      setShowToast(true);
      setTimeout(() => setShowToast(false), 4000);
      
      // Open itinerary to show imported events
      setIsItineraryOpen(true);

    } catch (error) {
      console.error('Error importing calendar:', error);
      
      // Re-throw error to be handled by the modal
      throw new Error(
        error instanceof Error 
          ? error.message 
          : 'Failed to import calendar events. Please try again.'
      );
    } finally {
      setIsImporting(false);
    }
  };

  // Handle clicking on an itinerary event marker
  const handleItineraryMarkerClick = (event: ItineraryEvent) => {
    setIsItineraryOpen(true);
  };

  // Show loading state while suggested activities are being loaded from Firebase
  if (suggestedActivitiesLoading) {
    return (
      <div className="h-screen bg-white dark:bg-gray-900 flex flex-col items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="animate-spin h-10 w-10 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Loading Suggested Activities
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Fetching activities from Firebase...
          </p>
        </div>
      </div>
    );
  }

  // Show loading or redirect if no available recommendations
  if (availableRecommendations.length === 0) {
    // If we still have original recommendations, show a message
    if (recommendations.length > 0) {
      return (
        <div className="h-screen bg-white dark:bg-gray-900 flex flex-col items-center justify-center px-4">
          <div className="text-center max-w-md">
            <div className="w-20 h-20 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              All Activities Added!
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-8">
              You&apos;ve added all suggested activities to your itinerary. Great job planning your trip!
            </p>
            <div className="flex flex-col gap-3">
              <button
                onClick={() => setIsItineraryOpen(true)}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white py-4 rounded-full font-semibold transition-all shadow-lg hover:shadow-xl"
              >
                View My Itinerary
              </button>
              <button
                onClick={() => router.push('/inspiration')}
                className="w-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-900 dark:text-white py-4 rounded-full font-semibold transition-all"
              >
                Find More Activities
              </button>
            </div>
          </div>
        </div>
      );
    }
    return null; // Will redirect via useEffect
  }

  const currentRecommendation = availableRecommendations[currentIndex];

  return (
    <div className="relative h-screen w-full overflow-hidden">
      {/* Map Background - Full screen */}
      <div className="absolute inset-0 z-0">
        <MapView
          recommendations={recommendations}
          selectedId={currentRecommendation?.id || null}
          onMarkerClick={(id) => {
            // Find in available recommendations only (soft delete)
            const index = availableRecommendations.findIndex(r => r.id === id);
            if (index !== -1) {
              setCurrentIndex(index);
              setExpandedCard(availableRecommendations[index]);
            } else {
              // This recommendation is in itinerary, show a message
              console.log('This activity is already in your itinerary');
            }
          }}
          itineraryEvents={itineraryEvents}
          onItineraryMarkerClick={handleItineraryMarkerClick}
        />
        {/* Overlay to dim the map slightly - allows pointer events to pass through */}
        <div className="absolute inset-0 bg-black/20 dark:bg-black/40 pointer-events-none" />
      </div>

      {/* Swipeable Card Stack - Only show available recommendations */}
      <SwipeableCardStack
        recommendations={availableRecommendations}
        currentIndex={currentIndex}
        onIndexChange={setCurrentIndex}
        onCardClick={(rec) => setExpandedCard(rec)}
        // onBook={handleBook} // Removed - booking functionality disabled
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
        onResetItinerary={handleResetItinerary}
        recommendations={availableRecommendations}
        onAddRecommendation={handleAddToItinerary}
        smartSuggestions={smartSuggestions}
        onAddSmartSuggestion={addSmartSuggestion}
        onExpandSmartSuggestion={(suggestion) => {
          // Could show smart suggestion details here
          console.log('Smart suggestion clicked:', suggestion);
        }}
      />

      {/* Enhanced Toast Notification for Added Items */}
      <AnimatePresence>
        {showToast && (
          <motion.div
            initial={{ opacity: 0, y: -50, scale: 0.8 }}
            animate={{ 
              opacity: 1, 
              y: 0, 
              scale: 1,
              transition: {
                type: 'spring',
                stiffness: 500,
                damping: 25,
                duration: 0.6
              }
            }}
            exit={{ 
              opacity: 0, 
              y: -30, 
              scale: 0.9,
              transition: { duration: 0.3 }
            }}
            className="fixed top-20 left-1/2 -translate-x-1/2 z-[60] pointer-events-none"
          >
            <motion.div 
              className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-5 rounded-2xl shadow-2xl border border-blue-400/30 flex items-center gap-4 backdrop-blur-sm"
              animate={{ 
                boxShadow: [
                  "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 10px 10px -5px rgb(0 0 0 / 0.04)",
                  "0 25px 50px -12px rgb(0 0 0 / 0.25), 0 25px 25px -5px rgb(0 0 0 / 0.1)",
                  "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 10px 10px -5px rgb(0 0 0 / 0.04)"
                ]
              }}
              transition={{ 
                boxShadow: { 
                  duration: 2, 
                  repeat: Infinity, 
                  ease: "easeInOut" 
                }
              }}
            >
              {/* Animated Success Icon */}
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ 
                  delay: 0.2, 
                  type: 'spring', 
                  stiffness: 600, 
                  damping: 25 
                }}
                className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm"
              >
                <motion.svg 
                  className="w-6 h-6 text-white" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ delay: 0.4, duration: 0.5, ease: "easeOut" }}
                >
                  <motion.path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={3}
                    d="M5 13l4 4L19 7"
                  />
                </motion.svg>
              </motion.div>

              {/* Message */}
              <div className="flex flex-col">
                <motion.span 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                  className="font-bold text-lg"
                >
                  Added to Itinerary!
                </motion.span>
                <motion.span 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 }}
                  className="text-sm text-blue-100"
                >
                  {toastMessage}
                </motion.span>
              </div>

              {/* Calendar Icon */}
              <motion.svg 
                className="w-6 h-6 text-white/70 flex-shrink-0" 
                initial={{ rotate: -20, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                transition={{ delay: 0.5, type: 'spring' }}
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </motion.svg>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

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
                <div className="relative h-[45vh] flex-shrink-0 bg-gray-200 dark:bg-gray-700">
                  {expandedCard.image ? (
                    <Image
                      src={expandedCard.image}
                      alt={expandedCard.title}
                      fill
                      className="object-cover"
                      sizes="100vw"
                      priority
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <svg className="w-20 h-20 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                  )}
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
                  {/* Add to Itinerary Button - Now full width */}
                  <button
                    onClick={() => {
                      handleAddToItinerary(expandedCard);
                      setExpandedCard(null); // Close the expanded view
                    }}
                    className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white py-4 rounded-full font-semibold transition-all duration-200 text-base flex items-center justify-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Add to Itinerary
                  </button>
                  {/* Book Now Button - REMOVED */}
                  {/* <button
                    onClick={() => {
                      handleBook(expandedCard);
                    }}
                    className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white py-4 rounded-full font-semibold transition-all duration-200 text-base"
                  >
                    Book Now
                  </button> */}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Calendar Import Modal */}
      <CalendarImportModal
        isOpen={isCalendarModalOpen}
        onClose={() => setIsCalendarModalOpen(false)}
        onImport={handleCalendarImport}
        isImporting={isImporting}
      />
    </div>
  );
}
