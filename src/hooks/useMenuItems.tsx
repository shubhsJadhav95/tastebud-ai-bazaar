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
    if (!restaurantId) {
      setState({ menuItems: [], loading: false, error: null });
      console.log("No restaurant ID provided for useMenuItems.");
      return;
    }

    setState(prev => ({ ...prev, loading: true, error: null }));
    console.log(`Setting up listener for menu items subcollection of restaurant: ${restaurantId}`);

    const menuItemsSubcollectionRef = collection(db, 'restaurants', restaurantId, 'menu');
    
    const q = query(
      menuItemsSubcollectionRef,
      orderBy('category', 'asc'), 
      orderBy('name', 'asc')
    );

    const unsubscribe = onSnapshot(q,
      (querySnapshot) => {
        console.log(`Menu items snapshot received (${querySnapshot.docs.length} docs) for restaurant ${restaurantId}`);
        const menuItemsData = querySnapshot.docs.map(docSnap => ({
          id: docSnap.id,
          ...docSnap.data(),
        })) as MenuItem[];
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

    return () => {
      console.log(`Cleaning up listener for menu items subcollection of restaurant: ${restaurantId}`);
      unsubscribe();
    };
  }, [restaurantId]);

  // --- CRUD Operations --- 

  const addMenuItem = async (itemData: Omit<MenuItem, 'id' | 'createdAt' | 'updatedAt' | 'restaurant_id'>): Promise<string | null> => {
    if (!restaurantId) {
      toast.error("Cannot add menu item without a restaurant ID.");
      return null;
    }
    try {
      const menuItemsSubcollectionRef = collection(db, 'restaurants', restaurantId, 'menu');
      const docRef = await addDoc(menuItemsSubcollectionRef, {
        ...itemData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      console.log("Menu item added with ID:", docRef.id);
      toast.success('Menu item added successfully');
      return docRef.id;
    } catch (err) {
      console.error("Error adding menu item:", err);
      const firestoreError = err as FirestoreError;
      toast.error(firestoreError.message || 'Failed to add menu item.');
      return null;
    }
  };

  const updateMenuItem = async (itemId: string, updates: Partial<Omit<MenuItem, 'id' | 'createdAt' | 'restaurant_id'>>): Promise<boolean> => {
    if (!restaurantId) {
      toast.error("Restaurant context missing for update.");
      return false;
    }
    try {
      const menuItemDocRef = doc(db, 'restaurants', restaurantId, 'menu', itemId);
      await updateDoc(menuItemDocRef, {
        ...updates,
        updatedAt: serverTimestamp(),
      });
      console.log("Menu item updated:", itemId);
      toast.success('Menu item updated successfully');
      return true;
    } catch (err) {
      console.error("Error updating menu item:", err);
      const firestoreError = err as FirestoreError;
      toast.error(firestoreError.message || 'Failed to update menu item.');
      return false;
    }
  };

  const deleteMenuItem = async (itemId: string): Promise<boolean> => {
    if (!restaurantId) {
      toast.error("Restaurant context missing for delete.");
      return false;
    }
    try {
      const menuItemDocRef = doc(db, 'restaurants', restaurantId, 'menu', itemId);
      await deleteDoc(menuItemDocRef);
      console.log("Menu item deleted:", itemId);
      toast.success('Menu item deleted successfully');
      return true;
    } catch (err) {
      console.error("Error deleting menu item:", err);
      const firestoreError = err as FirestoreError;
      toast.error(firestoreError.message || 'Failed to delete menu item.');
      return false;
    }
  };

  return {
    ...state,
    addMenuItem,
    updateMenuItem,
    deleteMenuItem,
  };
};
