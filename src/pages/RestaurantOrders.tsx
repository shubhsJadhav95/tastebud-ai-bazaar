import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthContext } from '@/contexts/AuthContext'; // Assuming you use this context
import NavBar from '@/components/NavBar';
import Footer from '@/components/Footer';
import { toast } from 'sonner';

const RestaurantOrders: React.FC = () => {
  const { user, profile, loading: authLoading } = useAuthContext();
  const navigate = useNavigate();

  // Basic auth check
  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      toast.error("Please log in.");
      navigate('/restaurant/login');
      return;
    }
    if (profile?.user_type !== 'restaurant') {
      toast.error('Access denied.');
      navigate('/customer/home'); // Or wherever non-restaurants should go
      return;
    }
  }, [user, profile, authLoading, navigate]);

  if (authLoading || !user || profile?.user_type !== 'restaurant') {
    // Render loading state or null while checking auth
    return (
      <div className="min-h-screen flex flex-col">
        <NavBar />
        <div className="flex-grow flex items-center justify-center"><p>Loading...</p></div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <NavBar />
      <div className="flex-grow container mx-auto py-8 px-4">
        <h1 className="text-3xl font-bold mb-6">Order Management</h1>
        <p>Restaurant orders will be displayed here.</p>
        {/* Add logic to fetch and display orders for the restaurant */}
      </div>
      <Footer />
    </div>
  );
};

export default RestaurantOrders; 