
import React from "react";
import { Plus, Info, IndianRupee } from "lucide-react";
import { useCart, MenuItem as MenuItemType } from "../context/CartContext";
import { convertToRupees } from "../context/CartContext";
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

const MenuItem: React.FC<MenuItemProps> = ({ item }) => {
  const { addItem } = useCart();
  const priceInRupees = convertToRupees(item.price);

  const handleAddToCart = () => {
    addItem({
      ...item,
      price: priceInRupees
    });
    toast.success(`Added ${item.name} to cart`);
  };

  return (
    <div className="menu-item-card animate-fade-in">
      <div className="relative h-24 w-24 min-w-24 overflow-hidden rounded-l-lg">
        <img
          src={item.image}
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
              {priceInRupees.toFixed(2)}
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
