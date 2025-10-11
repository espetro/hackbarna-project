'use client';

import React from 'react';
import { motion, PanInfo, useMotionValue, useTransform } from 'framer-motion';
import Image from 'next/image';
import { Recommendation } from '@/lib/types';

interface SwipeableCardStackProps {
  recommendations: Recommendation[];
  currentIndex: number;
  onIndexChange: (index: number) => void;
  onCardClick: (rec: Recommendation) => void;
  onBook: (rec: Recommendation) => void;
  onAddToItinerary?: (rec: Recommendation) => void;
}

export default function SwipeableCardStack({
  recommendations,
  currentIndex,
  onIndexChange,
  onCardClick,
  onBook,
  onAddToItinerary,
}: SwipeableCardStackProps) {
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-15, 15]);
  const opacity = useTransform(x, [-200, -100, 0, 100, 200], [0.5, 1, 1, 1, 0.5]);

  const handleDragEnd = (event: any, info: PanInfo) => {
    const threshold = 100;
    const velocity = info.velocity.x;
    const offset = info.offset.x;

    // Determine if swipe was strong enough
    if (Math.abs(velocity) > 500 || Math.abs(offset) > threshold) {
      if (offset > 0 || velocity > 0) {
        // Swipe right - go to previous card
        const newIndex = (currentIndex - 1 + recommendations.length) % recommendations.length;
        onIndexChange(newIndex);
      } else {
        // Swipe left - go to next card
        const newIndex = (currentIndex + 1) % recommendations.length;
        onIndexChange(newIndex);
      }
    }
  };

  const currentRec = recommendations[currentIndex];

  return (
    <div className="fixed bottom-10 md:bottom-12 left-1/2 transform -translate-x-1/2 w-full max-w-sm px-4 z-30">
      <div className="relative h-72 md:h-80">
        {/* Background cards for stacking effect */}
        <div className="absolute inset-0 transform scale-95 opacity-40 rounded-2xl">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg h-full" />
        </div>
        <div className="absolute inset-0 transform scale-[0.97] opacity-60 rounded-2xl">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg h-full" />
        </div>

        {/* Active card */}
        <motion.div
          className="absolute inset-0"
          style={{ x, rotate, opacity }}
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.7}
          onDragEnd={handleDragEnd}
        >
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl overflow-hidden h-full flex flex-col border-2 border-blue-500">
            {/* Image Section */}
            <div 
              className="relative h-32 md:h-40 flex-shrink-0 cursor-grab active:cursor-grabbing"
              onClick={() => onCardClick(currentRec)}
            >
              <Image
                src={currentRec.image || '/assets/barceloneta.png'}
                alt={currentRec.title}
                fill
                className="object-cover"
                sizes="400px"
              />
              <div className="absolute top-2 left-2 bg-purple-600 text-white px-2 py-1 rounded-full text-xs font-semibold">
                {currentIndex + 1}/{recommendations.length}
              </div>
              <div className="absolute top-2 right-2 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm px-2 py-1 rounded-full text-xs font-medium text-gray-800 dark:text-white">
                {currentRec.duration}
              </div>
            </div>

            {/* Content Section */}
            <div 
              className="flex-1 p-4 overflow-hidden cursor-grab active:cursor-grabbing"
              onClick={() => onCardClick(currentRec)}
            >
              <h3 className="text-lg md:text-xl font-bold text-gray-800 dark:text-white mb-2 line-clamp-2">
                {currentRec.title}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2 mb-2">
                {currentRec.description}
              </p>
              <div className="text-base font-bold text-gray-900 dark:text-white mb-2">
                {currentRec.price}
              </div>
              <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
                </svg>
                Swipe to explore
              </div>
            </div>

            {/* Action Buttons */}
            <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex-shrink-0">
              <div className="flex gap-2">
                {/* Add to Itinerary Button */}
                {onAddToItinerary && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onAddToItinerary(currentRec);
                    }}
                    className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-3 rounded-full font-semibold transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                    title="Add to Itinerary"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    <span className="hidden sm:inline">Itinerary</span>
                  </button>
                )}
                {/* Book Now Button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onBook(currentRec);
                  }}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white py-3 rounded-full font-semibold transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  Book Now
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
