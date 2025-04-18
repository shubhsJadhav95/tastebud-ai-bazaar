import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom'; // Added useNavigate
import { restaurantService } from '@/services/restaurantService'; // Corrected path alias if needed
import { Restaurant } from '@/types'; // Adjust path if needed
import MenuManager from '@/components/dashboard/MenuManager'; // Using correct alias path
import RestaurantForm from '@/components/forms/RestaurantForm'; // Import the form
import { toast } from 'sonner'; // Import toast for feedback
import { useAuthContext } from '@/contexts/AuthContext'; // Import AuthContext hook
import { AlertCircle } from 'lucide-react'; // For error display
// Import loading/error display components if you have them
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from '@/components/ui/button'; // For potential back button

const RestaurantManagePage: React.FC = () => {
  const { restaurantId } = useParams<{ restaurantId: string }>();
  const { user, loading: authLoading } = useAuthContext(); // Get user and auth loading state
  const navigate = useNavigate(); // Hook for navigation

  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null); // Track authorization status

  const fetchRestaurant = useCallback(async () => {
    if (!restaurantId) {
      setError('Restaurant ID is missing from URL.');
      setLoading(false);
      setIsAuthorized(false); // Cannot be authorized without ID
      return;
    }
    setLoading(true);
    setError(null);
    setIsAuthorized(null); // Reset authorization check
    try {
      const fetchedRestaurant = await restaurantService.getRestaurant(restaurantId);
      if (fetchedRestaurant) {
        setRestaurant(fetchedRestaurant);
        // Authorization check happens after data is fetched
      } else {
        setError('Restaurant not found.');
        toast.error('Restaurant not found.');
        setIsAuthorized(false); // Not found, not authorized
      }
    } catch (err) {
      console.error('Error fetching restaurant:', err);
      const message = err instanceof Error ? err.message : 'Failed to load restaurant data.';
      setError(message);
      toast.error(message);
      setIsAuthorized(false); // Error, assume not authorized
    } finally {
      setLoading(false);
    }
  }, [restaurantId]);

  useEffect(() => {
    fetchRestaurant();
  }, [fetchRestaurant]);

  // Perform authorization check after restaurant data and auth state are loaded
  useEffect(() => {
    if (!authLoading && !loading && restaurant && user) {
      if (restaurant.owner_id === user.uid) {
        setIsAuthorized(true);
      } else {
        setError('You are not authorized to manage this restaurant.');
        toast.error('Unauthorized access.');
        setIsAuthorized(false);
        // Optional: Redirect unauthorized users
        // navigate('/dashboard/restaurants'); // Or to their own dashboard
      }
    } else if (!authLoading && !loading && !user) {
        // If user is not logged in after loading
        setError('Please log in to manage restaurants.');
        setIsAuthorized(false);
        // navigate('/restaurant/login');
    }
    // Do nothing if still loading or no restaurant data

  }, [authLoading, loading, user, restaurant, navigate]);

  // Document Title Effect (Moved BEFORE conditional returns)
  useEffect(() => {
    if (restaurant?.name) {
      document.title = `Manage: ${restaurant.name}`;
    } else {
      // Optional: Set a default title if restaurant name isn't available yet
      document.title = 'Manage Restaurant';
    }
    // Cleanup function to reset title (optional)
    // return () => { document.title = 'Your App Name'; };
  }, [restaurant?.name]);

  // Callback for the form to update the local state after a successful save
  const handleRestaurantSave = (savedRestaurant: Restaurant) => {
    setRestaurant(savedRestaurant);
    // No need to set title here anymore, the useEffect above handles it
  };

  // Loading State using Skeleton
  if (authLoading || loading || isAuthorized === null) {
    return (
      <div className="container mx-auto p-4 md:p-6 space-y-8">
        {/* Skeleton for header */}
        <Skeleton className="h-9 w-1/2 rounded-md" />
        {/* Skeleton for RestaurantForm Card */}
        <div className="border rounded-lg p-6 space-y-4">
          <Skeleton className="h-6 w-1/4 rounded-md" />
          <Skeleton className="h-4 w-1/3 rounded-md mb-4" />
          <div className="space-y-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-4 w-1/4 rounded-md" />
                <Skeleton className="h-10 w-full rounded-md" />
              </div>
            ))}
          </div>
          <div className="flex justify-end pt-4">
             <Skeleton className="h-10 w-28 rounded-md" />
          </div>
        </div>
        {/* Skeleton for MenuManager Card */}
         <div className="border rounded-lg p-6 space-y-4">
            <div className="flex justify-between items-center">
                <Skeleton className="h-6 w-1/3 rounded-md" />
                <Skeleton className="h-10 w-36 rounded-md" />
            </div>
            <Skeleton className="h-40 w-full rounded-md" /> {/* Placeholder for table/content */}
         </div>
      </div>
    );
  }

  // Error/Unauthorized State using Alert
  if (error || !isAuthorized) {
    return (
      <div className="container mx-auto p-4 md:p-6">
        <Alert variant="destructive">
           <AlertCircle className="h-4 w-4" />
           <AlertTitle>Access Denied</AlertTitle>
           <AlertDescription>
            {error || 'An unknown error occurred while trying to load the restaurant data.'}
            {/* Suggest login if that was the issue */}
            {!user && error?.includes('log in') && 
              <Button variant="link" className="p-0 h-auto ml-1" onClick={() => navigate('/restaurant/login')}>
                Log In
              </Button> 
            }
           </AlertDescription>
        </Alert>
      </div>
    );
  }

  // Fallback if authorized but data is missing (should be rare)
  if (!restaurant || !restaurantId) {
    return (
      <div className="container mx-auto p-4 md:p-6">
         <Alert variant="default">
           <AlertCircle className="h-4 w-4" />
           <AlertTitle>Data Unavailable</AlertTitle>
           <AlertDescription>
             Restaurant data could not be loaded, or the ID is invalid. Please try again later or contact support.
           </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 md:p-6 space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl md:text-3xl font-bold">Manage: {restaurant.name}</h1>
        <Button variant="outline" onClick={() => navigate('/dashboard/restaurants')}>Back to List</Button>
      </div>

      <RestaurantForm
        restaurant={restaurant}
        onSave={handleRestaurantSave}
      />

      <MenuManager restaurantId={restaurantId} />
    </div>
  );
};

export default RestaurantManagePage; 