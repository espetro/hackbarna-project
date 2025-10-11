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
    <div className="fixed top-6 left-6 z-30">
      {/* Single Itinerary Button - Top Left */}
      <motion.button
        onClick={onOpenItinerary}
        className="relative bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-full shadow-2xl hover:shadow-3xl transition-all flex items-center gap-3 px-6 py-3"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        aria-label="Open itinerary"
      >
        {/* Event Count Badge */}
        {eventCount > 0 && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-2 -right-2 w-7 h-7 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center border-2 border-white"
          >
            {eventCount > 99 ? '99+' : eventCount}
          </motion.div>
        )}

        {/* Calendar Icon */}
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        
        <span className="font-semibold text-base">View Itinerary</span>
      </motion.button>
    </div>
  );
}

