import React, { useState, useEffect } from 'react';
import { useMenuItems } from '@/hooks/useMenuItems'; // Import the new hook
import { menuService } from '@/services/menuService'; 
import { MenuItem } from '@/types';
import { Button } from '@/components/ui/button';
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from "@/components/ui/table";
import { 
  Card, CardContent, CardHeader, CardTitle 
} from "@/components/ui/card";
import { 
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, 
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, 
  AlertDialogTrigger 
} from "@/components/ui/alert-dialog"; // For delete confirmation
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { toast } from 'sonner';
import { PlusCircle, Edit, Trash2, AlertCircle, Loader2, IndianRupee } from 'lucide-react'; // Add icons
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import MenuItemForm from '@/components/forms/MenuItemForm'; // Import the form

interface MenuManagerProps {
  restaurantId: string;
}

// Type for the form data submitted from MenuItemForm
type MenuItemFormData = Partial<Omit<MenuItem, 'id' | 'restaurant_id' | 'createdAt' | 'updatedAt'>>;

const MenuManager: React.FC<MenuManagerProps> = ({ restaurantId }) => {
  const { menuItems, isLoading, error } = useMenuItems(restaurantId); // Use the hook
  const [deletingItemId, setDeletingItemId] = useState<string | null>(null); // Track which item is being deleted
  const [isModalOpen, setIsModalOpen] = useState(false); // State for Dialog
  const [selectedMenuItem, setSelectedMenuItem] = useState<MenuItem | null>(null); // For editing
  const [isSubmitting, setIsSubmitting] = useState(false); // Form submission state

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
  };

  const handleDelete = async (menuItemId: string) => {
    if (!restaurantId || !menuItemId) return;
    setDeletingItemId(menuItemId); // Set loading state for the specific delete button
    try {
      await menuService.deleteMenuItem(restaurantId, menuItemId);
      toast.success("Menu item deleted successfully.");
      // The real-time listener in the hook will automatically update the list
    } catch (err) {
      console.error("Error deleting menu item:", err);
      toast.error("Failed to delete menu item.");
    } finally {
      setDeletingItemId(null); // Clear loading state
    }
  };

  const handleFormSubmit = async (formData: MenuItemFormData) => {
    setIsSubmitting(true);
    try {
      if (selectedMenuItem?.id) {
        // Edit mode
        await menuService.updateMenuItem(restaurantId, selectedMenuItem.id, formData);
        toast.success(`Menu item "${formData.name || 'Item'}" updated.`);
      } else {
        // Add mode - Ensure required fields are present if necessary before casting
        const newItem = await menuService.addMenuItem(restaurantId, formData as Omit<MenuItem, 'id' | 'restaurant_id'>); 
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

  const renderSkeleton = () => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Category</TableHead>
          <TableHead className="text-right">Price</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {[...Array(3)].map((_, i) => (
          <TableRow key={i}>
            <TableCell><Skeleton className="h-5 w-32" /></TableCell>
            <TableCell><Skeleton className="h-5 w-24" /></TableCell>
            <TableCell className="text-right"><Skeleton className="h-5 w-16 ml-auto" /></TableCell>
            <TableCell><Skeleton className="h-8 w-20" /></TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Menu Items</CardTitle>
        <Dialog open={isModalOpen} onOpenChange={(open) => !open && closeModal()}> 
           <DialogTrigger asChild>
             <Button size="sm" onClick={handleAddClick}> 
                <PlusCircle className="mr-2 h-4 w-4" /> Add New Item
             </Button>
           </DialogTrigger>
           <DialogContent className="sm:max-w-[425px] md:max-w-lg">
              <DialogHeader>
                 <DialogTitle>{selectedMenuItem ? 'Edit Menu Item' : 'Add New Menu Item'}</DialogTitle>
                 <DialogDescription>
                     {selectedMenuItem ? 'Update the details for this menu item.' : 'Fill in the details for the new menu item.'}
                 </DialogDescription>
              </DialogHeader>
              <div className="py-4 max-h-[60vh] overflow-y-auto pr-2">
                 <MenuItemForm
                     menuItem={selectedMenuItem}
                     onSubmit={handleFormSubmit}
                     onCancel={closeModal}
                     isSubmitting={isSubmitting}
                 />
              </div>
           </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          renderSkeleton()
        ) : error ? (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error Loading Menu</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : menuItems.length === 0 ? (
          <Alert>
             <AlertCircle className="h-4 w-4" />
             <AlertTitle>No Menu Items</AlertTitle>
             <AlertDescription>You haven't added any menu items yet. Click 'Add New Item' to start.</AlertDescription>
          </Alert>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead className="text-right">Price</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {menuItems.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.name}</TableCell>
                    <TableCell>{item.category || 'N/A'}</TableCell>
                    <TableCell className="text-sm text-gray-600 max-w-xs truncate">{item.description || '-'}</TableCell>
                    <TableCell className="text-right flex items-center justify-end">
                      <IndianRupee size={14} className="mr-0.5" />
                      {item.price.toFixed(2)}
                    </TableCell>
                    <TableCell className="space-x-2 whitespace-nowrap">
                      <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => handleEditClick(item)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button 
                            variant="destructive" 
                            size="icon" 
                            className="h-7 w-7"
                            disabled={deletingItemId === item.id}
                          >
                            {deletingItemId === item.id ? 
                              <Loader2 className="h-4 w-4 animate-spin" /> : 
                              <Trash2 className="h-4 w-4" />
                            }
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This action cannot be undone. This will permanently delete the menu item "{item.name}".
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDelete(item.id)} className="bg-destructive hover:bg-destructive/90">
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default MenuManager; 