import { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  images: {
    domains: ["images.unsplash.com", "source.unsplash.com"],
  },
};

export default nextConfig;
