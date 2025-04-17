
import React from "react";
import { Plus, Info, IndianRupee } from "lucide-react";
import { useCart, MenuItem as MenuItemType } from "../context/CartContext";
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

// Map of food names to appropriate image URLs
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

const MenuItem: React.FC<MenuItemProps> = ({ item }) => {
  const { addItem } = useCart();

  const handleAddToCart = () => {
    addItem({
      ...item
    });
    toast.success(`Added ${item.name} to cart`);
  };

  // Use the function to get a more appropriate image based on the food name
  const foodImage = item.image.includes("unsplash") ? getImageForFoodName(item.name) : item.image;

  return (
    <div className="menu-item-card animate-fade-in">
      <div className="relative h-24 w-24 min-w-24 overflow-hidden rounded-l-lg">
        <img
          src={foodImage}
          alt={item.name}
          className="w-full h-full object-cover"
        />
      </div>
      <div className="p-4 flex-grow flex flex-col justify-between">
        <div>
          <div className="flex justify-between">
            <h3 className="font-bold truncate">{item.name}</h3>
            <Dialog>
              <DialogTrigger asChild>
                <button className="text-gray-500 hover:text-food-primary">
                  <Info size={16} />
                </button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>{item.name}</DialogTitle>
                  <DialogDescription>Nutritional Information</DialogDescription>
                </DialogHeader>
                <div className="py-4">
                  <div className="flex justify-between mb-2">
                    <span className="font-semibold">Calories:</span>
                    <span>{item.calories} kcal</span>
                  </div>
                  <div className="grid grid-cols-2 gap-y-2 gap-x-4">
                    <div className="flex justify-between">
                      <span>Protein:</span>
                      <span>{item.nutrients.protein}g</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Carbs:</span>
                      <span>{item.nutrients.carbs}g</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Fat:</span>
                      <span>{item.nutrients.fat}g</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Fiber:</span>
                      <span>{item.nutrients.fiber}g</span>
                    </div>
                  </div>
                  <div className="mt-4">
                    <span className="font-semibold">Serving Size:</span>
                    <span className="ml-2">{item.servingSize}</span>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
          <p className="text-gray-500 text-sm mt-1 line-clamp-2">{item.description}</p>
        </div>
        <div className="flex justify-between items-center mt-2">
          <div>
            <span className="font-bold flex items-center">
              <IndianRupee size={14} className="mr-1" />
              {item.price.toFixed(2)}
            </span>
            <span className="text-sm text-gray-500 ml-2">{item.calories} Cal</span>
          </div>
          <button
            onClick={handleAddToCart}
            className="bg-food-primary text-white p-2 rounded-full hover:bg-orange-600 transition-colors"
          >
            <Plus size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default MenuItem;
