import { useState, useEffect } from 'react';
import { restaurantService } from '@/services/restaurantService';
import { Restaurant } from '@/types';
import { collection, query, orderBy, onSnapshot, Unsubscribe } from 'firebase/firestore'; // Import Firestore listener functions
import { db } from '@/integrations/firebase/client'; // Ensure db is imported correctly

interface UseAllRestaurantsResult {
  restaurants: Restaurant[];
  isLoading: boolean;
  error: string | null;
  // refetch might not be needed with real-time listener, but kept for consistency or manual refresh scenarios
  refetch: () => void; 
}

export const useAllRestaurants = (): UseAllRestaurantsResult => {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [triggerRefetch, setTriggerRefetch] = useState<number>(0); // Keep for manual refetch

  useEffect(() => {
    setIsLoading(true);
    setError(null);
    console.log("Setting up listener for all restaurants.");

    const restaurantsRef = collection(db, 'restaurants');
    const q = query(restaurantsRef, orderBy('name', 'asc')); // Order by name

    const unsubscribe: Unsubscribe = onSnapshot(q, 
      (querySnapshot) => {
        const fetchedRestaurants: Restaurant[] = [];
        querySnapshot.forEach((doc) => {
          fetchedRestaurants.push({ id: doc.id, ...doc.data() } as Restaurant);
        });
        setRestaurants(fetchedRestaurants);
        setError(null); // Clear error on successful fetch
        setIsLoading(false);
        console.log(`All restaurants snapshot received (${fetchedRestaurants.length} docs)`);
      },
      (err) => {
        console.error("Error listening to restaurants collection:", err);
        setError(err.message || 'Failed to load restaurants.');
        setRestaurants([]);
        setIsLoading(false);
      }
    );

    // Cleanup listener on component unmount or triggerRefetch change
    return () => {
      console.log("Cleaning up listener for all restaurants.");
      unsubscribe();
    };

  }, [triggerRefetch]); // Only refetch manually

  const refetch = () => {
    setTriggerRefetch(prev => prev + 1);
  };

  return { restaurants, isLoading, error, refetch };
}; 