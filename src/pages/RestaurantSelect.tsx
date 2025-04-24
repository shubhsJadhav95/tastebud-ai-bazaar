import * as React from 'react';
import { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthContext } from '@/contexts/AuthContext';
import { useRestaurantsByOwner } from '@/hooks/useRestaurantsByOwner';
import NavBar from '@/components/NavBar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, Utensils, Building, Users } from 'lucide-react';
import { toast } from 'sonner';

const RestaurantSelect: React.FC = () => {
  const { user, loading: authLoading } = useAuthContext();
  const { restaurants, isLoading: restaurantsLoading, error } = useRestaurantsByOwner();
  const navigate = useNavigate();

  // Redirect if not logged in
  useEffect(() => {
    if (!authLoading && !user) {
      toast.error("Please log in.");
      navigate('/restaurant/login');
    }
    // Assuming user_type check happens elsewhere or is implied by accessing this page
  }, [user, authLoading, navigate]);

  const handleSelectRestaurant = (restaurantId: string) => {
    // Navigate to the specific dashboard, passing the ID
    // Using /dashboard/restaurants/:id as the target seems more consistent
    // with the other dashboard routes we created.
    navigate(`/dashboard/restaurants/${restaurantId}`); 
    // If you strictly need /restaurant/dashboard/:id, change the line above
  };

  const renderSkeleton = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {[...Array(3)].map((_, i) => (
        <Card key={i}>
          <Skeleton className="h-32 w-full rounded-t-lg" />
          <CardContent className="p-4 space-y-2">
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-10 w-full mt-4" />
          </CardContent>
        </Card>
      ))}
    </div>
  );

  const isLoading = authLoading || restaurantsLoading;

  return (
    <div className="min-h-screen flex flex-col">
      <NavBar />
      <div className="flex-grow container mx-auto py-8 px-4">
        <header className="mb-8 text-center">
          <h1 className="text-3xl font-bold">Select Your Restaurant</h1>
          <p className="text-gray-600 mb-4">Choose which restaurant you want to manage.</p>
          <Link to="/dashboard/ngos">
            <Button variant="secondary">
                <Users size={16} className="mr-2"/> Manage Partner NGOs
            </Button>
          </Link>
        </header>

        {isLoading ? (
          renderSkeleton()
        ) : error ? (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error Loading Restaurants</AlertTitle>
            <AlertDescription>{error} - Please try refreshing.</AlertDescription>
          </Alert>
        ) : restaurants.length === 0 ? (
          <Alert>
            <Building className="h-4 w-4" />
            <AlertTitle>No Restaurants Found</AlertTitle>
            <AlertDescription>
              You haven't added any restaurants yet.
              <Button variant="link" className="p-0 h-auto ml-1" onClick={() => navigate('/dashboard/restaurants/new')}>
                Add Your First Restaurant
              </Button>
            </AlertDescription>
          </Alert>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {restaurants.map(restaurant => (
              <Card key={restaurant.id} className="overflow-hidden flex flex-col">
                <img
                  src={restaurant.coverImageUrl || restaurant.image_url || '/placeholder.svg'}
                  alt={restaurant.name}
                  className="h-40 w-full object-cover"
                  onError={(e) => { (e.target as HTMLImageElement).src = '/placeholder.svg'; }}
                />
                <CardHeader className="pb-2">
                  <CardTitle>{restaurant.name}</CardTitle>
                </CardHeader>
                <CardContent className="flex-grow flex flex-col justify-between">
                  <p className="text-sm text-gray-600 mb-3">
                    {restaurant.cuisine || 'Cuisine not specified'}
                  </p>
                  <Button 
                    onClick={() => handleSelectRestaurant(restaurant.id)}
                    className="w-full mt-auto"
                  >
                    Manage This Restaurant
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default RestaurantSelect; 