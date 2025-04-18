import React, { createContext, useContext, useReducer, useEffect } from "react";
import { MenuItem } from "@/types";

export interface CartItem extends MenuItem {
  quantity: number;
}

interface CartState {
  items: CartItem[];
  restaurantId: string | null;
  totalAmount: number;
}

type CartAction =
  | { type: "ADD_ITEM"; payload: { item: MenuItem } }
  | { type: "REMOVE_ITEM"; payload: string }
  | { type: "UPDATE_QUANTITY"; payload: { id: string; quantity: number } }
  | { type: "CLEAR_CART" }

interface CartContextType {
  cart: CartState;
  addItem: (item: MenuItem) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  itemCount: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const initialState: CartState = {
  items: [],
  restaurantId: null,
  totalAmount: 0,
};

const calculateTotalAmount = (items: CartItem[]): number => {
  return items.reduce((sum, item) => sum + (Number(item.price) || 0) * item.quantity, 0);
};

export const convertToRupees = (price: number): number => {
  return price;
};

const cartReducer = (state: CartState, action: CartAction): CartState => {
  switch (action.type) {
    case "ADD_ITEM": {
      const newItem = action.payload.item;
      
      if (!newItem || typeof newItem.price !== 'number') {
         console.error("Attempted to add invalid item:", newItem);
         return state;
      }

      if (state.items.length === 0) {
        const cartItem: CartItem = { ...newItem, quantity: 1 };
        const newItems = [cartItem];
        return {
          ...state,
          items: newItems,
          restaurantId: newItem.restaurant_id,
          totalAmount: calculateTotalAmount(newItems)
        };
      }
      
      if (state.restaurantId && state.restaurantId !== newItem.restaurant_id) {
        console.warn("Attempted to add item from different restaurant.");
        return state;
      }
      
      const existingItemIndex = state.items.findIndex(item => item.id === newItem.id);
      let updatedItems: CartItem[];

      if (existingItemIndex >= 0) {
        updatedItems = [...state.items];
        updatedItems[existingItemIndex] = {
          ...updatedItems[existingItemIndex],
          quantity: updatedItems[existingItemIndex].quantity + 1
        };
      } else {
        const cartItem: CartItem = { ...newItem, quantity: 1 };
        updatedItems = [...state.items, cartItem];
      }
      
      return {
        ...state,
        items: updatedItems,
        restaurantId: newItem.restaurant_id,
        totalAmount: calculateTotalAmount(updatedItems)
      };
    }
    
    case "REMOVE_ITEM": {
      const updatedItems = state.items.filter(item => item.id !== action.payload);
      const newState = {
        ...state,
        items: updatedItems,
        totalAmount: calculateTotalAmount(updatedItems),
        restaurantId: updatedItems.length === 0 ? null : state.restaurantId,
      };
      return newState;
    }
    
    case "UPDATE_QUANTITY": {
      const { id, quantity } = action.payload;
      if (quantity <= 0) {
        return cartReducer(state, { type: "REMOVE_ITEM", payload: id });
      }
      const updatedItems = state.items.map(item =>
        item.id === id ? { ...item, quantity: Number(quantity) || 1 } : item
      );
      return {
        ...state,
        items: updatedItems,
        totalAmount: calculateTotalAmount(updatedItems)
      };
    }

    case "CLEAR_CART": {
        return { ...initialState };
    }
    
    default:
      return state;
  }
};

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cart, dispatch] = useReducer(cartReducer, initialState, (init) => {
    try {
      const savedCart = localStorage.getItem("cart");
      if (savedCart) {
        const parsed = JSON.parse(savedCart);
        if (parsed && Array.isArray(parsed.items) && typeof parsed.restaurantId === 'string' || parsed.restaurantId === null) {
           parsed.totalAmount = calculateTotalAmount(parsed.items);
           return parsed as CartState;
        }
      }
    } catch (error) {
      console.error("Error reading cart from localStorage:", error);
      localStorage.removeItem("cart");
    }
    return init;
  });
  
  useEffect(() => {
    try {
        const stateToSave = { 
            items: cart.items, 
            restaurantId: cart.restaurantId 
        };
        localStorage.setItem("cart", JSON.stringify(stateToSave));
    } catch (error) {
        console.error("Error saving cart to localStorage:", error);
    }
  }, [cart.items, cart.restaurantId]);
  
  const addItem = (item: MenuItem) => {
    if (!item || !item.id || typeof item.price !== 'number') {
        console.error("Attempted to add invalid item:", item);
        return;
    }
    dispatch({ type: "ADD_ITEM", payload: { item } });
  };
  
  const removeItem = (id: string) => {
    dispatch({ type: "REMOVE_ITEM", payload: id });
  };
  
  const updateQuantity = (id: string, quantity: number) => {
    dispatch({ type: "UPDATE_QUANTITY", payload: { id, quantity } });
  };
  
  const clearCart = () => {
    dispatch({ type: "CLEAR_CART" });
  };

  const itemCount = cart.items.reduce((count, item) => count + item.quantity, 0);
  
  const contextValue: CartContextType = {
    cart,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    itemCount,
  };

  return (
    <CartContext.Provider value={contextValue}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};
