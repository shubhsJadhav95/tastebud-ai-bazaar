import { useState, useEffect } from 'react';
import { menuService } from '@/services/menuService';
import { MenuItem } from '@/types';
import { FirestoreError } from 'firebase/firestore';

// Hook to get a live feed of menu items for a restaurant
export const useMenuItems = (restaurantId: string | null | undefined) => {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!restaurantId) {
      console.log("No restaurant ID provided for useMenuItems.");
      setMenuItems([]);
      setIsLoading(false);
      return; // Don't listen if no ID
    }

    setIsLoading(true);
    setError(null);
    console.log(`Setting up listener for menu items of restaurant: ${restaurantId}`);

    const handleUpdate = (fetchedItems: MenuItem[]) => {
      setMenuItems(fetchedItems);
      setError(null);
      setIsLoading(false);
      console.log(`Menu items snapshot received (${fetchedItems.length} docs) for restaurant ${restaurantId}`);
    };

    const handleError = (err: FirestoreError) => {
      console.error("Error fetching menu items:", err);
      setError(err.message || 'Failed to load menu items.');
      setMenuItems([]);
      setIsLoading(false);
    };

    // Use the real-time service function
    const unsubscribe = menuService.getMenuItemsRealtime(
      restaurantId,
      handleUpdate,
      handleError
    );

    // Cleanup listener on component unmount or restaurantId change
    return () => {
       console.log(`Cleaning up listener for menu items of restaurant: ${restaurantId}`);
       unsubscribe();
    };

  }, [restaurantId]); // Rerun if restaurantId changes

  return { menuItems, isLoading, error };
}; 