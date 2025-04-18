import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthContext } from '@/contexts/AuthContext';
import { useMyRestaurant } from '@/hooks/useRestaurants';
import NavBar from '@/components/NavBar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { Utensils, ListOrdered, Settings, Plus } from 'lucide-react';

const RestaurantDashboard: React.FC = () => {
  const { user, profile, loading: authLoading, error: authError } = useAuthContext();
  const { myRestaurant, loading: restaurantLoading, error: restaurantError } = useMyRestaurant();
  const navigate = useNavigate();

  // Authentication and authorization checks
  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      toast.error("Please log in to access the dashboard.");
      navigate('/restaurant/login');
      return;
    }

    if (profile?.user_type !== 'restaurant') {
      toast.error("Access denied. Only restaurant owners can access this page.");
      navigate('/customer/home');
      return;
    }
  }, [user, profile, authLoading, navigate]);

  // Error handling
  useEffect(() => {
    if (authError) {
      toast.error(authError.message || "Authentication error");
    }
    if (restaurantError) {
      toast.error(restaurantError || "Failed to load restaurant data");
    }
  }, [authError, restaurantError]);

  if (authLoading || restaurantLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <NavBar />
        <div className="flex-grow py-8 px-4">
          <div className="container mx-auto max-w-7xl">
            <header className="mb-8 space-y-2">
              <Skeleton className="h-8 w-64" />
              <Skeleton className="h-4 w-80" />
            </header>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <Card key={i}>
                  <CardContent className="p-6 space-y-4">
                    <Skeleton className="h-6 w-32" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-10 w-24" />
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!user || profile?.user_type !== 'restaurant') {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <NavBar />
      
      <div className="flex-grow py-8 px-4">
        <div className="container mx-auto max-w-7xl">
          <header className="mb-8">
            <h1 className="text-3xl font-bold">Restaurant Dashboard</h1>
            <p className="text-gray-600">
              Welcome back, {profile.full_name || user.email}
            </p>
          </header>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-2">
                <div className="flex items-center space-x-2">
                  <Utensils className="text-primary" size={20} />
                  <CardTitle>Restaurant Profile</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                {restaurantError ? (
                  <p className="text-red-600">Error loading profile</p>
                ) : myRestaurant ? (
                  <>
                    <p className="text-gray-700 mb-1">Name: {myRestaurant.name}</p>
                    <p className="text-gray-700">Cuisine: {myRestaurant.cuisine || 'Not specified'}</p>
                    <Button 
                      onClick={() => navigate('/restaurant/profile')} 
                      className="mt-4"
                      aria-label="Edit restaurant profile"
                    >
                      Edit Profile
                    </Button>
                  </>
                ) : (
                  <>
                    <p className="text-gray-700">No restaurant profile found.</p>
                    <Button 
                      onClick={() => navigate('/restaurant/profile')} 
                      className="mt-4"
                      aria-label="Create restaurant profile"
                    >
                      Create Profile
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>
            
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-2">
                <div className="flex items-center space-x-2">
                  <ListOrdered className="text-primary" size={20} />
                  <CardTitle>Menu Management</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 mb-4">Add, edit, or remove menu items.</p>
                <Button 
                  onClick={() => navigate('/restaurant/menu')} 
                  className="mt-auto"
                  disabled={!myRestaurant}
                  aria-label="Manage menu"
                >
                  <Plus className="mr-2" size={16} />
                  Manage Menu
                </Button>
              </CardContent>
            </Card>
            
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-2">
                <div className="flex items-center space-x-2">
                  <Settings className="text-primary" size={20} />
                  <CardTitle>Order Management</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 mb-4">View and manage incoming orders.</p>
                <Button 
                  onClick={() => navigate('/restaurant/orders')} 
                  className="mt-auto"
                  disabled={!myRestaurant}
                  aria-label="View orders"
                >
                  View Orders
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default RestaurantDashboard;