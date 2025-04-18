
import React, { useState, useEffect, ChangeEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useRestaurants } from '@/hooks/useRestaurants';
import { toast } from 'sonner';
import NavBar from '@/components/NavBar';
import Footer from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import ProfileInput from '@/components/ProfileInput';
import {
  Store,
  MapPin,
  Phone,
  Clock,
  Utensils,
  DollarSign,
  Image,
  Camera,
  Save
} from 'lucide-react';

const RestaurantProfile: React.FC = () => {
  const { user, isAuthenticated, userType } = useAuth();
  const { myRestaurant, fetchMyRestaurant, saveRestaurant } = useRestaurants();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    cuisine: '',
    address: '',
    phone: '',
    delivery_time: '',
    price_range: '',
    image_url: '',
    logo_url: '',
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Check if user is authenticated and is a restaurant
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/restaurant/login');
      return;
    }
    
    if (userType !== 'restaurant') {
      navigate('/customer/home');
      toast.error('Only restaurant owners can access this page');
      return;
    }
    
    fetchMyRestaurant();
  }, [isAuthenticated, userType, navigate]);
  
  // Update form data when restaurant data is fetched
  useEffect(() => {
    if (myRestaurant) {
      setFormData({
        name: myRestaurant.name || '',
        description: myRestaurant.description || '',
        cuisine: myRestaurant.cuisine || '',
        address: myRestaurant.address || '',
        phone: myRestaurant.phone || '',
        delivery_time: myRestaurant.delivery_time || '',
        price_range: myRestaurant.price_range || '',
        image_url: myRestaurant.image_url || '',
        logo_url: myRestaurant.logo_url || '',
      });
    }
  }, [myRestaurant]);
  
  const handleInputChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      await saveRestaurant({
        name: formData.name,
        description: formData.description,
        cuisine: formData.cuisine,
        address: formData.address,
        phone: formData.phone,
        delivery_time: formData.delivery_time,
        price_range: formData.price_range,
        image_url: formData.image_url,
        logo_url: formData.logo_url,
      });
      
      toast.success('Restaurant profile updated successfully');
    } catch (error) {
      console.error('Error saving restaurant profile:', error);
      toast.error('Failed to update restaurant profile');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="min-h-screen flex flex-col">
      <NavBar />
      
      <div className="flex-grow py-8">
        <div className="container max-w-4xl mx-auto px-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl font-bold">Restaurant Profile</CardTitle>
            </CardHeader>
            
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Basic Information</h3>
                  
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <Label htmlFor="name">Restaurant Name *</Label>
                      <ProfileInput
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        placeholder="Restaurant Name"
                        icon={<Store size={18} />}
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="cuisine">Cuisine Type</Label>
                      <ProfileInput
                        id="cuisine"
                        name="cuisine"
                        value={formData.cuisine}
                        onChange={handleInputChange}
                        placeholder="Italian, Indian, etc."
                        icon={<Utensils size={18} />}
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      name="description"
                      value={formData.description || ''}
                      onChange={handleInputChange}
                      placeholder="Describe your restaurant"
                      className="h-24"
                    />
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Contact & Location</h3>
                  
                  <div>
                    <Label htmlFor="address">Address</Label>
                    <ProfileInput
                      id="address"
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      placeholder="Full Address"
                      icon={<MapPin size={18} />}
                    />
                  </div>
                  
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <Label htmlFor="phone">Phone Number</Label>
                      <ProfileInput
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        placeholder="Contact Number"
                        icon={<Phone size={18} />}
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="delivery_time">Delivery Time</Label>
                      <ProfileInput
                        id="delivery_time"
                        name="delivery_time"
                        value={formData.delivery_time}
                        onChange={handleInputChange}
                        placeholder="25-35 min"
                        icon={<Clock size={18} />}
                      />
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Other Details</h3>
                  
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <Label htmlFor="price_range">Price Range</Label>
                      <ProfileInput
                        id="price_range"
                        name="price_range"
                        value={formData.price_range}
                        onChange={handleInputChange}
                        placeholder="$, $$, $$$"
                        icon={<DollarSign size={18} />}
                      />
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Images</h3>
                  
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <Label htmlFor="logo_url">Logo URL</Label>
                      <ProfileInput
                        id="logo_url"
                        name="logo_url"
                        value={formData.logo_url}
                        onChange={handleInputChange}
                        placeholder="URL for your restaurant logo"
                        icon={<Image size={18} />}
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="image_url">Cover Image URL</Label>
                      <ProfileInput
                        id="image_url"
                        name="image_url"
                        value={formData.image_url}
                        onChange={handleInputChange}
                        placeholder="URL for restaurant cover image"
                        icon={<Camera size={18} />}
                      />
                    </div>
                  </div>
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full"
                  disabled={isSubmitting || !formData.name}
                >
                  {isSubmitting ? 'Saving...' : 'Save Profile'}
                  {!isSubmitting && <Save size={16} className="ml-2" />}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default RestaurantProfile;
