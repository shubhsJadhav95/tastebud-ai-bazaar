import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { db } from '@/integrations/firebase/client';
import { collection, query, where, orderBy, onSnapshot, addDoc, updateDoc, deleteDoc, doc, serverTimestamp, Timestamp } from 'firebase/firestore';

export interface MenuItem {
  id: string;
  restaurant_id: string;
  name: string;
  description: string | null;
  price: number;
  image_url: string | null;
  category: string | null;
  is_available: boolean;
  created_at: Timestamp;
  updated_at: Timestamp;
}

export const useMenuItems = (restaurantId?: string) => {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Create a new menu item
  const createMenuItem = async (itemData: Omit<MenuItem, 'id' | 'created_at' | 'updated_at' | 'restaurant_id'>) => {
    if (!restaurantId) {
      toast.error("Restaurant ID is required to add a menu item.");
      return null;
    }
    try {
      const menuItemsRef = collection(db, 'menu_items');
      const newMenuItemData = {
        ...itemData,
        restaurant_id: restaurantId,
        created_at: serverTimestamp(),
        updated_at: serverTimestamp(),
      };
      
      const docRef = await addDoc(menuItemsRef, newMenuItemData);
      toast.success('Menu item added successfully');
      return docRef.id;
    } catch (error) {
      console.error('Error creating menu item:', error);
      toast.error('Failed to add menu item');
      return null;
    }
  };
  
  // Update a menu item
  const updateMenuItem = async (itemId: string, updates: Partial<Omit<MenuItem, 'id' | 'created_at' | 'restaurant_id'>>) => {
    try {
      const menuItemDoc = doc(db, 'menu_items', itemId);
      await updateDoc(menuItemDoc, {
        ...updates,
        updated_at: serverTimestamp(),
      });
      toast.success('Menu item updated successfully');
      return true;
    } catch (error) {
      console.error('Error updating menu item:', error);
      toast.error('Failed to update menu item');
      return false;
    }
  };
  
  // Delete a menu item
  const deleteMenuItem = async (itemId: string) => {
    try {
      const menuItemDoc = doc(db, 'menu_items', itemId);
      await deleteDoc(menuItemDoc);
      toast.success('Menu item deleted successfully');
      return true;
    } catch (error) {
      console.error('Error deleting menu item:', error);
      toast.error('Failed to delete menu item');
      return false;
    }
  };
  
  // Set up real-time subscription when restaurantId changes
  useEffect(() => {
    setMenuItems([]);
    setIsLoading(true); 

    if (!restaurantId) {
      console.log("No restaurant ID provided, clearing menu items.");
      setIsLoading(false);
      return;
    }
    
    console.log("Setting up listener for menu items of restaurant:", restaurantId);
    const menuItemsRef = collection(db, 'menu_items');
    const q = query(
      menuItemsRef,
      where('restaurant_id', '==', restaurantId),
      orderBy('category'),
      orderBy('name')
    );
      
    const unsubscribe = onSnapshot(q, (snapshot) => {
      console.log("Menu items snapshot received. Docs count:", snapshot.docs.length);
      const menuItemsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as MenuItem[];
      
      setMenuItems(menuItemsData);
      setIsLoading(false);
    }, (error) => {
      console.error("Error listening to menu item updates:", error);
      toast.error("Error receiving real-time updates for menu items.");
      setIsLoading(false);
    });
      
    return () => {
      console.log("Cleaning up listener for menu items of restaurant:", restaurantId);
      unsubscribe();
    };
  }, [restaurantId]);

  return {
    menuItems,
    isLoading,
    createMenuItem,
    updateMenuItem,
    deleteMenuItem
  };
};
