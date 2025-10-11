import React from 'react';
import Image from 'next/image';
import type { Recommendation } from '@/lib/context/AppContext';

interface CompactRecommendationCardProps {
  recommendation: Recommendation;
  onBook: () => void;
  isExpanded?: boolean;
}

export default function CompactRecommendationCard({
  recommendation,
  onBook,
  isExpanded = false,
}: CompactRecommendationCardProps) {
  return (
    <div className="bg-white/90 dark:bg-black/90 backdrop-blur-md rounded-2xl border border-gray-200 dark:border-gray-700 shadow-lg overflow-hidden">
      <div className="flex items-center gap-3 p-3">
        {/* Small Image */}
        <div className="relative w-16 h-16 rounded-xl overflow-hidden flex-shrink-0">
          <Image
            src={recommendation.imageUrl || '/assets/barceloneta.png'}
            alt={recommendation.title}
            fill
            className="object-cover"
            sizes="64px"
          />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-sm text-gray-900 dark:text-white truncate">
            {recommendation.title}
          </h3>
          <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-1">
            {recommendation.description}
          </p>
          {isExpanded && (
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs font-medium text-gray-900 dark:text-white">
                {recommendation.price}
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-400">•</span>
              <span className="text-xs text-gray-600 dark:text-gray-400">
                {recommendation.duration}
              </span>
            </div>
          )}
        </div>

        {/* Book Button - only show when expanded */}
        {isExpanded && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onBook();
            }}
            className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-semibold rounded-full transition-all duration-200 flex-shrink-0"
          >
            Book
          </button>
        )}
      </div>
    </div>
  );
}
