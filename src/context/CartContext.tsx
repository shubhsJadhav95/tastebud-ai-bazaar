
import React, { createContext, useContext, useReducer, useEffect } from "react";

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  calories: number;
  restaurantId: string;
  restaurantName: string;
  nutrients: {
    protein: number;
    carbs: number;
    fat: number;
    fiber: number;
  };
  servingSize: string;
}

export interface CartItem extends MenuItem {
  quantity: number;
}

interface CartState {
  items: CartItem[];
  restaurantId: string | null;
  restaurantName: string | null;
  totalAmount: number;
  supercoins: number;
}

type CartAction =
  | { type: "ADD_ITEM"; payload: MenuItem }
  | { type: "REMOVE_ITEM"; payload: string }
  | { type: "UPDATE_QUANTITY"; payload: { id: string; quantity: number } }
  | { type: "CLEAR_CART" }
  | { type: "ADD_SUPERCOINS"; payload: number };

interface CartContextType {
  cart: CartState;
  addItem: (item: MenuItem) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  itemCount: number;
  addSupercoins: (amount: number) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const initialState: CartState = {
  items: [],
  restaurantId: null,
  restaurantName: null,
  totalAmount: 0,
  supercoins: 0
};

const calculateTotalAmount = (items: CartItem[]): number => {
  return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
};

// Price conversion function - no longer needed as prices are already in rupees
export const convertToRupees = (price: number): number => {
  return price;
};

const cartReducer = (state: CartState, action: CartAction): CartState => {
  switch (action.type) {
    case "ADD_ITEM": {
      const newItem = {
        ...action.payload
      };
      
      // Check if cart is empty or adding from same restaurant
      if (state.items.length === 0) {
        const cartItem: CartItem = {
          ...newItem,
          quantity: 1
        };
        
        return {
          ...state,
          items: [cartItem],
          restaurantId: newItem.restaurantId,
          restaurantName: newItem.restaurantName,
          totalAmount: calculateTotalAmount([cartItem])
        };
      }
      
      // If trying to add from a different restaurant
      if (state.restaurantId && state.restaurantId !== newItem.restaurantId) {
        alert("You can only order from one restaurant at a time!");
        return state;
      }
      
      // Check if item already in cart
      const existingItemIndex = state.items.findIndex(item => item.id === newItem.id);
      
      if (existingItemIndex >= 0) {
        // Increase quantity if already in cart
        const updatedItems = [...state.items];
        updatedItems[existingItemIndex] = {
          ...updatedItems[existingItemIndex],
          quantity: updatedItems[existingItemIndex].quantity + 1
        };
        
        return {
          ...state,
          items: updatedItems,
          totalAmount: calculateTotalAmount(updatedItems)
        };
      }
      
      // Add new item to cart
      const cartItem: CartItem = {
        ...newItem,
        quantity: 1
      };
      
      const updatedItems = [...state.items, cartItem];
      
      return {
        ...state,
        items: updatedItems,
        totalAmount: calculateTotalAmount(updatedItems)
      };
    }
    
    case "REMOVE_ITEM": {
      const updatedItems = state.items.filter(item => item.id !== action.payload);
      
      // Reset restaurant info if cart becomes empty
      const newState = {
        ...state,
        items: updatedItems,
        totalAmount: calculateTotalAmount(updatedItems)
      };
      
      if (updatedItems.length === 0) {
        newState.restaurantId = null;
        newState.restaurantName = null;
      }
      
      return newState;
    }
    
    case "UPDATE_QUANTITY": {
      const { id, quantity } = action.payload;
      
      if (quantity <= 0) {
        return cartReducer(state, { type: "REMOVE_ITEM", payload: id });
      }
      
      const updatedItems = state.items.map(item =>
        item.id === id ? { ...item, quantity } : item
      );
      
      return {
        ...state,
        items: updatedItems,
        totalAmount: calculateTotalAmount(updatedItems)
      };
    }
    
    case "ADD_SUPERCOINS": {
      return {
        ...state,
        supercoins: state.supercoins + action.payload
      };
    }
    
    default:
      return state;
  }
};

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cart, dispatch] = useReducer(cartReducer, initialState);
  
  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem("cart");
    if (savedCart) {
      try {
        const parsedCart = JSON.parse(savedCart);
        if (parsedCart.items && Array.isArray(parsedCart.items)) {
          // Clear cart first to ensure we don't have duplicates
          dispatch({ type: "CLEAR_CART" });
          
          // Add each item to the cart properly
          parsedCart.items.forEach((item: CartItem) => {
            // First add the item as a MenuItem (without quantity)
            const menuItem: MenuItem = {
              id: item.id,
              name: item.name,
              description: item.description,
              price: item.price,
              image: item.image,
              calories: item.calories,
              restaurantId: item.restaurantId,
              restaurantName: item.restaurantName,
              nutrients: item.nutrients,
              servingSize: item.servingSize
            };
            
            // Add the item to the cart
            dispatch({ type: "ADD_ITEM", payload: menuItem });
            
            // If quantity is more than 1, update it
            if (item.quantity > 1) {
              dispatch({ 
                type: "UPDATE_QUANTITY", 
                payload: { id: item.id, quantity: item.quantity }
              });
            }
          });
        }
        
        // Restore supercoins if available
        if (parsedCart.supercoins && typeof parsedCart.supercoins === 'number') {
          dispatch({ type: "ADD_SUPERCOINS", payload: parsedCart.supercoins });
        }
      } catch (error) {
        console.error("Error parsing cart from localStorage:", error);
        localStorage.removeItem("cart");
      }
    }
  }, []);
  
  // Save cart to localStorage when it changes
  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cart));
  }, [cart]);
  
  const addItem = (item: MenuItem) => {
    dispatch({ type: "ADD_ITEM", payload: item });
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
  
  const addSupercoins = (amount: number) => {
    dispatch({ type: "ADD_SUPERCOINS", payload: amount });
  };
  
  const itemCount = cart.items.reduce((count, item) => count + item.quantity, 0);
  
  return (
    <CartContext.Provider
      value={{
        cart,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        itemCount,
        addSupercoins
      }}
    >
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
