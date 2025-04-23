import { Timestamp } from 'firebase/firestore';

// User profile stored in /users/{userId}
export interface UserProfile {
  uid: string; // Matches Auth UID
  email: string;
  full_name: string | null;
  user_type: 'customer' | 'restaurant'; // Adjusted based on your app's types
  address?: string | null; // Optional fields based on previous code
  phone?: string | null;   // Optional fields based on previous code
  favoriteRestaurantIds?: string[]; // Added for storing favorite restaurant IDs
  supercoins?: number; // Current Supercoins balance
  referralCode?: string | null; // Added user's unique referral code
  referredByCode?: string | null; // Added optional: Code user was referred by
  referralCodeUsed?: boolean; // Has this user already used *someone else's* code?
  totalCoinDiscountClaimed?: number; // Added: Tracks total value claimed via coins
  createdAt?: Timestamp; // Optional or use serverTimestamp() on write
  updatedAt?: Timestamp; // Optional or use serverTimestamp() on write
}

// Restaurant data stored in /restaurants/{restaurantId}
export interface Restaurant {
  id: string; // Firestore document ID
  owner_id: string; // Added for ownership/permissions
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
  createdAt?: Timestamp; // Added for tracking creation time
  updatedAt?: Timestamp; // Optional or use serverTimestamp() on write
  // Optional fields potentially used in UI but not directly in base Firestore model
  rating?: number;
  contactNumber: string;
  logoUrl: string;
  coverImageUrl: string;
}

// Input type when creating a new restaurant (before ID, timestamps, lowercase are added)
export type NewRestaurantData = Omit<Restaurant, 'id' | 'createdAt' | 'updatedAt'>;

// Menu Item data stored in /menu_items/{itemId}
export interface MenuItem {
  id: string; // Firestore document ID
  restaurant_id: string;
  name: string;
  description?: string | null;
  price: number; // Assuming price is required
  image_url?: string | null;
  category?: string | null;
  calories?: number | null; // Added optional calorie count
  serves?: string | null;   // Added optional serving size (string for ranges like "2-3")
  is_available?: boolean;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

// Add other shared types for your application (e.g., Order, CartItem) here

// Define possible order statuses
export type OrderStatus = 
  | 'Pending' 
  | 'Confirmed' 
  | 'Preparing' 
  | 'Ready for Pickup' 
  | 'Out for Delivery' 
  | 'Delivered' 
  | 'Cancelled'
  | 'Failed';

// Interface for individual items within an order
export interface OrderItem {
  menuItemId: string; // Reference to the MenuItem
  name: string; // Store name at time of order
  quantity: number;
  price: number; // Store price at time of order
  image_url?: string | null; // Add optional image URL for display
  // Add options/customizations if applicable
}

// Interface for Order data stored in /orders/{orderId}
export interface Order {
  id: string; // Firestore document ID
  restaurant_id: string; // ID of the restaurant fulfilling the order
  customer_id: string; // ID of the customer placing the order
  items: OrderItem[]; // Array of items in the order
  totalAmount: number; // Total cost of the order
  status: OrderStatus; // Current status of the order
  orderNumber?: string | number; // Optional user-friendly order number
  deliveryAddress?: { // Optional: Only if delivery is supported
    street: string;
    city: string;
    state: string;
    zip: string;
    notes?: string;
  };
  customerName?: string; // Store for convenience
  customerPhone?: string; // Store for convenience
  paymentMethod?: string; // Added payment method (optional?)
  didDonate?: boolean; // Flag for meal donation
  createdAt: Timestamp;
  updatedAt?: Timestamp; // Track last status update time
}

// Add other shared types here as needed, e.g.:
// export interface UserProfile { ... }
// export interface MenuItem { ... } 