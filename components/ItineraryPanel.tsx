'use client';

import React from 'react';
import { motion, AnimatePresence, PanInfo } from 'framer-motion';
import { ItineraryEvent } from '@/lib/types';
import Image from 'next/image';

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
                      <div className="sticky top-0 bg-white dark:bg-gray-900 py-2 mb-3 border-b border-gray-200 dark:border-gray-700">
                        <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          {dateKey}
                        </h3>
                      </div>

                      {/* Events for this date */}
                      <div className="space-y-4">
                        {dateEvents.map((event, index) => (
                          <motion.div
                            key={event.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className="group relative bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-xl transition-all cursor-pointer border-2 border-gray-100 dark:border-gray-700 overflow-hidden"
                            onClick={() => onEventClick(event)}
                          >
                            {/* Event Image Background (if available) */}
                            {event.image && (
                              <div className="relative h-32 w-full">
                                <Image
                                  src={event.image}
                                  alt={event.title}
                                  fill
                                  className="object-cover"
                                  sizes="100vw"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                                
                                {/* Time Badge on Image */}
                                <div className="absolute top-3 left-3 bg-blue-600 text-white px-3 py-1.5 rounded-full text-sm font-semibold shadow-lg">
                                  {formatTime(event.startTime)}
                                </div>
                                
                                {/* Duration Badge */}
                                <div className="absolute top-3 right-3 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm text-gray-900 dark:text-white px-3 py-1.5 rounded-full text-xs font-medium">
                                  {getDuration(event.startTime, event.endTime)}
                                </div>

                                {/* Remove Button */}
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onRemoveEvent(event.id);
                                  }}
                                  className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity p-2 bg-red-500 hover:bg-red-600 rounded-full text-white shadow-lg"
                                  aria-label="Remove event"
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                  </svg>
                                </button>
                              </div>
                            )}

                            {/* Event Content */}
                            <div className="p-4">
                              {/* If no image, show time at top */}
                              {!event.image && (
                                <div className="flex items-center justify-between mb-3">
                                  <div className="bg-blue-600 text-white px-3 py-1.5 rounded-full text-sm font-semibold">
                                    {formatTime(event.startTime)}
                                  </div>
                                  <div className="text-gray-600 dark:text-gray-400 text-sm">
                                    {getDuration(event.startTime, event.endTime)}
                                  </div>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      onRemoveEvent(event.id);
                                    }}
                                    className="opacity-0 group-hover:opacity-100 transition-opacity p-2 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-full text-red-600 dark:text-red-400"
                                    aria-label="Remove event"
                                  >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                  </button>
                                </div>
                              )}

                              {/* Title */}
                              <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-2 line-clamp-2">
                                {event.title}
                              </h4>

                              {/* Description */}
                              {event.description && (
                                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                                  {event.description}
                                </p>
                              )}

                              {/* Footer Info */}
                              <div className="flex items-center justify-between gap-3 text-xs">
                                {/* Location */}
                                <div className="flex items-center gap-1.5 text-gray-600 dark:text-gray-400 flex-1 min-w-0">
                                  <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                  </svg>
                                  <span className="line-clamp-1 font-medium">{event.location.name}</span>
                                </div>

                                {/* Source Badge */}
                                <div className="flex items-center gap-1.5 px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded-full text-gray-700 dark:text-gray-300">
                                  {getSourceIcon(event.source)}
                                  <span className="capitalize text-xs font-medium">{event.source.replace('_', ' ')}</span>
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        ))}
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

