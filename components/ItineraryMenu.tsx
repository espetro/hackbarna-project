'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface ItineraryMenuProps {
  onOpenItinerary: () => void;
  eventCount: number;
}

export default function ItineraryMenu({
  onOpenItinerary,
  eventCount,
}: ItineraryMenuProps) {
  return (
    <div className="fixed top-4 left-4 z-30">
      <motion.button
        onClick={onOpenItinerary}
        className="relative bg-white dark:bg-gray-800 text-gray-800 dark:text-white rounded-full shadow-lg hover:shadow-xl transition-all flex items-center gap-2 px-4 py-3 border border-gray-200 dark:border-gray-700"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        aria-label="Open itinerary"
      >
        {/* Event Count Badge */}
        {eventCount > 0 && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1.5 -right-1.5 min-w-[1.5rem] h-6 bg-blue-600 text-white text-xs font-bold rounded-full flex items-center justify-center px-1.5"
          >
            {eventCount > 99 ? '99+' : eventCount}
          </motion.div>
        )}

        {/* Calendar Icon */}
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>

        <span className="font-semibold text-sm">Itinerary</span>
      </motion.button>
    </div>
  );
}

