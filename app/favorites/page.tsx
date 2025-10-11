'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { FavoritesSelection } from '@/components/FavoritesSelection';
import { useAppContext, type Attraction } from '@/lib/context/AppContext';
import { motion } from 'framer-motion';

// Attraction images from inspiration
const allAttractions: Attraction[] = [
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

export default function FavoritesPage() {
  const router = useRouter();
  const { setFavoriteAttractions } = useAppContext();

  const handleComplete = (favorites: Attraction[]) => {
    setFavoriteAttractions(favorites);
    // Navigate to inspiration/search page
    router.push('/inspiration');
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 relative overflow-hidden">
      {/* Simple background gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-blue-50/50 to-white dark:from-gray-800/50 dark:to-gray-900 pointer-events-none" />
      
      {/* Content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3 }}
        className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 relative z-10"
      >
        <div className="max-w-6xl mx-auto">
          {/* Clean header matching app style */}
          <div className="text-center mb-12">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4"
            >
              Select Your Favorites
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-lg text-gray-600 dark:text-gray-400"
            >
              Choose the activities that interest you most
            </motion.p>
          </div>

          {/* Favorites Selection Component */}
          <div className="flex justify-center">
            <FavoritesSelection attractions={allAttractions} onComplete={handleComplete} />
          </div>
        </div>
      </motion.div>
    </div>
  );
}
