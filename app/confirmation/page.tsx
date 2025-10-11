/*
 * BOOKING CONFIRMATION PAGE - CURRENTLY DISABLED
 * 
 * This page has been commented out as booking functionality has been removed.
 * The app now focuses on itinerary management only.
 * 
 * To re-enable: uncomment the handleBook functions in recommendations/page.tsx
 * and SwipeableCardStack.tsx
 */

'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useAppContext } from '@/lib/context/AppContext';

export default function ConfirmationPage() {
  const router = useRouter();
  const { selectedRecommendation } = useAppContext();

  // Redirect if no selection
  useEffect(() => {
    if (!selectedRecommendation) {
      router.push('/inspiration');
    }
  }, [selectedRecommendation, router]);

  const handleExploreMore = () => {
    router.push('/inspiration');
  };

  const handleViewRecommendations = () => {
    router.push('/recommendations');
  };

  // Simulate adding to Google Calendar (in production, this would use Calendar API)
  const handleAddToCalendar = () => {
    // This would typically open Google Calendar with pre-filled event data
    // For demo purposes, we'll just show an alert
    alert('In production, this would open Google Calendar to add the event. For now, consider it added to your calendar!');
  };

  if (!selectedRecommendation) {
    return null; // Will redirect
  }

  return (
    <div className="h-screen bg-white dark:bg-gray-900 flex items-center justify-center px-4 sm:px-6 lg:px-8 overflow-y-auto">
      <div className="w-full max-w-3xl py-8">
        {/* Success Animation/Icon */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full mb-4 shadow-xl">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-3">
            Booking Confirmed!
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Your experience has been added to your itinerary
          </p>
        </div>

        {/* Experience Details Card */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden mb-6 border-2 border-gray-100 dark:border-gray-700">
          {/* Image */}
          <div className="relative h-56 w-full">
            <Image
              src={selectedRecommendation.image}
              alt={selectedRecommendation.title}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 768px"
            />
          </div>

          {/* Details */}
          <div className="p-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
              {selectedRecommendation.title}
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {selectedRecommendation.description}
            </p>

            {/* Info Grid */}
            <div className="grid grid-cols-2 gap-4 mb-6 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
              {selectedRecommendation.duration && (
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Duration</p>
                  <p className="font-semibold text-gray-900 dark:text-white">{selectedRecommendation.duration}</p>
                </div>
              )}
              {selectedRecommendation.price && (
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Price</p>
                  <p className="font-semibold text-gray-900 dark:text-white">{selectedRecommendation.price}</p>
                </div>
              )}
              <div className="col-span-2">
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Status</p>
                <p className="font-semibold text-blue-600 dark:text-blue-400 flex items-center gap-2">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Confirmed
                </p>
              </div>
            </div>

            {/* Add to Calendar Button */}
            <button
              onClick={handleAddToCalendar}
              className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold rounded-full transition-all duration-200 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Add to Google Calendar
            </button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <button
            onClick={handleViewRecommendations}
            className="flex-1 px-6 py-3 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 font-semibold rounded-full border-2 border-gray-300 dark:border-gray-600 transition-all duration-200 shadow-md hover:shadow-lg"
          >
            View More Recommendations
          </button>
          <button
            onClick={handleExploreMore}
            className="flex-1 px-6 py-3 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 font-semibold rounded-full transition-all duration-200"
          >
            Start New Search
          </button>
        </div>
      </div>
    </div>
  );
}
