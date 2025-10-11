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
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-indigo-900 dark:to-purple-900 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-300 dark:bg-purple-600 rounded-full mix-blend-multiply dark:mix-blend-soft-light filter blur-3xl opacity-30 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-300 dark:bg-indigo-600 rounded-full mix-blend-multiply dark:mix-blend-soft-light filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-pink-300 dark:bg-pink-600 rounded-full mix-blend-multiply dark:mix-blend-soft-light filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>
      </div>
      
      {/* Content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.5, ease: "easeInOut" }}
        className="min-h-screen py-16 px-4 sm:px-6 lg:px-8 relative z-10"
      >
        <div className="max-w-7xl mx-auto">
          {/* Simple elegant header */}
          <div className="text-center mb-24">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-5xl md:text-6xl lg:text-7xl font-light bg-gradient-to-r from-purple-600 via-indigo-600 to-pink-600 dark:from-purple-400 dark:via-indigo-400 dark:to-pink-400 bg-clip-text text-transparent leading-tight"
            >
              What resonates more with you?
            </motion.h1>
          </div>

          {/* Favorites Selection Component with Briefcase */}
          <div className="flex justify-center">
            <FavoritesSelection attractions={allAttractions} onComplete={handleComplete} />
          </div>
        </div>
      </motion.div>
    </div>
  );
}
