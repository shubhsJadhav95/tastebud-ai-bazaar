import React, { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import { MenuItem } from '@/types'; // Adjust path if needed
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Switch } from "@/components/ui/switch";
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react'; // Import Loader2 icon

// Explicitly define the form data shape
type MenuItemFormData = {
  name?: string;
  description?: string | null;
  price?: number | string; // Allow string for input
  category?: string | null;
  image_url?: string | null;
  is_available?: boolean;
};

interface MenuItemFormProps {
  menuItem?: MenuItem | null; // For pre-filling in edit mode
  onSubmit: (formData: MenuItemFormData) => Promise<void>; // Async submit handler
  onCancel: () => void; // Function to call when cancelling
  isSubmitting: boolean; // Indicate if submission is in progress
}

const MenuItemForm: React.FC<MenuItemFormProps> = ({ menuItem, onSubmit, onCancel, isSubmitting }) => {
  const [formData, setFormData] = useState<MenuItemFormData>({});
  const isEditMode = !!menuItem;

  useEffect(() => {
    if (isEditMode && menuItem) {
      setFormData({
        name: menuItem.name,
        description: menuItem.description,
        price: String(menuItem.price),
        category: menuItem.category,
        image_url: menuItem.image_url,
        is_available: menuItem.is_available ?? true,
      });
    } else {
      setFormData({
        name: '',
        description: '',
        price: '',
        category: '',
        image_url: '',
        is_available: true,
      });
    }
  }, [menuItem, isEditMode]);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handlePriceChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    // Allow empty string, numbers, and decimals
    if (value === '' || /^[0-9]*\.?\d*$/.test(value)) {
      setFormData(prev => ({ ...prev, price: value }));
    }
  };

  const handleSwitchChange = (checked: boolean) => {
    setFormData(prev => ({ ...prev, is_available: checked }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const priceAsNumber = parseFloat(String(formData.price));
    if (isNaN(priceAsNumber) || priceAsNumber < 0) {
        toast.error("Please enter a valid positive price.");
        return;
    }

    // Prepare final data for submission, using URL from form
    const finalFormData: MenuItemFormData = {
      ...formData,
      price: priceAsNumber,
    };

    await onSubmit(finalFormData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="name">Name *</Label>
        <Input
          id="name"
          name="name"
          value={formData.name || ''}
          onChange={handleInputChange}
          placeholder="e.g., Margherita Pizza"
          required
          disabled={isSubmitting}
        />
      </div>
      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          name="description"
          value={formData.description || ''}
          onChange={handleInputChange}
          placeholder="Classic tomato sauce, mozzarella, basil"
          disabled={isSubmitting}
        />
      </div>
      <div>
        <Label htmlFor="price">Price *</Label>
        <Input
          id="price"
          name="price"
          type="text" // Use text to allow decimal input easily
          inputMode="decimal" // Hint for mobile keyboards
          value={formData.price || ''}
          onChange={handlePriceChange}
          placeholder="e.g., 12.99"
          required
          disabled={isSubmitting}
        />
      </div>
      <div>
        <Label htmlFor="category">Category</Label>
        <Input
          id="category"
          name="category"
          value={formData.category || ''}
          onChange={handleInputChange}
          placeholder="e.g., Pizza, Appetizer, Drink"
          disabled={isSubmitting}
        />
      </div>
      <div>
        <Label htmlFor="image_url">Image URL</Label>
        <Input
          id="image_url"
          name="image_url"
          type="url"
          value={formData.image_url || ''}
          onChange={handleInputChange}
          placeholder="https://yourdomain.com/image.jpg"
          disabled={isSubmitting}
        />
        {formData.image_url && (
           <div className="mt-2">
             <img 
               src={formData.image_url} 
               alt="Image Preview" 
               className="h-24 w-24 rounded-md object-cover border bg-gray-100"
               onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
              />
           </div>
        )}
      </div>
      <div className="flex items-center space-x-2 pt-2">
         <Switch
           id="is_available"
           name="is_available"
           checked={formData.is_available ?? true}
           onCheckedChange={handleSwitchChange}
           disabled={isSubmitting}
         />
         <Label htmlFor="is_available">Available for Ordering</Label>
       </div>

      <div className="flex justify-end space-x-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            isEditMode ? 'Save Changes' : 'Add Item'
          )}
        </Button>
      </div>
    </form>
  );
};

export default MenuItemForm; 