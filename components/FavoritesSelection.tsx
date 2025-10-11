'use client';

import { AnimatePresence, MotionConfig, motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { BriefcaseBack, BriefcaseFront } from './BriefcaseAssets';
import clsx from 'clsx';
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
  const [attractionsToRemove, setAttractionsToRemove] = useState<number[]>([]);
  const [readyToRemove, setReadyToRemove] = useState<boolean>(false);
  const [removed, setRemoved] = useState(false);
  const [hide, setHide] = useState(false);

  const attractionsToShow = readyToRemove
    ? attractions.filter((attr) => !attractionsToRemove.includes(attr.id))
    : attractions;

  useEffect(() => {
    if (removed) {
      setTimeout(() => {
        setHide(true);
      }, 1000);

      setTimeout(() => {
        // Keep only favorites (non-removed attractions)
        const favorites = attractions.filter((attr) => !attractionsToRemove.includes(attr.id));
        onComplete(favorites);
      }, 1200);

      setTimeout(() => {
        setHide(false);
      }, 1700);
    }
  }, [removed, attractions, attractionsToRemove, onComplete]);

  return (
    <MotionConfig transition={{ type: 'spring', duration: 0.5, bounce: 0.2 }}>
      <motion.div
        initial={false}
        animate={{ opacity: hide ? 0 : 1 }}
        className="relative flex h-[700px] flex-col items-center justify-center"
      >
        <ul className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
          <AnimatePresence>
            {!readyToRemove &&
              attractionsToShow.map((attraction) => {
                const isSelected = attractionsToRemove.includes(attraction.id);

                return (
                  <motion.li
                    exit={isSelected ? {} : { opacity: 0, filter: 'blur(4px)', transition: { duration: 0.17 } }}
                    key={attraction.id}
                    className="relative flex h-[180px] w-[180px] md:h-[200px] md:w-[200px]"
                  >
                    <motion.div
                      exit={{ opacity: 0, transition: { duration: 0 } }}
                      className={clsx(
                        'pointer-events-none absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full z-10'
                      )}
                    >
                      <AnimatePresence>
                        {isSelected ? (
                          <motion.div
                            initial={{ scale: 0.5, opacity: 0, rotate: -180 }}
                            animate={{ scale: 1, opacity: 1, rotate: 0 }}
                            exit={{
                              scale: 0.5,
                              opacity: 0,
                              rotate: 180,
                              transition: { duration: 0.2 },
                            }}
                            transition={{
                              type: 'spring',
                              duration: 0.5,
                              bounce: 0.6,
                            }}
                            className="relative h-9 w-9"
                          >
                            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 shadow-lg" />
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="relative h-9 w-9 flex-shrink-0 rounded-full text-white p-1.5"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={3}
                                d="M5 13l4 4L19 7"
                              />
                            </svg>
                          </motion.div>
                        ) : null}
                      </AnimatePresence>
                    </motion.div>
                    <button
                      aria-label="Select favorite attraction"
                      onClick={() => {
                        if (isSelected) {
                          setAttractionsToRemove((attrs) => attrs.filter((id) => id !== attraction.id));
                        } else {
                          setAttractionsToRemove((attrs) => [...attrs, attraction.id]);
                        }
                      }}
                      className="relative w-full h-full group"
                    >
                      <motion.div
                        layoutId={`attraction-${attraction.id}`}
                        animate={{
                          scale: isSelected ? 0.95 : 1,
                          boxShadow: isSelected 
                            ? '0 0 0 5px rgba(139, 92, 246, 0.6), 0 20px 25px -5px rgba(139, 92, 246, 0.3)' 
                            : '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
                        }}
                        whileHover={!isSelected ? {
                          scale: 1.05,
                          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.15), 0 10px 10px -5px rgba(0, 0, 0, 0.1)',
                        } : {}}
                        transition={{
                          type: 'spring',
                          duration: 0.3,
                          bounce: 0.4,
                        }}
                        className="rounded-3xl overflow-hidden w-full h-full relative bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900"
                      >
                        <Image
                          src={attraction.src}
                          alt={attraction.alt}
                          fill
                          className={clsx(
                            'object-cover transition-all duration-300',
                            isSelected ? 'brightness-95 saturate-110' : 'group-hover:brightness-110 group-hover:saturate-125'
                          )}
                          sizes="200px"
                        />
                        {isSelected && (
                          <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="absolute inset-0 bg-gradient-to-br from-purple-500/25 via-indigo-500/20 to-pink-500/25 ring-[5px] ring-purple-500 dark:ring-purple-400 ring-inset backdrop-blur-[0.5px]"
                          />
                        )}
                        {/* Hover gradient overlay */}
                        {!isSelected && (
                          <div className="absolute inset-0 bg-gradient-to-t from-black/0 via-transparent to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        )}
                      </motion.div>
                    </button>
                  </motion.li>
                );
              })}
          </AnimatePresence>
        </ul>

        <AnimatePresence>
          {attractionsToRemove.length > 0 && !readyToRemove ? (
            <motion.div
              initial={{ y: 20, filter: 'blur(4px)', opacity: 0 }}
              animate={{ y: 0, filter: 'blur(0px)', opacity: 1 }}
              exit={{ y: 20, filter: 'blur(4px)', opacity: 0 }}
              className="absolute bottom-8 flex gap-3 rounded-2xl p-3 shadow-[0_0_0_1px_rgba(139,92,246,0.2),0px_8px_24px_-8px_rgba(139,92,246,0.3)] will-change-transform bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl"
            >
              <div className="flex w-full justify-between gap-3">
                <button
                  onClick={() => {
                    setAttractionsToRemove([]);
                  }}
                  className="flex w-28 flex-col items-center gap-1 rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 pb-2 pt-2 text-sm font-semibold text-gray-700 dark:text-gray-300 hover:from-gray-200 hover:to-gray-300 dark:hover:from-gray-600 dark:hover:to-gray-700 transition-all shadow-sm hover:shadow-md"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6 flex-shrink-0"
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
                  Clear
                </button>
                <button
                  onClick={() => {
                    if (readyToRemove) {
                      setRemoved(true);
                    } else {
                      setReadyToRemove(true);
                    }
                  }}
                  className="flex w-40 flex-col items-center gap-1 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 pb-2 pt-2 text-sm font-semibold text-white hover:from-purple-600 hover:to-indigo-700 transition-all shadow-md hover:shadow-lg hover:scale-105"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    className="h-6 w-6 flex-shrink-0"
                  >
                    <path
                      fillRule="evenodd"
                      clipRule="evenodd"
                      d="M8 6C8 3.79086 9.79086 2 12 2C14.2091 2 16 3.79086 16 6V7H17C18.1046 7 19 7.89543 19 9V19C19 20.1046 18.1046 21 17 21H7C5.89543 21 5 20.1046 5 19V9C5 7.89543 5.89543 7 7 7H8V6ZM12 4C10.8954 4 10 4.89543 10 6V7H14V6C14 4.89543 13.1046 4 12 4Z"
                      fill="currentColor"
                    />
                  </svg>
                  Add Preferences
                </button>
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>

        {readyToRemove ? (
          <motion.div
            initial={{ scale: 1.2, opacity: 0, filter: 'blur(4px)' }}
            animate={{ scale: 1, opacity: 1, filter: 'blur(0px)' }}
            transition={{ duration: 0.3, bounce: 0, type: 'spring' }}
            className="absolute bottom-10 flex flex-col gap-2"
          >
            <button
              onClick={() => {
                if (readyToRemove) {
                  setRemoved(true);
                } else {
                  setReadyToRemove(true);
                }
              }}
              className="flex h-14 px-8 items-center justify-center gap-3 rounded-full bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-600 text-center text-lg font-bold text-white hover:from-purple-700 hover:via-indigo-700 hover:to-purple-700 transition-all shadow-[0_0_30px_rgba(139,92,246,0.4)] hover:shadow-[0_0_40px_rgba(139,92,246,0.6)] hover:scale-105 ring-2 ring-purple-400/30 ring-offset-2 ring-offset-white dark:ring-offset-gray-900"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              Add {attractionsToRemove.length} to Preferences
            </button>
          </motion.div>
        ) : null}

        <AnimatePresence>
          {readyToRemove ? (
            <div className="absolute top-1/2 z-10 h-[114px] w-24 -translate-y-1/2">
              <motion.div
                initial={{ scale: 1.2, filter: 'blur(4px)', opacity: 0 }}
                animate={{ scale: 1, filter: 'blur(0px)', opacity: 1 }}
                exit={{ scale: 1.2, filter: 'blur(4px)', opacity: 0 }}
              >
                <BriefcaseBack />
              </motion.div>

              <motion.div
                animate={{
                  y: removed ? 110 : 73,
                  scale: removed ? 0.7 : 1,
                  filter: removed ? 'blur(4px)' : 'blur(0px)',
                }}
                transition={removed ? { duration: 0.3, type: 'spring', bounce: 0 } : { delay: 0.13 }}
                className="absolute flex w-full top-[-60px] flex-col-reverse items-center"
              >
                {attractions
                  .filter((attr) => attractionsToRemove.includes(attr.id))
                  .map((attraction, index) => (
                    <li key={attraction.id} className="flex h-1 items-center gap-2">
                      <motion.div
                        layoutId={`attraction-${attraction.id}`}
                        className="rounded overflow-hidden relative"
                        style={{
                          rotate:
                            index % 2 === 0
                              ? 4 * (attractionsToRemove.length - index + 1)
                              : -1 * (attractionsToRemove.length - index + 1) * 4,
                        }}
                      >
                        <Image
                          src={attraction.src}
                          alt={attraction.alt}
                          height={65}
                          width={65}
                          className="object-cover"
                        />
                      </motion.div>
                    </li>
                  ))}
              </motion.div>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ delay: 0.175, duration: 0 }}
                className="absolute bottom-[0] left-[3px] h-full w-[90px]"
              >
                <BriefcaseFront />
              </motion.div>
            </div>
          ) : null}
        </AnimatePresence>
      </motion.div>
    </MotionConfig>
  );
}
