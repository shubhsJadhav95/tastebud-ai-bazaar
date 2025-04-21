import { useState, useEffect } from 'react';
import { orderService } from '@/services/orderService';
import { Order } from '@/types';
import { FirestoreError } from 'firebase/firestore';

// Hook to get a live feed of recent orders for a restaurant
export const useLiveOrders = (restaurantId: string | null | undefined, limitCount: number = 5) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!restaurantId) {
      setOrders([]);
      setIsLoading(false);
      return; // Don't listen if no ID
    }

    setIsLoading(true);
    setError(null);

    const handleUpdate = (fetchedOrders: Order[]) => {
      // Maybe filter here for only Pending/Confirmed orders if needed for the feed
      setOrders(fetchedOrders);
      setError(null);
      setIsLoading(false);
    };

    const handleError = (err: FirestoreError) => {
      console.error("Error fetching live orders:", err);
      setError(err.message || 'Failed to load live orders.');
      setOrders([]);
      setIsLoading(false);
    };

    // Use the existing real-time service function
    // We might want to add a limit to this query in the service later for performance
    const unsubscribe = orderService.getOrdersByRestaurantRealtime(
      restaurantId,
      handleUpdate,
      handleError
      // Consider adding a limit parameter to getOrdersByRestaurantRealtime
    );

    // Cleanup listener on component unmount or restaurantId change
    return () => unsubscribe();

  }, [restaurantId, limitCount]); // Rerun if restaurantId or limit changes

  return { orders, isLoading, error };
}; 