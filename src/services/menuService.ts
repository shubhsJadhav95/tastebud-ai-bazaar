import { db } from '../config/firebase';
import { MenuItem } from '../types';
import { collection, doc, getDocs, addDoc, updateDoc, deleteDoc, query, where, orderBy } from 'firebase/firestore';

export const menuService = {
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
  async addMenuItem(restaurantId: string, menuItem: Omit<MenuItem, 'id'>): Promise<MenuItem> {
    try {
      const menuRef = collection(db, 'restaurants', restaurantId, 'menu');
      const docRef = await addDoc(menuRef, menuItem);
      return {
        id: docRef.id,
        ...menuItem
      };
    } catch (error) {
      console.error('Error adding menu item:', error);
      throw error;
    }
  },

  // Update a menu item
  async updateMenuItem(restaurantId: string, menuItemId: string, updates: Partial<MenuItem>): Promise<void> {
    try {
      const menuItemRef = doc(db, 'restaurants', restaurantId, 'menu', menuItemId);
      await updateDoc(menuItemRef, updates);
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
  }
}; 