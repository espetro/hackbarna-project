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
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="max-w-md w-full bg-white dark:bg-gray-800 rounded-3xl shadow-2xl p-8 text-center"
      >
        {/* Success Icon */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200, damping: 10 }}
          className="mb-6 flex justify-center"
        >
          <div className="w-20 h-20 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full flex items-center justify-center">
            <svg
              className="w-12 h-12 text-white"
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
          transition={{ delay: 0.3 }}
          className="text-3xl font-bold text-gray-800 dark:text-white mb-3"
        >
          Booking Confirmed!
        </motion.h1>

        {/* Description */}
        <motion.p
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-gray-600 dark:text-gray-300 mb-6"
        >
          {selectedRecommendation ? (
            <>
              Your experience <span className="font-semibold">{selectedRecommendation.title}</span> has been successfully booked!
            </>
          ) : (
            'Your experience has been successfully booked!'
          )}
        </motion.p>

        {/* Details Card */}
        {selectedRecommendation && (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-gray-700 dark:to-gray-600 rounded-2xl p-6 mb-6"
          >
            <div className="space-y-3 text-left">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-300">Experience:</span>
                <span className="text-sm font-semibold text-gray-800 dark:text-white">
                  {selectedRecommendation.title}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-300">Duration:</span>
                <span className="text-sm font-semibold text-gray-800 dark:text-white">
                  {selectedRecommendation.duration}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-300">Price:</span>
                <span className="text-sm font-semibold text-gray-800 dark:text-white">
                  {selectedRecommendation.price}
                </span>
              </div>
            </div>
          </motion.div>
        )}

        {/* Confirmation Message */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-xl p-4 mb-6"
        >
          <p className="text-sm text-blue-800 dark:text-blue-200">
            A confirmation email has been sent to your inbox with all the details.
          </p>
        </motion.div>

        {/* Countdown */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="text-sm text-gray-500 dark:text-gray-400 mb-6"
        >
          Redirecting to home in <span className="font-bold text-purple-600 dark:text-purple-400">{countdown}</span> seconds...
        </motion.p>

        {/* Action Buttons */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="space-y-3"
        >
          <button
            onClick={() => router.push('/inspiration')}
            className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold py-3 rounded-full transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            Explore More Experiences
          </button>
          <button
            onClick={() => router.push('/favorites')}
            className="w-full bg-white dark:bg-gray-700 border-2 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 font-semibold py-3 rounded-full transition-all duration-200"
          >
            View My Favorites
          </button>
        </motion.div>
      </motion.div>
    </div>
  );
}

