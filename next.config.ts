import { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  images: {
    domains: ["images.unsplash.com", "source.unsplash.com"],
  },
};

// Only apply Lingo.dev compiler if GOOGLE_API_KEY is available
// This allows builds to succeed in environments without the API key
const hasGoogleApiKey = process.env.GOOGLE_API_KEY && process.env.GOOGLE_API_KEY.trim() !== '';

// Dynamically import and apply Lingo.dev compiler only if API key is present
// This prevents the compiler from being loaded when the key is not available
let config = nextConfig;

if (hasGoogleApiKey) {
  const lingoCompiler = require("lingo.dev/compiler").default;
  config = lingoCompiler.next({
    sourceLocale: "en",
    targetLocales: ["es", "fr", "de"],
    models: {
      "*:*": "google:gemini-2.0-flash",
    },
  })(nextConfig);
}

export default config;
