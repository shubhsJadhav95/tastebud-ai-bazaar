import { useState, useEffect } from 'react';
import { orderService } from '@/services/orderService';

interface OrderSummary {
  count: number;
  totalEarnings: number;
}

export const useTodaysOrdersSummary = (restaurantId: string | null | undefined) => {
  const [summary, setSummary] = useState<OrderSummary>({ count: 0, totalEarnings: 0 });
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!restaurantId) {
      setSummary({ count: 0, totalEarnings: 0 });
      setIsLoading(false);
      return; // Don't fetch if no ID
    }

    const fetchSummary = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const fetchedSummary = await orderService.getTodaysOrderSummary(restaurantId);
        setSummary(fetchedSummary);
      } catch (err: any) {
        console.error("Error fetching today's order summary:", err);
        setError(err.message || "Failed to load order summary.");
        setSummary({ count: 0, totalEarnings: 0 });
      } finally {
        setIsLoading(false);
      }
    };

    fetchSummary();
    
    // Optionally add a timer to refetch periodically if real-time isn't strictly needed
    // const interval = setInterval(fetchSummary, 60000); // Refetch every minute
    // return () => clearInterval(interval);

  }, [restaurantId]); // Refetch if restaurantId changes

  return { summary, isLoading, error };
}; 