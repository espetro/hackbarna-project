'use client';

import React from 'react';
import { motion, AnimatePresence, PanInfo } from 'framer-motion';
import { ItineraryEvent, Recommendation } from '@/lib/types';
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
  recommendations?: Recommendation[];
  onAddRecommendation?: (rec: Recommendation) => void;
}

export default function ItineraryPanel({
  isOpen,
  onClose,
  events,
  onRemoveEvent,
  onEventClick,
  onImportCalendar,
  recommendations = [],
  onAddRecommendation,
}: ItineraryPanelProps) {
  const [expandedEventIds, setExpandedEventIds] = React.useState<Set<string>>(new Set());
  const [selectedDate, setSelectedDate] = React.useState<Date>(new Date());
  const [carouselIndices, setCarouselIndices] = React.useState<Record<string, number>>({});
  
  // Check if calendar has been synced (has events from google_calendar source)
  const hasCalendarEvents = React.useMemo(() => {
    return events.some(event => event.source === 'google_calendar');
  }, [events]);

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

  // Filter events for selected date (one-day view)
  const dayEvents = events.filter(event => {
    const eventDate = new Date(event.startTime);
    return (
      eventDate.getFullYear() === selectedDate.getFullYear() &&
      eventDate.getMonth() === selectedDate.getMonth() &&
      eventDate.getDate() === selectedDate.getDate()
    );
  }).sort((a, b) => a.startTime.getTime() - b.startTime.getTime());

  // Get unique dates from all events
  const uniqueDates = Array.from(
    new Set(
      events.map(event =>
        new Date(event.startTime.getFullYear(), event.startTime.getMonth(), event.startTime.getDate()).getTime()
      )
    )
  )
    .map(timestamp => new Date(timestamp))
    .sort((a, b) => a.getTime() - b.getTime());

  // Generate agenda time slots (8 AM to 10 PM)
  const generateTimeSlots = () => {
    const slots = [];
    for (let hour = 8; hour <= 22; hour++) {
      slots.push(hour);
    }
    return slots;
  };

  const timeSlots = generateTimeSlots();

  // Detect gaps where we can add activities (30+ minutes during daytime 8am-10pm)
  const detectGaps = () => {
    if (dayEvents.length === 0) return [];

    const gaps: Array<{ startHour: number; endHour: number; startMinute: number; endMinute: number; durationMinutes: number }> = [];
    const dayStart = new Date(selectedDate);
    dayStart.setHours(8, 0, 0, 0);
    const dayEnd = new Date(selectedDate);
    dayEnd.setHours(22, 0, 0, 0);

    // Check gap before first event
    if (dayEvents[0].startTime.getTime() - dayStart.getTime() > 30 * 60 * 1000) {
      const durationMinutes = (dayEvents[0].startTime.getTime() - dayStart.getTime()) / (60 * 1000);
      gaps.push({
        startHour: dayStart.getHours(),
        startMinute: dayStart.getMinutes(),
        endHour: dayEvents[0].startTime.getHours(),
        endMinute: dayEvents[0].startTime.getMinutes(),
        durationMinutes,
      });
    }

    // Check gaps between events
    for (let i = 0; i < dayEvents.length - 1; i++) {
      const currentEnd = dayEvents[i].endTime;
      const nextStart = dayEvents[i + 1].startTime;
      const gapMinutes = (nextStart.getTime() - currentEnd.getTime()) / (60 * 1000);

      if (gapMinutes > 30) {
        gaps.push({
          startHour: currentEnd.getHours(),
          startMinute: currentEnd.getMinutes(),
          endHour: nextStart.getHours(),
          endMinute: nextStart.getMinutes(),
          durationMinutes: gapMinutes,
        });
      }
    }

    // Check gap after last event
    const lastEvent = dayEvents[dayEvents.length - 1];
    if (dayEnd.getTime() - lastEvent.endTime.getTime() > 30 * 60 * 1000) {
      const durationMinutes = (dayEnd.getTime() - lastEvent.endTime.getTime()) / (60 * 1000);
      gaps.push({
        startHour: lastEvent.endTime.getHours(),
        startMinute: lastEvent.endTime.getMinutes(),
        endHour: dayEnd.getHours(),
        endMinute: dayEnd.getMinutes(),
        durationMinutes,
      });
    }

    return gaps;
  };

  const gaps = detectGaps();

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
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">My Agenda</h2>
                    <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
                      {formatDate(selectedDate)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {/* Google Calendar Sync Button - Only show when itinerary has events */}
                    {events.length > 0 && (
                      <button
                        onClick={hasCalendarEvents ? undefined : onImportCalendar}
                        disabled={hasCalendarEvents}
                        className={`p-2 rounded-full transition-all flex items-center gap-2 ${
                          hasCalendarEvents
                            ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 cursor-not-allowed'
                            : 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 hover:bg-blue-200 dark:hover:bg-blue-800/40'
                        }`}
                        aria-label={hasCalendarEvents ? 'Calendar synced' : 'Sync with Google Calendar'}
                        title={hasCalendarEvents ? 'Calendar synced' : 'Import from Google Calendar'}
                      >
                        {hasCalendarEvents ? (
                          // Synced state - checkmark
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                        ) : (
                          // Not synced state - calendar icon
                          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V10h14v10zM9 14H7v-2h2v2zm4 0h-2v-2h2v2zm4 0h-2v-2h2v2zm-8 4H7v-2h2v2zm4 0h-2v-2h2v2zm4 0h-2v-2h2v2z"/>
                          </svg>
                        )}
                      </button>
                    )}
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

                {/* Date Navigator */}
                {uniqueDates.length > 0 && (
                  <div className="flex items-center gap-2 overflow-x-auto pb-2">
                    {uniqueDates.map((date) => {
                      const isSelected =
                        date.getFullYear() === selectedDate.getFullYear() &&
                        date.getMonth() === selectedDate.getMonth() &&
                        date.getDate() === selectedDate.getDate();

                      return (
                        <button
                          key={date.getTime()}
                          onClick={() => setSelectedDate(date)}
                          className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-semibold transition-colors ${
                            isSelected
                              ? 'bg-blue-600 text-white'
                              : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                          }`}
                        >
                          {date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

            {/* Agenda Timeline */}
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
                    Import from Google Calendar or add recommendations to start building your agenda
                  </p>

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
              ) : dayEvents.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full px-6 text-center">
                  <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4">
                    <svg className="w-8 h-8 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                    No events on this day
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">
                    Select another date or add activities to this day
                  </p>
                </div>
              ) : (
                <div className="px-4 py-4">
                  {/* Agenda Timeline - Simple List */}
                  <div className="space-y-2">
                    {dayEvents.map((event, index) => {
                      const isRecommendation = event.source === 'recommendation';
                      const isExpanded = expandedEventIds.has(event.id);

                      // Check if there's a gap before this event
                      const gapBefore = gaps.find(g =>
                        g.endHour === event.startTime.getHours() &&
                        g.endMinute === event.startTime.getMinutes()
                      );

                      return (
                        <React.Fragment key={event.id}>
                          {/* Gap Block with Recommendations */}
                          {gapBefore && recommendations.length > 0 && onAddRecommendation && (
                            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-2 border-dashed border-blue-300 dark:border-blue-700 rounded-xl p-4 my-3">
                              <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-2">
                                  <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                  </svg>
                                  <span className="text-sm font-semibold text-blue-900 dark:text-blue-100">
                                    Add activity here
                                  </span>
                                </div>
                                <span className="text-xs text-blue-600 dark:text-blue-400">
                                  {Math.floor(gapBefore.durationMinutes / 60)}h {Math.floor(gapBefore.durationMinutes % 60)}m free
                                </span>
                              </div>

                              {/* Recommendation Carousel */}
                              <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                                {recommendations.slice(0, 5).map((rec) => (
                                  <div
                                    key={rec.id}
                                    className="flex-shrink-0 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 overflow-hidden cursor-pointer hover:shadow-lg transition-all"
                                    onClick={() => onAddRecommendation(rec)}
                                  >
                                    {rec.image && (
                                      <div className="relative h-24 w-full">
                                        <Image
                                          src={rec.image}
                                          alt={rec.title}
                                          fill
                                          className="object-cover"
                                          sizes="200px"
                                        />
                                      </div>
                                    )}
                                    <div className="p-3">
                                      <h4 className="text-xs font-semibold text-gray-900 dark:text-white line-clamp-1 mb-1">
                                        {rec.title}
                                      </h4>
                                      <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400">
                                        <span>{rec.duration}</span>
                                        <span>{rec.price}</span>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Event Card */}
                          <div className="flex gap-3">
                            {/* Time Column */}
                            <div className="flex-shrink-0 w-16 pt-1">
                              <div className="text-sm font-bold text-gray-900 dark:text-white">
                                {formatTime(event.startTime)}
                              </div>
                            </div>

                            {/* Event Content */}
                            <div className="flex-1">
                              <motion.div
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.03 }}
                              >
                                <div
                                  className={`rounded-lg shadow-sm hover:shadow-md transition-all cursor-pointer border overflow-hidden group ${
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
                                    <div className="flex items-start justify-between gap-2 mb-1">
                                      <h3 className={`text-sm font-semibold flex-1 ${
                                        isRecommendation
                                          ? 'text-purple-900 dark:text-purple-100'
                                          : 'text-gray-900 dark:text-white'
                                      }`}>
                                        {event.title}
                                      </h3>
                                      <div className="flex items-center gap-1">
                                        {isRecommendation && (
                                          <div className={`p-0.5 rounded-full ${isExpanded ? 'bg-purple-200 dark:bg-purple-700' : ''}`}>
                                            <svg
                                              className={`w-3 h-3 transition-transform ${isExpanded ? 'rotate-180' : ''} text-purple-600 dark:text-purple-400`}
                                              fill="none"
                                              stroke="currentColor"
                                              viewBox="0 0 24 24"
                                            >
                                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                            </svg>
                                          </div>
                                        )}
                                        {/* Only show remove button for non-calendar events */}
                                        {event.source !== 'google_calendar' && (
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
                                        )}
                                      </div>
                                    </div>

                                    <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
                                      <span>{getDuration(event.startTime, event.endTime)}</span>
                                      <span className="flex items-center gap-1">
                                        {getSourceIcon(event.source)}
                                      </span>
                                    </div>

                                    {isRecommendation && isExpanded && event.description && (
                                      <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        transition={{ duration: 0.2 }}
                                        className="mt-2 pt-2 border-t border-purple-200 dark:border-purple-800"
                                      >
                                        <p className="text-xs text-purple-800 dark:text-purple-200">
                                          {event.description}
                                        </p>
                                      </motion.div>
                                    )}
                                  </div>
                                </div>
                              </motion.div>
                            </div>
                          </div>
                        </React.Fragment>
                      );
                    })}

                    {/* Final gap after all events */}
                    {gaps.length > 0 && gaps[gaps.length - 1].endHour >= dayEvents[dayEvents.length - 1]?.endTime.getHours() && recommendations.length > 0 && onAddRecommendation && (
                      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-2 border-dashed border-blue-300 dark:border-blue-700 rounded-xl p-4 mt-3">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                            </svg>
                            <span className="text-sm font-semibold text-blue-900 dark:text-blue-100">
                              Add activity here
                            </span>
                          </div>
                          <span className="text-xs text-blue-600 dark:text-blue-400">
                            Evening slot
                          </span>
                        </div>

                        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                          {recommendations.slice(0, 5).map((rec) => (
                            <div
                              key={rec.id}
                              className="flex-shrink-0 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 overflow-hidden cursor-pointer hover:shadow-lg transition-all"
                              onClick={() => onAddRecommendation(rec)}
                            >
                              {rec.image && (
                                <div className="relative h-24 w-full">
                                  <Image
                                    src={rec.image}
                                    alt={rec.title}
                                    fill
                                    className="object-cover"
                                    sizes="200px"
                                  />
                                </div>
                              )}
                              <div className="p-3">
                                <h4 className="text-xs font-semibold text-gray-900 dark:text-white line-clamp-1 mb-1">
                                  {rec.title}
                                </h4>
                                <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400">
                                  <span>{rec.duration}</span>
                                  <span>{rec.price}</span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
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

