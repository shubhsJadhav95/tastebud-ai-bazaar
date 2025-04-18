import { Timestamp } from 'firebase/firestore';

// User profile stored in /users/{userId}
export interface UserProfile {
  uid: string; // Matches Auth UID
  email: string;
  full_name: string | null;
  user_type: 'customer' | 'restaurant'; // Adjusted based on your app's types
  address?: string | null; // Optional fields based on previous code
  phone?: string | null;   // Optional fields based on previous code
  createdAt?: Timestamp; // Optional or use serverTimestamp() on write
  updatedAt?: Timestamp; // Optional or use serverTimestamp() on write
}

// Restaurant data stored in /restaurants/{restaurantId}
export interface Restaurant {
  id: string; // Firestore document ID
  owner_id: string;
  name: string;
  name_lowercase: string; // Lowercase version for case-insensitive querying
  description?: string | null;
  cuisine?: string | null;
  address?: string | null;
  image_url?: string | null;
  logo_url?: string | null;
  price_range?: string | null;
  delivery_time?: string | null;
  phone?: string | null;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
  // Optional fields potentially used in UI but not directly in base Firestore model
  rating?: number; 
}

// Input type when creating a new restaurant (before ID, timestamps, lowercase are added)
export type NewRestaurantData = Omit<Restaurant, 'id' | 'name_lowercase' | 'createdAt' | 'updatedAt'>;

// Menu Item data stored in /menu_items/{itemId}
export interface MenuItem {
  id: string; // Firestore document ID
  restaurant_id: string;
  name: string;
  description?: string | null;
  price: number; // Assuming price is required
  image_url?: string | null;
  category?: string | null;
  is_available?: boolean;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

// Add other shared types for your application (e.g., Order, CartItem) here

// Add other shared types here as needed, e.g.:
// export interface UserProfile { ... }
// export interface MenuItem { ... } 