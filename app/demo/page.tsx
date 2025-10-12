/*
 * Demo page for VideoCarousel component
 * Visit: http://localhost:3000/demo
 */

'use client';

import Link from 'next/link';
import VideoCarousel from '@/components/VideoCarousel';

// Example video items - replace with your actual video sources
const items = [
  {
    src: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    caption: 'Sunrise over dunes - Experience the golden hour magic',
    poster: '/assets/barceloneta.png', // fallback poster
  },
  {
    src: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
    caption: 'City lights in the rain - Urban adventures await',
    poster: '/assets/flamenco.png',
  },
  {
    src: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    caption: 'Waves under moonlight - Coastal serenity at its finest',
    poster: '/assets/camp nou.png',
  },
] as const;

export default function DemoPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-6 md:p-12">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-white mb-2">Video Carousel Demo</h1>
          <p className="text-gray-400 text-lg">
            Swipe, click arrows, or use keyboard (← →) to navigate
          </p>
        </div>

        <VideoCarousel items={items} autoAdvanceDelayMs={1000} transitionMs={350} />

        <div className="mt-12 bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10">
          <h2 className="text-2xl font-bold text-white mb-4">Features Showcase</h2>
          <ul className="space-y-3 text-gray-300">
            <li className="flex items-start gap-3">
              <span className="text-green-400 mt-1">✓</span>
              <span>
                <strong className="text-white">Autoplay:</strong> Videos auto-advance 1 second
                after ending
              </span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-green-400 mt-1">✓</span>
              <span>
                <strong className="text-white">Keyboard Navigation:</strong> Use arrow keys (← →)
                to navigate between slides
              </span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-green-400 mt-1">✓</span>
              <span>
                <strong className="text-white">Mouse/Touch:</strong> Click prev/next buttons or
                pagination dots
              </span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-green-400 mt-1">✓</span>
              <span>
                <strong className="text-white">Visibility Aware:</strong> Pauses when tab is
                inactive or scrolled out of view
              </span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-green-400 mt-1">✓</span>
              <span>
                <strong className="text-white">Accessible:</strong> Full ARIA support, screen
                reader announcements, and keyboard focus management
              </span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-green-400 mt-1">✓</span>
              <span>
                <strong className="text-white">Smooth Transitions:</strong> GPU-accelerated
                crossfade with subtle transform
              </span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-green-400 mt-1">✓</span>
              <span>
                <strong className="text-white">Performance:</strong> Only active video plays,
                others paused to save CPU
              </span>
            </li>
          </ul>
        </div>

        <div className="mt-8 text-center">
          <Link
            href="/"
            className="inline-block px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold rounded-full transition-all"
          >
            ← Back to Home
          </Link>
        </div>
      </div>
    </main>
  );
}
