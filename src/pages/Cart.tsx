
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import NavBar from "../components/NavBar";
import Footer from "../components/Footer";
import OrderItem from "../components/OrderItem";
import { useCart } from "../context/CartContext";
import { toast } from "sonner";
import { offers } from "../utils/mockData";
import { ShoppingBag, Truck, CreditCard, Tag, X } from "lucide-react";

const Cart: React.FC = () => {
  const { cart, removeItem, updateQuantity, clearCart } = useCart();
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<any>(null);
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("card");
  const navigate = useNavigate();

  const deliveryFee = 2.99;
  const tax = cart.totalAmount * 0.08;
  
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

  const handleCheckout = () => {
    if (!deliveryAddress) {
      toast.error("Please enter a delivery address");
      return;
    }
    
    // Create order object with all details
    const order = {
      items: cart.items,
      restaurantId: cart.restaurantId,
      restaurantName: cart.restaurantName,
      totalAmount,
      deliveryAddress,
      paymentMethod,
      couponApplied: appliedCoupon?.code,
      discount,
      deliveryFee,
      tax,
      orderDate: new Date().toISOString()
    };
    
    // Store order in localStorage (in a real app, this would be sent to a backend)
    const orders = JSON.parse(localStorage.getItem("orders") || "[]");
    orders.push({
      ...order,
      id: `order-${Date.now()}`,
      status: "pending"
    });
    localStorage.setItem("orders", JSON.stringify(orders));
    
    // Clear cart
    clearCart();
    
    // Navigate to the order tracking page
    toast.success("Order placed successfully!");
    navigate("/order-tracking");
  };

  if (cart.items.length === 0) {
    return (
      <div className="min-h-screen flex flex-col">
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
    <div className="min-h-screen flex flex-col">
      <NavBar />
      
      <div className="flex-grow py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <h1 className="text-2xl font-bold mb-8">Your Cart</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h2 className="text-xl font-semibold mb-4">
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
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4">Delivery Information</h2>
              
              <div className="mb-4">
                <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                  Delivery Address
                </label>
                <textarea
                  id="address"
                  rows={2}
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
                      id="paypal"
                      name="paymentMethod"
                      type="radio"
                      className="h-4 w-4 text-food-primary focus:ring-food-primary"
                      value="paypal"
                      checked={paymentMethod === "paypal"}
                      onChange={() => setPaymentMethod("paypal")}
                    />
                    <label htmlFor="paypal" className="ml-2 block text-sm text-gray-900">
                      PayPal
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
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-24">
              <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
              
              <div className="space-y-4 mb-6">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span>${cart.totalAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Delivery Fee</span>
                  <span>${deliveryFee.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Tax</span>
                  <span>${tax.toFixed(2)}</span>
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
                    <span>-${discount.toFixed(2)}</span>
                  </div>
                )}
                
                <div className="border-t pt-4 flex justify-between font-bold">
                  <span>Total</span>
                  <span>${totalAmount.toFixed(2)}</span>
                </div>
              </div>
              
              {/* Coupon */}
              {!appliedCoupon && (
                <div className="mb-6">
                  <label htmlFor="coupon" className="block text-sm font-medium text-gray-700 mb-1">
                    Coupon Code
                  </label>
                  <div className="flex">
                    <input
                      type="text"
                      id="coupon"
                      className="input-field rounded-r-none flex-grow"
                      placeholder="Enter coupon code"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                    />
                    <button
                      onClick={handleApplyCoupon}
                      className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-2 px-4 rounded-r-md"
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
                Proceed to Checkout
              </button>
              
              <div className="mt-4 text-center text-xs text-gray-500">
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
