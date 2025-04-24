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
import { Loader2, Trash2 } from 'lucide-react'; // Import Loader2 and Trash2 icons
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"; // Import AlertDialog components

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
  const [isDeleting, setIsDeleting] = useState(false); // State for delete loading

  const isEditMode = !!restaurant;

  useEffect(() => {
    if (isEditMode && restaurant) {
      const { id, createdAt, updatedAt, name_lowercase, ...editableData } = restaurant;
      setFormData(editableData);
    } else {
      setFormData({ owner_id: user?.uid || undefined });
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
      const dataToSubmit = {
        owner_id: user.uid,
        name: formData.name.trim(),
        name_lowercase: formData.name.trim().toLowerCase(),
        cuisine: formData.cuisine?.trim() || '',
        address: formData.address?.trim() || '',
        contactNumber: formData.contactNumber?.trim() || '',
        logoUrl: formData.logoUrl?.trim() || '',
        coverImageUrl: formData.coverImageUrl?.trim() || '',
        price_range: formData.price_range || null,
        delivery_time: formData.delivery_time || null,
        phone: formData.phone || null,
        description: formData.description || null,
      };

      if (isEditMode && restaurant?.id) {
        await restaurantService.updateRestaurant(restaurant.id, dataToSubmit as Partial<Restaurant>); 
        toast.success(`Restaurant "${dataToSubmit.name}" updated successfully!`);
        savedRestaurant = { ...restaurant, ...(dataToSubmit as Partial<Restaurant>) }; 
      } else {
        savedRestaurant = await restaurantService.createRestaurant(dataToSubmit); 
        toast.success(`Restaurant "${savedRestaurant.name}" created successfully!`);
        navigate(`/dashboard/restaurants/${savedRestaurant.id}`);
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

  // --- Delete Handler ---
  const handleDelete = async () => {
    if (!isEditMode || !restaurant?.id) {
      toast.error("Cannot delete unsaved or invalid restaurant.");
      return;
    }

    setIsDeleting(true);
    try {
      await restaurantService.deleteRestaurant(restaurant.id);
      toast.success(`Restaurant "${restaurant.name}" deleted successfully.`);
      navigate('/dashboard/restaurants'); // Navigate back to list after deletion
    } catch (error: any) {
      console.error("Error deleting restaurant:", error);
      toast.error(error.message || "Failed to delete restaurant.");
    } finally {
      setIsDeleting(false);
    }
  };
  // --- End Delete Handler ---

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
              disabled={isSubmitting || isDeleting}
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
              disabled={isSubmitting || isDeleting}
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
              disabled={isSubmitting || isDeleting}
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
              disabled={isSubmitting || isDeleting}
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
              disabled={isSubmitting || isDeleting}
            />
            {formData.logoUrl && (
               <div className="mt-2">
                 <img 
                    src={formData.logoUrl} 
                    alt="Logo Preview" 
                    className="h-20 w-20 rounded-md object-contain border bg-gray-100"
                    onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                 />
               </div>
            )}
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
              disabled={isSubmitting || isDeleting}
            />
            {formData.coverImageUrl && (
               <div className="mt-2">
                 <img 
                   src={formData.coverImageUrl} 
                   alt="Cover Preview" 
                   className="h-32 w-full max-w-sm rounded-md object-cover border bg-gray-100"
                   onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                 />
               </div>
            )}
          </div>
        </CardContent>
        <CardFooter className="flex justify-between items-center border-t pt-4 gap-2">
          <Button type="submit" disabled={isSubmitting || isDeleting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              isEditMode ? 'Save Changes' : 'Create Restaurant'
            )}
          </Button>

          {isEditMode && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" type="button" disabled={isSubmitting || isDeleting}>
                  {isDeleting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Deleting...</> : <><Trash2 className="mr-2 h-4 w-4" /> Delete Restaurant</>}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete the
                    restaurant "{restaurant?.name}" and all associated data (including menus).
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDelete} disabled={isDeleting} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                    {isDeleting ? 'Deleting...' : 'Yes, delete restaurant'}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </CardFooter>
      </form>
    </Card>
  );
};

export default RestaurantForm; 