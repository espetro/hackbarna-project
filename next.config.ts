import { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  images: {
    domains: ["images.unsplash.com", "source.unsplash.com"],
  },
};

// Note: Lingo.dev compiler has been temporarily disabled to allow builds without GOOGLE_API_KEY
// To re-enable translations:
// 1. Add GOOGLE_API_KEY environment variable
// 2. Uncomment the Lingo.dev configuration below
//
// import lingoCompiler from "lingo.dev/compiler";
// export default lingoCompiler.next({
//   sourceLocale: "en",
//   targetLocales: ["es", "fr", "de"],
//   models: {
//     "*:*": "google:gemini-2.0-flash",
//   },
// })(nextConfig);

export default nextConfig;
