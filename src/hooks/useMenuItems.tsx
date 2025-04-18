import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import {
  collection, query, where, orderBy, onSnapshot,
  addDoc, updateDoc, deleteDoc, doc,
  serverTimestamp, FirestoreError, Timestamp
} from 'firebase/firestore';
import { db } from '@/integrations/firebase/client';
import { MenuItem } from '@/types'; // Use shared type

interface MenuItemsHookState {
  menuItems: MenuItem[];
  loading: boolean;
  error: string | null;
}

export const useMenuItems = (restaurantId?: string) => {
  const [state, setState] = useState<MenuItemsHookState>({
    menuItems: [],
    loading: true, // Start loading true until listener provides data or confirms no ID
    error: null,
  });

  // Real-time listener for menu items of a specific restaurant
  useEffect(() => {
    // If restaurantId is missing or invalid, don't query
    if (!restaurantId) {
      setState({ menuItems: [], loading: false, error: null }); // Clear data, stop loading
      console.log("No restaurant ID provided for useMenuItems.");
      return;
    }

    setState(prev => ({ ...prev, loading: true, error: null }));
    console.log(`Setting up listener for menu items of restaurant: ${restaurantId}`);

    const menuItemsCollectionRef = collection(db, 'menu_items');
    const q = query(
      menuItemsCollectionRef,
      where('restaurant_id', '==', restaurantId),
      orderBy('category', 'asc'), // Example ordering
      orderBy('name', 'asc')
    );

    const unsubscribe = onSnapshot(q,
      (querySnapshot) => {
        console.log(`Menu items snapshot received (${querySnapshot.docs.length} docs) for restaurant ${restaurantId}`);
        const menuItemsData = querySnapshot.docs.map(docSnap => ({
          id: docSnap.id,
          ...docSnap.data(),
        })) as MenuItem[]; // Use shared type
        setState({ menuItems: menuItemsData, loading: false, error: null });
      },
      (err) => {
        console.error(`Error listening to menu items for restaurant ${restaurantId}:`, err);
        const firestoreError = err as FirestoreError;
        const errorMessage = firestoreError.message || 'Failed to fetch menu items.';
        setState({ menuItems: [], loading: false, error: errorMessage });
        toast.error(errorMessage);
      }
    );

    // Cleanup listener on unmount or when restaurantId changes
    return () => {
      console.log(`Cleaning up listener for menu items of restaurant: ${restaurantId}`);
      unsubscribe();
    };
  }, [restaurantId]); // Dependency array: rerun effect if restaurantId changes

  // --- CRUD Operations --- 

  const addMenuItem = async (itemData: Omit<MenuItem, 'id' | 'createdAt' | 'updatedAt' | 'restaurant_id'>): Promise<string | null> => {
    if (!restaurantId) {
      toast.error("Cannot add menu item without a restaurant ID.");
      return null;
    }
    try {
      const menuItemsCollectionRef = collection(db, 'menu_items');
      const docRef = await addDoc(menuItemsCollectionRef, {
        ...itemData,
        restaurant_id: restaurantId,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      console.log("Menu item added with ID:", docRef.id);
      toast.success('Menu item added successfully');
      // State update handled by the listener
      return docRef.id;
    } catch (err) {
      console.error("Error adding menu item:", err);
      const firestoreError = err as FirestoreError;
      toast.error(firestoreError.message || 'Failed to add menu item.');
      return null;
    }
  };

  const updateMenuItem = async (itemId: string, updates: Partial<Omit<MenuItem, 'id' | 'createdAt' | 'restaurant_id'>>): Promise<boolean> => {
    try {
      const menuItemDocRef = doc(db, 'menu_items', itemId);
      await updateDoc(menuItemDocRef, {
        ...updates,
        updatedAt: serverTimestamp(),
      });
      console.log("Menu item updated:", itemId);
      toast.success('Menu item updated successfully');
      // State update handled by the listener
      return true;
    } catch (err) {
      console.error("Error updating menu item:", err);
      const firestoreError = err as FirestoreError;
      toast.error(firestoreError.message || 'Failed to update menu item.');
      return false;
    }
  };

  const deleteMenuItem = async (itemId: string): Promise<boolean> => {
    try {
      const menuItemDocRef = doc(db, 'menu_items', itemId);
      await deleteDoc(menuItemDocRef);
      console.log("Menu item deleted:", itemId);
      toast.success('Menu item deleted successfully');
      // State update handled by the listener
      return true;
    } catch (err) {
      console.error("Error deleting menu item:", err);
      const firestoreError = err as FirestoreError;
      toast.error(firestoreError.message || 'Failed to delete menu item.');
      return false;
    }
  };

  return {
    ...state, // menuItems, loading, error
    addMenuItem,
    updateMenuItem,
    deleteMenuItem,
  };
};
