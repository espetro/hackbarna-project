import { NextConfig } from "next";
import lingoCompiler from "lingo.dev/compiler";

const nextConfig: NextConfig = {
  output: "standalone",
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
    // Optimize images and handle large files better
    minimumCacheTTL: 60,
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    // Set limits for image optimization
    dangerouslyAllowSVG: true,
    contentDispositionType: "attachment",
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
  // Increase API timeout for image optimization
  experimental: {
    proxyTimeout: 60000, // 60 seconds
  },
};

const withLingo = lingoCompiler.next({
  sourceLocale: "en",
  targetLocales: ["en", "es", "ca", "ru", "pt", "fr"],
  models: {
    "*:*": "google:gemini-2.0-flash", // Option 2: Google AI
  },
});

// export default nextConfig
export default withLingo(nextConfig);
