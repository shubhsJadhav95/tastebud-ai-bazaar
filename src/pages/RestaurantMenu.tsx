import React, { useState, useEffect, ChangeEvent, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthContext } from '@/contexts/AuthContext';
import { useMyRestaurant } from '@/hooks/useRestaurants';
import { useMenuItems } from '@/hooks/useMenuItems';
import { MenuItem, Restaurant, UserProfile } from '@/types';
import { firestoreService } from '../services/firestoreService';
import { toast } from 'sonner';
import NavBar from '@/components/NavBar';
import Footer from '@/components/Footer';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
  CardDescription
} from '@/components/ui/card';
import { 
  Button,
} from '@/components/ui/button';
import { 
  Input,
} from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Plus,
  Edit,
  Trash,
  Image as ImageIcon,
  Check,
  X,
  Eye,
  EyeOff,
  Search,
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"

const TEMP_CATEGORIES = ['Appetizers', 'Main Courses', 'Desserts', 'Drinks'];

const RestaurantMenu: React.FC = () => {
  const { user, profile, loading: authLoading, error: authError } = useAuthContext();
  const { myRestaurant, isLoading: restaurantLoading, error: restaurantError } = useMyRestaurant();
  const { 
    menuItems, 
    loading: menuItemsLoading,
    error: menuItemsError,
    addMenuItem,
    updateMenuItem, 
    deleteMenuItem,
  } = useMenuItems(myRestaurant?.id);
  const navigate = useNavigate();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedMenuItem, setSelectedMenuItem] = useState<MenuItem | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [formData, setFormData] = useState<Omit<MenuItem, 'id' | 'createdAt' | 'updatedAt' | 'restaurant_id'>>({
    name: '',
    description: '',
    price: 0,
    image_url: '',
    category: '',
    is_available: true,
  });
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  const categories = TEMP_CATEGORIES;

  const filteredMenuItems = menuItems.filter(item => 
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.category?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    if (authLoading) return;
    
    if (!user) {
      toast.error("Please log in to access the menu.");
      navigate('/restaurant/login');
      return;
    }
    
    if (profile && profile.user_type !== 'restaurant') {
      toast.error('Only restaurant owners can access this page');
      navigate('/customer/home');
      return;
    }
    
    if (!restaurantLoading && !myRestaurant && profile) {
      toast.info("Please create your restaurant profile first.");
      navigate('/restaurant/profile');
    }
  }, [user, profile, authLoading, myRestaurant, restaurantLoading, navigate]);

  useEffect(() => {
    if (authError) {
      const message = authError instanceof Error ? authError.message : String(authError);
      toast.error(message || "Authentication error");
    }
    if (menuItemsError) {
      toast.error(menuItemsError || "Failed to load menu items");
    }
    if (restaurantError) {
      toast.error(restaurantError || "Failed to load restaurant data.");
    }
  }, [authError, menuItemsError, restaurantError]);

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value;
    setFormData(prev => ({ ...prev, image_url: url }));
    setImagePreview(url || null);
  };

  const handleImageUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setImagePreview(result);
        setFormData(prev => ({ ...prev, image_url: result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const validateForm = useCallback(() => {
    if (!formData.name.trim()) {
      toast.error("Menu item name is required");
      return false;
    }
    if (formData.price <= 0) {
      toast.error("Price must be greater than 0");
      return false;
    }
    return true;
  }, [formData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    try {
      const itemData = { 
        ...formData, 
        price: Number(formData.price),
        category: formData.category || undefined
      };
      
      if (isEditMode && selectedMenuItem?.id) {
        await updateMenuItem(selectedMenuItem.id, itemData);
        toast.success("Menu item updated successfully");
      } else {
        await addMenuItem(itemData);
        toast.success("Menu item added successfully");
      }
      
      closeModal();
    } catch (error) {
      toast.error("Failed to save menu item");
      console.error("Error saving menu item:", error);
    }
  };

  const handleEdit = (item: MenuItem) => {
    setIsEditMode(true);
    setSelectedMenuItem(item);
    setFormData({
      name: item.name,
      description: item.description || '',
      price: item.price,
      image_url: item.image_url || '',
      category: item.category || '',
      is_available: item.is_available !== undefined ? item.is_available : true,
    });
    setImagePreview(item.image_url || null);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this menu item?')) {
      try {
        await deleteMenuItem(id);
        toast.success("Menu item deleted successfully");
      } catch (error) {
        toast.error("Failed to delete menu item");
        console.error("Error deleting menu item:", error);
      }
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setIsEditMode(false);
    setSelectedMenuItem(null);
    setFormData({
      name: '',
      description: '',
      price: 0,
      image_url: '',
      category: '',
      is_available: true,
    });
    setImagePreview(null);
    setIsUploadingImage(false);
  };

  if (authLoading || menuItemsLoading || restaurantLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <NavBar />
        <div className="flex-grow container mx-auto py-8 px-4">
          <div className="flex justify-between items-center mb-8">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-10 w-32" />
          </div>
          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {[...Array(8)].map((_, i) => (
              <Card key={i} className="h-64">
                <CardContent className="p-4 h-full flex flex-col">
                  <Skeleton className="w-full h-32 mb-2" />
                  <Skeleton className="h-6 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-1/2 mb-2" />
                  <Skeleton className="h-4 w-full flex-grow" />
                  <div className="flex justify-between mt-2">
                    <Skeleton className="h-6 w-16" />
                    <Skeleton className="h-6 w-20" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!user || (profile && profile.user_type !== 'restaurant')) {
    return null;
  }

  if (!restaurantLoading && !myRestaurant) {
    return (
      <div className="min-h-screen flex flex-col">
        <NavBar />
        <div className="flex-grow flex items-center justify-center flex-col gap-4">
          <p className="text-lg">Please create your restaurant profile to manage the menu.</p>
          <Button onClick={() => navigate('/restaurant/profile')}>
            Create Restaurant Profile
          </Button>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <NavBar />
      
      <div className="flex-grow container mx-auto py-8 px-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold">Menu Management</h1>
            <p className="text-gray-600">{myRestaurant?.name}</p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search menu items..."
                className="pl-9"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button onClick={() => setIsModalOpen(true)} className="whitespace-nowrap">
              <Plus className="mr-2" size={16} />
              Add Menu Item
            </Button>
          </div>
        </div>
        
        {menuItemsError ? (
          <Card className="text-center py-8">
            <CardContent>
              <p className="text-red-600">Error loading menu: {menuItemsError}</p>
              <Button 
                variant="outline" 
                className="mt-4"
                onClick={() => window.location.reload()}
              >
                Retry
              </Button>
            </CardContent>
          </Card>
        ) : filteredMenuItems.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              {searchTerm ? (
                <>
                  <p>No menu items found matching "{searchTerm}"</p>
                  <Button 
                    variant="ghost" 
                    className="mt-2"
                    onClick={() => setSearchTerm("")}
                  >
                    Clear search
                  </Button>
                </>
              ) : (
                <>
                  <p>No menu items found</p>
                  <Button 
                    className="mt-4"
                    onClick={() => setIsModalOpen(true)}
                  >
                    <Plus className="mr-2" size={16} />
                    Add your first menu item
                  </Button>
                </>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {filteredMenuItems.map(item => (
              <Card key={item.id} className="h-full flex flex-col hover:shadow-lg transition-shadow">
                <CardHeader className="p-0 relative">
                  <div className="aspect-square overflow-hidden">
                    <img
                      src={item.image_url || 'https://placehold.co/600x400/png?text=No+Image'}
                      alt={item.name}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://placehold.co/600x400/png?text=No+Image';
                      }}
                    />
                  </div>
                  <div className="absolute top-2 right-2 flex gap-1">
                    <Button 
                      size="icon" 
                      variant="secondary" 
                      className="w-8 h-8"
                      onClick={() => handleEdit(item)}
                      aria-label="Edit menu item"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button 
                      size="icon" 
                      variant="destructive" 
                      className="w-8 h-8"
                      onClick={() => handleDelete(item.id)}
                      aria-label="Delete menu item"
                    >
                      <Trash className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="flex-grow p-4 flex flex-col">
                  <div className="flex-grow">
                    <div className="flex justify-between items-start mb-1">
                      <h3 className="text-lg font-semibold line-clamp-1">{item.name}</h3>
                      <p className="text-lg font-semibold whitespace-nowrap ml-2">${item.price.toFixed(2)}</p>
                    </div>
                    {item.category && (
                      <Badge variant="outline" className="mb-2">
                        {item.category}
                      </Badge>
                    )}
                    <p className="text-sm text-gray-600 line-clamp-2 mb-3">{item.description || "No description"}</p>
                  </div>
                  <div className="mt-auto">
                    {item.is_available ? (
                      <Badge variant="secondary">Available</Badge>
                    ) : (
                      <Badge variant="destructive">Unavailable</Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
      
      <Footer />
      
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <Card className="w-full max-w-md max-h-[90vh] overflow-y-auto">
            <CardHeader className="relative">
              <CardTitle>
                {isEditMode ? 'Edit Menu Item' : 'Add Menu Item'}
              </CardTitle>
              <CardDescription>
                {isEditMode ? 'Update your menu item details' : 'Add a new item to your menu'}
              </CardDescription>
              <Button 
                variant="ghost" 
                size="icon" 
                className="absolute top-4 right-4"
                onClick={closeModal}
                aria-label="Close modal"
              >
                <X className="h-5 w-5" />
              </Button>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label>Image Preview</Label>
                  <div className="mt-1 aspect-square bg-gray-100 rounded-md overflow-hidden flex items-center justify-center">
                    {imagePreview ? (
                      <img 
                        src={imagePreview} 
                        alt="Preview" 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="text-gray-400 flex flex-col items-center">
                        <ImageIcon className="h-12 w-12 mb-2" />
                        <p>No image selected</p>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <Label htmlFor="image_url">Image URL</Label>
                  <Input
                    id="image_url"
                    name="image_url"
                    value={formData.image_url}
                    onChange={handleImageChange}
                    placeholder="https://example.com/image.jpg"
                  />
                </div>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-200" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">
                      OR
                    </span>
                  </div>
                </div>

                <div>
                  <Label htmlFor="image_upload">Upload Image</Label>
                  <Input
                    id="image_upload"
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="cursor-pointer"
                  />
                </div>

                <div>
                  <Label htmlFor="name">Item Name *</Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="category">Category</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) => setFormData({...formData, category: value === 'none' ? '' : value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                      <SelectItem value="none">None</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    rows={3}
                  />
                </div>

                <div>
                  <Label htmlFor="price">Price *</Label>
                  <div className="flex items-center gap-2 border border-input rounded-md focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2">
                    <span className="text-sm font-medium pl-3 text-muted-foreground">$</span>
                    <Input
                      id="price"
                      name="price"
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.price}
                      onChange={(e) => setFormData({...formData, price: parseFloat(e.target.value) || 0})}
                      required
                      className="flex-1 h-auto border-0 shadow-none focus-visible:ring-0 pl-1"
                      placeholder="0.00"
                    />
                  </div>
                </div>

                <div className="flex items-center space-x-2 pt-2">
                  <input
                    type="checkbox"
                    id="is_available"
                    name="is_available"
                    checked={formData.is_available}
                    onChange={(e) => setFormData({...formData, is_available: e.target.checked})}
                    className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                  />
                  <Label htmlFor="is_available">Item is available</Label>
                </div>

                <div className="flex justify-end gap-2 pt-4">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={closeModal}
                  >
                    Cancel
                  </Button>
                  <Button type="submit">
                    {isEditMode ? 'Save Changes' : 'Add Item'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default RestaurantMenu;