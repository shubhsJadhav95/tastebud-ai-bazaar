import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import NavBar from "../components/NavBar";
import Footer from "../components/Footer";
import OrderItem from "../components/OrderItem";
import { useCart } from "../context/CartContext";
import { useAuthContext } from "@/contexts/AuthContext";
import { userService } from "@/services/userService";
import { toast } from "sonner";
import { ShoppingBag, Truck, CreditCard, Tag, X, IndianRupee, Gift, Coins, Loader2, User, Phone } from "lucide-react";
import { useIsMobile } from "../hooks/use-mobile";
import { db } from "@/integrations/firebase/client";
import { collection, doc, writeBatch, serverTimestamp, FieldValue, query, where, getDocs, limit } from "firebase/firestore";
import { Order, OrderItem as OrderItemType, OrderStatus, UserProfile } from "@/types";

// Define a type for the data being written, allowing serverTimestamp for createdAt
// Explicitly define the type again to ensure correctness
type NewOrderData = Omit<Order, 'id' | 'createdAt'> & { 
  createdAt: FieldValue 
};

// --- Tiered Discount Logic ---
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

const Cart: React.FC = () => {
  const { cart, removeItem, updateQuantity, clearCart, applyCoupon, removeCoupon, applyCoins, removeCoins } = useCart();
  const { user, profile: authProfile, loading: authLoading } = useAuthContext();
  const [couponCode, setCouponCode] = useState("");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("card");
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  const [currentProfile, setCurrentProfile] = useState<UserProfile | null>(authProfile);
  const [isApplyingCode, setIsApplyingCode] = useState(false);

  useEffect(() => {
    console.log("Cart profile useEffect triggered.");
    let isMounted = true;
    const fetchProfile = async (userId: string) => {
        console.log(`Fetching profile for userId: ${userId}`);
        try {
            const profileData = await userService.getUserProfile(userId);
            console.log("Fetched profile data:", profileData);
            if (isMounted) {
                 setCurrentProfile(profileData);
                 console.log("Set currentProfile with fetched data.");
                 if(profileData){
                    setDeliveryAddress(prev => prev || profileData.address || "");
                    setCustomerName(prev => prev || profileData.full_name || "");
                    setCustomerPhone(prev => prev || profileData.phone || "");
                 }
            }
        } catch (error) {
            console.error("Failed to fetch user profile for cart:", error);
            if (isMounted) {
                 setCurrentProfile(null);
                 console.log("Set currentProfile to null due to fetch error.");
            }
        }
    };

    if (user?.uid && !authLoading) {
        console.log(`User found (UID: ${user.uid}), authLoading: ${authLoading}`);
        if (authProfile) {
             console.log("Using profile from AuthContext:", authProfile);
             setCurrentProfile(authProfile);
             console.log("Set currentProfile with AuthContext data.");
             setDeliveryAddress(prev => prev || authProfile.address || "");
             setCustomerName(prev => prev || authProfile.full_name || "");
             setCustomerPhone(prev => prev || authProfile.phone || "");
        } else {
            console.log("Profile not in AuthContext, attempting fetch...");
            fetchProfile(user.uid);
        }
    } else if (!authLoading) {
        console.log(`No user or finished loading without user (authLoading: ${authLoading})`);
        setCurrentProfile(null);
        console.log("Set currentProfile to null (no user).");
        setDeliveryAddress("");
        setCustomerName("");
        setCustomerPhone("");
    } else {
        console.log("Auth is still loading...");
    }

    return () => {
        console.log("Cart profile useEffect cleanup.");
        isMounted = false
    };
    
  }, [user, authProfile, authLoading]);

  // --- Calculations --- 
  const deliveryFee = 49;
  const taxRate = 0.05;
  const tax = cart.subtotal * taxRate;
  const couponDiscount = cart.couponDiscountAmount;
  const coinDiscount = cart.coinDiscountAmount;
  const totalAmount = cart.totalAmount;
  const availableCoins = currentProfile?.supercoins || 0;
  const appliedCoins = cart.appliedCoins;

  const applicableTier = getDiscountTierForCoins(availableCoins);

  let potentialCoinDiscountAmount = 0;
  if (applicableTier) {
      potentialCoinDiscountAmount = Math.min(
          cart.subtotal, 
          cart.subtotal * (applicableTier.discountPercent / 100)
      );
  }

  // Updated handler for applying coupons, user's own code, OR using "SUPERCOINS" keyword
  const handleApplyCode = async () => {
    const codeToApply = couponCode.trim().toUpperCase();
    if (!codeToApply) return;
    
    setIsApplyingCode(true);
    console.log(`Attempting to apply standard coupon: "${codeToApply}"`); 

    const standardCoupons: { [code: string]: number } = {
        "TASTEBUD10": 50,
        "WELCOME50": cart.subtotal * 0.5,
    };

    if (standardCoupons[codeToApply] !== undefined) {
        const discountAmount = standardCoupons[codeToApply];
        const actualDiscount = Math.min(cart.subtotal, discountAmount);
        
        if (actualDiscount > 0) {
            applyCoupon(codeToApply, actualDiscount);
            setCouponCode("");
            toast.success(`Coupon ${codeToApply} applied!`);
        } else {
            toast.info("Coupon value is zero or cart is empty.");
        }
    } else {
        toast.error(`Invalid coupon code: ${codeToApply}`);
    }

    setIsApplyingCode(false);
  };

  const handleRemoveCoupon = () => {
    removeCoupon();
    setCouponCode("");
    toast.success("Coupon removed");
  };

  // --- Quantity Handlers --- 
  const handleIncreaseQuantity = (id: string) => {
    const item = cart.items.find(item => item.id === id);
    if (item) {
      updateQuantity(id, item.quantity + 1);
    }
  };

  const handleDecreaseQuantity = (id: string) => {
    const item = cart.items.find(item => item.id === id);
    if (item && item.quantity > 1) {
      updateQuantity(id, item.quantity - 1);
    } else if (item) {
      removeItem(id);
    }
  };

  // --- Re-add Supercoins handlers --- 
  const handleApplyCoins = () => {
      if (applicableTier && potentialCoinDiscountAmount > 0) {
          applyCoins(applicableTier.coinsNeeded, potentialCoinDiscountAmount);
          toast.success(`Applied ${applicableTier.coinsNeeded} Supercoins for ${applicableTier.discountPercent}% off!`);
      } else {
          toast.info("Not enough Supercoins for a discount or cart is empty.");
      }
  };

  const handleRemoveCoins = () => {
      removeCoins();
      toast.info("Supercoin discount removed.");
  };

  // --- Checkout Handler (No changes needed here for this logic) --- 
  const handleCheckout = async () => {
    if (!user) {
      toast.error("Please log in to place an order.");
      navigate("/customer/login");
      return;
    }
    if (!deliveryAddress) {
      toast.error("Please enter a delivery address");
      return;
    }
    if (cart.items.length === 0) {
      toast.error("Your cart is empty.");
      return;
    }
    if (!cart.restaurantId) {
      toast.error("Restaurant information is missing from the cart.");
      return;
    }

    const newOrderRef = doc(collection(db, "orders"));
    const newOrderId = newOrderRef.id;

    const orderData: NewOrderData = {
      customer_id: user.uid,
      restaurant_id: cart.restaurantId,
      items: cart.items.map(item => ({
        menuItemId: item.id,
        name: item.name,
        quantity: item.quantity,
        price: item.price,
      })) as OrderItemType[],
      subtotal: cart.subtotal,
      couponCode: cart.appliedCouponCode,
      couponDiscount: cart.couponDiscountAmount,
      coinsApplied: cart.appliedCoins,
      coinDiscount: cart.coinDiscountAmount,
      deliveryFee: deliveryFee,
      tax: tax,
      totalAmount: cart.totalAmount,
      status: 'Pending' as OrderStatus,
      deliveryAddress: {
        street: deliveryAddress,
        city: "", // Assuming city/state/zip are not collected or needed here
        state: "",
        zip: "",
        notes: "",
      },
      customerName: customerName || user?.email || 'N/A',
      customerPhone: customerPhone || 'N/A',
      paymentMethod: paymentMethod,
      createdAt: serverTimestamp(),
    };

    const batch = writeBatch(db);
    batch.set(newOrderRef, orderData);
    const userOrderRef = doc(db, "users", user.uid, "orders", newOrderId);
    batch.set(userOrderRef, orderData);

    try {
      await batch.commit();
      localStorage.setItem("latestOrderId", newOrderId);
      toast.success("Order placed successfully!");

      // --- Post-Order Actions --- 
      const postOrderPromises = [];

      // 1. Apply Coin Discount to User Profile (if coins were manually applied)
      if (cart.appliedCoins > 0 && cart.coinDiscountAmount > 0) { 
          postOrderPromises.push(
              userService.applyCoinDiscountToUser(user!.uid, cart.appliedCoins, cart.coinDiscountAmount)
                .then(() => toast.info(`${cart.appliedCoins} Supercoins used for discount.`))
                .catch(err => {
                     console.error("CRITICAL: Failed to apply coin discount to user profile:", err);
                     toast.error("CRITICAL: Failed to update Supercoin balance/stats! Please contact support.");
                })
          );
      } 
      
      await Promise.all(postOrderPromises);
      clearCart();
      // Navigate to the new success page, passing the order ID in state
      console.log(`NAVIGATING to /order-success with orderId: ${newOrderId}`);
      navigate("/order-success", { state: { orderId: newOrderId } });

    } catch (error) {
      console.error("Error placing order in Firestore:", error);
      toast.error("Failed to place order. Please try again.");
    }
  };

  if (cart.items.length === 0) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <NavBar />
        <div className="flex-grow flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <ShoppingBag size={64} className="mx-auto text-gray-300 mb-4" />
            <h2 className="text-2xl font-bold mb-2">Your cart is empty</h2>
            <p className="text-gray-600 mb-6">
              Looks like you haven't added any items to your cart yet.
            </p>
            <button
              onClick={() => navigate("/customer/home")}
              className="bg-food-primary text-white px-6 py-3 rounded-md hover:bg-orange-600 transition-colors"
            >
              Browse Restaurants
            </button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <NavBar />
      
      <div className="flex-grow py-6 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <h1 className="text-xl font-bold mb-6">Your Cart</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm p-4 mb-4">
              {/* Display restaurant name if available (Assuming it might be on cart state later) */}
              <h2 className="text-lg font-semibold mb-3">
                {/* {cart.restaurantName ? `${cart.restaurantName} ` : ''} */} ({cart.items.length} {cart.items.length === 1 ? "item" : "items"})
              </h2>
              
              <div className="divide-y">
                {cart.items.map(item => (
                  <OrderItem
                    key={item.id}
                    item={item}
                    showControls={true}
                    onIncrease={handleIncreaseQuantity}
                    onDecrease={handleDecreaseQuantity}
                    onRemove={removeItem}
                  />
                ))}
              </div>
            </div>
            
            {/* Delivery Info */}
            <div className="bg-white rounded-lg shadow-sm p-4">
              <h2 className="text-lg font-semibold mb-4">Delivery & Contact Information</h2>
              
              {/* Name Input */} 
              <div className="mb-4">
                  <label htmlFor="customerName" className="block text-sm font-medium text-gray-700 mb-1">Contact Name</label>
                  <div className="relative rounded-md shadow-sm">
                      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                          <User className="h-5 w-5 text-gray-400" aria-hidden="true" />
                      </div>
                      <input
                          type="text"
                          name="customerName"
                          id="customerName"
                          className="input-field block w-full pl-10"
                          placeholder="Enter contact name"
                          value={customerName}
                          onChange={(e) => setCustomerName(e.target.value)}
                      />
                  </div>
              </div>
              
              {/* Phone Input */} 
               <div className="mb-4">
                  <label htmlFor="customerPhone" className="block text-sm font-medium text-gray-700 mb-1">Contact Phone</label>
                  <div className="relative rounded-md shadow-sm">
                      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                          <Phone className="h-5 w-5 text-gray-400" aria-hidden="true" />
                      </div>
                      <input
                          type="tel" // Use tel type for better mobile input
                          name="customerPhone"
                          id="customerPhone"
                          className="input-field block w-full pl-10"
                          placeholder="Enter contact phone number"
                          value={customerPhone}
                          onChange={(e) => setCustomerPhone(e.target.value)}
                      />
                  </div>
              </div>
              
              {/* Address Input */}
              <div className="mb-4">
                <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">Delivery Address</label>
                <textarea
                  id="address"
                  rows={isMobile ? 2 : 3}
                  className="input-field"
                  placeholder="Enter your full delivery address"
                  value={deliveryAddress}
                  onChange={(e) => setDeliveryAddress(e.target.value)}
                  required
                ></textarea>
              </div>
              
              {/* Payment Method */} 
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Payment Method
                </label>
                <div className="space-y-2">
                  {/* Radio buttons for payment methods remain the same */}
                   <div className="flex items-center">
                    <input
                      id="card"
                      name="paymentMethod"
                      type="radio"
                      className="h-4 w-4 text-food-primary focus:ring-food-primary"
                      value="card"
                      checked={paymentMethod === "card"}
                      onChange={() => setPaymentMethod("card")}
                    />
                    <label htmlFor="card" className="ml-2 block text-sm text-gray-900">
                      Credit/Debit Card
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input
                      id="upi"
                      name="paymentMethod"
                      type="radio"
                      className="h-4 w-4 text-food-primary focus:ring-food-primary"
                      value="upi"
                      checked={paymentMethod === "upi"}
                      onChange={() => setPaymentMethod("upi")}
                    />
                    <label htmlFor="upi" className="ml-2 block text-sm text-gray-900">
                      UPI
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input
                      id="cash"
                      name="paymentMethod"
                      type="radio"
                      className="h-4 w-4 text-food-primary focus:ring-food-primary"
                      value="cash"
                      checked={paymentMethod === "cash"}
                      onChange={() => setPaymentMethod("cash")}
                    />
                    <label htmlFor="cash" className="ml-2 block text-sm text-gray-900">
                      Cash on Delivery
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-4 sticky top-20 space-y-4">
              <h2 className="text-lg font-semibold border-b pb-2">Order Summary</h2>
              
              {/* --- Re-added Supercoins Section --- */}
              <div className="border-b pb-3">
                  <h3 className="text-sm font-medium mb-2 flex items-center">
                      <Coins size={16} className="mr-2 text-yellow-500"/> Supercoins
                  </h3>
                  <p className="text-xs text-gray-600 mb-2">Balance: {availableCoins} coins</p>
                  
                  {/* If coins are currently applied */} 
                  {cart.appliedCoins > 0 && (
                       <div className="flex justify-between items-center text-sm bg-green-50 p-2 rounded border border-green-200">
                          <span className="text-green-700 font-medium">
                               <Gift size={14} className="inline mr-1"/> {getDiscountTierForCoins(cart.appliedCoins)?.discountPercent}% Discount Applied! (-₹{cart.coinDiscountAmount.toFixed(2)})
                           </span>
                           <button onClick={handleRemoveCoins} className="text-red-500 hover:text-red-700 text-xs font-semibold">Remove</button>
                       </div>
                  )}
                  
                  {/* If coins are NOT applied, show button for highest applicable tier */} 
                  {cart.appliedCoins === 0 && applicableTier && (
                       <button 
                           onClick={handleApplyCoins}
                           disabled={!!cart.appliedCouponCode || potentialCoinDiscountAmount <= 0}
                           className="w-full text-sm btn-secondary py-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
                       >
                          Apply {applicableTier.coinsNeeded} coins for {applicableTier.discountPercent}% off (₹{potentialCoinDiscountAmount.toFixed(2)})
                       </button>
                  )} 
                  
                  {/* If user doesn't qualify for any tier */} 
                   {cart.appliedCoins === 0 && !applicableTier && (
                       <p className="text-xs text-gray-500 italic">Need 100 coins for 10% off!</p>
                  )}
                  
                  {/* Message if coupon blocking coins */} 
                  {cart.appliedCouponCode && cart.appliedCoins === 0 && applicableTier && (
                      <p className="text-xs text-orange-600 mt-1">Cannot apply coins when a coupon is active.</p>
                  )}
              </div>

              {/* --- Coupon Code Section --- */}
              <div className="border-b pb-3">
                  <h3 className="text-sm font-medium mb-2 flex items-center">
                      <Tag size={16} className="mr-2 text-blue-500"/> Coupon Code
                  </h3>
                  
                  {/* Display applied Coupon */} 
                  {cart.appliedCouponCode ? (
                      <div className="flex justify-between items-center text-sm bg-green-50 p-2 rounded border border-green-200 mb-2">
                           <span className="text-green-700 font-medium">
                              Code "{cart.appliedCouponCode}" Applied! (-₹{cart.couponDiscountAmount.toFixed(2)})
                           </span>
                           <button onClick={handleRemoveCoupon} className="text-red-500 hover:text-red-700 text-xs font-semibold">Remove</button>
                      </div>
                  ) : (
                       // Show input only if NO coupon applied
                       <> 
                         <div className="flex space-x-2"> 
                           <input
                               type="text"
                               placeholder="Enter coupon code"
                               className="input-field flex-grow text-sm py-1.5"
                               value={couponCode}
                               onChange={(e) => setCouponCode(e.target.value)}
                               disabled={isApplyingCode || cart.appliedCoins > 0}
                           />
                           <button 
                               onClick={handleApplyCode}
                               disabled={!couponCode || isApplyingCode || cart.appliedCoins > 0}
                               className="btn-secondary text-sm py-1.5 px-3 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                           >
                               {isApplyingCode ? <Loader2 className="h-4 w-4 animate-spin mr-1"/> : null}
                               Apply
                           </button>
                         </div>
                       </>
                  )}
                   {/* Message if coins blocking coupon */} 
                  {cart.appliedCoins > 0 && (
                      <p className="text-xs text-orange-600 mt-1">Cannot apply coupon when Supercoins are used.</p>
                  )}
              </div>

              {/* --- Price Breakdown --- */}
              <div className="space-y-1 text-sm border-b pb-3">
                <div className="flex justify-between"><span className="text-gray-600">Subtotal</span><span><IndianRupee size={12} className="inline mr-0.5"/>{cart.subtotal.toFixed(2)}</span></div>
                <div className="flex justify-between"><span className="text-gray-600">Delivery Fee</span><span><IndianRupee size={12} className="inline mr-0.5"/>{deliveryFee.toFixed(2)}</span></div>
                <div className="flex justify-between"><span className="text-gray-600">Taxes (5%)</span><span><IndianRupee size={12} className="inline mr-0.5"/>{tax.toFixed(2)}</span></div>
                
                {/* Display Coupon Discount if applied */} 
                {couponDiscount > 0 && cart.appliedCouponCode && (
                  <div className="flex justify-between text-green-600">
                      <span>Coupon Discount ({cart.appliedCouponCode})</span>
                      <span>-<IndianRupee size={12} className="inline mr-0.5"/>{couponDiscount.toFixed(2)}</span>
                  </div>
                )}
                {/* Display Coin Discount if applied */} 
                {coinDiscount > 0 && cart.appliedCoins > 0 && (
                  <div className="flex justify-between text-green-600">
                      <span>Supercoin Discount ({getDiscountTierForCoins(cart.appliedCoins)?.discountPercent}%)</span>
                      <span>-<IndianRupee size={12} className="inline mr-0.5"/>{coinDiscount.toFixed(2)}</span>
                  </div>
                )}
              </div>

              {/* Final Total */} 
              <div className="border-t pt-3 flex justify-between font-bold">
                <span>Total</span>
                <span className="flex items-center">
                  <IndianRupee size={16} className="mr-1" />
                  {cart.totalAmount.toFixed(2)} 
                </span>
              </div>

              {/* Checkout Button */}
              <button
                onClick={handleCheckout}
                className="btn-primary w-full flex justify-center items-center"
                disabled={!deliveryAddress.trim() || cart.items.length === 0}
              >
                <CreditCard size={18} className="mr-2" />
                Place Order
              </button>
              
              <div className="mt-3 text-center text-xs text-gray-500">
                By placing your order, you agree to our Terms of Service and Privacy Policy
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default Cart;
