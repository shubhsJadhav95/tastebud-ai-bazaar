import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { db } from '@/integrations/firebase/client';
import { collection, query, orderBy, onSnapshot, Timestamp } from 'firebase/firestore';
// Import the shared Restaurant type
import { Restaurant } from '@/types';

// Re-using the Restaurant interface (consider moving to a shared types file)
export interface Restaurant {
  id: string;
  owner_id: string;
  name: string;
  description: string | null;
  cuisine: string | null;
  address: string | null;
  image_url: string | null;
  logo_url: string | null;
  price_range: string | null;
  delivery_time: string | null;
  phone: string | null;
  created_at: Timestamp;
  updated_at: Timestamp;
}

export const useAllRestaurants = () => {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    console.log("Setting up listener for all restaurants.");
    const restaurantsRef = collection(db, 'restaurants');
    // Query to get all restaurants, ordered by name
    const q = query(restaurantsRef, orderBy('name'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      console.log("All restaurants snapshot received. Docs count:", snapshot.docs.length);
      const restaurantsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Restaurant[]; // Firestore Timestamps are handled correctly
      
      setRestaurants(restaurantsData);
      setIsLoading(false);
    }, (error) => {
      console.error("Error listening to all restaurants updates:", error);
      toast.error("Error fetching restaurants list.");
      setIsLoading(false);
    });

    // Cleanup listener on component unmount
    return () => {
      console.log("Cleaning up listener for all restaurants.");
      unsubscribe();
    };
  }, []); // Empty dependency array means this runs once on mount

  return {
    restaurants,
    isLoading,
  };
}; 