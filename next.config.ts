import lingoCompiler from "lingo.dev/compiler";
import { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  images: {
    domains: ["images.unsplash.com", "source.unsplash.com"],
  },
};

const withLingo = lingoCompiler.next({
  sourceLocale: "en",
  targetLocales: ["es"],
  models: {
    "*:*": "google:gemini-2.0-flash", // Option 2: Google AI
  },
});

// export default nextConfig
export default withLingo(nextConfig);
