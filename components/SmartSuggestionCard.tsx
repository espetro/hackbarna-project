'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { SmartSuggestion } from '@/lib/types';
import { formatDistance, formatSlotDuration, parseDurationToMinutes } from '@/lib/smartSuggestions';

interface SmartSuggestionCardProps {
  suggestion: SmartSuggestion;
  onAdd: (suggestion: SmartSuggestion) => void;
  onExpand: (suggestion: SmartSuggestion) => void;
}

export default function SmartSuggestionCard({
  suggestion,
  onAdd,
  onExpand,
}: SmartSuggestionCardProps) {
  const { activity, slot, distanceToClosest, closestActivity, suggestedStartTime, suggestedEndTime } = suggestion;
  const [imageError, setImageError] = React.useState(false);

  // Safety check: If activity is undefined, don't render the card
  if (!activity) {
    console.warn('⚠️ SmartSuggestionCard received undefined activity');
    return null;
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const activityDuration = parseDurationToMinutes(activity.duration);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -10, scale: 0.95 }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      className="relative bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-2 border-blue-200 dark:border-blue-700 rounded-xl p-4 shadow-md hover:shadow-lg transition-all cursor-pointer"
      onClick={() => onExpand(suggestion)}
    >
      {/* "Smart Fit" Badge */}
      <div className="absolute -top-2 left-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs font-bold px-2 py-1 rounded-full shadow-md">
        Smart Fit
      </div>

      <div className="flex items-start gap-3 mt-2">
        {/* Activity Image */}
        <div className="relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-gray-200 dark:bg-gray-700">
          {activity.image && !imageError ? (
            <Image
              src={activity.image}
              alt={activity.title}
              fill
              className="object-cover"
              sizes="64px"
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <svg className="w-8 h-8 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Activity Title */}
          <h4 className="text-sm font-semibold text-blue-900 dark:text-blue-100 truncate mb-1">
            {activity.title}
          </h4>

          {/* Suggested Time */}
          <div className="flex items-center gap-2 text-xs text-blue-700 dark:text-blue-300 mb-2">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="font-medium">
              {formatTime(suggestedStartTime)} - {formatTime(suggestedEndTime)}
            </span>
          </div>

          {/* Smart Fit Metrics */}
          <div className="flex items-center gap-4 text-xs">
            {/* Distance to closest */}
            <div className="flex items-center gap-1 text-green-700 dark:text-green-300">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span>{formatDistance(distanceToClosest)} from {closestActivity}</span>
            </div>

            {/* Duration fit */}
            <div className="flex items-center gap-1 text-blue-700 dark:text-blue-300">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Fits {formatSlotDuration(activityDuration)} slot</span>
            </div>
          </div>
        </div>

        {/* Quick Add Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onAdd(suggestion);
          }}
          className="flex-shrink-0 p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-md hover:shadow-lg transition-all duration-200"
          aria-label="Add to itinerary"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
        </button>
      </div>

      {/* Available Time Slot Info */}
      <div className="mt-3 pt-3 border-t border-blue-200 dark:border-blue-700">
        <div className="text-xs text-blue-600 dark:text-blue-400">
          <span className="font-medium">Available slot:</span> {formatSlotDuration(slot.availableMinutes)} 
          <span className="ml-2">({formatTime(slot.startTime)} - {formatTime(slot.endTime)})</span>
        </div>
      </div>
    </motion.div>
  );
}
