import React, { useState, useEffect, ChangeEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthContext } from '@/contexts/AuthContext';
import { useMyRestaurant } from '@/hooks/useRestaurants';
import { Restaurant, NewRestaurantData } from '@/types';
import { restaurantService } from '@/services/restaurantService';
import { toast } from 'sonner';
import NavBar from '@/components/NavBar';
import Footer from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
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
  Save,
  IndianRupee
} from 'lucide-react';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';

const RestaurantProfile: React.FC = () => {
  const { user, profile, loading: authLoading, error: authError } = useAuthContext();
  const { myRestaurant, isLoading: restaurantLoading, error: restaurantError } = useMyRestaurant();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState<Partial<NewRestaurantData>>({
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
  
  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      toast.error("Please log in.");
      navigate('/restaurant/login');
      return;
    }
    if (!profile) return; 
    if (profile.user_type !== 'restaurant') {
      toast.error('Only restaurant owners can access this page');
      navigate('/customer/home');
      return;
    }
  }, [user, profile, authLoading, navigate]);
  
  useEffect(() => {
    if (authError) toast.error(`Auth Error: ${authError}`);
    if (restaurantError) toast.error(`Restaurant Error: ${restaurantError}`);
  }, [authError, restaurantError]);
  
  const handleInputChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value || null }));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user?.uid) {
      toast.error("Authentication error. Please log in again.");
      return;
    }
    if (!formData.name?.trim()) {
        toast.error("Restaurant name is required.");
        return;
    }
    
    setIsSubmitting(true);
    try {
        const dataToSave: NewRestaurantData = {
            owner_id: user.uid,
            name: formData.name.trim(),
            description: formData.description?.trim() || null,
            cuisine: formData.cuisine?.trim() || null,
            address: formData.address?.trim() || null,
            phone: formData.phone?.trim() || null,
            delivery_time: formData.delivery_time?.trim() || null,
            price_range: formData.price_range?.trim() || null,
            image_url: formData.image_url?.trim() || null,
            logo_url: formData.logo_url?.trim() || null,
        };
        const docRef = await restaurantService.addRestaurant(dataToSave);
        toast.success(`Restaurant "${dataToSave.name}" profile created successfully!`);
    } catch (error: any) {
        console.error('Error saving restaurant profile:', error);
        toast.error(error.message || "An error occurred while saving the profile.");
    } finally {
        setIsSubmitting(false);
    }
  };
  
  if (authLoading || restaurantLoading) {
      return (
        <div className="min-h-screen flex flex-col">
          <NavBar />
          <div className="flex-grow flex items-center justify-center"><p>Loading Profile...</p></div>
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
      
      <div className="flex-grow py-8">
        <div className="container max-w-4xl mx-auto px-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl font-bold">
                {myRestaurant ? 'Edit Restaurant Profile' : 'Create Restaurant Profile'}
              </CardTitle>
            </CardHeader>
            
            <CardContent>
              {!restaurantLoading && restaurantError && (
                 <div className="mb-4 p-4 bg-red-100 text-red-700 border border-red-300 rounded">
                    Error loading restaurant data: {restaurantError}
                 </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Basic Information</h3>
                  
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <Label htmlFor="name">Restaurant Name *</Label>
                      <ProfileInput
                        id="name"
                        name="name"
                        value={formData.name ?? ''}
                        onChange={handleInputChange}
                        placeholder="Your Restaurant Name"
                        icon={<Store size={18} />}
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="cuisine">Cuisine Type</Label>
                      <ProfileInput
                        id="cuisine"
                        name="cuisine"
                        value={formData.cuisine ?? ''}
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
                      value={formData.description ?? ''}
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
                      value={formData.address ?? ''}
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
                        value={formData.phone ?? ''}
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
                        value={formData.delivery_time ?? ''}
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
                        value={formData.price_range ?? ''}
                        onChange={handleInputChange}
                        placeholder="₹, ₹₹, ₹₹₹"
                        icon={<IndianRupee size={18} />}
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
                        value={formData.logo_url ?? ''}
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
                        value={formData.image_url ?? ''}
                        onChange={handleInputChange}
                        placeholder="URL for restaurant cover image"
                        icon={<Image size={18} />}
                      />
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-end pt-4">
                  <Button type="submit" disabled={isSubmitting || authLoading || restaurantLoading}>
                    <Save className="mr-2" size={16} />
                    {isSubmitting ? 'Saving...' : 'Save Profile'}
                  </Button>
                </div>
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
