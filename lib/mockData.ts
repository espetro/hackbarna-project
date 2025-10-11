// Mock data for recommendations when API is not available
import { Recommendation } from './types';

export const mockRecommendations: Recommendation[] = [
  {
    id: 1,
    title: "Hidden City Food Tour",
    description: "Explore local markets and hidden eateries with a local guide. Taste authentic street food and learn about culinary traditions.",
    image: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400",
    location: { lat: 48.8566, lng: 2.3522 },
    duration: "3 hours",
    price: "€45"
  },
  {
    id: 2,
    title: "Street Art Cycling Ride",
    description: "Bike through vibrant neighborhoods to see stunning street art and murals. Perfect for art enthusiasts and active travelers.",
    image: "https://images.unsplash.com/photo-1499781350541-7783f6c6a0c8?w=400",
    location: { lat: 48.8666, lng: 2.3300 },
    duration: "2.5 hours",
    price: "€35"
  },
  {
    id: 3,
    title: "Rooftop Wine Tasting",
    description: "Sample local wines on a hidden rooftop terrace with panoramic city views. Small group experience with sommelier.",
    image: "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=400",
    location: { lat: 48.8606, lng: 2.3376 },
    duration: "2 hours",
    price: "€55"
  },
  {
    id: 4,
    title: "Artisan Workshop Visit",
    description: "Meet local craftspeople in their workshops. Watch traditional techniques and try your hand at creating something unique.",
    image: "https://images.unsplash.com/photo-1452860606245-08befc0ff44b?w=400",
    location: { lat: 48.8534, lng: 2.3488 },
    duration: "2 hours",
    price: "€40"
  },
  {
    id: 5,
    title: "Jazz Club Evening",
    description: "Experience authentic jazz in an intimate underground club frequented by locals. Includes a welcome drink.",
    image: "https://images.unsplash.com/photo-1415201364774-f6f0bb35f28f?w=400",
    location: { lat: 48.8584, lng: 2.3470 },
    duration: "3 hours",
    price: "€30"
  },
  {
    id: 6,
    title: "Historic Walking Tour",
    description: "Discover hidden courtyards and secret passages in the historic district with a passionate local historian.",
    image: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=400",
    location: { lat: 48.8530, lng: 2.3499 },
    duration: "2.5 hours",
    price: "€25"
  }
];
