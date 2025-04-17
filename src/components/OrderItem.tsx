
import React from "react";
import { CartItem } from "../context/CartContext";
import { IndianRupee } from "lucide-react";

interface OrderItemProps {
  item: CartItem;
  showControls?: boolean;
  onIncrease?: (id: string) => void;
  onDecrease?: (id: string) => void;
  onRemove?: (id: string) => void;
}

const OrderItem: React.FC<OrderItemProps> = ({
  item,
  showControls = false,
  onIncrease,
  onDecrease,
  onRemove
}) => {
  return (
    <div className="flex items-center py-4 border-b border-gray-200 animate-fade-in">
      <div className="h-16 w-16 min-w-16 rounded overflow-hidden">
        <img
          src={item.image}
          alt={item.name}
          className="w-full h-full object-cover"
        />
      </div>
      <div className="ml-4 flex-grow">
        <h4 className="font-medium">{item.name}</h4>
        <div className="flex justify-between mt-1">
          <span className="text-gray-600 text-sm flex items-center">
            <IndianRupee size={12} className="mr-1" />
            {item.price.toFixed(2)} x {item.quantity}
          </span>
          <span className="font-semibold flex items-center">
            <IndianRupee size={14} className="mr-1" />
            {(item.price * item.quantity).toFixed(2)}
          </span>
        </div>
      </div>
      
      {showControls && (
        <div className="ml-4 flex items-center">
          <button
            onClick={() => onDecrease && onDecrease(item.id)}
            className="bg-gray-200 hover:bg-gray-300 rounded-full w-6 h-6 flex items-center justify-center"
          >
            -
          </button>
          <span className="mx-2 w-6 text-center">{item.quantity}</span>
          <button
            onClick={() => onIncrease && onIncrease(item.id)}
            className="bg-gray-200 hover:bg-gray-300 rounded-full w-6 h-6 flex items-center justify-center"
          >
            +
          </button>
          <button
            onClick={() => onRemove && onRemove(item.id)}
            className="ml-4 text-red-500 hover:text-red-700"
          >
            Remove
          </button>
        </div>
      )}
    </div>
  );
};

export default OrderItem;
