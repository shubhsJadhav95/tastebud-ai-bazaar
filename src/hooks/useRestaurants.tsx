
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';

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
  created_at: string;
  updated_at: string;
}

export const useRestaurants = () => {
  const { user } = useAuth();
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [myRestaurant, setMyRestaurant] = useState<Restaurant | null>(null);
  
  // Fetch all restaurants
  const fetchRestaurants = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('restaurants')
        .select('*')
        .order('name');
      
      if (error) {
        throw error;
      }
      
      setRestaurants(data as Restaurant[]);
    } catch (error) {
      console.error('Error fetching restaurants:', error);
      toast.error('Failed to load restaurants');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Fetch restaurant by owner (for restaurant owners)
  const fetchMyRestaurant = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('restaurants')
        .select('*')
        .eq('owner_id', user.id)
        .single();
      
      if (error && error.code !== 'PGRST116') { // PGRST116 is "no rows returned" error
        throw error;
      }
      
      setMyRestaurant(data as Restaurant);
    } catch (error) {
      console.error('Error fetching my restaurant:', error);
    }
  };
  
  // Create or update restaurant
  const saveRestaurant = async (restaurantData: Partial<Restaurant>) => {
    if (!user) {
      toast.error('You must be logged in to perform this action');
      return null;
    }
    
    try {
      // Check if restaurant exists
      if (myRestaurant?.id) {
        // Update existing restaurant
        const { data, error } = await supabase
          .from('restaurants')
          .update({
            ...restaurantData,
            updated_at: new Date().toISOString(),
          })
          .eq('id', myRestaurant.id)
          .select()
          .single();
        
        if (error) throw error;
        
        setMyRestaurant(data as Restaurant);
        toast.success('Restaurant updated successfully');
        return data;
      } else {
        // Create new restaurant - Make sure name is required
        if (!restaurantData.name) {
          toast.error('Restaurant name is required');
          return null;
        }
        
        // Create new restaurant with properly typed data
        const newRestaurant = {
          ...restaurantData,
          owner_id: user.id,
          name: restaurantData.name
        };
        
        const { data, error } = await supabase
          .from('restaurants')
          .insert([newRestaurant])
          .select()
          .single();
        
        if (error) throw error;
        
        setMyRestaurant(data as Restaurant);
        toast.success('Restaurant created successfully');
        return data;
      }
    } catch (error) {
      console.error('Error saving restaurant:', error);
      toast.error('Failed to save restaurant');
      return null;
    }
  };
  
  // Subscribe to real-time changes
  useEffect(() => {
    fetchRestaurants();
    
    if (user) {
      fetchMyRestaurant();
    }
    
    // Set up real-time subscription
    const channel = supabase
      .channel('restaurants-changes')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'restaurants' 
      }, (payload) => {
        console.log('Real-time update:', payload);
        
        // Handle different events
        if (payload.eventType === 'INSERT') {
          setRestaurants(prev => [...prev, payload.new as Restaurant]);
        } else if (payload.eventType === 'UPDATE') {
          setRestaurants(prev => 
            prev.map(restaurant => 
              restaurant.id === payload.new.id ? (payload.new as Restaurant) : restaurant
            )
          );
          
          // Update myRestaurant if it's the same
          if (myRestaurant?.id === payload.new.id) {
            setMyRestaurant(payload.new as Restaurant);
          }
        } else if (payload.eventType === 'DELETE') {
          setRestaurants(prev => 
            prev.filter(restaurant => restaurant.id !== payload.old.id)
          );
          
          // Clear myRestaurant if it was deleted
          if (myRestaurant?.id === payload.old.id) {
            setMyRestaurant(null);
          }
        }
      })
      .subscribe();
    
    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id]);

  return {
    restaurants,
    myRestaurant,
    isLoading,
    fetchRestaurants,
    fetchMyRestaurant,
    saveRestaurant
  };
};
