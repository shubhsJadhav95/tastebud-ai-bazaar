import React, { useState, useEffect, ChangeEvent } from 'react';
import { MenuItem } from '@/types'; // Adjust path if needed
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Checkbox } from "@/components/ui/checkbox"
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react'; // Import Loader2 icon

// Define the fields needed for the form (excluding generated ones like id, restaurant_id)
type MenuItemFormData = Omit<MenuItem, 'id' | 'restaurant_id' | 'createdAt' | 'updatedAt'>;

interface MenuItemFormProps {
  menuItem?: MenuItem | null; // For pre-filling in edit mode
  onSubmit: (data: MenuItemFormData) => Promise<void>; // Function to call on save
  onCancel: () => void; // Function to call when cancelling
  isSubmitting: boolean; // Indicate if submission is in progress
}

const MenuItemForm: React.FC<MenuItemFormProps> = ({ menuItem, onSubmit, onCancel, isSubmitting }) => {
  const [formData, setFormData] = useState<MenuItemFormData>({
    name: '',
    description: '',
    price: 0,
    category: '',
    image_url: '',
    is_available: true,
  });

  const isEditMode = !!menuItem;

  useEffect(() => {
    if (isEditMode && menuItem) {
      // Pre-fill form, ensuring defaults for optional fields
      const { id, restaurant_id, createdAt, updatedAt, ...editableData } = menuItem;
      setFormData({
        name: editableData.name || '',
        description: editableData.description || '',
        price: editableData.price || 0,
        category: editableData.category || '',
        image_url: editableData.image_url || '',
        is_available: editableData.is_available !== undefined ? editableData.is_available : true,
      });
    } else {
      // Reset form for create mode
      setFormData({
        name: '',
        description: '',
        price: 0,
        category: '',
        image_url: '',
        is_available: true,
      });
    }
  }, [menuItem, isEditMode]);

  const handleInputChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'price' ? parseFloat(value) || 0 : value,
    }));
  };

  const handleCheckboxChange = (checked: boolean | 'indeterminate') => {
    setFormData((prev) => ({ ...prev, is_available: !!checked }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error("Menu item name is required.");
      return;
    }
    if (formData.price <= 0) {
      toast.error("Price must be a positive number.");
      return;
    }

    await onSubmit(formData);
    // The parent component (MenuManager) will handle closing the modal/form
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="name">Item Name *</Label>
        <Input
          id="name"
          name="name"
          value={formData.name}
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
          placeholder="e.g., Classic pizza with tomato, mozzarella, and basil"
          disabled={isSubmitting}
        />
      </div>
      <div>
        <Label htmlFor="price">Price *</Label>
        <Input
          id="price"
          name="price"
          type="number"
          step="0.01"
          min="0.01"
          value={formData.price}
          onChange={handleInputChange}
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
          placeholder="e.g., Appetizers, Main Courses, Drinks"
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
          placeholder="https://yourdomain.com/item.jpg"
          disabled={isSubmitting}
        />
      </div>
      <div className="flex items-center space-x-2 pt-2">
        <Checkbox
          id="is_available"
          checked={formData.is_available}
          onCheckedChange={handleCheckboxChange}
          disabled={isSubmitting}
        />
        <Label htmlFor="is_available" className="cursor-pointer">
          Item is available for ordering
        </Label>
      </div>
      <div className="flex justify-end gap-2 pt-4">
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