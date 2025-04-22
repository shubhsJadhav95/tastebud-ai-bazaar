import React, { createContext, useContext, useReducer, useEffect } from "react";
import { MenuItem } from "@/types";

// --- Tiered Discount Logic Helper --- (Moved outside for clarity, used by reducer)
interface DiscountTier {
  coinsNeeded: number;
  discountPercent: number;
}
const getDiscountTierForCoins = (availableCoins: number): DiscountTier | null => {
  if (availableCoins >= 800) return { coinsNeeded: 800, discountPercent: 80 };
  if (availableCoins >= 700) return { coinsNeeded: 700, discountPercent: 70 };
  if (availableCoins >= 500) return { coinsNeeded: 500, discountPercent: 60 };
  if (availableCoins >= 400) return { coinsNeeded: 400, discountPercent: 40 };
  if (availableCoins >= 300) return { coinsNeeded: 300, discountPercent: 30 };
  if (availableCoins >= 200) return { coinsNeeded: 200, discountPercent: 20 };
  if (availableCoins >= 100) return { coinsNeeded: 100, discountPercent: 10 };
  return null;
};
// --- End Tiered Discount Logic ---

export interface CartItem extends MenuItem {
  quantity: number;
}

interface CartState {
  items: CartItem[];
  restaurantId: string | null;
  subtotal: number;
  appliedCouponCode: string | null;
  couponDiscountAmount: number;
  // Coin state
  appliedCoins: number; // How many coins are currently applied (due to auto-apply)
  coinDiscountAmount: number; // Discount amount from applied coins
  // Final total
  totalAmount: number;
}

type CartAction =
  | { type: "ADD_ITEM"; payload: { item: MenuItem } }
  | { type: "REMOVE_ITEM"; payload: string }
  | { type: "UPDATE_QUANTITY"; payload: { id: string; quantity: number } }
  | { type: "CLEAR_CART" }
  | { type: "APPLY_COUPON"; payload: { code: string; discountAmount: number } }
  | { type: "REMOVE_COUPON" }
  | { type: "APPLY_COINS"; payload: { coins: number; discountAmount: number } }
  | { type: "REMOVE_COINS" };

interface CartContextType {
  cart: CartState;
  addItem: (item: MenuItem) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  applyCoupon: (code: string, discountAmount: number) => void;
  removeCoupon: () => void;
  applyCoins: (coins: number, discountAmount: number) => void;
  removeCoins: () => void;
  itemCount: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const initialState: CartState = {
  items: [],
  restaurantId: null,
  subtotal: 0,
  appliedCouponCode: null,
  couponDiscountAmount: 0,
  appliedCoins: 0,
  coinDiscountAmount: 0,
  totalAmount: 0,
};

// Helper to calculate subtotal (before discounts)
const calculateSubtotal = (items: CartItem[]): number => {
  return items.reduce((sum, item) => sum + (Number(item.price) || 0) * item.quantity, 0);
};

// Helper to calculate final total amount considering discounts
const calculateFinalTotal = (subtotal: number, couponDiscount: number, coinDiscount: number): number => {
    const total = subtotal - couponDiscount - coinDiscount;
    return Math.max(0, total); // Prevent negative totals
};

const cartReducer = (state: CartState, action: CartAction): CartState => {
  let newState = { ...state }; // Start with a copy of the current state

  switch (action.type) {
    case "ADD_ITEM": {
      const newItem = action.payload.item;
      if (!newItem || typeof newItem.price !== 'number') return state; // Invalid item

      let updatedItems: CartItem[];
      let newRestaurantId = state.restaurantId;

      if (state.items.length === 0) {
        // First item, set restaurant ID
        newRestaurantId = newItem.restaurant_id;
        updatedItems = [{ ...newItem, quantity: 1 }];
      } else if (state.restaurantId && state.restaurantId !== newItem.restaurant_id) {
        // Item from different restaurant, clear cart and add new item
        console.warn("Adding item from different restaurant. Clearing previous cart.");
        newRestaurantId = newItem.restaurant_id;
        updatedItems = [{ ...newItem, quantity: 1 }];
        // Reset discounts when clearing for new restaurant
        newState = { ...initialState }; // Reset fully
      } else {
        // Item from the same restaurant
        const existingItemIndex = state.items.findIndex(item => item.id === newItem.id);
        if (existingItemIndex >= 0) {
          // Increase quantity
          updatedItems = [...state.items];
          updatedItems[existingItemIndex] = { ...updatedItems[existingItemIndex], quantity: updatedItems[existingItemIndex].quantity + 1 };
        } else {
          // Add new item
          updatedItems = [...state.items, { ...newItem, quantity: 1 }];
        }
        newRestaurantId = state.restaurantId; // Restaurant ID remains the same
      }
      newState.items = updatedItems;
      newState.restaurantId = newRestaurantId;
      break; // Recalculate totals below
    }

    case "REMOVE_ITEM": {
      newState.items = state.items.filter(item => item.id !== action.payload);
      if (newState.items.length === 0) {
          newState.restaurantId = null;
          // Reset discounts if cart becomes empty
          newState.appliedCouponCode = null;
          newState.couponDiscountAmount = 0;
          newState.appliedCoins = 0;
          newState.coinDiscountAmount = 0;
      }
      break; // Recalculate totals below
    }

    case "UPDATE_QUANTITY": {
      const { id, quantity } = action.payload;
      if (quantity <= 0) {
        // Remove item if quantity is zero or less
        newState.items = state.items.filter(item => item.id !== id);
      } else {
        newState.items = state.items.map(item => item.id === id ? { ...item, quantity: Number(quantity) || 1 } : item );
      }
       if (newState.items.length === 0) {
          newState.restaurantId = null;
          // Reset discounts if cart becomes empty
          newState.appliedCouponCode = null;
          newState.couponDiscountAmount = 0;
          newState.appliedCoins = 0;
          newState.coinDiscountAmount = 0;
       }
      break; // Recalculate totals below
    }

    case "CLEAR_CART": {
      // Reset fully
      return { ...initialState };
    }

    case "APPLY_COUPON": {
        const { code, discountAmount } = action.payload;
        const tempSubtotal = calculateSubtotal(state.items); // Use current items for subtotal
        const actualDiscount = Math.min(tempSubtotal, discountAmount);
        
        // Applying a coupon removes coin discount
        newState.appliedCouponCode = code;
        newState.couponDiscountAmount = actualDiscount;
        newState.appliedCoins = 0; 
        newState.coinDiscountAmount = 0;
        newState.subtotal = tempSubtotal; // Update subtotal explicitly here
        newState.totalAmount = calculateFinalTotal(tempSubtotal, actualDiscount, 0);
        return newState; // Return early as totals are calculated here
    }
    case "REMOVE_COUPON": {
        newState.appliedCouponCode = null;
        newState.couponDiscountAmount = 0;
        // Recalculate totals below (no auto coin logic anymore)
        break;
    }
    case "APPLY_COINS": {
         const { coins, discountAmount } = action.payload;
         const tempSubtotal = calculateSubtotal(state.items);
         const actualDiscount = Math.min(tempSubtotal, discountAmount);
         
         // Applying coins removes coupon discount
         newState.appliedCoins = coins;
         newState.coinDiscountAmount = actualDiscount;
         newState.appliedCouponCode = null;
         newState.couponDiscountAmount = 0;
         newState.subtotal = tempSubtotal;
         newState.totalAmount = calculateFinalTotal(tempSubtotal, 0, actualDiscount);
         return newState;
     }
     case "REMOVE_COINS": {
         newState.appliedCoins = 0;
         newState.coinDiscountAmount = 0;
         // Recalculate totals below
         break;
     }

    default:
      return state; // No change for unknown actions
  }

  // --- Recalculate Subtotal and Final Total (Simpler version) ---
  // This runs after ADD_ITEM, REMOVE_ITEM, UPDATE_QUANTITY, REMOVE_COUPON, REMOVE_COINS
  
  newState.subtotal = calculateSubtotal(newState.items);

  // Recalculate discounts based on new subtotal, ensuring they don't exceed it
  newState.couponDiscountAmount = newState.appliedCouponCode ? Math.min(newState.subtotal, newState.couponDiscountAmount) : 0;
  newState.coinDiscountAmount = newState.appliedCoins > 0 ? Math.min(newState.subtotal, newState.coinDiscountAmount) : 0;
  
  // Ensure only one discount type is active
  if (newState.couponDiscountAmount > 0) {
      newState.appliedCoins = 0;
      newState.coinDiscountAmount = 0;
  } else if (newState.coinDiscountAmount > 0) {
      newState.appliedCouponCode = null;
      newState.couponDiscountAmount = 0;
  } 

  // Calculate final total
  newState.totalAmount = calculateFinalTotal(
      newState.subtotal, 
      newState.couponDiscountAmount, 
      newState.coinDiscountAmount
  );

  return newState;
};


export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cart, dispatch] = useReducer(cartReducer, initialState, (init) => {
    // Load saved cart items and restaurant ID from localStorage
    try {
      const savedCart = localStorage.getItem("cart");
      if (savedCart) {
        const parsed = JSON.parse(savedCart);
        if (parsed && Array.isArray(parsed.items)) {
           const loadedItems = parsed.items as CartItem[];
           const loadedRestaurantId = typeof parsed.restaurantId === 'string' ? parsed.restaurantId : null;
           const loadedSubtotal = calculateSubtotal(loadedItems);
           return {
                ...initialState, 
                items: loadedItems,
                restaurantId: loadedRestaurantId,
                subtotal: loadedSubtotal,
                totalAmount: loadedSubtotal, 
           };
        }
      }
    } catch (error) {
      console.error("Error reading cart from localStorage:", error);
      localStorage.removeItem("cart"); // Clear corrupted cart
    }
    return init; // Return initial state if loading fails
  });
  
  // Save only items and restaurant ID to localStorage
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
  
  // --- Dispatcher functions ---
  const addItem = (item: MenuItem) => dispatch({ type: "ADD_ITEM", payload: { item } });
  const removeItem = (id: string) => dispatch({ type: "REMOVE_ITEM", payload: id });
  const updateQuantity = (id: string, quantity: number) => dispatch({ type: "UPDATE_QUANTITY", payload: { id, quantity } });
  const clearCart = () => dispatch({ type: "CLEAR_CART" });
  const applyCoupon = (code: string, discountAmount: number) => 
      dispatch({ type: "APPLY_COUPON", payload: { code, discountAmount } });
  const removeCoupon = () => dispatch({ type: "REMOVE_COUPON" });
  const applyCoins = (coins: number, discountAmount: number) => dispatch({ type: "APPLY_COINS", payload: { coins, discountAmount } });
  const removeCoins = () => dispatch({ type: "REMOVE_COINS" });

  const itemCount = cart.items.reduce((count, item) => count + item.quantity, 0);
  
  const contextValue: CartContextType = {
    cart,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    applyCoupon,
    removeCoupon,
    applyCoins,
    removeCoins,
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
