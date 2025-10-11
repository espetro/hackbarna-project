'use client';

import React from 'react';

interface VideoBackgroundProps {
  videoSrc: string;
  children: React.ReactNode;
}

export default function VideoBackground({ videoSrc, children }: VideoBackgroundProps) {
  return (
    <div className="relative w-full h-screen overflow-hidden" suppressHydrationWarning>
      {/* Video Background */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute top-0 left-0 w-full h-full object-cover"
        aria-hidden="true"
        suppressHydrationWarning
      >
        <source src={videoSrc} type="video/mp4" suppressHydrationWarning />
        Your browser does not support the video tag.
      </video>

      {/* Dark Overlay for better text contrast */}
      <div className="absolute top-0 left-0 w-full h-full bg-black bg-opacity-50" />

      {/* Content */}
      <div className="relative z-10 flex items-center justify-center h-full">
        {children}
      </div>
    </div>
  );
}
