// src/services/restaurantService.ts
import {
  collection,
  query,
  where,
  getDocs,
  Timestamp,
  DocumentReference,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  orderBy,
  getDoc
} from 'firebase/firestore';
import { db } from '../integrations/firebase/firebaseConfig';
import { Restaurant, NewRestaurantData } from '@/types'; // Assuming @/types alias works

export const restaurantService = {
  // Get all restaurants
  async getRestaurants(): Promise<Restaurant[]> {
    try {
      const restaurantsRef = collection(db, 'restaurants');
      const q = query(restaurantsRef, orderBy('name'));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Restaurant[];
    } catch (error) {
      console.error('Error fetching restaurants:', error);
      throw error;
    }
  },

  // Get a single restaurant by ID
  async getRestaurant(restaurantId: string): Promise<Restaurant | null> {
    try {
      const restaurantRef = doc(db, 'restaurants', restaurantId);
      const docSnap = await getDoc(restaurantRef);
      if (!docSnap.exists()) {
        console.log(`Restaurant with ID ${restaurantId} not found.`);
        return null;
      }
      return {
        id: docSnap.id,
        ...docSnap.data()
      } as Restaurant;
    } catch (error) {
      console.error('Error fetching restaurant:', error);
      throw error;
    }
  },

  // Get restaurants by owner
  async getRestaurantsByOwner(ownerId: string): Promise<Restaurant[]> {
    if (!ownerId) {
      console.error("Owner ID is required to fetch restaurants.");
      return [];
    }
    try {
      const restaurantsRef = collection(db, 'restaurants');
      const q = query(
        restaurantsRef,
        where('owner_id', '==', ownerId),
        orderBy('name', 'asc') // Optional: order alphabetically by name
      );
      const querySnapshot = await getDocs(q);
      const restaurants: Restaurant[] = [];
      querySnapshot.forEach((doc) => {
        restaurants.push({ id: doc.id, ...doc.data() } as Restaurant);
      });
      console.log(`Fetched ${restaurants.length} restaurants for owner ${ownerId}`);
      return restaurants;
    } catch (error) {
      console.error(`Error fetching restaurants for owner ${ownerId}:`, error);
      throw new Error('Failed to fetch restaurants.'); // Re-throw for handling in hook/component
    }
  },

  // Create a new restaurant (Refactored)
  async createRestaurant(restaurantData: Omit<Restaurant, 'id'>): Promise<Restaurant> {
    if (!restaurantData.name?.trim()) {
      throw new Error("Restaurant name is required.");
    }
    if (!restaurantData.owner_id?.trim()) {
      throw new Error("Owner ID is required to add a restaurant.");
    }

    const trimmedName = restaurantData.name.trim();
    const nameLowercase = trimmedName.toLowerCase();

    try {
      const nameQuery = query(
        collection(db, 'restaurants'),
        where('name_lowercase', '==', nameLowercase)
      );
      const querySnapshot = await getDocs(nameQuery);
      if (!querySnapshot.empty) {
        throw new Error(`Restaurant with name "${trimmedName}" already exists.`);
      }
    } catch (error) {
      console.error("Error checking for existing restaurant name:", error);
      if (error instanceof Error && error.message.includes("already exists")) {
        throw error;
      }
      throw new Error("Failed to verify restaurant name uniqueness.");
    }

    const dataToAdd = {
      ...restaurantData,
      name: trimmedName,
      name_lowercase: nameLowercase,
      createdAt: Timestamp.now(),
    };

    try {
      const restaurantsRef = collection(db, 'restaurants');
      const docRef = await addDoc(restaurantsRef, dataToAdd);
      console.log("Restaurant created with ID:", docRef.id);
      return {
        id: docRef.id,
        ...dataToAdd
      } as Restaurant;
    } catch (error) {
      console.error('Error creating restaurant:', error);
      throw new Error("Failed to save restaurant data.");
    }
  },

  // Update a restaurant
  async updateRestaurant(restaurantId: string, updates: Partial<Restaurant>): Promise<void> {
    try {
      const restaurantRef = doc(db, 'restaurants', restaurantId);
      await updateDoc(restaurantRef, updates);
    } catch (error) {
      console.error('Error updating restaurant:', error);
      throw error;
    }
  },

  // Delete a restaurant
  async deleteRestaurant(restaurantId: string): Promise<void> {
    try {
      const restaurantRef = doc(db, 'restaurants', restaurantId);
      await deleteDoc(restaurantRef);
      console.log(`Restaurant ${restaurantId} deleted successfully.`);
    } catch (error) {
      console.error('Error deleting restaurant:', error);
      throw error;
    }
  },
}; 