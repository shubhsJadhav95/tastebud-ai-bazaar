import React, { useState, useEffect, useCallback } from 'react';
import { FirestoreError } from 'firebase/firestore';
import { menuService } from '@/services/menuService'; // Adjust path if needed
import { MenuItem } from '@/types'; // Adjust path if needed
import MenuItemForm from '@/components/forms/MenuItemForm'; // Adjust path if needed
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { toast } from 'sonner';
import { Plus, Edit, Trash2, Loader2, AlertCircle } from 'lucide-react';
import { Skeleton } from "@/components/ui/skeleton";

interface MenuManagerProps {
  restaurantId: string;
}

const MenuManager: React.FC<MenuManagerProps> = ({ restaurantId }) => {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedMenuItem, setSelectedMenuItem] = useState<MenuItem | null>(null); // For editing

  // Fetch and listen for real-time updates
  useEffect(() => {
    if (!restaurantId) {
      setError("Restaurant ID is missing.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const handleUpdate = (items: MenuItem[]) => {
      setMenuItems(items);
      setError(null); // Clear previous errors on successful update
      setLoading(false);
    };

    const handleError = (err: FirestoreError) => {
      console.error("Error fetching menu items:", err);
      const message = `Failed to load menu items: ${err.message || 'Unknown error'}`;
      setError(message);
      setLoading(false);
      toast.error(message);
    };

    // Subscribe to real-time updates
    const unsubscribe = menuService.getMenuItemsRealtime(
      restaurantId,
      handleUpdate,
      handleError
    );

    // Cleanup listener on component unmount or restaurantId change
    return () => {
      console.log("Cleaning up menu items listener for:", restaurantId);
      unsubscribe();
    };
  }, [restaurantId]);

  const handleAddClick = () => {
    setSelectedMenuItem(null); // Ensure we are in "add" mode
    setIsModalOpen(true);
  };

  const handleEditClick = (item: MenuItem) => {
    setSelectedMenuItem(item);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedMenuItem(null); // Clear selection when modal closes
    setIsSubmitting(false); // Ensure submitting state is reset
  };

  const handleDeleteClick = async (itemId: string, itemName: string) => {
    if (!window.confirm(`Are you sure you want to delete "${itemName}"? This action cannot be undone.`)) {
      return;
    }
    try {
      await menuService.deleteMenuItem(restaurantId, itemId);
      toast.success(`Menu item "${itemName}" deleted successfully.`);
      // Real-time listener will update the UI
    } catch (err: any) {
      console.error("Error deleting menu item:", err);
      toast.error(`Failed to delete menu item: ${err.message || 'Unknown error'}`);
    }
  };

  // Type guard for MenuItemFormData
  type MenuItemFormData = Omit<MenuItem, 'id' | 'restaurant_id' | 'createdAt' | 'updatedAt'>;
  function isMenuItemFormData(data: any): data is MenuItemFormData {
    return typeof data === 'object' && data !== null && 'name' in data && 'price' in data;
  }


  const handleFormSubmit = async (formData: unknown) => {
     if (!isMenuItemFormData(formData)) {
      toast.error("Invalid form data submitted.");
      console.error("Invalid form data:", formData);
      return;
    }

    setIsSubmitting(true);
    try {
      if (selectedMenuItem?.id) {
        // Edit mode
        await menuService.updateMenuItem(restaurantId, selectedMenuItem.id, formData);
        toast.success(`Menu item "${formData.name}" updated.`);
      } else {
        // Add mode
        const newItem = await menuService.addMenuItem(restaurantId, formData);
        toast.success(`Menu item "${newItem.name}" added.`);
      }
      closeModal(); // Close modal on success
    } catch (err: any) {
      console.error("Error saving menu item:", err);
      toast.error(`Failed to save menu item: ${err.message || 'Unknown error'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderContent = () => {
    if (loading) {
      // Skeleton loader for the table
      return (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px] hidden sm:table-cell">Image</TableHead>
              <TableHead>Name</TableHead>
              <TableHead className="hidden md:table-cell">Category</TableHead>
              <TableHead className="text-right">Price</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {[...Array(5)].map((_, index) => ( // Show 5 skeleton rows
              <TableRow key={index}>
                <TableCell className="hidden sm:table-cell">
                  <Skeleton className="h-10 w-10 rounded" />
                </TableCell>
                <TableCell><Skeleton className="h-5 w-3/4 rounded" /></TableCell>
                <TableCell className="hidden md:table-cell"><Skeleton className="h-5 w-24 rounded" /></TableCell>
                <TableCell className="text-right"><Skeleton className="h-5 w-12 rounded ml-auto" /></TableCell>
                <TableCell><Skeleton className="h-6 w-20 rounded-full" /></TableCell>
                <TableCell className="text-right space-x-1">
                  <Skeleton className="h-8 w-8 rounded inline-block" />
                  <Skeleton className="h-8 w-8 rounded inline-block" />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      );
    }

    if (error) {
      return (
        <div className="text-center py-10 text-red-600">
          <AlertCircle className="h-8 w-8 mx-auto mb-2" />
          <p>{error}</p>
           {/* Removed retry button as listener should auto-retry or error persists */}
        </div>
      );
    }

    if (menuItems.length === 0) {
      return (
        <div className="text-center py-10 text-gray-500">
          <p>No menu items found for this restaurant.</p>
          <p>Click "Add Menu Item" to get started.</p>
        </div>
      );
    }

    return (
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px] hidden sm:table-cell">Image</TableHead>
              <TableHead>Name</TableHead>
              <TableHead className="hidden md:table-cell">Category</TableHead>
              <TableHead className="text-right">Price</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {menuItems.map((item) => (
              <TableRow key={item.id}>
                 <TableCell className="hidden sm:table-cell">
                  <img
                    src={item.image_url || 'https://placehold.co/60x60/png?text=N/A'}
                    alt={item.name}
                    className="h-10 w-10 rounded object-cover"
                    onError={(e) => { (e.target as HTMLImageElement).src = 'https://placehold.co/60x60/png?text=Error'; }}
                  />
                 </TableCell>
                <TableCell className="font-medium">{item.name}</TableCell>
                <TableCell className="hidden md:table-cell">{item.category || '-'}</TableCell>
                <TableCell className="text-right">${item.price.toFixed(2)}</TableCell>
                <TableCell>
                  {item.is_available ? (
                    <Badge variant="secondary" className="bg-green-100 text-green-800">Available</Badge>
                  ) : (
                    <Badge variant="outline">Unavailable</Badge>
                  )}
                </TableCell>
                <TableCell className="text-right space-x-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => handleEditClick(item)}
                    aria-label={`Edit ${item.name}`}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-red-600 hover:text-red-700 h-8 w-8"
                    onClick={() => handleDeleteClick(item.id, item.name)}
                    aria-label={`Delete ${item.name}`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  };

  return (
    // Use Card if you want it visually separated like the RestaurantForm
     <div className="p-4 border rounded shadow-sm bg-white"> {/* Added structure */}
        <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Menu Management</h2>
            <Dialog open={isModalOpen} onOpenChange={(open) => !open && closeModal()}> {/* Close modal logic */}
            <DialogTrigger asChild>
                <Button onClick={handleAddClick}>
                <Plus className="mr-2 h-4 w-4" /> Add Menu Item
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] md:max-w-lg"> {/* Increased width slightly */}
                <DialogHeader>
                <DialogTitle>{selectedMenuItem ? 'Edit Menu Item' : 'Add New Menu Item'}</DialogTitle>
                <DialogDescription>
                    {selectedMenuItem ? 'Update the details for this menu item.' : 'Fill in the details for the new menu item.'}
                </DialogDescription>
                </DialogHeader>
                <div className="py-4 max-h-[60vh] overflow-y-auto pr-2"> {/* Scrollable form area */}
                <MenuItemForm
                    menuItem={selectedMenuItem}
                    onSubmit={handleFormSubmit}
                    onCancel={closeModal}
                    isSubmitting={isSubmitting}
                />
                </div>
                {/* Footer is handled by the form's buttons */}
            </DialogContent>
            </Dialog>
        </div>

        {renderContent()}
     </div>
  );
};

export default MenuManager; 