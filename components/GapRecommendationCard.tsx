'use client';

import React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { RecommendationFit, formatDurationFit, formatDistance } from '@/lib/itineraryIntelligence';

interface GapRecommendationCardProps {
  fit: RecommendationFit;
  onAdd: () => void;
}

export default function GapRecommendationCard({ fit, onAdd }: GapRecommendationCardProps) {
  const { recommendation, fitScore, durationFit, suggestedStartTime, suggestedEndTime, distanceFromPrevious, distanceFromNext } = fit;
  const { label, badgeColor } = formatDurationFit(durationFit);
  const [imageError, setImageError] = React.useState(false);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  // Determine which distance to show (prefer closest)
  const closestDistance = distanceFromPrevious !== undefined && distanceFromNext !== undefined
    ? Math.min(distanceFromPrevious, distanceFromNext)
    : distanceFromPrevious ?? distanceFromNext;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex-shrink-0 w-56 bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 overflow-hidden cursor-pointer hover:shadow-xl hover:scale-105 transition-all duration-200"
      onClick={onAdd}
    >
      {/* Image */}
      <div className="relative h-32 w-full bg-gray-200 dark:bg-gray-700">
        {recommendation.image && !imageError ? (
          <Image
            src={recommendation.image}
            alt={recommendation.title}
            fill
            className="object-cover"
            sizes="224px"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <svg className="w-12 h-12 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        )}

        {/* Fit Badge */}
        <div className={`absolute top-2 right-2 px-2 py-1 rounded-full text-xs font-bold ${badgeColor}`}>
          {label}
        </div>

        {/* Fit Score */}
        {fitScore >= 80 && (
          <div className="absolute top-2 left-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1">
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            {fitScore}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-3">
        <h4 className="text-sm font-bold text-gray-900 dark:text-white line-clamp-2 mb-2">
          {recommendation.title}
        </h4>

        {/* Time Slot */}
        <div className="flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400 mb-2">
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="font-medium">
            {formatTime(suggestedStartTime)} - {formatTime(suggestedEndTime)}
          </span>
        </div>

        {/* Details */}
        <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400 mb-2">
          <span className="font-medium">{recommendation.duration}</span>
          <span className="font-medium">{recommendation.price}</span>
        </div>

        {/* Distance */}
        {closestDistance !== undefined && (
          <div className="flex items-center gap-1 text-xs text-green-600 dark:text-green-400">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span className="font-medium">{formatDistance(closestDistance)}</span>
          </div>
        )}

        {/* Add Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onAdd();
          }}
          className="w-full mt-3 px-3 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-lg font-semibold text-xs transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-1"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Add to Itinerary
        </button>
      </div>
    </motion.div>
  );
}
