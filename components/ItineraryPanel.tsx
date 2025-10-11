'use client';

import React from 'react';
import { motion, AnimatePresence, PanInfo } from 'framer-motion';
import { ItineraryEvent } from '@/lib/types';
import Image from 'next/image';
import {
  calculateDistance,
  calculateTravelTime,
  formatDistance,
  formatTravelTime,
  getTravelMode,
  calculateGapBetweenEvents,
} from '@/lib/itineraryUtils';

interface ItineraryPanelProps {
  isOpen: boolean;
  onClose: () => void;
  events: ItineraryEvent[];
  onRemoveEvent: (eventId: string) => void;
  onEventClick: (event: ItineraryEvent) => void;
  onImportCalendar: () => void;
}

export default function ItineraryPanel({
  isOpen,
  onClose,
  events,
  onRemoveEvent,
  onEventClick,
  onImportCalendar,
}: ItineraryPanelProps) {
  
  const handleDragEnd = (event: any, info: PanInfo) => {
    // Close if dragged down more than 150px
    if (info.offset.y > 150) {
      onClose();
    }
  };
  
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  };

  const getDuration = (start: Date, end: Date) => {
    const diff = end.getTime() - start.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours === 0) return `${minutes}m`;
    if (minutes === 0) return `${hours}h`;
    return `${hours}h ${minutes}m`;
  };

  const getSourceIcon = (source: ItineraryEvent['source']) => {
    switch (source) {
      case 'google_calendar':
        return (
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
            <path d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V10h14v10zM9 14H7v-2h2v2zm4 0h-2v-2h2v2zm4 0h-2v-2h2v2zm-8 4H7v-2h2v2zm4 0h-2v-2h2v2zm4 0h-2v-2h2v2z"/>
          </svg>
        );
      case 'recommendation':
        return (
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
          </svg>
        );
      case 'manual':
        return (
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        );
    }
  };

  // Group events by date
  const groupedEvents = events.reduce((groups, event) => {
    const dateKey = formatDate(event.startTime);
    if (!groups[dateKey]) {
      groups[dateKey] = [];
    }
    groups[dateKey].push(event);
    return groups;
  }, {} as Record<string, ItineraryEvent[]>);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
            onClick={onClose}
          />

          {/* Draggable Bottom Sheet - Card Style */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            drag="y"
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0, bottom: 0.5 }}
            onDragEnd={handleDragEnd}
            className="fixed bottom-0 left-0 right-0 z-50 mx-auto"
            style={{ width: '95%', maxWidth: '95vw', height: '85vh' }}
          >
            <div className="bg-white dark:bg-gray-800 rounded-t-3xl shadow-2xl overflow-hidden h-full flex flex-col border-2 border-blue-500">
              {/* Drag Handle */}
              <div className="flex-shrink-0 py-3 flex justify-center cursor-grab active:cursor-grabbing bg-gradient-to-r from-blue-600 to-indigo-600">
                <div className="w-12 h-1.5 bg-white/50 rounded-full"></div>
              </div>

              {/* Header */}
              <div className="flex-shrink-0 px-6 py-4 bg-gradient-to-r from-blue-600 to-indigo-600">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-white">My Itinerary</h2>
                    <p className="text-blue-100 text-sm mt-1">
                      {events.length} {events.length === 1 ? 'event' : 'events'} scheduled
                    </p>
                  </div>
                  <button
                    onClick={onClose}
                    className="p-2 hover:bg-white/20 rounded-full transition-colors"
                    aria-label="Close itinerary"
                  >
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                </div>
              </div>

            {/* Events List */}
            <div className="flex-1 overflow-y-auto">
              {events.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full px-6 text-center">
                  <div className="w-24 h-24 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
                    <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    No events yet
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm mb-6">
                    Import from Google Calendar or add recommendations to start building your itinerary
                  </p>
                  
                  {/* Import Google Calendar Button - Centered */}
                  <button
                    onClick={onImportCalendar}
                    className="flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200 font-semibold"
                  >
                    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V10h14v10zM9 14H7v-2h2v2zm4 0h-2v-2h2v2zm4 0h-2v-2h2v2zm-8 4H7v-2h2v2zm4 0h-2v-2h2v2zm4 0h-2v-2h2v2z"/>
                    </svg>
                    <span>Import Google Calendar</span>
                  </button>
                </div>
              ) : (
                <div className="px-6 py-4 space-y-6">
                  {Object.entries(groupedEvents).map(([dateKey, dateEvents]) => (
                    <div key={dateKey}>
                      {/* Date Header */}
                      <div className="sticky top-0 bg-white dark:bg-gray-900 py-2 mb-6 z-10">
                        <h3 className="text-lg font-bold text-gray-800 dark:text-white">
                          {dateKey}
                        </h3>
                      </div>

                      {/* Timeline Events */}
                      <div className="relative">
                        {/* Vertical Timeline Line */}
                        <div className="absolute left-[18px] top-0 bottom-0 w-0.5 bg-gradient-to-b from-blue-400 via-indigo-400 to-blue-400" />
                        
                        <div className="space-y-0">
                        {dateEvents.map((event, index) => {
                          const nextEvent = dateEvents[index + 1];
                          const distance = nextEvent
                            ? calculateDistance(
                                event.location.lat,
                                event.location.lng,
                                nextEvent.location.lat,
                                nextEvent.location.lng
                              )
                            : 0;
                          const travelTime = nextEvent ? calculateTravelTime(distance) : 0;
                          const travelMode = nextEvent ? getTravelMode(distance) : 'walking';
                          const gapTime = nextEvent ? calculateGapBetweenEvents(event, nextEvent) : 0;

                          return (
                            <React.Fragment key={event.id}>
                              {/* Event Card */}
                              <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                                className="relative mb-6"
                              >
                                {/* Timeline Number Circle */}
                                <div className="absolute left-0 top-8 z-10 w-10 h-10 bg-gradient-to-br from-teal-500 to-teal-600 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg border-4 border-white dark:border-gray-900">
                                  {index + 1}
                                </div>

                                {/* Event Content Card */}
                                <div
                                  className="ml-16 bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-xl transition-all cursor-pointer border border-gray-200 dark:border-gray-700 overflow-hidden group"
                                  onClick={() => onEventClick(event)}
                                >
                                  {/* Event Content - Timeline Style */}
                                  <div className="p-5">
                                    {/* Title - Prominent */}
                                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                                      {event.title}
                                    </h3>

                                    {/* Time - Extra Prominent with Clock Icon */}
                                    <div className="flex items-center gap-2 mb-3">
                                      <svg className="w-5 h-5 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                      </svg>
                                      <span className="text-2xl font-bold text-gray-800 dark:text-white">
                                        {formatTime(event.startTime)}
                                      </span>
                                    </div>

                                    {/* Duration with Icon */}
                                    <div className="flex items-center gap-2 mb-3">
                                      <svg className="w-5 h-5 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                      </svg>
                                      <span className="text-base text-gray-600 dark:text-gray-400">
                                        {getDuration(event.startTime, event.endTime)}
                                      </span>
                                    </div>

                                    {/* Price (if available) */}
                                    {event.recommendationId && (
                                      <div className="flex items-center gap-2 mb-3">
                                        <svg className="w-5 h-5 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        <span className="text-base text-gray-600 dark:text-gray-400">
                                          €{15 + index * 5}
                                        </span>
                                      </div>
                                    )}

                                    {/* Category Tag */}
                                    <div className="flex items-center gap-2 mb-4">
                                      <svg className="w-5 h-5 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                                      </svg>
                                      <span className="text-sm text-gray-600 dark:text-gray-400">
                                        {event.source === 'recommendation' ? 'activity' : 'event'}
                                      </span>
                                    </div>

                                    {/* Description */}
                                    {event.description && (
                                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 leading-relaxed">
                                        {event.description}
                                      </p>
                                    )}

                                    {/* Location with Full Address */}
                                    <div className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400">
                                      <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                      </svg>
                                      <span className="leading-relaxed">
                                        {event.location.name}
                                      </span>
                                    </div>

                                    {/* Remove Button - Top Right */}
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        onRemoveEvent(event.id);
                                      }}
                                      className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity p-2 bg-red-500 hover:bg-red-600 rounded-full text-white shadow-lg"
                                      aria-label="Remove event"
                                    >
                                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                      </svg>
                                    </button>
                                  </div>
                                </div>
                              </motion.div>

                              {/* Travel Segment Between Events */}
                              {nextEvent && (
                                <motion.div
                                  initial={{ opacity: 0 }}
                                  animate={{ opacity: 1 }}
                                  transition={{ delay: index * 0.05 + 0.1 }}
                                  className="relative mb-6 ml-16"
                                >
                                  <div className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 rounded-xl p-4 border-l-4 border-blue-400">
                                    <div className="flex items-center justify-between">
                                      <div className="flex items-center gap-3">
                                        {/* Travel Mode Icon */}
                                        {travelMode === 'walking' ? (
                                          <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                          </svg>
                                        ) : (
                                          <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                                          </svg>
                                        )}
                                        <div>
                                          <div className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                                            {travelMode === 'walking' ? '🚶 Walking' : '🚕 Transit'}
                                          </div>
                                          <div className="text-xs text-gray-500 dark:text-gray-400">
                                            {formatDistance(distance)} • {formatTravelTime(travelTime)}
                                          </div>
                                        </div>
                                      </div>
                                      
                                      {/* Gap Time Info */}
                                      {gapTime > travelTime + 5 && (
                                        <div className="text-xs text-gray-500 dark:text-gray-400">
                                          +{formatTravelTime(gapTime - travelTime)} buffer
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </motion.div>
                              )}
                            </React.Fragment>
                          );
                        })}
                      </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

