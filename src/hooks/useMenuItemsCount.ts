import { useState, useEffect } from 'react';
import { menuService } from '@/services/menuService';

export const useMenuItemsCount = (restaurantId: string | null | undefined) => {
  const [count, setCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!restaurantId) {
      setCount(0);
      setIsLoading(false);
      return; // Don't fetch if no ID
    }

    const fetchCount = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const fetchedCount = await menuService.getMenuItemCount(restaurantId);
        setCount(fetchedCount);
      } catch (err: any) {
        console.error("Error fetching menu item count:", err);
        setError(err.message || "Failed to load menu item count.");
        setCount(0);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCount();

    // No cleanup needed as getCountFromServer is a one-time fetch

  }, [restaurantId]); // Refetch if restaurantId changes

  return { count, isLoading, error };
}; 