import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthContext } from '@/contexts/AuthContext';
import { useMyRestaurant } from '@/hooks/useRestaurants'; // Hook to get the owner's restaurant
import OrderManager from '@/components/dashboard/OrderManager'; // Import the component
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from '@/components/ui/button';
import { AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

const RestaurantOrdersPage: React.FC = () => {
  const { user, loading: authLoading } = useAuthContext();
  // Fetch the restaurant associated with the logged-in user
  const { myRestaurant, isLoading: restaurantLoading, error: restaurantError } = useMyRestaurant();
  const navigate = useNavigate();

  // Authorization check: Ensure user is logged in and is a restaurant owner
  useEffect(() => {
    if (!authLoading && !user) {
      toast.error("Please log in to manage orders.");
      navigate('/restaurant/login');
    }
    // Note: useMyRestaurant hook implicitly handles if the user is a restaurant owner
    // because it only returns a restaurant if one is linked to the user's ID.
  }, [user, authLoading, navigate]);

  // Loading State
  if (authLoading || restaurantLoading) {
    return (
      <div className="container mx-auto p-4 md:p-6 space-y-6">
        <Skeleton className="h-9 w-1/3 rounded-md" />
        <Skeleton className="h-64 w-full rounded-md" />
      </div>
    );
  }

  // Error State (Could be auth error or error fetching restaurant)
  if (restaurantError) {
    return (
      <div className="container mx-auto p-4 md:p-6">
        <Alert variant="destructive">
           <AlertCircle className="h-4 w-4" />
           <AlertTitle>Error Loading Restaurant Data</AlertTitle>
           <AlertDescription>
            {restaurantError}
           </AlertDescription>
        </Alert>
      </div>
    );
  }

  // If the user is logged in but has no associated restaurant profile
  if (!myRestaurant) {
    return (
      <div className="container mx-auto p-4 md:p-6">
        <Alert>
           <AlertCircle className="h-4 w-4" />
           <AlertTitle>Restaurant Profile Needed</AlertTitle>
           <AlertDescription>
            You need to create your restaurant profile before you can manage orders.
            <Button variant="link" className="p-0 h-auto ml-1" onClick={() => navigate('/restaurant/profile')}>
              Create Profile
            </Button>
           </AlertDescription>
        </Alert>
      </div>
    );
  }

  // If everything is loaded and authorized, render the OrderManager
  return (
    <div className="container mx-auto p-4 md:p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl md:text-3xl font-bold">Manage Orders for: {myRestaurant.name}</h1>
        {/* Filters can be added here */}
      </div>
      
      {/* Render OrderManager only if restaurantId is available */}
      <OrderManager restaurantId={myRestaurant.id} />
    </div>
  );
};

export default RestaurantOrdersPage; 