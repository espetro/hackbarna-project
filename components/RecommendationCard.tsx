'use client';

import React from 'react';
import Image from 'next/image';
import { Recommendation } from '@/lib/types';

interface RecommendationCardProps {
  recommendation: Recommendation;
  isSelected: boolean;
  onSelect: () => void;
  onBook: () => void;
}

export default function RecommendationCard({
  recommendation,
  isSelected,
  onSelect,
  onBook,
}: RecommendationCardProps) {
  return (
    <div
      className={`bg-white rounded-lg shadow-lg overflow-hidden transition-all duration-300 cursor-pointer ${
        isSelected ? 'ring-4 ring-primary scale-105' : 'hover:shadow-xl'
      }`}
      onClick={onSelect}
    >
      {/* Image */}
      <div className="relative h-48 w-full">
        <Image
          src={recommendation.image}
          alt={recommendation.title}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="text-xl font-bold text-gray-900 mb-2">
          {recommendation.title}
        </h3>
        <p className="text-gray-600 text-sm mb-4 line-clamp-3">
          {recommendation.description}
        </p>

        {/* Details */}
        <div className="flex items-center gap-4 mb-4 text-sm text-gray-500">
          {recommendation.duration && (
            <div className="flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{recommendation.duration}</span>
            </div>
          )}
          {recommendation.price && (
            <div className="flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{recommendation.price}</span>
            </div>
          )}
        </div>

        {/* Book Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onBook();
          }}
          className="w-full px-4 py-2 bg-primary hover:bg-primary-dark text-white font-semibold rounded-lg transition-colors duration-200"
        >
          Book Now
        </button>
      </div>
    </div>
  );
}
