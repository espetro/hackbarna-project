/*
 * THANK YOU / BOOKING SUCCESS PAGE - CURRENTLY DISABLED
 * 
 * This page has been commented out as booking functionality has been removed.
 * The app now focuses on itinerary management only.
 * 
 * To re-enable: uncomment the handleBook functions in recommendations/page.tsx
 * and SwipeableCardStack.tsx
 */

'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useAppContext } from '@/lib/context/AppContext';

export default function ThankYouPage() {
  const router = useRouter();
  const { selectedRecommendation } = useAppContext();
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    // Countdown and redirect to inspiration page
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          router.push('/inspiration');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [router]);

  return (
    <div className="h-screen bg-white dark:bg-gray-900 flex items-center justify-center p-4">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="max-w-md w-full bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 text-center border-2 border-gray-100 dark:border-gray-700"
      >
        {/* Success Icon */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.1, type: "spring", stiffness: 300, damping: 20 }}
          className="mb-6 flex justify-center"
        >
          <div className="w-20 h-20 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full flex items-center justify-center shadow-xl">
            <svg
              className="w-10 h-10 text-white"
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
          </div>
        </motion.div>

        {/* Title */}
        <motion.h1
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-3xl font-bold text-gray-900 dark:text-white mb-3"
        >
          All Set!
        </motion.h1>

        {/* Description */}
        <motion.p
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-gray-600 dark:text-gray-400 mb-6 text-lg"
        >
          {selectedRecommendation ? (
            <>
              <span className="font-semibold text-gray-900 dark:text-white">{selectedRecommendation.title}</span> has been added to your itinerary
            </>
          ) : (
            'Your experience has been successfully booked'
          )}
        </motion.p>

        {/* Details Card */}
        {selectedRecommendation && (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-5 mb-6"
          >
            <div className="space-y-3 text-left">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-400">Duration</span>
                <span className="text-sm font-semibold text-gray-900 dark:text-white">
                  {selectedRecommendation.duration}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-400">Price</span>
                <span className="text-sm font-semibold text-gray-900 dark:text-white">
                  {selectedRecommendation.price}
                </span>
              </div>
            </div>
          </motion.div>
        )}

        {/* Countdown */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-sm text-gray-500 dark:text-gray-400 mb-6"
        >
          Redirecting in <span className="font-bold text-blue-600 dark:text-blue-400">{countdown}</span> seconds...
        </motion.p>

        {/* Action Buttons */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="space-y-3"
        >
          <button
            onClick={() => router.push('/inspiration')}
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-3 rounded-full transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            Explore More
          </button>
          <button
            onClick={() => router.push('/recommendations')}
            className="w-full bg-white dark:bg-gray-700 border-2 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 font-semibold py-3 rounded-full transition-all duration-200"
          >
            View Recommendations
          </button>
        </motion.div>
      </motion.div>
    </div>
  );
}

