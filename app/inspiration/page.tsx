'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useAppContext } from '@/lib/context/AppContext';
import { useAuth } from '@/lib/context/AuthContext';
import { mockRecommendations } from '@/lib/mockData';
import Logo from '@/components/Logo';
import { BackgroundLines } from '@/components/BackgroundLines';
import ThinkingScreen from '@/components/ThinkingScreen';
import { sendWebhookRequest, parseWebhookResponse, generateSessionId } from '@/lib/webhookService';
import { saveWebhookActivities } from '@/lib/firebase/db';
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
  const [showThinkingScreen, setShowThinkingScreen] = useState(false);
  const router = useRouter();
  const { user } = useAuth();
  const { setRecommendations, setUserQuery, loadSuggestedActivities, suggestedActivitiesLoading, favoriteAttractions, setCurrentSessionId } = useAppContext();


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
      // Check if webhook is configured
      const webhookUrl = process.env.NEXT_PUBLIC_WEBHOOK;

      if (webhookUrl && typeof webhookUrl === 'string' && webhookUrl.trim() !== '') {
        // Use webhook integration
        console.log('Using webhook integration...');

        // Generate session ID for tracking
        const sessionId = generateSessionId();
        setCurrentSessionId(sessionId);

        // Format favorite movies for the request
        const favoriteMovieNames = favoriteAttractions.map(attr => attr.alt);
        console.log('📽️ User favorite movies:', favoriteMovieNames);

        // Show thinking screen and make webhook call
        setShowThinkingScreen(true);
        setIsLoading(false); // Not loading anymore, now thinking

        try {
          // Make webhook request
          console.log('📞 Calling webhook with session:', sessionId);
          console.log('📽️ Including favorite movies:', favoriteMovieNames);
          const webhookResponse = await sendWebhookRequest(query, favoriteMovieNames);

          // Parse response and set recommendations
          console.log('📋 Parsing webhook response...');
          const recommendations = parseWebhookResponse(webhookResponse, sessionId);

          if (recommendations.length === 0) {
            throw new Error('No valid activities received from webhook');
          }

          setRecommendations(recommendations);
          setCurrentSessionId(sessionId); // Store session ID in context
          console.log('✅ Set', recommendations.length, 'recommendations in context with session ID:', sessionId);

          // Save to Firebase (don't block on this - recommendations are already in context)
          if (user) {
            console.log('💾 Saving activities to Firebase (async)...');
            saveWebhookActivities(recommendations, user.uid, sessionId)
              .then(() => console.log('✅ Activities saved to Firebase'))
              .catch((err) => console.error('⚠️ Firebase save failed (non-blocking):', err));
          } else {
            console.log('⚠️ User not authenticated, skipping Firebase save');
          }

          console.log('✅ Webhook integration successful - recommendations in context');

          // ThinkingScreen component will handle navigation after 30 seconds
          return;

        } catch (webhookError) {
          console.error('❌ Webhook failed:', webhookError);
          setShowThinkingScreen(false);
          setCurrentSessionId(null);
          // Don't return - fall through to context recommendations fallback
        }
      }

      // Use context recommendations as fallback (from webhook or previous session)
      console.log('📦 Using context recommendations as fallback');
      router.push('/recommendations');
    } catch (err) {
      console.error('Error fetching recommendations:', err);
      setError('Unable to connect to recommendation service. Loading suggested activities instead...');

      // Fallback to Firebase suggested activities
      console.log('API call failed, trying Firebase suggested activities...');
      try {
        await loadSuggestedActivities();
        setError(''); // Clear error if Firebase works
        router.push('/recommendations');
      } catch (fbErr) {
        console.error('Firebase also failed:', fbErr);
        console.log('Using mock data as final fallback');
        
        try {
          const { mockRecommendations } = await import('@/lib/mockData');
          setRecommendations(mockRecommendations);
          setError(''); // Clear error if mock data works
          router.push('/recommendations');
        } catch (mockErr) {
          console.error('Even mock data failed:', mockErr);
          setError('Unable to load recommendations. Please try again.');
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Handle completion of thinking screen
  const handleThinkingComplete = () => {
    // Navigate directly to recommendations page
    // Don't set showThinkingScreen to false first as it may cause navigation issues
    router.push('/recommendations');
  };

  // Show thinking screen if webhook is processing
  if (showThinkingScreen) {
    return <ThinkingScreen onComplete={handleThinkingComplete} duration={30000} />;
  }

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
            <Logo width={180} height={60} />
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
                  disabled={isLoading || suggestedActivitiesLoading}
                  className="w-full px-8 py-5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-lg font-semibold rounded-2xl shadow-lg transition-all duration-300 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none active:scale-[0.98]"
                >
                  {isLoading || suggestedActivitiesLoading ? (
                    <span className="flex items-center justify-center gap-3">
                      <svg className="animate-spin h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      {suggestedActivitiesLoading ? 'Loading activities...' : 'Finding experiences...'}
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

        </div>
      </motion.div>
    </BackgroundLines>
  );
}
