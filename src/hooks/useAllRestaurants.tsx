import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import {
  collection, query, orderBy, onSnapshot, FirestoreError
} from 'firebase/firestore';
import { db } from '@/integrations/firebase/client';
import { Restaurant } from '@/types'; // Use shared type

interface AllRestaurantsHookState {
  restaurants: Restaurant[];
  loading: boolean;
  error: string | null;
}

// Renamed for clarity if you also have a hook for a single restaurant owner
export const useAllRestaurants = () => {
  const [state, setState] = useState<AllRestaurantsHookState>({
    restaurants: [],
    loading: true,
    error: null,
  });

  useEffect(() => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    console.log("Setting up listener for all restaurants.");

    const restaurantsCollectionRef = collection(db, 'restaurants');
    const q = query(restaurantsCollectionRef, orderBy('name', 'asc')); // Order by name A-Z

    const unsubscribe = onSnapshot(q,
      (querySnapshot) => {
        console.log(`All restaurants snapshot received (${querySnapshot.docs.length} docs)`);
        const restaurantsData = querySnapshot.docs.map(docSnap => ({
          id: docSnap.id,
          ...docSnap.data(),
        })) as Restaurant[]; // Use shared type
        setState({ restaurants: restaurantsData, loading: false, error: null });
      },
      (err) => {
        console.error("Error listening to all restaurants:", err);
        const firestoreError = err as FirestoreError;
        const errorMessage = firestoreError.message || 'Failed to fetch restaurants list.';
        setState({ restaurants: [], loading: false, error: errorMessage });
        toast.error(errorMessage); // Show feedback
      }
    );

    // Cleanup listener on unmount
    return () => {
      console.log("Cleaning up listener for all restaurants.");
      unsubscribe();
    };
  }, []); // Run only once on mount

  return {
    ...state, // restaurants, loading, error
  };
}; 