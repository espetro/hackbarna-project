'use client';

import { AnimatePresence, motion, MotionConfig } from 'framer-motion';
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
  const [isReadyToConfirm, setIsReadyToConfirm] = useState(false);

  const handleToggle = (id: number) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((selectedId) => selectedId !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const handleContinue = () => {
    if (isReadyToConfirm) {
      const favorites = attractions.filter((attr) => selectedIds.includes(attr.id));
      onComplete(favorites);
    } else {
      setIsReadyToConfirm(true);
    }
  };

  const handleBack = () => {
    setIsReadyToConfirm(false);
  };

  return (
    <MotionConfig transition={{ type: 'spring', duration: 0.5, bounce: 0.2 }}>
      <div className="w-full max-w-5xl relative pb-32">
        {/* Grid of attraction cards */}
        <AnimatePresence mode="popLayout">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
            {attractions.map((attraction) => {
              const isSelected = selectedIds.includes(attraction.id);

              return (
                <motion.li
                  key={attraction.id}
                  className="relative flex"
                  layout
                  exit={
                    !isSelected
                      ? {
                          opacity: 0,
                          filter: 'blur(4px)',
                          transition: { duration: 0.05 },
                        }
                      : {}
                  }
                >
                  <motion.button
                    onClick={() => !isReadyToConfirm && handleToggle(attraction.id)}
                    className="relative aspect-square group w-full"
                    whileHover={!isReadyToConfirm ? { scale: 1.02 } : {}}
                    whileTap={!isReadyToConfirm ? { scale: 0.98 } : {}}
                    disabled={isReadyToConfirm}
                    layout
                  >
                    {/* Card container */}
                    <div
                      className={`relative w-full h-full rounded-2xl overflow-hidden transition-all duration-200 ${
                        isSelected
                          ? 'ring-4 ring-blue-500 shadow-2xl'
                          : 'ring-2 ring-gray-200 dark:ring-gray-700 shadow-lg hover:shadow-xl'
                      }`}
                    >
                      {/* Image with layoutId for shared animation */}
                      <motion.div
                        layoutId={`image-${attraction.id}`}
                        className="relative w-full h-full"
                      >
                        <Image
                          src={attraction.src}
                          alt={attraction.alt}
                          fill
                          className={`object-cover transition-all duration-200 ${
                            isSelected ? 'scale-105' : 'group-hover:scale-110'
                          }`}
                          sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                        />
                      </motion.div>

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
                </motion.li>
              );
            })}
          </div>
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

        {/* Collection Box with selected items */}
        <AnimatePresence>
          {selectedIds.length > 0 && isReadyToConfirm && (
            <motion.div
              initial={{ opacity: 0, scale: 1.2, filter: 'blur(4px)' }}
              animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
              exit={{ opacity: 0, scale: 1.2, filter: 'blur(4px)' }}
              className="fixed bottom-32 left-1/2 -translate-x-1/2 z-40"
            >
              {/* Animated container that drops items */}
              <motion.div
                animate={{ y: 20 }}
                transition={{ delay: 0.13 }}
                className="flex flex-col-reverse items-center"
              >
                {/* Collection of selected images */}
                <div className="relative bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/40 dark:to-indigo-900/40 backdrop-blur-xl rounded-3xl p-6 shadow-2xl border-2 border-blue-200 dark:border-blue-800">
                  <div className="flex gap-2 items-center justify-center flex-wrap max-w-md">
                    {attractions
                      .filter((attr) => selectedIds.includes(attr.id))
                      .map((attraction, index) => (
                        <motion.div
                          key={attraction.id}
                          layoutId={`image-${attraction.id}`}
                          className="relative"
                          style={{
                            rotate:
                              index % 2 === 0
                                ? 4 * (selectedIds.length - index + 1)
                                : -1 * (selectedIds.length - index + 1) * 4,
                          }}
                        >
                          <Image
                            src={attraction.src}
                            alt={attraction.alt}
                            width={80}
                            height={80}
                            className="rounded-xl object-cover shadow-lg"
                          />
                        </motion.div>
                      ))}
                  </div>

                  {/* Count badge */}
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-3 -right-3 bg-blue-600 text-white w-10 h-10 rounded-full flex items-center justify-center font-bold shadow-lg border-4 border-white dark:border-gray-900"
                  >
                    {selectedIds.length}
                  </motion.div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Floating Action Toolbar */}
        <AnimatePresence>
          {selectedIds.length > 0 && (
            <motion.div
              key="toolbar"
              initial={{ y: 20, opacity: 0, filter: 'blur(4px)' }}
              animate={{
                y: 0,
                opacity: 1,
                filter: 'blur(0px)',
              }}
              exit={{ y: 20, opacity: 0, filter: 'blur(4px)' }}
              transition={{ duration: 0.3, bounce: 0, type: 'spring' }}
              className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50"
            >
              <div className="flex gap-2 bg-white dark:bg-gray-800 rounded-2xl p-2 shadow-2xl border-2 border-gray-200 dark:border-gray-700">
                {/* Back button - only show when ready to confirm */}
                {isReadyToConfirm && (
                  <motion.button
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    onClick={handleBack}
                    className="flex flex-col items-center gap-1 rounded-xl bg-gray-100 dark:bg-gray-700 px-4 py-3 text-xs font-medium text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors min-w-[60px]"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="size-5 flex-shrink-0"
                      viewBox="0 0 24 24"
                      fill="none"
                    >
                      <path
                        fillRule="evenodd"
                        clipRule="evenodd"
                        d="M10.8839 18.6339C10.3957 19.122 9.60427 19.122 9.11612 18.6339L3.36612 12.8839C3.1317 12.6495 3 12.3315 3 12C3 11.6685 3.13169 11.3506 3.36612 11.1161L9.11612 5.36612C9.60427 4.87796 10.3957 4.87796 10.8839 5.36612C11.372 5.85427 11.372 6.64573 10.8839 7.13388L7.26776 10.75H19.75C20.4404 10.75 21 11.3097 21 12C21 12.6904 20.4404 13.25 19.75 13.25H7.26777L10.8839 16.8661C11.372 17.3543 11.372 18.1457 10.8839 18.6339Z"
                        fill="currentColor"
                      />
                    </svg>
                    Back
                  </motion.button>
                )}

                {/* Clear button */}
                <button
                  onClick={() => setSelectedIds([])}
                  className="flex flex-col items-center gap-1 rounded-xl bg-gray-100 dark:bg-gray-700 px-4 py-3 text-xs font-medium text-gray-900 dark:text-white hover:bg-red-100 hover:text-red-600 dark:hover:bg-red-900/30 dark:hover:text-red-400 transition-colors min-w-[60px]"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    className="size-5 flex-shrink-0"
                  >
                    <path
                      fillRule="evenodd"
                      clipRule="evenodd"
                      d="M7.58393 5C8.28068 3.24301 9.99487 2 12.0009 2C14.007 2 15.7212 3.24301 16.4179 5H21.25C21.6642 5 22 5.33579 22 5.75C22 6.16421 21.6642 6.5 21.25 6.5H19.9532L19.0588 20.3627C18.9994 21.2835 18.2352 22 17.3124 22H6.68756C5.76481 22 5.0006 21.2835 4.94119 20.3627L4.04683 6.5H2.75C2.33579 6.5 2 6.16421 2 5.75C2 5.33579 2.33579 5 2.75 5H7.58393ZM9.26161 5C9.83935 4.09775 10.8509 3.5 12.0009 3.5C13.151 3.5 14.1625 4.09775 14.7403 5H9.26161Z"
                      fill="currentColor"
                    />
                  </svg>
                  Clear
                </button>

                {/* Continue/Confirm button */}
                <button
                  onClick={handleContinue}
                  className="flex flex-col items-center gap-1 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 px-6 py-3 text-xs font-bold text-white transition-all shadow-lg hover:shadow-xl min-w-[80px]"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="size-5"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2.5}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  {isReadyToConfirm ? 'Confirm' : 'Continue'}
                </button>
              </div>

              {/* Selection count tooltip */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="absolute -top-12 left-1/2 -translate-x-1/2 bg-gray-900 dark:bg-gray-700 text-white px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap shadow-lg"
              >
                {selectedIds.length} {selectedIds.length === 1 ? 'item' : 'items'} selected
                {/* Arrow pointer */}
                <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-gray-900 dark:bg-gray-700 rotate-45" />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </MotionConfig>
  );
}
