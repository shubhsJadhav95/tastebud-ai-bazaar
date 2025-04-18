import React, { useState, useEffect, ChangeEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useRestaurants } from '@/hooks/useRestaurants';
import { useMenuItems, MenuItem } from '@/hooks/useMenuItems';
import { toast } from 'sonner';
import NavBar from '@/components/NavBar';
import Footer from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Plus,
  Edit,
  Trash,
  Image,
  Check,
  X
} from 'lucide-react';

const RestaurantMenu: React.FC = () => {
  const { user, profile, isAuthenticated, userType } = useAuth();
  const { myRestaurant } = useRestaurants();
  const { menuItems, isLoading, createMenuItem, updateMenuItem, deleteMenuItem } = useMenuItems(myRestaurant?.id);
  const navigate = useNavigate();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedMenuItem, setSelectedMenuItem] = useState<MenuItem | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: 0,
    image_url: '',
    category: '',
    is_available: true,
  });
  
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
  }, [isAuthenticated, userType, navigate]);
  
  const openModal = () => {
    setIsModalOpen(true);
  };
  
  const closeModal = () => {
    setIsModalOpen(false);
    setIsEditMode(false);
    setSelectedMenuItem(null);
    resetForm();
  };
  
  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };
  
  const handleCheckboxChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: checked,
    }));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!myRestaurant?.id) {
      toast.error('Restaurant not found. Please update your restaurant profile.');
      return;
    }
    
    const itemData = {
      ...formData,
      restaurant_id: myRestaurant.id,
      price: parseFloat(formData.price.toString()),
    };
    
    if (isEditMode && selectedMenuItem) {
      // Update existing item
      const updatedItem = await updateMenuItem(selectedMenuItem.id, itemData);
      if (updatedItem) {
        toast.success('Menu item updated successfully');
        closeModal();
      } else {
        toast.error('Failed to update menu item');
      }
    } else {
      // Create new item
      const newItem = await createMenuItem(itemData);
      if (newItem) {
        toast.success('Menu item created successfully');
        closeModal();
      } else {
        toast.error('Failed to create menu item');
      }
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
      is_available: item.is_available,
    });
    openModal();
  };
  
  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this menu item?')) {
      const success = await deleteMenuItem(id);
      if (success) {
        toast.success('Menu item deleted successfully');
      } else {
        toast.error('Failed to delete menu item');
      }
    }
  };
  
  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: 0,
      image_url: '',
      category: '',
      is_available: true,
    });
  };
  
  return (
    <div className="min-h-screen flex flex-col">
      <NavBar />
      
      <div className="flex-grow py-8 px-4">
        <div className="container mx-auto max-w-7xl">
          <header className="mb-8">
            <h1 className="text-3xl font-bold">Menu Management</h1>
            <p className="text-gray-600">
              Welcome, {profile?.full_name || user?.email}
            </p>
          </header>
          
          <Card>
            <CardHeader className="flex items-center justify-between">
              <CardTitle className="text-xl font-semibold">Menu Items</CardTitle>
              <Button onClick={openModal}>
                <Plus className="mr-2" size={16} />
                Add Item
              </Button>
            </CardHeader>
            
            <CardContent>
              {isLoading ? (
                <p>Loading menu items...</p>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                  {menuItems.map(item => (
                    <div key={item.id} className="border rounded-md p-4">
                      <div className="relative">
                        {item.image_url && (
                          <img
                            src={item.image_url}
                            alt={item.name}
                            className="w-full h-32 object-cover rounded-md mb-2"
                          />
                        )}
                        <div className="absolute top-2 right-2 flex space-x-2">
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => handleEdit(item)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => handleDelete(item.id)}
                          >
                            <Trash className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      <h3 className="text-lg font-semibold">{item.name}</h3>
                      <p className="text-gray-500">{item.category}</p>
                      <p className="text-gray-700">${item.price.toFixed(2)}</p>
                      <p className="text-sm text-gray-600">{item.description}</p>
                      <div className="mt-2">
                        {item.is_available ? (
                          <span className="inline-flex items-center rounded-md bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/10">
                            Available
                          </span>
                        ) : (
                          <span className="inline-flex items-center rounded-md bg-red-50 px-2 py-1 text-xs font-medium text-red-700 ring-1 ring-inset ring-red-600/10">
                            Unavailable
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
      
      <Footer />
      
      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">
                {isEditMode ? 'Edit Menu Item' : 'Add Menu Item'}
              </h2>
              <Button variant="ghost" onClick={closeModal}>
                <X className="h-5 w-5" />
              </Button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  className="h-24"
                />
              </div>
              
              <div>
                <Label htmlFor="price">Price</Label>
                <Input
                  id="price"
                  name="price"
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="image_url">Image URL</Label>
                <Input
                  id="image_url"
                  name="image_url"
                  type="text"
                  value={formData.image_url}
                  onChange={handleInputChange}
                />
              </div>
              
              <div>
                <Label htmlFor="category">Category</Label>
                <Input
                  id="category"
                  name="category"
                  type="text"
                  value={formData.category}
                  onChange={handleInputChange}
                />
              </div>
              
              <div className="flex items-center space-x-2">
                <Label htmlFor="is_available">Available</Label>
                <Input
                  id="is_available"
                  name="is_available"
                  type="checkbox"
                  checked={formData.is_available}
                  onChange={handleCheckboxChange}
                />
              </div>
              
              <Button type="submit" className="w-full">
                {isEditMode ? 'Update Item' : 'Add Item'}
              </Button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default RestaurantMenu;
