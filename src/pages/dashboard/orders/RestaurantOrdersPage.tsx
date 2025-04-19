import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthContext } from '@/contexts/AuthContext';
// import { useMyRestaurant } from '@/hooks/useRestaurants'; // Already commented out/removed
import { useRestaurantsByOwner } from '@/hooks/useRestaurantsByOwner'; // Import the new hook
import OrderManager from '@/components/dashboard/OrderManager'; // Import the component
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"; // Import Select components
import { AlertCircle, Utensils } from 'lucide-react';
import { toast } from 'sonner';

const RestaurantOrdersPage: React.FC = () => {
  const { user, loading: authLoading } = useAuthContext();
  // Use the new hook to fetch all restaurants owned by the user
  const { 
    restaurants, 
    isLoading: restaurantsLoading, 
    error: restaurantsError 
  } = useRestaurantsByOwner(); 
  const [selectedRestaurantId, setSelectedRestaurantId] = useState<string | null>(null);
  const navigate = useNavigate();

  // Authorization check: Ensure user is logged in
  useEffect(() => {
    if (!authLoading && !user) {
      toast.error("Please log in to manage orders.");
      navigate('/restaurant/login');
    }
  }, [user, authLoading, navigate]);

  // Find the selected restaurant object based on ID for display name
  const selectedRestaurant = restaurants.find(r => r.id === selectedRestaurantId);

  // --- Loading State --- 
  // Show loading if either auth or restaurant list is loading
  if (authLoading || restaurantsLoading) {
    return (
      <div className="container mx-auto p-4 md:p-6 space-y-6">
        <Skeleton className="h-9 w-1/3 rounded-md" /> 
        <Skeleton className="h-10 w-1/2 mb-4 rounded-md" /> {/* Skeleton for Select */}
        <Skeleton className="h-64 w-full rounded-md" /> {/* Skeleton for OrderManager */}
      </div>
    );
  }

  // --- Error State --- 
  // Show error if fetching restaurants failed
  if (restaurantsError) {
    return (
      <div className="container mx-auto p-4 md:p-6">
        <Alert variant="destructive">
           <AlertCircle className="h-4 w-4" />
           <AlertTitle>Error Loading Restaurants</AlertTitle>
           <AlertDescription>
            {restaurantsError} - Please try refreshing the page.
           </AlertDescription>
        </Alert>
      </div>
    );
  }

  // --- No Restaurants Found State --- 
  // If user is logged in but has no restaurants associated
  if (!restaurantsLoading && restaurants.length === 0) {
    return (
      <div className="container mx-auto p-4 md:p-6">
        <Alert>
           <AlertCircle className="h-4 w-4" />
           <AlertTitle>No Restaurants Found</AlertTitle>
           <AlertDescription>
            You haven't added any restaurants yet. 
            <Button variant="link" className="p-0 h-auto ml-1" onClick={() => navigate('/dashboard/restaurants/new')}>
              Add a Restaurant
            </Button>
            to start managing orders.
           </AlertDescription>
        </Alert>
      </div>
    );
  }

  // --- Main Content --- 
  // If everything is loaded and authorized, render the selector and potentially OrderManager
  return (
    <div className="container mx-auto p-4 md:p-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl md:text-3xl font-bold flex-shrink-0">
          Manage Orders
        </h1>
        <div className="w-full sm:w-auto min-w-[250px]">
          <Select 
            value={selectedRestaurantId ?? undefined} // Handle null state for Select
            onValueChange={(value) => setSelectedRestaurantId(value || null)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select a Restaurant..." />
            </SelectTrigger>
            <SelectContent>
              {restaurants.map((restaurant) => (
                <SelectItem key={restaurant.id} value={restaurant.id}>
                  {restaurant.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      
      {/* Render OrderManager only if a restaurantId is selected */}
      {selectedRestaurantId ? (
        <>
          <h2 className="text-xl font-semibold">Orders for: {selectedRestaurant?.name || '...'}</h2>
          <OrderManager restaurantId={selectedRestaurantId} />
        </>
      ) : (
        <Alert className="mt-4">
           <Utensils className="h-4 w-4" />
           <AlertTitle>Select a Restaurant</AlertTitle>
           <AlertDescription>
             Please select a restaurant from the dropdown above to view its orders.
           </AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default RestaurantOrdersPage; 