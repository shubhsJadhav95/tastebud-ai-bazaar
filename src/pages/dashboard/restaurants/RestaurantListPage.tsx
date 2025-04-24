import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom'; // For navigation
import { restaurantService } from '@/services/restaurantService'; // Adjust path if needed
import { Restaurant } from '@/types'; // Adjust path if needed
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton'; // For loading state
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"; // Import Alert components
import { AlertCircle, Plus, Edit, Utensils, Building } from 'lucide-react';
import { toast } from 'sonner';
import { useAuthContext } from '@/contexts/AuthContext'; // Import auth context
import { useRestaurantsByOwner } from '@/hooks/useRestaurantsByOwner'; // Import the hook

const RestaurantListPage: React.FC = () => {
  // Use the hook to fetch restaurants for the current owner
  const { restaurants, isLoading: restaurantsLoading, error: restaurantsError } = useRestaurantsByOwner();
  const { user, loading: authLoading } = useAuthContext(); // Get auth state
  const navigate = useNavigate();

  // --- Authorization Check --- 
  // Redirect if user is not logged in after auth check is complete
  useEffect(() => {
    if (!authLoading && !user) {
      toast.error("Please log in to view your restaurants.");
      navigate('/restaurant/login');
    }
    // Optional: Add check for user_type === 'restaurant' if needed, though hook might handle implicitly
  }, [user, authLoading, navigate]);

  // --- Combined Loading State --- 
  const isLoading = authLoading || restaurantsLoading;

  // --- List Rendering Logic --- 
  const renderRestaurantList = () => {
    // Show skeleton while loading auth or restaurants
    if (isLoading) {
      return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="flex flex-col">
              <CardHeader>
                <Skeleton className="h-6 w-3/4 rounded" />
                <Skeleton className="h-16 w-16 mt-2 rounded" />
              </CardHeader>
              <CardContent className="flex-grow space-y-2">
                <Skeleton className="h-4 w-1/2 rounded" />
                <Skeleton className="h-4 w-full rounded" />
              </CardContent>
              <CardFooter className="flex justify-end gap-2 border-t pt-4 mt-auto">
                <Skeleton className="h-9 w-24 rounded-md" />
              </CardFooter>
            </Card>
          ))}
        </div>
      );
    }

    // Show error message if fetching restaurants failed
    if (restaurantsError) {
      return (
        <Alert variant="destructive" className="mt-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error Loading Restaurants</AlertTitle>
          <AlertDescription>
            {restaurantsError} - Please try refreshing the page.
          </AlertDescription>
        </Alert>
      );
    }

    // Show message if user is logged in but has no restaurants
    if (!isLoading && restaurants.length === 0) {
      return (
        <Alert className="mt-4">
          <Building className="h-4 w-4" /> {/* Use Building icon */}
          <AlertTitle>No Restaurants Found</AlertTitle>
          <AlertDescription>
            You haven't added any restaurants yet. Click the "Add New Restaurant" button to create your first one.
          </AlertDescription>
        </Alert>
      );
    }

    // Render the actual list of restaurants
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {restaurants.map((restaurant) => (
          <Card key={restaurant.id} className="flex flex-col hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle className="truncate" title={restaurant.name}>{restaurant.name}</CardTitle>
              {/* Display logo */}
               {(restaurant.logoUrl || restaurant.logo_url) ? ( // Check both fields
                 <img
                   src={restaurant.logoUrl || restaurant.logo_url} // Use the one that exists
                   alt={`${restaurant.name} logo`}
                   className="h-16 w-16 object-contain rounded mt-2 bg-gray-100"
                   onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                 />
               ) : (
                 <div className="h-16 w-16 flex items-center justify-center bg-gray-100 rounded mt-2 text-gray-400">
                   <Utensils size={24} />
                 </div>
               )}
            </CardHeader>
            <CardContent className="flex-grow">
              <p className="text-sm text-gray-600 mb-1">
                {restaurant.cuisine || 'Cuisine not specified'}
              </p>
              <p className="text-sm text-gray-600 truncate" title={restaurant.address || ''}>
                {restaurant.address || 'Address not specified'}
              </p>
            </CardContent>
            <CardFooter className="flex justify-end gap-2 border-t pt-4 mt-auto">
              {/* Button to go to the manage page (which includes menu) */}
              <Button
                variant="default"
                size="sm"
                onClick={() => navigate(`/dashboard/restaurants/${restaurant.id}`)}
                 aria-label={`Manage ${restaurant.name}`}
             >
                <Edit className="mr-1 h-4 w-4" /> Manage
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    );
  };

  // Navigate to the dedicated create page
  const handleAddNew = () => {
     navigate('/dashboard/restaurants/new');
  };

  // --- Main Render --- 
  // Render based on auth state first
  if (authLoading) {
     // You might want a specific loading indicator while checking auth
     return (
        <div className="container mx-auto p-4 md:p-6 space-y-6">
           <div className="flex justify-between items-center">
             <Skeleton className="h-9 w-1/3 rounded-md" />
             <Skeleton className="h-10 w-48 rounded-md" />
           </div>
           {/* Reuse the list skeleton */}
           {renderRestaurantList()} 
        </div>
     );
  }

  // If not loading and no user (should be caught by useEffect redirect, but belt-and-suspenders)
  if (!user) {
      return (
         <div className="container mx-auto p-4 md:p-6">
           <Alert variant="destructive">
             <AlertCircle className="h-4 w-4" />
             <AlertTitle>Not Authenticated</AlertTitle>
             <AlertDescription>
               Please <Link to="/restaurant/login" className="underline">log in</Link> to manage your restaurants.
             </AlertDescription>
           </Alert>
         </div>
      );
  }

  // If authenticated, render the main content with the list renderer
  return (
    <div className="container mx-auto p-4 md:p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl md:text-3xl font-bold">Your Restaurants</h1>
        <Button onClick={handleAddNew}>
          <Plus className="mr-2 h-4 w-4" /> Add New Restaurant
        </Button>
      </div>
      {renderRestaurantList()} 
    </div>
  );
};

export default RestaurantListPage; 