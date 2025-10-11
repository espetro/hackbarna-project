'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { useState } from 'react';
import Image from 'next/image';

interface Attraction {
  id: number;
  src: string;
  alt: string;
}

interface FavoritesSelectionProps {
  attractions: Attraction[];
  onComplete: (favorites: Attraction[]) => void;
}

export function FavoritesSelection({ attractions, onComplete }: FavoritesSelectionProps) {
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const handleToggle = (id: number) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((selectedId) => selectedId !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const handleContinue = () => {
    setIsTransitioning(true);
    // Short delay for white screen transition
    setTimeout(() => {
      const favorites = attractions.filter((attr) => selectedIds.includes(attr.id));
      onComplete(favorites);
    }, 600);
  };

  return (
    <>
      {/* White transition overlay */}
      <AnimatePresence>
        {isTransitioning && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
            className="fixed inset-0 bg-white dark:bg-gray-900 z-[100] flex items-center justify-center"
          >
            <div className="text-center">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"
              />
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="text-lg font-medium text-gray-900 dark:text-white"
              >
                Preparing your preferences...
              </motion.p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="w-full max-w-5xl relative pb-32">
        {/* Grid of attraction cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {attractions.map((attraction, index) => {
            const isSelected = selectedIds.includes(attraction.id);

            return (
              <motion.button
                key={attraction.id}
                onClick={() => handleToggle(attraction.id)}
                className="relative aspect-square group"
                initial={{ opacity: 0, scale: 0.8, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ 
                  type: 'spring', 
                  stiffness: 300, 
                  damping: 25,
                  delay: index * 0.1 // Staggered entrance animation
                }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {/* Card container with enhanced selection animation */}
                <motion.div
                  className={`relative w-full h-full rounded-2xl overflow-hidden transition-all duration-300 ${
                    isSelected
                      ? 'ring-4 ring-blue-500 shadow-2xl'
                      : 'ring-2 ring-gray-200 dark:ring-gray-700 shadow-lg hover:shadow-xl'
                  }`}
                  animate={isSelected ? { scale: 1.02 } : { scale: 1 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                >
                  {/* Image */}
                  <Image
                    src={attraction.src}
                    alt={attraction.alt}
                    fill
                    className={`object-cover transition-all duration-300 ${
                      isSelected ? 'scale-110 brightness-95' : 'group-hover:scale-105'
                    }`}
                    sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                  />

                  {/* Enhanced overlay gradient with animation */}
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-t from-blue-600/30 to-transparent"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: isSelected ? 1 : 0 }}
                    transition={{ duration: 0.3 }}
                  />

                  {/* Hover overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200" />

                  {/* Selected checkmark with enhanced animation */}
                  <AnimatePresence>
                    {isSelected && (
                      <motion.div
                        initial={{ scale: 0, opacity: 0, rotate: -180 }}
                        animate={{ scale: 1, opacity: 1, rotate: 0 }}
                        exit={{ scale: 0, opacity: 0, rotate: 180 }}
                        transition={{ 
                          type: 'spring', 
                          stiffness: 600, 
                          damping: 25,
                          duration: 0.5
                        }}
                        className="absolute top-3 right-3 w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center shadow-xl z-10 border-2 border-white"
                      >
                        <motion.svg
                          className="w-7 h-7 text-white"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          initial={{ pathLength: 0 }}
                          animate={{ pathLength: 1 }}
                          transition={{ duration: 0.3, delay: 0.1 }}
                        >
                          <motion.path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={3}
                            d="M5 13l4 4L19 7"
                          />
                        </motion.svg>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Title overlay */}
                  <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/70 to-transparent">
                    <p className="text-white text-sm font-semibold truncate">
                      {attraction.alt}
                    </p>
                  </div>
                </motion.div>
              </motion.button>
            );
          })}
        </div>


        {/* Centered Floating Action Buttons - Fixed to viewport */}
        <AnimatePresence>
          {selectedIds.length > 0 && (
            <motion.div
              initial={{ y: 100, opacity: 0, scale: 0.9 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: 100, opacity: 0, scale: 0.9 }}
              transition={{ 
                type: 'spring', 
                stiffness: 300, 
                damping: 25,
                opacity: { duration: 0.2 }
              }}
              className="fixed bottom-6 left-0 right-0 z-50 flex justify-center px-4"
            >
              <div className="flex flex-col items-center gap-3 max-w-md w-full">
                {/* Count badge with enhanced animation */}
                <motion.div
                  initial={{ scale: 0, y: 20 }}
                  animate={{ scale: 1, y: 0 }}
                  transition={{ 
                    delay: 0.1, 
                    type: 'spring', 
                    stiffness: 500, 
                    damping: 25 
                  }}
                  className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white px-6 py-3 rounded-full font-bold shadow-xl border-2 border-blue-200 dark:border-blue-800"
                >
                  <motion.span
                    key={selectedIds.length} // Re-animate when count changes
                    initial={{ scale: 1.3, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.2 }}
                  >
                    {selectedIds.length} {selectedIds.length === 1 ? 'movie' : 'movies'} selected
                  </motion.span>
                </motion.div>

                {/* Action buttons with enhanced animations */}
                <div className="flex gap-3 w-full">
                  {/* Clear button */}
                  <motion.button
                    onClick={() => setSelectedIds([])}
                    initial={{ scale: 0, x: -50 }}
                    animate={{ scale: 1, x: 0 }}
                    transition={{ 
                      delay: 0.15, 
                      type: 'spring', 
                      stiffness: 400, 
                      damping: 25 
                    }}
                    className="flex-1 px-6 py-4 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 font-bold rounded-full border-2 border-gray-300 dark:border-gray-600 transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    Clear
                  </motion.button>

                  {/* Continue button */}
                  <motion.button
                    onClick={handleContinue}
                    initial={{ scale: 0, x: 50 }}
                    animate={{ scale: 1, x: 0 }}
                    transition={{ 
                      delay: 0.2, 
                      type: 'spring', 
                      stiffness: 400, 
                      damping: 25 
                    }}
                    className="flex-[2] px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold rounded-full transition-all shadow-xl hover:shadow-2xl flex items-center justify-center gap-2"
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <span className="text-lg">Continue</span>
                    <motion.svg 
                      className="w-5 h-5" 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                      whileHover={{ x: 2 }}
                      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </motion.svg>
                  </motion.button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}
