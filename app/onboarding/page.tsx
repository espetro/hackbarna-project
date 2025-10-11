'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import VideoCarousel from '@/components/VideoCarousel';
import Logo from '@/components/Logo';

// Onboarding step content
const onboardingSteps = [
  {
    src: '/assets/before.mp4',
    caption: 'For the savvy business traveller with some time.',
    poster: '/assets/barceloneta.png',
  },
  {
    src: '/assets/oldway.mp4',
    caption: 'Stop going to the old soulless attractions that feel like losing time.',
    poster: '/assets/flamenco.png',
  },
  {
    src: '/assets/after.mp4',
    caption: 'Use TetrisTravel to slip in local-like experiences.',
    poster: '/assets/camp nou.png',
  },
] as const;

export default function OnboardingPage() {
  const [currentStep, setCurrentStep] = useState(0);
  const router = useRouter();

  // Listen to video carousel changes via a custom event or use a ref
  // For now, we'll rely on keyboard/swipe to update currentStep
  // The carousel handles its own navigation, we just display the matching caption

  return (
    <div className="relative w-full h-screen overflow-hidden bg-black">
      {/* Full-screen VideoCarousel with custom styling */}
      <div className="absolute inset-0">
        <VideoCarousel
          items={onboardingSteps}
          autoAdvanceDelayMs={5000}
          transitionMs={800}
          className="!rounded-none !shadow-none aspect-auto h-screen"
          showCaptions={false}
          showControls={false}
          onSlideChange={(index) => setCurrentStep(index)}
          onComplete={() => router.push('/favorites')}
        />
      </div>

      {/* Enhanced overlay with refined gradients */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent via-30% to-black/70 pointer-events-none z-10" />

      {/* Vignette effect */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,black_100%)] opacity-30 pointer-events-none z-10" />

      {/* Top branding area - removed logo and skip button */}

      {/* Message Caption */}
      <motion.div
        key={`caption-${currentStep}`}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="absolute left-0 right-0 bottom-48 md:bottom-56 z-20 px-6 md:px-12"
      >
        <h1 className="text-3xl md:text-5xl lg:text-6xl font-light text-white text-center leading-tight tracking-tight max-w-4xl mx-auto bg-blue-600/80 backdrop-blur-sm px-8 py-6 rounded-2xl">
          {onboardingSteps[currentStep].caption}
        </h1>
      </motion.div>

      {/* Step indicators */}
      <div className="absolute bottom-36 md:bottom-44 left-0 right-0 z-20 flex justify-center gap-2">
        {onboardingSteps.map((_, index) => (
          <motion.div
            key={index}
            animate={{
              scale: index === currentStep ? 1 : 0.8,
              opacity: index === currentStep ? 1 : 0.5,
            }}
            transition={{ duration: 0.3 }}
            className={`h-1.5 rounded-full transition-all ${
              index === currentStep ? 'w-8 bg-white' : 'w-1.5 bg-white/60'
            }`}
          />
        ))}
      </div>

    </div>
  );
}
