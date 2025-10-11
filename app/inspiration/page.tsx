'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useAppContext } from '@/lib/context/AppContext';
import { mockRecommendations } from '@/lib/mockData';
import Logo from '@/components/Logo';
import { BackgroundLines } from '@/components/BackgroundLines';
import { motion } from 'framer-motion';

// Inspiration images - using Unsplash for demo purposes
const inspirationImages = [
  {
    id: 1,
    src: '/assets/barceloneta.png',
    alt: 'Barceloneta experience',
  },
  {
    id: 2,
    src: '/assets/flamenco.png',
    alt: 'Flamenco Show',
  },
  {
    id: 3,
    src: '/assets/camp nou.png',
    alt: 'Camp Nou',
  },
  {
    id: 4,
    src: '/assets/casa mila pedrera.png',
    alt: 'La Pedrera',
  },
  {
    id: 5,
    src: '/assets/moco museum.png',
    alt: 'Moco Museum',
  },
  {
    id: 6,
    src: '/assets/parc guell.png',
    alt: 'Parc Guell',
  },
  {
    id: 7,
    src: '/assets/safrada familia.png',
    alt: 'Sagrada Familia',
  },
  {
    id: 8,
    src: '/assets/montserrat mountains.png',
    alt: 'Montserrat Mountains',
  },
];

export default function InspirationPage() {
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const { setRecommendations, setUserQuery, itineraryEvents } = useAppContext();

  const handleSeeWeekActivities = () => {
    // Navigate to recommendations page which has the itinerary
    router.push('/recommendations');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!query.trim()) {
      setError('Please enter what kind of experience you are looking for');
      return;
    }

    setError('');
    setIsLoading(true);
    setUserQuery(query);

    try {
      // Check if API endpoint is configured
      const apiEndpoint = process.env.NEXT_PUBLIC_RECOMMENDATIONS_API;

      if (apiEndpoint && apiEndpoint.trim() !== '') {
        // Make API call if endpoint is configured
        console.log('Using API endpoint:', apiEndpoint);
        const response = await fetch(apiEndpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ query }),
        });

        if (!response.ok) {
          throw new Error('Failed to fetch recommendations');
        }

        const data = await response.json();
        setRecommendations(data);

        // Navigate to recommendations page
        router.push('/recommendations');
      } else {
        // Use mock data if no API endpoint is configured
        console.log('No API endpoint configured, using mock data');

        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 1000));

        setRecommendations(mockRecommendations);

        // Navigate to recommendations page
        router.push('/recommendations');
      }
    } catch (err) {
      console.error('Error fetching recommendations:', err);

      // Fallback to mock data on error
      console.log('API call failed, using mock data as fallback');
      setRecommendations(mockRecommendations);
      router.push('/recommendations');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <BackgroundLines>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.5, ease: "easeInOut" }}
        className="min-h-screen py-12 px-4 sm:px-6 lg:px-8"
      >
        <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="flex justify-center mb-8">
            <Logo width={160} height={53} />
          </div>
          <h1 className="text-4xl md:text-5xl font-light text-gray-900 dark:text-white mb-2">
            What do u fancy and when can you make it?
          </h1>
        </div>

        {/* Search Form */}
        <div className="max-w-4xl mx-auto">
          <form onSubmit={handleSubmit} className="relative">
            <div className="bg-white/80 dark:bg-black/80 backdrop-blur-md rounded-3xl shadow-2xl overflow-hidden border border-gray-100 dark:border-gray-800">
              <textarea
                id="query"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="e.g., I have 3 hours in Paris and I'd love a local foodie experience..."
                className="w-full px-8 py-8 text-lg text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 border-0 focus:outline-none focus:ring-0 resize-none bg-transparent"
                rows={6}
                disabled={isLoading}
              />

              {error && (
                <div className="px-8 pb-4">
                  <p className="text-red-500 text-sm flex items-center gap-2" role="alert">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"/>
                    </svg>
                    {error}
                  </p>
                </div>
              )}

              <div className="px-8 pb-8">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full px-8 py-5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-lg font-semibold rounded-2xl shadow-lg transition-all duration-300 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none active:scale-[0.98]"
                >
                  {isLoading ? (
                    <span className="flex items-center justify-center gap-3">
                      <svg className="animate-spin h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Finding experiences...
                    </span>
                  ) : (
                    'Find Experiences'
                  )}
                </button>
              </div>
            </div>

            {/* Help Text */}
            <p className="text-center text-gray-500 dark:text-gray-400 mt-6 text-sm font-light">
              Be specific about your location, time available, and interests for better recommendations
            </p>
          </form>
        </div>

        {/* Floating Action Button - Show only if there are itinerary events */}
        {itineraryEvents.length > 0 && (
          <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-30">
            <motion.button
              onClick={handleSeeWeekActivities}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-full shadow-2xl hover:shadow-3xl transition-all flex items-center gap-3 px-8 py-4"
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5, type: 'spring', stiffness: 200, damping: 20 }}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span className="font-bold text-lg">See Activities for This Week</span>
              {itineraryEvents.length > 0 && (
                <span className="bg-white/20 px-3 py-1 rounded-full text-sm">
                  {itineraryEvents.length}
                </span>
              )}
            </motion.button>
          </div>
        )}
        </div>
      </motion.div>
    </BackgroundLines>
  );
}
