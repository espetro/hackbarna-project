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

  const handleToggle = (id: number) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((selectedId) => selectedId !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const handleContinue = () => {
    const favorites = attractions.filter((attr) => selectedIds.includes(attr.id));
    onComplete(favorites);
  };

  return (
    <div className="w-full max-w-5xl">
      {/* Grid of attraction cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
        {attractions.map((attraction) => {
          const isSelected = selectedIds.includes(attraction.id);

          return (
            <motion.button
              key={attraction.id}
              onClick={() => handleToggle(attraction.id)}
              className="relative aspect-square group"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            >
              {/* Card container */}
              <div
                className={`relative w-full h-full rounded-2xl overflow-hidden transition-all duration-200 ${
                  isSelected
                    ? 'ring-4 ring-blue-500 shadow-2xl'
                    : 'ring-2 ring-gray-200 dark:ring-gray-700 shadow-lg hover:shadow-xl'
                }`}
              >
                {/* Image */}
                <Image
                  src={attraction.src}
                  alt={attraction.alt}
                  fill
                  className={`object-cover transition-all duration-200 ${
                    isSelected ? 'scale-105' : 'group-hover:scale-110'
                  }`}
                  sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                />

                {/* Overlay gradient */}
                <div
                  className={`absolute inset-0 transition-opacity duration-200 ${
                    isSelected
                      ? 'bg-gradient-to-t from-blue-600/40 to-transparent'
                      : 'bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100'
                  }`}
                />

                {/* Selected checkmark */}
                <AnimatePresence>
                  {isSelected && (
                    <motion.div
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0, opacity: 0 }}
                      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                      className="absolute top-3 right-3 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center shadow-lg z-10"
                    >
                      <svg
                        className="w-5 h-5 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={3}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.button>
          );
        })}
      </div>

      {/* Action buttons */}
      <AnimatePresence>
        {selectedIds.length > 0 && (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 20, opacity: 0 }}
            className="flex flex-col sm:flex-row gap-3 justify-center items-center"
          >
            <button
              onClick={() => setSelectedIds([])}
              className="px-6 py-3 bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-full font-semibold hover:bg-gray-50 dark:hover:bg-gray-700 transition-all shadow-md hover:shadow-lg"
            >
              Clear Selection
            </button>
            <button
              onClick={handleContinue}
              className="px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-full font-semibold transition-all shadow-lg hover:shadow-xl flex items-center gap-2"
            >
              <span>Continue with {selectedIds.length} Selected</span>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Helper text when nothing selected */}
      {selectedIds.length === 0 && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center text-gray-500 dark:text-gray-400 text-sm"
        >
          Select one or more activities to continue
        </motion.p>
      )}
    </div>
  );
}
