import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useRestaurants } from '@/hooks/useRestaurants';
import NavBar from '@/components/NavBar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

const RestaurantDashboard: React.FC = () => {
  const { user, profile, isAuthenticated, userType } = useAuth();
  const { myRestaurant, isLoading: isRestaurantLoading } = useRestaurants();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/restaurant/login');
      return;
    }

    if (userType !== 'restaurant') {
      navigate('/customer/home');
      return;
    }
  }, [isAuthenticated, userType, navigate]);

  if (!isAuthenticated || userType !== 'restaurant') {
    return null;
  }

  const handleEditProfile = () => {
    navigate('/restaurant/profile');
  };

  const handleManageMenu = () => {
    navigate('/restaurant/menu');
  };

  return (
    <div className="min-h-screen flex flex-col">
      <NavBar />
      
      <div className="flex-grow py-8 px-4">
        <div className="container mx-auto max-w-7xl">
          <header className="mb-8">
            <h1 className="text-3xl font-bold">Restaurant Dashboard</h1>
            <p className="text-gray-600">
              Welcome back, {profile?.full_name || user?.email}
            </p>
          </header>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="bg-white shadow-md rounded-lg overflow-hidden">
              <CardContent className="p-6">
                <h2 className="text-xl font-semibold mb-4">Restaurant Profile</h2>
                {isRestaurantLoading ? (
                  <p>Loading restaurant profile...</p>
                ) : myRestaurant ? (
                  <>
                    <p className="text-gray-700">Name: {myRestaurant.name}</p>
                    <p className="text-gray-700">Cuisine: {myRestaurant.cuisine || 'Not specified'}</p>
                    <Button onClick={handleEditProfile} className="mt-4">
                      Edit Profile
                    </Button>
                  </>
                ) : (
                  <>
                    <p className="text-gray-700">No restaurant profile found.</p>
                    <Button onClick={handleEditProfile} className="mt-4">
                      Create Profile
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>
            
            <Card className="bg-white shadow-md rounded-lg overflow-hidden">
              <CardContent className="p-6">
                <h2 className="text-xl font-semibold mb-4">Menu Management</h2>
                <p className="text-gray-700">Manage your restaurant's menu items.</p>
                <Button onClick={handleManageMenu} className="mt-4">
                  Manage Menu
                </Button>
              </CardContent>
            </Card>
            
            <Card className="bg-white shadow-md rounded-lg overflow-hidden">
              <CardContent className="p-6">
                <h2 className="text-xl font-semibold mb-4">Order Management</h2>
                <p className="text-gray-700">View and manage incoming orders.</p>
                <Button onClick={() => navigate('/restaurant/orders')} className="mt-4">
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
