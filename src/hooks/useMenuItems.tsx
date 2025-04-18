
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface MenuItem {
  id: string;
  restaurant_id: string;
  name: string;
  description: string | null;
  price: number;
  image_url: string | null;
  category: string | null;
  is_available: boolean;
  created_at: string;
  updated_at: string;
}

export const useMenuItems = (restaurantId?: string) => {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Fetch menu items for a specific restaurant
  const fetchMenuItems = async (id?: string) => {
    const restaurantIdToUse = id || restaurantId;
    
    if (!restaurantIdToUse) {
      setMenuItems([]);
      setIsLoading(false);
      return;
    }
    
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('menu_items')
        .select('*')
        .eq('restaurant_id', restaurantIdToUse)
        .order('category', { ascending: true })
        .order('name', { ascending: true });
      
      if (error) {
        throw error;
      }
      
      setMenuItems(data as MenuItem[]);
    } catch (error) {
      console.error('Error fetching menu items:', error);
      toast.error('Failed to load menu items');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Create a new menu item
  const createMenuItem = async (item: Omit<MenuItem, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('menu_items')
        .insert([item])
        .select()
        .single();
      
      if (error) throw error;
      
      toast.success('Menu item added successfully');
      return data as MenuItem;
    } catch (error) {
      console.error('Error creating menu item:', error);
      toast.error('Failed to add menu item');
      return null;
    }
  };
  
  // Update a menu item
  const updateMenuItem = async (id: string, updates: Partial<MenuItem>) => {
    try {
      const { data, error } = await supabase
        .from('menu_items')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      
      toast.success('Menu item updated successfully');
      return data as MenuItem;
    } catch (error) {
      console.error('Error updating menu item:', error);
      toast.error('Failed to update menu item');
      return null;
    }
  };
  
  // Delete a menu item
  const deleteMenuItem = async (id: string) => {
    try {
      const { error } = await supabase
        .from('menu_items')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      toast.success('Menu item deleted successfully');
      return true;
    } catch (error) {
      console.error('Error deleting menu item:', error);
      toast.error('Failed to delete menu item');
      return false;
    }
  };
  
  // Set up real-time subscription when restaurantId changes
  useEffect(() => {
    if (restaurantId) {
      fetchMenuItems();
      
      // Set up real-time subscription
      const channel = supabase
        .channel('menu-items-changes')
        .on('postgres_changes', { 
          event: '*', 
          schema: 'public', 
          table: 'menu_items',
          filter: `restaurant_id=eq.${restaurantId}`
        }, (payload) => {
          console.log('Real-time menu update:', payload);
          
          // Handle different events
          if (payload.eventType === 'INSERT') {
            setMenuItems(prev => [...prev, payload.new as MenuItem]);
          } else if (payload.eventType === 'UPDATE') {
            setMenuItems(prev => 
              prev.map(item => 
                item.id === payload.new.id ? (payload.new as MenuItem) : item
              )
            );
          } else if (payload.eventType === 'DELETE') {
            setMenuItems(prev => 
              prev.filter(item => item.id !== payload.old.id)
            );
          }
        })
        .subscribe();
      
      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [restaurantId]);

  return {
    menuItems,
    isLoading,
    fetchMenuItems,
    createMenuItem,
    updateMenuItem,
    deleteMenuItem
  };
};
