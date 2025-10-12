'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAppContext } from '@/lib/context/AppContext';
import { useAuth } from '@/lib/context/AuthContext';
import Logo from '@/components/Logo';
import { BackgroundLines } from '@/components/BackgroundLines';
import { motion } from 'framer-motion';

export default function InspirationPage() {
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const { user } = useAuth();
  const { setUserQuery, loadSuggestedActivities, suggestedActivitiesLoading } = useAppContext();


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!query.trim()) {
      setError('Please enter what kind of experience you are looking for');
      return;
    }

    setError('');
    setUserQuery(query);

    // Check if webhook is configured
    const webhookUrl = process.env.NEXT_PUBLIC_WEBHOOK;

    if (webhookUrl && typeof webhookUrl === 'string' && webhookUrl.trim() !== '') {
      // Use webhook integration - navigate to thinking page
      console.log('Using webhook integration - navigating to thinking page...');
      router.push(`/thinking?query=${encodeURIComponent(query)}`);
    } else {
      // No webhook - try Firebase fallback
      setIsLoading(true);
      try {
        console.log('No webhook configured, trying Firebase suggested activities...');
        await loadSuggestedActivities();
        setError('');
        router.push('/recommendations');
      } catch (err) {
        console.error('Firebase also failed:', err);
        setError('Unable to load recommendations. Please try again.');
      } finally {
        setIsLoading(false);
      }
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
            <Logo width={240} height={80} />
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
