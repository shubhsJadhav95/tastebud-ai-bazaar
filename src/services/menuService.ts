import { db } from '@/integrations/firebase/client';
import { MenuItem } from '../types';
import {
  collection, doc, getDocs, addDoc, updateDoc, deleteDoc, query, where, orderBy,
  onSnapshot, Unsubscribe, FirestoreError, getCountFromServer // Import necessary types
} from 'firebase/firestore';

export const menuService = {
  /**
   * Sets up a real-time listener for menu items of a specific restaurant.
   * Calls the onUpdate callback with the current menu items whenever they change.
   * Returns an unsubscribe function to clean up the listener.
   */
  getMenuItemsRealtime(
    restaurantId: string,
    onUpdate: (items: MenuItem[]) => void,
    onError: (error: FirestoreError) => void
  ): Unsubscribe {
    console.log(`Setting up real-time listener for menu items of restaurant: ${restaurantId}`);
    const menuRef = collection(db, 'restaurants', restaurantId, 'menu');
    const q = query(menuRef, orderBy('category'), orderBy('name'));

    const unsubscribe = onSnapshot(q,
      (snapshot) => {
        console.log(`Menu items snapshot received for ${restaurantId} (${snapshot.docs.length} docs)`);
        const items = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as MenuItem[];
        onUpdate(items); // Call the callback with the latest data
      },
      (error) => {
        console.error(`Error listening to menu items for restaurant ${restaurantId}:`, error);
        onError(error); // Call the error callback
      }
    );

    return unsubscribe; // Return the cleanup function
  },

  // Get all menu items for a restaurant
  async getMenuItems(restaurantId: string): Promise<MenuItem[]> {
    try {
      const menuRef = collection(db, 'restaurants', restaurantId, 'menu');
      const q = query(menuRef, orderBy('category'), orderBy('name'));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as MenuItem[];
    } catch (error) {
      console.error('Error fetching menu items:', error);
      throw error;
    }
  },

  // Add a new menu item
  async addMenuItem(restaurantId: string, menuItem: Omit<MenuItem, 'id' | 'restaurant_id' | 'createdAt' | 'updatedAt'>): Promise<MenuItem> {
    try {
      // Add restaurant_id internally
      const dataToAdd = { ...menuItem, restaurant_id: restaurantId };
      const menuRef = collection(db, 'restaurants', restaurantId, 'menu');
      const docRef = await addDoc(menuRef, dataToAdd);
      // Return the full item including the ID
      return {
        id: docRef.id,
        ...dataToAdd
      } as MenuItem;
    } catch (error) {
      console.error('Error adding menu item:', error);
      throw error;
    }
  },

  // Update a menu item
  async updateMenuItem(restaurantId: string, menuItemId: string, updates: Partial<MenuItem>): Promise<void> {
    try {
      // Ensure restaurant_id or id is not accidentally updated if passed in updates
      const { id, restaurant_id, ...validUpdates } = updates;
      const menuItemRef = doc(db, 'restaurants', restaurantId, 'menu', menuItemId);
      await updateDoc(menuItemRef, validUpdates);
    } catch (error) {
      console.error('Error updating menu item:', error);
      throw error;
    }
  },

  // Delete a menu item
  async deleteMenuItem(restaurantId: string, menuItemId: string): Promise<void> {
    try {
      const menuItemRef = doc(db, 'restaurants', restaurantId, 'menu', menuItemId);
      await deleteDoc(menuItemRef);
    } catch (error) {
      console.error('Error deleting menu item:', error);
      throw error;
    }
  },

  /**
   * Gets the total count of menu items for a specific restaurant.
   * @param restaurantId The ID of the restaurant.
   * @returns A promise resolving to the number of menu items.
   */
  async getMenuItemCount(restaurantId: string): Promise<number> {
    if (!restaurantId) {
      console.error("Restaurant ID required for menu item count.");
      return 0;
    }
    try {
      // Correct the path to the 'menu' subcollection
      const menuItemsRef = collection(db, 'restaurants', restaurantId, 'menu');
      // ~~ Assuming menu items are in a subcollection named 'menu_items' under the restaurant ~~ 
      // ~~ Adjust the path if your structure is different (e.g., a top-level collection) ~~ 
      // ~~ const menuItemsRef = collection(db, 'restaurants', restaurantId, 'menu_items'); ~~
      
      // Use getCountFromServer for efficiency if available (Firestore >= v9.6.0)
      const snapshot = await getCountFromServer(menuItemsRef); 
      // If using older Firestore or need compatibility: 
      // const snapshot = await getDocs(menuItemsRef);
      // return snapshot.size;

      console.log(`Menu item count for ${restaurantId} (from 'menu' subcollection): ${snapshot.data().count}`);
      return snapshot.data().count;

    } catch (error) {
      console.error(`Error fetching menu item count for ${restaurantId}:`, error);
      return 0; // Return 0 on error
    }
  },
}; 