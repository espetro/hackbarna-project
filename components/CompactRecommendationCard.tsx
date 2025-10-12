import React from 'react';
import Image from 'next/image';
import type { Recommendation } from '@/lib/types';

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
  const [imageError, setImageError] = React.useState(false);

  return (
    <div className="bg-white/90 dark:bg-black/90 backdrop-blur-md rounded-2xl border border-gray-200 dark:border-gray-700 shadow-lg overflow-hidden">
      <div className="flex items-center gap-3 p-3">
        {/* Small Image */}
        <div className="relative w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 bg-gray-200 dark:bg-gray-700">
          {recommendation.image && !imageError ? (
            <Image
              src={recommendation.image}
              alt={recommendation.title}
              fill
              className="object-cover"
              sizes="64px"
              unoptimized={true}
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <svg className="w-8 h-8 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          )}
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
