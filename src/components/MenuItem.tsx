import React from "react";
import { Plus, Info, IndianRupee } from "lucide-react";
import { MenuItem as MenuItemType } from "@/types";
import { useCart } from "../context/CartContext";
import { toast } from "sonner";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface MenuItemProps {
  item: MenuItemType;
}

// This function might need adjustment or removal depending on image handling
// For now, it tries using image_url, then name-based lookup, then placeholder
const getImageUrl = (item: MenuItemType): string => {
  if (item.image_url) {
    return item.image_url;
  }
  // Keep name-based logic as a fallback if desired, or remove it
  const lowerName = item.name.toLowerCase();
  if (lowerName.includes('paneer')) return "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?q=80&w=2574&auto=format&fit=crop";
  // ... (other name checks) ...
  else {
    return "https://placehold.co/300x200/png?text=No+Image"; // Fallback placeholder
  }
};

const MenuItemComponent: React.FC<MenuItemProps> = ({ item }) => {
  const { addItem } = useCart();

  const handleAddToCart = () => {
    // Pass the item object matching the shared MenuItemType
    addItem(item); 
    toast.success(`Added ${item.name} to cart`);
  };

  // Use the updated image logic
  const imageUrl = getImageUrl(item);

  return (
    <div className="menu-item-card animate-fade-in border rounded-lg flex overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      {/* Image Section */}
      <div className="relative h-24 w-24 min-w-24 overflow-hidden flex-shrink-0">
        <img
          src={imageUrl} 
          alt={item.name}
          className="w-full h-full object-cover"
        />
      </div>
      {/* Content Section */}
      <div className="p-3 flex-grow flex flex-col justify-between">
        {/* Top part: Name and Info Dialog */}
        <div>
          <div className="flex justify-between items-start mb-1">
            <h3 className="font-bold text-md truncate pr-2">{item.name}</h3>
            {/* Info Dialog Trigger (Optional - remove if no detailed info) */}
            <Dialog>
              <DialogTrigger asChild>
                <button className="text-gray-400 hover:text-food-primary flex-shrink-0">
                  <Info size={16} />
                </button>
              </DialogTrigger>
              <DialogContent className="max-w-sm">
                <DialogHeader>
                  <DialogTitle>{item.name}</DialogTitle>
                  <DialogDescription>{item.description || "Detailed information not available."}</DialogDescription>
                </DialogHeader>
                {/* Add more details if available in your MenuItemType */}
                <div className="py-2 text-sm">
                  <p><strong>Category:</strong> {item.category || "N/A"}</p>
                  <p><strong>Availability:</strong> {item.is_available ? "Available" : "Unavailable"}</p>
                  {/* Remove nutrient info if not present */}
                </div>
              </DialogContent>
            </Dialog>
          </div>
          {/* Description */}
          <p className="text-gray-500 text-sm line-clamp-2 mb-1">{item.description || "No description available."}</p>
          {/* Calories and Serves Info - Added */}
          <div className="text-xs text-gray-400 flex items-center space-x-2">
            {item.calories != null && (
              <span>{item.calories} Cal</span>
            )}
            {item.calories != null && item.serves && (
              <span className="font-bold">·</span> // Separator
            )}
            {item.serves && (
              <span>Serves: {item.serves}</span>
            )}
          </div>
        </div>
        {/* Bottom part: Price and Add to Cart */}
        <div className="flex justify-between items-center mt-2">
          <span className="font-bold flex items-center">
            <IndianRupee size={14} className="mr-0.5" />
            {item.price.toFixed(2)}
          </span>
          {/* Conditionally render Add button based on availability */}
          {item.is_available ? (
            <button
              onClick={handleAddToCart}
              className="bg-food-primary text-white p-1.5 rounded-full hover:bg-orange-600 transition-colors disabled:bg-gray-300"
              aria-label={`Add ${item.name} to cart`}
              disabled={!item.is_available} // Double check for clarity
            >
              <Plus size={16} />
            </button>
          ) : (
             <span className="text-xs text-red-600 font-medium">Unavailable</span>
          )}
        </div>
      </div>
    </div>
  );
};

// Rename the export to match the import in RestaurantDetail
export default MenuItemComponent;
