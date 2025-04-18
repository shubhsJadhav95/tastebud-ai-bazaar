import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import {
  collection, query, where, onSnapshot, addDoc, updateDoc, doc, getDocs,
  serverTimestamp, limit, FirestoreError, Timestamp
} from 'firebase/firestore';
import { db } from '@/integrations/firebase/client';
import { useAuthContext } from "@/contexts/AuthContext";
import { Restaurant } from '@/types'; // Use shared type

interface MyRestaurantHookState {
  myRestaurant: Restaurant | null;
  isLoading: boolean;
  error: string | null;
}

// This hook is for fetching and managing the restaurant owned by the logged-in user.
export const useMyRestaurant = () => {
  const { user } = useAuthContext(); // Get the logged-in user
  const [state, setState] = useState<MyRestaurantHookState>({
    myRestaurant: null,
    isLoading: true, // Start loading true until data is fetched or confirmed non-existent
    error: null,
  });
  // Keep track of the specific restaurant ID once found for the listener
  const [restaurantId, setRestaurantId] = useState<string | null>(null);

  // Fetch restaurant by owner ID
  const fetchMyRestaurant = useCallback(async (userId: string) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    console.log("Fetching restaurant for user:", userId);
    const restaurantsRef = collection(db, 'restaurants');
    const q = query(restaurantsRef, where('owner_id', '==', userId), limit(1));

    try {
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        const docSnap = querySnapshot.docs[0];
        console.log("Restaurant found:", docSnap.id);
        // Set ID to trigger listener
        setRestaurantId(docSnap.id);
        // Set initial data (listener will update)
        setState(prev => ({ 
          ...prev, 
          myRestaurant: { id: docSnap.id, ...docSnap.data() } as Restaurant, 
          isLoading: false, // We have initial data, listener will refine
          error: null 
        }));
      } else {
        console.log("No restaurant found for this user.");
        setRestaurantId(null); // Ensure listener doesn't run
        setState({ myRestaurant: null, isLoading: false, error: null });
      }
    } catch (err) {
      console.error('Error fetching my restaurant:', err);
      const firestoreError = err as FirestoreError;
      const errorMessage = firestoreError.message || 'Failed to load your restaurant information.';
      setState({ myRestaurant: null, isLoading: false, error: errorMessage });
      toast.error(errorMessage);
      setRestaurantId(null);
    }
  }, []); // useCallback dependency array

  // Effect to fetch restaurant when user logs in or changes
  useEffect(() => {
    if (user?.uid) {
      fetchMyRestaurant(user.uid);
    } else {
      // Clear restaurant data if user logs out
      setRestaurantId(null);
      setState({ myRestaurant: null, isLoading: false, error: null });
    }
  }, [user?.uid, fetchMyRestaurant]);

  // Effect for real-time updates on the specific restaurant document
  useEffect(() => {
    if (!restaurantId) {
      // No restaurant to listen to, ensure loading is false if fetch failed or user has no restaurant
      if(state.isLoading && !user?.uid) setState(prev => ({...prev, isLoading: false}));
      return; 
    }

    console.log("Setting up listener for restaurant:", restaurantId);
    // We already set isLoading: true in fetchMyRestaurant, listener will set it to false
    const restaurantDocRef = doc(db, 'restaurants', restaurantId);
    
    const unsubscribe = onSnapshot(restaurantDocRef, 
      (docSnap) => {
        if (docSnap.exists()) {
          console.log("My restaurant data updated:", docSnap.id);
          setState({ 
            myRestaurant: { id: docSnap.id, ...docSnap.data() } as Restaurant, 
            isLoading: false, 
            error: null 
          });
        } else {
          // Handle case where the restaurant document is deleted
          console.log("My restaurant document deleted.");
          setRestaurantId(null); 
          setState({ myRestaurant: null, isLoading: false, error: 'Restaurant data not found.' }); 
        }
      }, 
      (err) => {
        console.error("Error listening to my restaurant updates:", err);
        const firestoreError = err as FirestoreError;
        const errorMessage = firestoreError.message || "Error receiving real-time updates for your restaurant.";
        // Keep existing data? Or clear? Decide based on UX.
        setState(prev => ({ ...prev, isLoading: false, error: errorMessage }));
        toast.error(errorMessage);
      }
    );

    // Cleanup listener on component unmount or when restaurantId changes
    return () => {
      console.log("Cleaning up listener for my restaurant:", restaurantId);
      unsubscribe();
    };
  }, [restaurantId, user?.uid]); // Add user?.uid dependency

  // --- CRUD Operations --- 

  // Save function handles both Create and Update
  const saveMyRestaurant = async (restaurantData: Partial<Omit<Restaurant, 'id' | 'owner_id' | 'createdAt' | 'updatedAt'>>) => {
    if (!user?.uid) {
      toast.error('You must be logged in to save a restaurant.');
      throw new Error('User not authenticated');
    }

    // Use the current restaurantId from state
    const currentRestaurantId = restaurantId; 

    try {
      if (currentRestaurantId) {
        // Update existing restaurant
        console.log("Updating restaurant:", currentRestaurantId);
        const restaurantDocRef = doc(db, 'restaurants', currentRestaurantId);
        await updateDoc(restaurantDocRef, {
          ...restaurantData,
          updatedAt: serverTimestamp(), // Use serverTimestamp
        });
        toast.success('Restaurant updated successfully');
        // State update will be handled by the listener
        // Optionally return true or the data for immediate feedback if needed
        return true; 
      } else {
        // Create new restaurant
        console.log("Creating new restaurant for user:", user.uid);
        if (!restaurantData.name) {
          toast.error('Restaurant name is required.');
          throw new Error('Restaurant name is required.');
        }
        const restaurantsCollectionRef = collection(db, 'restaurants');
        const newRestaurantData = {
          ...restaurantData,
          owner_id: user.uid,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        };
        const docRef = await addDoc(restaurantsCollectionRef, newRestaurantData);
        console.log("New restaurant created with ID:", docRef.id);
        // Setting the restaurantId will trigger the listener to fetch the new data
        // setRestaurantId(docRef.id); // Let the fetch/listener handle state update
        toast.success('Restaurant created successfully');
        return docRef.id; // Return new ID
      }
    } catch (err) {
      console.error('Error saving restaurant:', err);
      const firestoreError = err as FirestoreError;
      const errorMessage = firestoreError.message || 'Failed to save restaurant.';
      toast.error(errorMessage);
      throw err; // Re-throw error
    }
  };

  // Note: Delete operation might need its own function if required.

  return {
    ...state, // myRestaurant, isLoading, error
    saveMyRestaurant,
  };
};
