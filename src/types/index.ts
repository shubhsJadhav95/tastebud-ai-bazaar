import { Timestamp } from 'firebase/firestore';

// Consistent Restaurant type definition
export interface Restaurant {
  id: string;
  owner_id: string; // From Firestore
  name: string;
  description: string | null;
  cuisine: string | null;
  address: string | null;
  image_url: string | null;
  logo_url: string | null;
  price_range: string | null;
  delivery_time: string | null;
  phone: string | null;
  created_at: Timestamp; // From Firestore
  updated_at: Timestamp; // From Firestore
  rating?: number; // Optional: Used by card, maybe added later
  image?: string; // Used by card, might be same as image_url or different
  deliveryTime?: string; // Used by card, seems redundant with delivery_time
  priceRange?: string; // Used by card, seems redundant with price_range
}

// Add other shared types here as needed, e.g.:
// export interface UserProfile { ... }
// export interface MenuItem { ... } 