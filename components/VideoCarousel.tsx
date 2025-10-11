/*
 * VideoCarousel - Accessible 3-slide video carousel with autoplay & smooth transitions
 *
 * Usage example:
 *
 * import VideoCarousel from '@/components/VideoCarousel';
 *
 * const items = [
 *   { src: '/videos/one.mp4', caption: 'Sunrise over dunes', poster: '/posters/one.jpg' },
 *   { src: '/videos/two.mp4', caption: 'City lights in the rain', poster: '/posters/two.jpg' },
 *   { src: '/videos/three.mp4', caption: 'Waves under moonlight', poster: '/posters/three.jpg' },
 * ] as const;
 *
 * export default function Page() {
 *   return <VideoCarousel items={items} autoAdvanceDelayMs={1000} transitionMs={350} />;
 * }
 */

'use client';

import React, { useRef, useState, useEffect, useCallback } from 'react';

export type VideoItem = {
  src: string;
  caption: string;
  poster?: string;
  muted?: boolean; // default: true
};

type Props = {
  items: [VideoItem, VideoItem, VideoItem]; // exactly three
  autoAdvanceDelayMs?: number; // default: 1000 (1s after 'ended')
  transitionMs?: number; // default: 350 (smooth but snappy)
  className?: string;
  showCaptions?: boolean; // default: true - set to false for custom overlays
  showControls?: boolean; // default: true - set to false to hide nav buttons
  onSlideChange?: (index: number) => void; // callback when slide changes
  onComplete?: () => void; // callback when user tries to advance past last slide
};

export default function VideoCarousel({
  items,
  autoAdvanceDelayMs = 1000,
  transitionMs = 350,
  className = '',
  showCaptions = true,
  showControls = true,
  onSlideChange,
  onComplete,
}: Props): JSX.Element {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([null, null, null]);
  const autoAdvanceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const announceRef = useRef<HTMLDivElement>(null);
  const touchStartX = useRef<number>(0);
  const touchEndX = useRef<number>(0);

  // Clear any pending auto-advance timer
  const clearAutoAdvanceTimer = useCallback(() => {
    if (autoAdvanceTimerRef.current) {
      clearTimeout(autoAdvanceTimerRef.current);
      autoAdvanceTimerRef.current = null;
    }
  }, []);

  // Navigate to a specific slide
  const goTo = useCallback(
    (index: number) => {
      clearAutoAdvanceTimer();
      setActiveIndex(index);
      // Announce to screen readers
      if (announceRef.current) {
        announceRef.current.textContent = `Slide ${index + 1} of 3: ${items[index].caption}`;
      }
      // Notify parent of slide change
      if (onSlideChange) {
        onSlideChange(index);
      }
    },
    [clearAutoAdvanceTimer, items, onSlideChange]
  );

  // Navigate to next slide
  const next = useCallback(() => {
    const nextIndex = activeIndex + 1;
    if (nextIndex >= 3) {
      // At the last slide, trigger onComplete if provided
      if (onComplete) {
        onComplete();
      } else {
        // Otherwise cycle back to first
        goTo(0);
      }
    } else {
      goTo(nextIndex);
    }
  }, [activeIndex, goTo, onComplete]);

  // Navigate to previous slide
  const prev = useCallback(() => {
    goTo((activeIndex - 1 + 3) % 3);
  }, [activeIndex, goTo]);

  // Handle video ended event
  const handleVideoEnded = useCallback(() => {
    clearAutoAdvanceTimer();
    autoAdvanceTimerRef.current = setTimeout(() => {
      next();
    }, autoAdvanceDelayMs);
  }, [next, autoAdvanceDelayMs, clearAutoAdvanceTimer]);

  // Effect 1: Manage video playback when activeIndex changes
  useEffect(() => {
    const activeVideo = videoRefs.current[activeIndex];

    // Pause all other videos
    videoRefs.current.forEach((video, i) => {
      if (video && i !== activeIndex) {
        video.pause();
        video.currentTime = 0;
      }
    });

    // Play the active video if visible
    if (activeVideo && isVisible) {
      const playVideo = () => {
        activeVideo.play().catch((err) => {
          console.warn('Video play failed:', err);
        });
      };

      if (activeVideo.readyState >= 3) {
        // HAVE_FUTURE_DATA or better
        playVideo();
      } else {
        activeVideo.addEventListener('canplay', playVideo, { once: true });
      }

      // Add ended listener to active video only
      activeVideo.addEventListener('ended', handleVideoEnded);

      return () => {
        activeVideo.removeEventListener('ended', handleVideoEnded);
      };
    }
  }, [activeIndex, isVisible, handleVideoEnded]);

  // Effect 2: Setup page visibility and intersection observer
  useEffect(() => {
    // Handle page visibility
    const handleVisibilityChange = () => {
      const visible = !document.hidden;
      setIsVisible(visible);

      const activeVideo = videoRefs.current[activeIndex];
      if (activeVideo) {
        if (visible) {
          activeVideo.play().catch(() => {});
        } else {
          activeVideo.pause();
        }
      }
    };

    // Handle intersection (scroll in/out of view)
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          setIsVisible(entry.isIntersecting);

          const activeVideo = videoRefs.current[activeIndex];
          if (activeVideo) {
            if (entry.isIntersecting) {
              activeVideo.play().catch(() => {});
            } else {
              activeVideo.pause();
            }
          }
        });
      },
      { threshold: 0.5 }
    );

    if (typeof document !== 'undefined') {
      document.addEventListener('visibilitychange', handleVisibilityChange);
    }

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => {
      if (typeof document !== 'undefined') {
        document.removeEventListener('visibilitychange', handleVisibilityChange);
      }
      observer.disconnect();
    };
  }, [activeIndex]);

  // Effect 3: Cleanup timers on unmount
  useEffect(() => {
    return () => {
      clearAutoAdvanceTimer();
    };
  }, [clearAutoAdvanceTimer]);

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      prev();
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      next();
    }
  };

  // Touch/Swipe handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    const swipeThreshold = 50; // minimum distance for swipe
    const diff = touchStartX.current - touchEndX.current;

    if (Math.abs(diff) > swipeThreshold) {
      if (diff > 0) {
        // Swiped left - go to next
        next();
      } else {
        // Swiped right - go to previous
        prev();
      }
    }

    // Reset values
    touchStartX.current = 0;
    touchEndX.current = 0;
  };

  return (
    <div
      ref={containerRef}
      className={`relative w-full aspect-video overflow-hidden rounded-2xl shadow-lg bg-black ${className}`}
      role="region"
      aria-label="Video carousel"
      onKeyDown={handleKeyDown}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      tabIndex={0}
    >
      {/* Video slides */}
      {items.map((item, index) => {
        const isActive = index === activeIndex;
        return (
          <div
            key={index}
            className="absolute inset-0 transition-opacity duration-[var(--transition-ms)] ease-out"
            style={
              {
                '--transition-ms': `${transitionMs}ms`,
                opacity: isActive ? 1 : 0,
                transform: isActive ? 'translate3d(0, 0, 0)' : 'translate3d(2px, 0, 0)',
                willChange: 'opacity, transform',
                pointerEvents: isActive ? 'auto' : 'none',
              } as React.CSSProperties
            }
          >
            <video
              ref={(el) => {
                videoRefs.current[index] = el;
              }}
              src={item.src}
              poster={item.poster}
              muted={item.muted !== false}
              playsInline
              preload="metadata"
              className="w-full h-full object-cover"
              aria-hidden={!isActive}
            />

            {/* Overlay gradient and caption - only if showCaptions is true */}
            {showCaptions && (
              <>
                <div
                  className="pointer-events-none absolute inset-x-0 bottom-0 h-2/5 bg-gradient-to-t from-black/80 via-black/40 to-transparent"
                  aria-hidden="true"
                />
                <div className="absolute inset-x-0 bottom-0 p-4 md:p-6">
                  <p className="text-white text-sm md:text-base font-medium line-clamp-2 drop-shadow-lg [text-wrap:balance]">
                    {item.caption}
                  </p>
                </div>
              </>
            )}
          </div>
        );
      })}

      {/* Navigation buttons - only if showControls is true */}
      {showControls && (
        <>
          <div className="absolute inset-x-4 top-1/2 -translate-y-1/2 flex justify-between pointer-events-none">
            <button
              onClick={prev}
              aria-label="Previous slide"
              className="pointer-events-auto w-10 h-10 md:w-12 md:h-12 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-all opacity-0 hover:opacity-100 focus:opacity-100 flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-black/50"
            >
              <svg
                className="w-5 h-5 md:w-6 md:h-6 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2.5}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>

            <button
              onClick={next}
              aria-label="Next slide"
              className="pointer-events-auto w-10 h-10 md:w-12 md:h-12 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-all opacity-0 hover:opacity-100 focus:opacity-100 flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-black/50"
            >
              <svg
                className="w-5 h-5 md:w-6 md:h-6 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          {/* Pagination dots */}
          <div className="absolute inset-x-0 bottom-16 md:bottom-20 flex justify-center gap-2 pointer-events-none">
            {items.map((item, index) => (
              <button
                key={index}
                onClick={() => goTo(index)}
                aria-label={`Go to slide ${index + 1}`}
                aria-current={index === activeIndex ? 'true' : 'false'}
                className={`pointer-events-auto w-2 h-2 rounded-full transition-all focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-black/50 ${
                  index === activeIndex
                    ? 'bg-white w-8'
                    : 'bg-white/50 hover:bg-white/75'
                }`}
              />
            ))}
          </div>
        </>
      )}

      {/* Screen reader announcements */}
      <div
        ref={announceRef}
        className="sr-only"
        role="status"
        aria-live="polite"
        aria-atomic="true"
      />
    </div>
  );
}
