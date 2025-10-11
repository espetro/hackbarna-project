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
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        {/* Success Animation/Icon */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-green-500 rounded-full mb-4 animate-bounce">
            <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Booked!
          </h1>
          <p className="text-xl text-gray-700">
            We have added this experience to your calendar.
          </p>
        </div>

        {/* Experience Details Card */}
        <div className="bg-white rounded-xl shadow-xl overflow-hidden mb-8">
          {/* Image */}
          <div className="relative h-64 w-full">
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
            <h2 className="text-2xl font-bold text-gray-900 mb-3">
              {selectedRecommendation.title}
            </h2>
            <p className="text-gray-600 mb-4">
              {selectedRecommendation.description}
            </p>

            {/* Info Grid */}
            <div className="grid grid-cols-2 gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
              {selectedRecommendation.duration && (
                <div>
                  <p className="text-sm text-gray-500 mb-1">Duration</p>
                  <p className="font-semibold text-gray-900">{selectedRecommendation.duration}</p>
                </div>
              )}
              {selectedRecommendation.price && (
                <div>
                  <p className="text-sm text-gray-500 mb-1">Price</p>
                  <p className="font-semibold text-gray-900">{selectedRecommendation.price}</p>
                </div>
              )}
              <div>
                <p className="text-sm text-gray-500 mb-1">Location</p>
                <p className="font-semibold text-gray-900">
                  {selectedRecommendation.location.lat.toFixed(4)}, {selectedRecommendation.location.lng.toFixed(4)}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Status</p>
                <p className="font-semibold text-green-600">Confirmed</p>
              </div>
            </div>

            {/* Add to Calendar Button */}
            <button
              onClick={handleAddToCalendar}
              className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors duration-200 flex items-center justify-center gap-2 mb-3"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Open Google Calendar
            </button>

            {/* Info Text */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <svg className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <p className="text-sm text-blue-900 font-medium mb-1">Next Steps</p>
                  <p className="text-sm text-blue-800">
                    Check your email for booking confirmation and details. The experience provider will contact you shortly with final arrangements.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4">
          <button
            onClick={handleExploreMore}
            className="flex-1 px-6 py-3 bg-primary hover:bg-primary-dark text-white font-semibold rounded-lg transition-colors duration-200"
          >
            Explore More Experiences
          </button>
          <button
            onClick={handleViewRecommendations}
            className="flex-1 px-6 py-3 bg-white hover:bg-gray-50 text-gray-700 font-semibold rounded-lg border-2 border-gray-300 transition-colors duration-200"
          >
            Back to Results
          </button>
        </div>

        {/* Footer Note */}
        <p className="text-center text-gray-500 text-sm mt-8">
          Have questions? Contact us at support@tetristravel.com
        </p>
      </div>
    </div>
  );
}
