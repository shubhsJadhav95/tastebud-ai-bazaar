import React from 'react';
import { useNavigate } from 'react-router-dom';
import RestaurantForm from '@/components/forms/RestaurantForm';
import { Restaurant } from '@/types';
import { toast } from 'sonner';

const RestaurantCreatePage: React.FC = () => {
  const navigate = useNavigate();

  // Callback function for when the form successfully saves a new restaurant
  const handleSaveSuccess = (savedRestaurant: Restaurant) => {
    toast.success(`Restaurant "${savedRestaurant.name}" created!`);
    // Navigate to the manage page for the newly created restaurant
    navigate(`/dashboard/restaurants/${savedRestaurant.id}`);
  };

  return (
    <div className="container mx-auto p-4 md:p-6">
      {/* You can add a header or breadcrumbs here if desired */}
      {/* <h1 className="text-2xl md:text-3xl font-bold mb-6">Create New Restaurant</h1> */}
      
      <RestaurantForm 
        onSave={handleSaveSuccess} 
        // No 'restaurant' prop is passed, so the form knows it's in create mode
      />
    </div>
  );
};

export default RestaurantCreatePage; 