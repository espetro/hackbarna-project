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
  const [expandedEventIds, setExpandedEventIds] = React.useState<Set<string>>(new Set());

  const handleDragEnd = (event: any, info: PanInfo) => {
    // Close if dragged down more than 150px
    if (info.offset.y > 150) {
      onClose();
    }
  };

  const toggleExpanded = (eventId: string) => {
    setExpandedEventIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(eventId)) {
        newSet.delete(eventId);
      } else {
        newSet.add(eventId);
      }
      return newSet;
    });
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
            className="fixed bottom-0 left-0 right-0 z-50"
          >
            <div className="bg-white dark:bg-gray-800 rounded-t-3xl shadow-2xl overflow-hidden h-[90vh] flex flex-col">
              {/* Drag Handle */}
              <div className="flex-shrink-0 py-3 flex justify-center cursor-grab active:cursor-grabbing">
                <div className="w-12 h-1.5 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
              </div>

              {/* Header */}
              <div className="flex-shrink-0 px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">My Itinerary</h2>
                    <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
                      {events.length} {events.length === 1 ? 'event' : 'events'} scheduled
                    </p>
                  </div>
                  <button
                    onClick={onClose}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
                    aria-label="Close itinerary"
                  >
                    <svg className="w-6 h-6 text-gray-800 dark:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                </div>
              </div>

            {/* Events List */}
            <div className="flex-1 overflow-y-auto">
              {events.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full px-6 text-center">
                  <div className="w-20 h-20 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4">
                    <svg className="w-10 h-10 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                    No events yet
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm mb-6 max-w-sm">
                    Import from Google Calendar or add recommendations to start building your itinerary
                  </p>

                  {/* Import Google Calendar Button - Centered */}
                  <button
                    onClick={onImportCalendar}
                    className="flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200 font-semibold"
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
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
                      <div className="sticky top-0 bg-white dark:bg-gray-800 py-2 mb-4 z-10">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                          {dateKey}
                        </h3>
                      </div>

                      {/* Timeline Events */}
                      <div className="space-y-4">
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

                          const isRecommendation = event.source === 'recommendation';
                          const isExpanded = expandedEventIds.has(event.id);

                          return (
                            <React.Fragment key={event.id}>
                              {/* Event Card */}
                              <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                                className="relative"
                              >
                                <div
                                  className={`rounded-xl shadow-md hover:shadow-lg transition-all cursor-pointer border overflow-hidden group ${
                                    isRecommendation
                                      ? 'bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800'
                                      : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700'
                                  }`}
                                  onClick={() => {
                                    if (isRecommendation) {
                                      toggleExpanded(event.id);
                                    } else {
                                      onEventClick(event);
                                    }
                                  }}
                                >
                                  <div className="p-3">
                                    {/* Compact Header */}
                                    <div className="flex items-start justify-between gap-2 mb-2">
                                      <div className="flex items-center gap-2 flex-1 min-w-0">
                                        {/* Time */}
                                        <span className={`text-sm font-bold whitespace-nowrap ${
                                          isRecommendation
                                            ? 'text-purple-700 dark:text-purple-300'
                                            : 'text-gray-900 dark:text-white'
                                        }`}>
                                          {formatTime(event.startTime)}
                                        </span>
                                        {/* Title */}
                                        <h3 className={`text-sm font-semibold truncate ${
                                          isRecommendation
                                            ? 'text-purple-900 dark:text-purple-100'
                                            : 'text-gray-900 dark:text-white'
                                        }`}>
                                          {event.title}
                                        </h3>
                                      </div>

                                      {/* Actions */}
                                      <div className="flex items-center gap-1 flex-shrink-0">
                                        {/* Expand/Collapse for recommendations */}
                                        {isRecommendation && (
                                          <div className={`p-1 rounded-full ${
                                            isExpanded ? 'bg-purple-200 dark:bg-purple-700' : ''
                                          }`}>
                                            <svg
                                              className={`w-4 h-4 transition-transform ${
                                                isExpanded ? 'rotate-180' : ''
                                              } ${
                                                isRecommendation
                                                  ? 'text-purple-600 dark:text-purple-400'
                                                  : 'text-gray-400'
                                              }`}
                                              fill="none"
                                              stroke="currentColor"
                                              viewBox="0 0 24 24"
                                            >
                                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                            </svg>
                                          </div>
                                        )}
                                        {/* Remove Button */}
                                        <button
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            onRemoveEvent(event.id);
                                          }}
                                          className="opacity-0 group-hover:opacity-100 transition-opacity p-1 bg-red-500 hover:bg-red-600 rounded-full text-white"
                                          aria-label="Remove event"
                                        >
                                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                          </svg>
                                        </button>
                                      </div>
                                    </div>

                                    {/* Compact Details - Always visible */}
                                    <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
                                      {/* Duration */}
                                      <div className="flex items-center gap-1">
                                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        <span>{getDuration(event.startTime, event.endTime)}</span>
                                      </div>

                                      {/* Source Badge */}
                                      <div className="flex items-center gap-1">
                                        {getSourceIcon(event.source)}
                                        <span>
                                          {event.source === 'recommendation' ? 'Activity' : event.source === 'google_calendar' ? 'Calendar' : 'Manual'}
                                        </span>
                                      </div>
                                    </div>

                                    {/* Expandable Details - Only for recommendations */}
                                    {isRecommendation && isExpanded && (
                                      <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        transition={{ duration: 0.2 }}
                                        className="mt-3 pt-3 border-t border-purple-200 dark:border-purple-800"
                                      >
                                        {/* Description */}
                                        {event.description && (
                                          <p className="text-sm text-purple-800 dark:text-purple-200 mb-3">
                                            {event.description}
                                          </p>
                                        )}

                                        {/* Location */}
                                        <div className="flex items-start gap-2 text-sm text-purple-700 dark:text-purple-300">
                                          <svg className="w-4 h-4 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                          </svg>
                                          <span>
                                            {event.location.name}
                                          </span>
                                        </div>
                                      </motion.div>
                                    )}
                                  </div>
                                </div>
                              </motion.div>

                              {/* Travel Segment Between Events */}
                              {nextEvent && (
                                <motion.div
                                  initial={{ opacity: 0 }}
                                  animate={{ opacity: 1 }}
                                  transition={{ delay: index * 0.05 + 0.1 }}
                                  className="flex items-center justify-center py-2"
                                >
                                  <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-700/50 px-3 py-2 rounded-full">
                                    {/* Travel Mode Icon */}
                                    {travelMode === 'walking' ? (
                                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                      </svg>
                                    ) : (
                                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                                      </svg>
                                    )}
                                    <span>
                                      {formatDistance(distance)} • {formatTravelTime(travelTime)}
                                    </span>
                                  </div>
                                </motion.div>
                              )}
                            </React.Fragment>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

