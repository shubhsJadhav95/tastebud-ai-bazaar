import React, { useState, useEffect, ChangeEvent } from 'react';
import { Restaurant, NewRestaurantData } from '@/types'; // Adjust path if needed
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { toast } from 'sonner';
import { restaurantService } from '@/services/restaurantService'; // Adjust path if needed
import { useAuthContext } from '@/contexts/AuthContext'; // Need owner_id
import { useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react'; // Import Loader2 icon

interface RestaurantFormProps {
  restaurant?: Restaurant | null; // Optional: For edit mode
  onSave?: (savedRestaurant: Restaurant) => void; // Optional callback after save
}

// Define the shape of the form data, including owner_id potentially
type RestaurantFormData = Partial<Omit<Restaurant, 'id' | 'createdAt' | 'updatedAt' | 'name_lowercase'> & { owner_id?: string }>;

const RestaurantForm: React.FC<RestaurantFormProps> = ({ restaurant, onSave }) => {
  const { user } = useAuthContext();
  const navigate = useNavigate();
  const [formData, setFormData] = useState<RestaurantFormData>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isEditMode = !!restaurant;

  useEffect(() => {
    // Pre-fill form if in edit mode
    if (isEditMode && restaurant) {
      // Ensure we only pick fields relevant to the form
      const { id, createdAt, updatedAt, name_lowercase, ...editableData } = restaurant;
      setFormData(editableData);
    } else {
      // Reset form for create mode
      setFormData({ owner_id: user?.uid }); // Set owner_id if creating
    }
  }, [restaurant, isEditMode, user]);

  const handleInputChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
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
      let savedRestaurant: Restaurant;
      const dataToSubmit: Omit<Restaurant, 'id' | 'createdAt' | 'updatedAt'> = {
        owner_id: user.uid,
        name: formData.name.trim(),
        name_lowercase: formData.name.trim().toLowerCase(),
        cuisine: formData.cuisine?.trim() || '',
        address: formData.address?.trim() || '',
        contactNumber: formData.contactNumber?.trim() || '',
        logoUrl: formData.logoUrl?.trim() || '',
        coverImageUrl: formData.coverImageUrl?.trim() || '',
        // Include other fields from your Restaurant type if they should be saved
        // Ensure required fields have defaults or are handled
      };

      if (isEditMode && restaurant?.id) {
        await restaurantService.updateRestaurant(restaurant.id, dataToSubmit);
        toast.success(`Restaurant "${dataToSubmit.name}" updated successfully!`);
        // Construct the updated restaurant object for the callback
        savedRestaurant = { ...restaurant, ...dataToSubmit }; 
      } else {
        // Create new restaurant
        savedRestaurant = await restaurantService.createRestaurant(dataToSubmit);
        toast.success(`Restaurant "${savedRestaurant.name}" created successfully!`);
        // Optionally navigate after creation, e.g., to the new restaurant's manage page
        // navigate(`/dashboard/restaurants/${savedRestaurant.id}`);
      }

      if (onSave) {
        onSave(savedRestaurant);
      }
    } catch (error: any) {
      console.error('Error saving restaurant:', error);
      toast.error(error.message || "An error occurred while saving.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{isEditMode ? 'Edit Restaurant' : 'Create New Restaurant'}</CardTitle>
        <CardDescription>
          {isEditMode ? 'Update the details for your restaurant.' : 'Fill in the details for your new restaurant.'}
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="name">Restaurant Name *</Label>
            <Input
              id="name"
              name="name"
              value={formData.name || ''}
              onChange={handleInputChange}
              placeholder="e.g., The Delicious Place"
              required
            />
          </div>
          <div>
            <Label htmlFor="cuisine">Cuisine Type</Label>
            <Input
              id="cuisine"
              name="cuisine"
              value={formData.cuisine || ''}
              onChange={handleInputChange}
              placeholder="e.g., Italian, Mexican, Cafe"
            />
          </div>
          <div>
            <Label htmlFor="address">Address</Label>
            <Textarea
              id="address"
              name="address"
              value={formData.address || ''}
              onChange={handleInputChange}
              placeholder="123 Main St, Anytown, USA"
            />
          </div>
          <div>
            <Label htmlFor="contactNumber">Contact Number</Label>
            <Input
              id="contactNumber"
              name="contactNumber"
              value={formData.contactNumber || ''}
              onChange={handleInputChange}
              placeholder="+1 (555) 123-4567"
            />
          </div>
          <div>
            <Label htmlFor="logoUrl">Logo Image URL</Label>
            <Input
              id="logoUrl"
              name="logoUrl"
              type="url"
              value={formData.logoUrl || ''}
              onChange={handleInputChange}
              placeholder="https://yourdomain.com/logo.png"
            />
          </div>
          <div>
            <Label htmlFor="coverImageUrl">Cover Image URL</Label>
            <Input
              id="coverImageUrl"
              name="coverImageUrl"
              type="url"
              value={formData.coverImageUrl || ''}
              onChange={handleInputChange}
              placeholder="https://yourdomain.com/cover.jpg"
            />
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              isEditMode ? 'Save Changes' : 'Create Restaurant'
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};

export default RestaurantForm; 