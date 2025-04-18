import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import NavBar from "../components/NavBar";
import Footer from "../components/Footer";
import { useAuth } from "../context/AuthContext";
import { Plus, Edit, Trash2, Save, X, IndianRupee } from "lucide-react";
import { toast } from "sonner";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogFooter,
  DialogDescription
} from "@/components/ui/dialog";

// Import mock data to simulate database
import { menuItems } from "../utils/mockData";

// Helper function to get appropriate image URL based on food name
const getImageForFoodName = (name: string): string => {
  const lowerName = name.toLowerCase();
  
  if (lowerName.includes('paneer') || lowerName.includes('tikka')) {
    return "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?q=80&w=2574&auto=format&fit=crop";
  } else if (lowerName.includes('dal') || lowerName.includes('lentil')) {
    return "https://images.unsplash.com/photo-1626200824493-ffbbf1a2b4d7?q=80&w=2574&auto=format&fit=crop";
  } else if (lowerName.includes('biryani') || lowerName.includes('rice')) {
    return "https://images.unsplash.com/photo-1633945274405-b6c8069047b0?q=80&w=2574&auto=format&fit=crop";
  } else if (lowerName.includes('dosa') || lowerName.includes('idli')) {
    return "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?q=80&w=2574&auto=format&fit=crop";
  } else if (lowerName.includes('naan') || lowerName.includes('roti') || lowerName.includes('bread')) {
    return "https://images.unsplash.com/photo-1606491048802-8342506d6471?q=80&w=2574&auto=format&fit=crop";
  } else if (lowerName.includes('curry') || lowerName.includes('masala')) {
    return "https://images.unsplash.com/photo-1565557623262-b51c2513a641?q=80&w=2574&auto=format&fit=crop";
  } else if (lowerName.includes('tandoori')) {
    return "https://images.unsplash.com/photo-1628294896516-344152572ee8?q=80&w=2574&auto=format&fit=crop";
  } else if (lowerName.includes('sweet') || lowerName.includes('dessert') || lowerName.includes('gulab')) {
    return "https://images.unsplash.com/photo-1627489316265-7829b9bbab2b?q=80&w=2574&auto=format&fit=crop";
  } else if (lowerName.includes('lassi') || lowerName.includes('drink')) {
    return "https://images.unsplash.com/photo-1626451184843-73631124a73a?q=80&w=2574&auto=format&fit=crop";
  } else if (lowerName.includes('chaat') || lowerName.includes('samosa')) {
    return "https://images.unsplash.com/photo-1601050690597-df0568f70950?q=80&w=2574&auto=format&fit=crop";
  } else {
    // Default Indian food image
    return "https://images.unsplash.com/photo-1585937421612-70a008356c36?q=80&w=2574&auto=format&fit=crop";
  }
};

const RestaurantMenu: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [menuList, setMenuList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [currentItem, setCurrentItem] = useState<any>(null);
  
  // New menu item template
  const emptyMenuItem = {
    id: "",
    name: "",
    description: "",
    price: 0,
    image: "https://images.unsplash.com/photo-1585937421612-70a008356c36?q=80&w=2574&auto=format&fit=crop",
    calories: 0,
    nutrients: {
      protein: 0,
      carbs: 0,
      fat: 0,
      fiber: 0
    },
    servingSize: "1 serving",
    restaurantId: user?.id || "",
    restaurantName: user?.name || ""
  };
  
  // Load menu items for this restaurant
  useEffect(() => {
    if (!user) {
      navigate("/restaurant/login");
      return;
    }
    
    // Simulate API call to load restaurant's menu items
    setLoading(true);
    setTimeout(() => {
      // Check if current user email is posj2004@gmail.com
      if (user.email === "posj2004@gmail.com") {
        // Use the first restaurant's menu items from mock data
        const restaurantId = Object.keys(menuItems)[0];
        const items = menuItems[restaurantId] || [];
        
        // Update images based on food names
        const itemsWithUpdatedImages = items.map(item => ({
          ...item,
          image: getImageForFoodName(item.name)
        }));
        
        setMenuList(itemsWithUpdatedImages);
      } else {
        // For other users, start with an empty menu
        setMenuList([]);
      }
      setLoading(false);
    }, 1000);
  }, [user, navigate]);
  
  const handleAddItem = () => {
    setCurrentItem({
      ...emptyMenuItem,
      id: `temp-${Date.now()}` // Generate temporary ID
    });
    setEditDialogOpen(true);
  };
  
  const handleEditItem = (item: any) => {
    setCurrentItem(item);
    setEditDialogOpen(true);
  };
  
  const handleDeleteItem = (item: any) => {
    setCurrentItem(item);
    setDeleteDialogOpen(true);
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    if (name === "name" && currentItem) {
      // Update image URL based on the name when name changes
      const updatedImage = getImageForFoodName(value);
      
      if (name.includes('.')) {
        // Handle nested object properties (nutrients)
        const [parent, child] = name.split('.');
        setCurrentItem({
          ...currentItem,
          [parent]: {
            ...currentItem[parent],
            [child]: value
          },
          image: updatedImage
        });
      } else {
        setCurrentItem({
          ...currentItem,
          [name]: name === "price" || name === "calories" ? parseFloat(value) : value,
          image: updatedImage
        });
      }
    } else if (name.includes('.')) {
      // Handle nested object properties (nutrients)
      const [parent, child] = name.split('.');
      setCurrentItem({
        ...currentItem,
        [parent]: {
          ...currentItem[parent],
          [child]: parseFloat(value)
        }
      });
    } else {
      setCurrentItem({
        ...currentItem,
        [name]: name === "price" || name === "calories" ? parseFloat(value) : value
      });
    }
  };
  
  const handleSaveItem = () => {
    // Validation
    if (!currentItem.name || !currentItem.description || currentItem.price <= 0) {
      toast.error("Please fill in all required fields");
      return;
    }
    
    // Check if item already exists in menu
    const existingItemIndex = menuList.findIndex(item => item.id === currentItem.id);
    let updatedMenu;
    
    if (existingItemIndex >= 0) {
      // Update existing item
      updatedMenu = [...menuList];
      updatedMenu[existingItemIndex] = currentItem;
    } else {
      // Add new item
      updatedMenu = [...menuList, currentItem];
    }
    
    setMenuList(updatedMenu);
    setEditDialogOpen(false);
    toast.success(existingItemIndex >= 0 ? "Menu item updated" : "Menu item added");
    
    // In a real app, here we would save to the database
    // saveToDatabase(updatedMenu);
  };
  
  const handleConfirmDelete = () => {
    const updatedMenu = menuList.filter(item => item.id !== currentItem.id);
    setMenuList(updatedMenu);
    setDeleteDialogOpen(false);
    toast.success("Menu item deleted");
    
    // In a real app, here we would delete from the database
    // deleteFromDatabase(currentItem.id);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <NavBar />
      
      <div className="flex-grow py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold mb-2">Menu Management</h1>
            <p className="text-gray-600">Add, edit or remove menu items</p>
          </div>
          <button 
            className="btn-primary flex items-center"
            onClick={handleAddItem}
          >
            <Plus size={16} className="mr-2" />
            Add Menu Item
          </button>
        </div>
        
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="animate-pulse flex h-32 bg-gray-100 rounded-lg">
                <div className="h-full w-32 bg-gray-200 rounded-l-lg"></div>
                <div className="flex-grow p-4">
                  <div className="h-5 bg-gray-200 rounded w-1/3 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-2/3 mb-4"></div>
                  <div className="flex justify-between">
                    <div className="h-4 bg-gray-200 rounded w-16"></div>
                    <div className="flex space-x-2">
                      <div className="h-8 w-8 bg-gray-200 rounded"></div>
                      <div className="h-8 w-8 bg-gray-200 rounded"></div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : menuList.length === 0 ? (
          <div className="bg-gray-50 rounded-lg p-8 text-center">
            <h3 className="text-xl font-medium text-gray-700 mb-2">Your menu is empty</h3>
            <p className="text-gray-500 mb-6">Start adding delicious items to your menu</p>
            <button 
              className="btn-primary flex items-center mx-auto"
              onClick={handleAddItem}
            >
              <Plus size={16} className="mr-2" />
              Add First Menu Item
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {menuList.map(item => (
              <div key={item.id} className="bg-white border rounded-lg overflow-hidden flex animate-fade-in">
                <div className="w-32 h-32 overflow-hidden">
                  <img 
                    src={item.image}
                    alt={item.name} 
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-grow p-4 flex flex-col justify-between">
                  <div>
                    <h3 className="font-bold text-lg">{item.name}</h3>
                    <p className="text-gray-500 text-sm line-clamp-2">{item.description}</p>
                  </div>
                  <div className="flex justify-between items-center mt-2">
                    <div className="flex items-center">
                      <span className="font-bold flex items-center">
                        <IndianRupee size={14} className="mr-1" />
                        {item.price.toFixed(2)}
                      </span>
                      <span className="text-sm text-gray-500 ml-3">{item.calories} Cal</span>
                    </div>
                    <div className="flex space-x-2">
                      <button 
                        className="p-2 rounded-full hover:bg-gray-100"
                        onClick={() => handleEditItem(item)}
                      >
                        <Edit size={18} className="text-food-primary" />
                      </button>
                      <button 
                        className="p-2 rounded-full hover:bg-gray-100"
                        onClick={() => handleDeleteItem(item)}
                      >
                        <Trash2 size={18} className="text-red-500" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* Edit/Add Menu Item Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>
              {currentItem?.id.startsWith('temp-') ? 'Add New Menu Item' : 'Edit Menu Item'}
            </DialogTitle>
          </DialogHeader>
          
          {currentItem && (
            <div className="py-4 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    className="input-field"
                    value={currentItem.name}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Price (₹) *
                  </label>
                  <input
                    type="number"
                    name="price"
                    min="0"
                    step="0.01"
                    className="input-field"
                    value={currentItem.price}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description *
                </label>
                <textarea
                  name="description"
                  rows={3}
                  className="input-field"
                  value={currentItem.description}
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Image URL
                </label>
                <input
                  type="text"
                  name="image"
                  className="input-field"
                  value={currentItem.image}
                  onChange={handleInputChange}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Calories
                  </label>
                  <input
                    type="number"
                    name="calories"
                    min="0"
                    className="input-field"
                    value={currentItem.calories}
                    onChange={handleInputChange}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Serving Size
                  </label>
                  <input
                    type="text"
                    name="servingSize"
                    className="input-field"
                    value={currentItem.servingSize}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
              
              <fieldset>
                <legend className="block text-sm font-medium text-gray-700 mb-2">
                  Nutritional Information (grams)
                </legend>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">
                      Protein (g)
                    </label>
                    <input
                      type="number"
                      name="nutrients.protein"
                      min="0"
                      step="0.1"
                      className="input-field"
                      value={currentItem.nutrients.protein}
                      onChange={handleInputChange}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">
                      Carbs (g)
                    </label>
                    <input
                      type="number"
                      name="nutrients.carbs"
                      min="0"
                      step="0.1"
                      className="input-field"
                      value={currentItem.nutrients.carbs}
                      onChange={handleInputChange}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">
                      Fat (g)
                    </label>
                    <input
                      type="number"
                      name="nutrients.fat"
                      min="0"
                      step="0.1"
                      className="input-field"
                      value={currentItem.nutrients.fat}
                      onChange={handleInputChange}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">
                      Fiber (g)
                    </label>
                    <input
                      type="number"
                      name="nutrients.fiber"
                      min="0"
                      step="0.1"
                      className="input-field"
                      value={currentItem.nutrients.fiber}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
              </fieldset>
            </div>
          )}
          
          <DialogFooter>
            <button
              type="button"
              className="btn-secondary"
              onClick={() => setEditDialogOpen(false)}
            >
              Cancel
            </button>
            <button
              type="button"
              className="btn-primary flex items-center"
              onClick={handleSaveItem}
            >
              <Save size={16} className="mr-2" />
              Save Item
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Delete Menu Item</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{currentItem?.name}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          
          <DialogFooter className="mt-4">
            <button
              type="button"
              className="btn-secondary"
              onClick={() => setDeleteDialogOpen(false)}
            >
              Cancel
            </button>
            <button
              type="button"
              className="bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded-md flex items-center"
              onClick={handleConfirmDelete}
            >
              <Trash2 size={16} className="mr-2" />
              Delete
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <Footer />
    </div>
  );
};

export default RestaurantMenu;
