import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom'; // For navigation
import { restaurantService } from '@/services/restaurantService'; // Adjust path if needed
import { Restaurant } from '@/types'; // Adjust path if needed
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton'; // For loading state
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"; // Import Alert components
import { AlertCircle, Plus, Edit, Utensils } from 'lucide-react';
import { toast } from 'sonner';

const RestaurantListPage: React.FC = () => {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchRestaurants = async () => {
      setLoading(true);
      setError(null);
      try {
        // Assuming getRestaurants fetches all needed - adjust if pagination/filtering is needed
        const fetchedRestaurants = await restaurantService.getRestaurants();
        setRestaurants(fetchedRestaurants);
      } catch (err: any) {
        console.error("Error fetching restaurants:", err);
        const message = `Failed to load restaurants: ${err.message || 'Unknown error'}`;
        setError(message);
        toast.error(message);
      } finally {
        setLoading(false);
      }
    };

    fetchRestaurants();
  }, []); // Empty dependency array means fetch only once on mount

  const renderRestaurantList = () => {
    if (loading) {
      // Improved skeleton loading state
      return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => ( // Show more skeletons for better visual
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

    if (error) {
      // Use Alert component for error display
      return (
        <Alert variant="destructive" className="mt-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error Loading Restaurants</AlertTitle>
          <AlertDescription>
            {error}
          </AlertDescription>
          {/* Optional: Add a retry button? */}
          {/* <Button variant="outline" size="sm" className="mt-2">Retry</Button> */}
        </Alert>
      );
    }

    if (restaurants.length === 0) {
       // Use Alert component for empty state (optional, can keep plain text)
      return (
        <Alert className="mt-4">
          <Utensils className="h-4 w-4" />
          <AlertTitle>No Restaurants Yet</AlertTitle>
          <AlertDescription>
            Click the "Add New Restaurant" button to create your first one.
          </AlertDescription>
        </Alert>
      );
    }

    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {restaurants.map((restaurant) => (
          <Card key={restaurant.id} className="flex flex-col hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle className="truncate" title={restaurant.name}>{restaurant.name}</CardTitle>
              {/* Display logo */}
               {restaurant.logoUrl ? (
                 <img 
                   src={restaurant.logoUrl} 
                   alt={`${restaurant.name} logo`} 
                   className="h-16 w-16 object-contain rounded mt-2 bg-gray-100" // Added bg for placeholder effect
                   onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} // Hide if error
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