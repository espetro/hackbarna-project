'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { FavoritesSelection } from '@/components/FavoritesSelection';
import { useAppContext, type Attraction } from '@/lib/context/AppContext';
import { motion } from 'framer-motion';

// Movie posters - user's favorite movies
const allAttractions: Attraction[] = [
  {
    id: 1,
    src: '/images/amelie.png',
    alt: 'Amelie',
  },
  {
    id: 2,
    src: '/images/barbie.webp',
    alt: 'Barbie',
  },
  {
    id: 3,
    src: '/images/forrest gump.jpg',
    alt: 'Forrest Gump',
  },
  {
    id: 4,
    src: '/images/harry potter.jpg',
    alt: 'Harry Potter',
  },
  {
    id: 5,
    src: '/images/matrix.jpg',
    alt: 'Matrix',
  },
  {
    id: 6,
    src: '/images/pulp fiction.jpg',
    alt: 'Pulp Fiction',
  },
  {
    id: 7,
    src: '/images/schindlerslist.jpg',
    alt: 'Schindler\'s List',
  },
  {
    id: 8,
    src: '/images/starwars.jpg',
    alt: 'Star Wars',
  },
];

export default function FavoritesPage() {
  const router = useRouter();
  const { setFavoriteAttractions } = useAppContext();

  const handleComplete = (favorites: Attraction[]) => {
    setFavoriteAttractions(favorites);
    // Navigate to inspiration/search page
    router.push('/inspiration');
  };

  return (
    <div className="h-screen bg-white dark:bg-gray-900 relative overflow-hidden">
      {/* Simple background gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-blue-50/50 to-white dark:from-gray-800/50 dark:to-gray-900 pointer-events-none" />
      
      {/* Content - Full viewport height with proper spacing */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3 }}
        className="h-full flex flex-col px-4 sm:px-6 lg:px-8 relative z-10"
      >
        <div className="max-w-6xl mx-auto w-full flex flex-col h-full">
          {/* Clean header matching app style */}
          <div className="text-center py-4 flex-shrink-0">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white"
            >
              Movie tastes?
            </motion.h1>
          </div>

          {/* Favorites Selection Component - Fits viewport */}
          <div className="flex-1 overflow-hidden pb-4">
            <div className="flex justify-center h-full">
              <FavoritesSelection attractions={allAttractions} onComplete={handleComplete} />
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
