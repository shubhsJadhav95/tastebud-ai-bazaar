import { useState, useEffect, useCallback } from 'react';
import { useAuthContext } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { db } from '@/integrations/firebase/client';
import { collection, query, where, orderBy, onSnapshot, addDoc, updateDoc, doc, getDocs, serverTimestamp, limit } from 'firebase/firestore';

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
  created_at: any;
  updated_at: any;
}

export const useRestaurants = () => {
  const { user } = useAuthContext();
  const [isLoading, setIsLoading] = useState(true);
  const [myRestaurant, setMyRestaurant] = useState<Restaurant | null>(null);
  const [restaurantId, setRestaurantId] = useState<string | null>(null);
  
  // Fetch restaurant by owner ID using useCallback
  const fetchMyRestaurant = useCallback(async (userId: string) => {
    setIsLoading(true);
    console.log("Fetching restaurant for user:", userId);
    const restaurantsRef = collection(db, 'restaurants');
    // Query for restaurant owned by the user
    const q = query(restaurantsRef, where('owner_id', '==', userId), limit(1));

    try {
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        const docSnap = querySnapshot.docs[0];
        console.log("Restaurant found:", docSnap.id);
        setRestaurantId(docSnap.id);
        setMyRestaurant({ id: docSnap.id, ...docSnap.data() } as Restaurant);
      } else {
        console.log("No restaurant found for this user.");
        setMyRestaurant(null);
        setRestaurantId(null);
      }
    } catch (error) {
      console.error('Error fetching my restaurant:', error);
      toast.error('Failed to load your restaurant information.');
      setMyRestaurant(null);
      setRestaurantId(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Effect to fetch restaurant when user logs in
  useEffect(() => {
    if (user?.uid) {
      fetchMyRestaurant(user.uid);
    } else {
      // Clear restaurant data if user logs out
      setMyRestaurant(null);
      setRestaurantId(null);
      setIsLoading(false);
    }
  }, [user?.uid, fetchMyRestaurant]);

  // Effect for real-time updates on the fetched restaurant
  useEffect(() => {
    if (!restaurantId) return;

    console.log("Setting up listener for restaurant:", restaurantId);
    const restaurantDocRef = doc(db, 'restaurants', restaurantId);
    
    const unsubscribe = onSnapshot(restaurantDocRef, (docSnap) => {
      if (docSnap.exists()) {
        console.log("Restaurant data updated:", docSnap.id);
        setMyRestaurant({ id: docSnap.id, ...docSnap.data() } as Restaurant);
      } else {
        // Handle case where the restaurant might be deleted
        console.log("Restaurant document deleted.");
        setMyRestaurant(null);
        setRestaurantId(null); 
      }
      setIsLoading(false); // Ensure loading is false after first snapshot
    }, (error) => {
      console.error("Error listening to restaurant updates:", error);
      toast.error("Error receiving real-time updates for your restaurant.");
      setIsLoading(false);
    });

    // Cleanup listener on component unmount or when restaurantId changes
    return () => {
      console.log("Cleaning up listener for restaurant:", restaurantId);
      unsubscribe();
    };
  }, [restaurantId]);

  // Create or update restaurant
  const saveRestaurant = async (restaurantData: Partial<Omit<Restaurant, 'id' | 'owner_id' | 'created_at' | 'updated_at'>>) => {
    if (!user) {
      toast.error('You must be logged in to perform this action');
      return null;
    }
    
    try {
      const restaurantsRef = collection(db, 'restaurants');
      
      if (restaurantId) {
        // Update existing restaurant
        console.log("Updating restaurant:", restaurantId);
        const restaurantDoc = doc(db, 'restaurants', restaurantId);
        await updateDoc(restaurantDoc, {
          ...restaurantData,
          // Use serverTimestamp for updates
          updated_at: serverTimestamp(), 
        });
        toast.success('Restaurant updated successfully');
        // No need to manually set state, listener will catch the update
        // Return the updated data structure immediately for UI feedback if needed
        return { id: restaurantId, ...myRestaurant, ...restaurantData } as Restaurant;
      } else {
        // Create new restaurant
        console.log("Creating new restaurant for user:", user.uid);
        if (!restaurantData.name) {
          toast.error('Restaurant name is required');
          return null;
        }
        
        const newRestaurantData = {
          ...restaurantData,
          owner_id: user.uid,
          // Use serverTimestamp for creation and update
          created_at: serverTimestamp(),
          updated_at: serverTimestamp(),
        };
        
        const docRef = await addDoc(restaurantsRef, newRestaurantData);
        console.log("New restaurant created with ID:", docRef.id);
        // Set the new restaurant ID to trigger the listener
        // The listener will then set the myRestaurant state
        // setRestaurantId(docRef.id); 
        // We might not need to setRestaurantId here if fetchMyRestaurant runs again
        // Or, we can manually update the state for immediate feedback
        const createdRestaurant = {
          id: docRef.id,
          ...newRestaurantData,
          // Timestamps will be null until resolved by server, handle this in UI or fetch again
          created_at: new Date(), // Placeholder until listener updates
          updated_at: new Date(), // Placeholder
        } as Restaurant;
        setMyRestaurant(createdRestaurant);
        setRestaurantId(docRef.id);

        toast.success('Restaurant created successfully');
        return createdRestaurant;
      }
    } catch (error) {
      console.error('Error saving restaurant:', error);
      toast.error('Failed to save restaurant');
      return null;
    }
  };

  return {
    // Only return the owner's restaurant
    myRestaurant,
    isLoading,
    fetchMyRestaurant, // Keep if needed externally, though useEffect handles it
    saveRestaurant
  };
};
