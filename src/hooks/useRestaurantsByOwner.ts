import { useState, useEffect } from 'react';
import { useAuthContext } from '@/contexts/AuthContext';
import { restaurantService } from '@/services/restaurantService';
import { Restaurant } from '@/types';

interface UseRestaurantsByOwnerResult {
  restaurants: Restaurant[];
  isLoading: boolean;
  error: string | null;
  refetch: () => void; // Function to manually trigger refetch
}

export const useRestaurantsByOwner = (): UseRestaurantsByOwnerResult => {
  const { user } = useAuthContext();
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [triggerRefetch, setTriggerRefetch] = useState<number>(0); // State to trigger refetch

  useEffect(() => {
    if (!user?.uid) {
      // If user is not logged in, don't attempt to fetch
      setRestaurants([]);
      setIsLoading(false);
      return;
    }

    const fetchRestaurants = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const fetchedRestaurants = await restaurantService.getRestaurantsByOwner(user.uid);
        setRestaurants(fetchedRestaurants);
      } catch (err: any) {
        console.error("Error in useRestaurantsByOwner hook:", err);
        setError(err.message || 'Failed to load your restaurants.');
        setRestaurants([]); // Clear restaurants on error
      } finally {
        setIsLoading(false);
      }
    };

    fetchRestaurants();

    // No cleanup needed for getDocs (one-time fetch)

  }, [user?.uid, triggerRefetch]); // Rerun if user changes or refetch is triggered

  // Function to allow manual refetching
  const refetch = () => {
    setTriggerRefetch(prev => prev + 1);
  };

  return { restaurants, isLoading, error, refetch };
}; 