// Type definitions for TetrisTravel application

export interface Recommendation {
  id: number;
  title: string;
  description: string;
  image: string;
  location: {
    lat: number;
    lng: number;
  };
  duration?: string;
  price?: string;
}

export interface UserQuery {
  text: string;
  location?: string;
  duration?: string;
}
