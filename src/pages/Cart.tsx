import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import NavBar from "../components/NavBar";
import Footer from "../components/Footer";
import OrderItem from "../components/OrderItem";
import { useCart } from "../context/CartContext";
import { useAuthContext } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { offers } from "../utils/mockData";
import { ShoppingBag, Truck, CreditCard, Tag, X, IndianRupee } from "lucide-react";
import { useIsMobile } from "../hooks/use-mobile";
import { db } from "@/integrations/firebase/client";
import { collection, doc, writeBatch, serverTimestamp, FieldValue } from "firebase/firestore";
import { Order, OrderItem as OrderItemType, OrderStatus } from "@/types";

// Define a type for the data being written, allowing serverTimestamp for createdAt
// Explicitly define the type again to ensure correctness
type NewOrderData = Omit<Order, 'id' | 'createdAt'> & { 
  createdAt: FieldValue 
};

const Cart: React.FC = () => {
  const { cart, removeItem, updateQuantity, clearCart } = useCart();
  const { user, profile } = useAuthContext();
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<any>(null);
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("card");
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  const deliveryFee = 49;
  const tax = cart.totalAmount * 0.05;
  
  // Calculate discount if coupon is applied
  const discount = appliedCoupon 
    ? appliedCoupon.discount >= 1 
      ? (appliedCoupon.discount / 100) * cart.totalAmount 
      : appliedCoupon.discount
    : 0;
  
  const totalAmount = cart.totalAmount + deliveryFee + tax - discount;

  const handleApplyCoupon = () => {
    const foundCoupon = offers.find(offer => 
      offer.code.toLowerCase() === couponCode.toLowerCase()
    );
    
    if (foundCoupon) {
      setAppliedCoupon(foundCoupon);
      toast.success(`Coupon ${foundCoupon.code} applied successfully!`);
    } else {
      toast.error("Invalid coupon code");
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode("");
    toast.success("Coupon removed");
  };

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

    // 1. Generate a new Order ID for Firestore
    const newOrderRef = doc(collection(db, "orders"));
    const newOrderId = newOrderRef.id;

    // 2. Prepare the Order data matching the Firestore Order type
    const orderData: NewOrderData = {
      customer_id: user.uid,
      restaurant_id: cart.restaurantId,
      items: cart.items.map(item => ({
        menuItemId: item.id,
        name: item.name,
        quantity: item.quantity,
        price: item.price,
      })) as OrderItemType[],
      totalAmount: totalAmount,
      status: 'Pending' as OrderStatus,
      deliveryAddress: {
        street: deliveryAddress,
        city: "",
        state: "",
        zip: "",
        notes: "",
      },
      customerName: user.displayName || profile?.full_name || user.email || 'N/A',
      customerPhone: profile?.phone || 'N/A',
      paymentMethod: paymentMethod,
      createdAt: serverTimestamp(),
    };

    // 3. Create a Write Batch
    const batch = writeBatch(db);

    // 4. Set the main order document
    batch.set(newOrderRef, orderData);

    // 5. Set the user's order subcollection document
    const userOrderRef = doc(db, "users", user.uid, "orders", newOrderId);
    batch.set(userOrderRef, orderData);

    try {
      // 6. Commit the batch
      await batch.commit();

      // 7. Clear cart (local state)
      clearCart();

      // 8. Navigate to the order tracking page (pass the new ID)
      toast.success("Order placed successfully!");
      navigate("/order-tracking");

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
              <h2 className="text-lg font-semibold mb-3">
                {cart.restaurantName} ({cart.items.length} {cart.items.length === 1 ? "item" : "items"})
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
              <h2 className="text-lg font-semibold mb-3">Delivery Information</h2>
              
              <div className="mb-4">
                <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                  Delivery Address
                </label>
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
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Payment Method
                </label>
                <div className="space-y-2">
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
            <div className="bg-white rounded-lg shadow-sm p-4 sticky top-20">
              <h2 className="text-lg font-semibold mb-3">Order Summary</h2>
              
              <div className="space-y-3 mb-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Item Total</span>
                  <span className="flex items-center">
                    <IndianRupee size={14} className="mr-1" />
                    {cart.totalAmount.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Delivery Fee</span>
                  <span className="flex items-center">
                    <IndianRupee size={14} className="mr-1" />
                    {deliveryFee.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">GST (5%)</span>
                  <span className="flex items-center">
                    <IndianRupee size={14} className="mr-1" />
                    {tax.toFixed(2)}
                  </span>
                </div>
                
                {appliedCoupon && (
                  <div className="flex justify-between text-green-600">
                    <span className="flex items-center">
                      Discount ({appliedCoupon.code})
                      <button
                        onClick={handleRemoveCoupon}
                        className="ml-2 text-gray-400 hover:text-gray-600"
                      >
                        <X size={14} />
                      </button>
                    </span>
                    <span className="flex items-center">
                      -<IndianRupee size={14} className="mx-1" />
                      {discount.toFixed(2)}
                    </span>
                  </div>
                )}
                
                <div className="border-t pt-3 flex justify-between font-bold">
                  <span>Total</span>
                  <span className="flex items-center">
                    <IndianRupee size={16} className="mr-1" />
                    {totalAmount.toFixed(2)}
                  </span>
                </div>
              </div>
              
              {/* Coupon */}
              {!appliedCoupon && (
                <div className="mb-4">
                  <label htmlFor="coupon" className="block text-sm font-medium text-gray-700 mb-1">
                    Coupon Code
                  </label>
                  <div className="flex">
                    <input
                      type="text"
                      id="coupon"
                      className="input-field rounded-r-none flex-grow text-sm"
                      placeholder="Enter coupon code"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                    />
                    <button
                      onClick={handleApplyCoupon}
                      className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-2 px-3 rounded-r-md text-sm"
                      disabled={!couponCode}
                    >
                      Apply
                    </button>
                  </div>
                  <div className="mt-2 text-xs text-gray-500 flex items-center">
                    <Tag size={12} className="mr-1" />
                    <span>Try WELCOME50 for 50% off your first order</span>
                  </div>
                </div>
              )}
              
              {/* Checkout Button */}
              <button
                onClick={handleCheckout}
                className="btn-primary w-full flex justify-center items-center"
                disabled={!cart.items.length}
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
