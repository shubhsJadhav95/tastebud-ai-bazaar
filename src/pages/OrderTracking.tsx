
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import NavBar from "../components/NavBar";
import Footer from "../components/Footer";
import OrderItem from "../components/OrderItem";
import { Check, Clock, Utensils, Truck, Gift, MapPin } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { toast } from "sonner";

const OrderTracking: React.FC = () => {
  const [order, setOrder] = useState<any>(null);
  const [currentStatus, setCurrentStatus] = useState<string>("pending");
  const [donationOpen, setDonationOpen] = useState(false);
  const [isDelivered, setIsDelivered] = useState(false);
  
  // Load the most recent order from localStorage
  useEffect(() => {
    const orders = JSON.parse(localStorage.getItem("orders") || "[]");
    if (orders.length > 0) {
      const latestOrder = orders[orders.length - 1];
      setOrder(latestOrder);
      setCurrentStatus(latestOrder.status);
      
      // Start the simulation for order progress
      startOrderSimulation();
    }
  }, []);
  
  // Simulate order status progression
  const startOrderSimulation = () => {
    const statusProgression = ["pending", "preparing", "on-the-way", "delivered"];
    let currentIndex = 0;
    
    const interval = setInterval(() => {
      if (currentIndex < statusProgression.length - 1) {
        currentIndex++;
        const newStatus = statusProgression[currentIndex];
        setCurrentStatus(newStatus);
        
        if (newStatus === "delivered") {
          setIsDelivered(true);
          clearInterval(interval);
        }
      } else {
        clearInterval(interval);
      }
    }, 10000); // Change status every 10 seconds
    
    return () => clearInterval(interval);
  };
  
  // Handle donation
  const handleDonate = () => {
    toast.success("Thank you for donating your leftover food to help those in need!");
    setDonationOpen(false);
  };

  if (!order) {
    return (
      <div className="min-h-screen flex flex-col">
        <NavBar />
        <div className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-2">No active order found</h2>
            <p className="text-gray-600 mb-4">You don't have any active orders to track.</p>
            <Link to="/customer/home" className="btn-primary inline-block">
              Browse Restaurants
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // Progress statuses
  const statuses = [
    { key: "pending", label: "Order Received", icon: <Check /> },
    { key: "preparing", label: "Preparing Food", icon: <Utensils /> },
    { key: "on-the-way", label: "On the Way", icon: <Truck /> },
    { key: "delivered", label: "Delivered", icon: <Check /> }
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <NavBar />
      
      <div className="flex-grow py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold mb-2">Track Your Order</h1>
          <p className="text-gray-600">
            Order #{order.id.split('-').pop()} • {order.restaurantName}
          </p>
        </div>
        
        {/* Status Tracking */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="relative">
            {/* Progress bar */}
            <div className="hidden sm:block absolute left-0 right-0 h-1 bg-gray-200 top-5 z-0">
              <div 
                className="h-1 bg-food-primary transition-all duration-500"
                style={{ 
                  width: `${
                    currentStatus === "pending" ? 0 : 
                    currentStatus === "preparing" ? 33.3 : 
                    currentStatus === "on-the-way" ? 66.6 : 100
                  }%` 
                }}
              ></div>
            </div>
            
            {/* Status steps */}
            <div className="flex flex-col sm:flex-row justify-between relative z-10">
              {statuses.map((status, index) => {
                const isActive = statuses.findIndex(s => s.key === currentStatus) >= index;
                const isCurrent = status.key === currentStatus;
                
                return (
                  <div 
                    key={status.key} 
                    className={`flex sm:flex-col items-center ${index < statuses.length - 1 ? 'mb-6 sm:mb-0' : ''}`}
                  >
                    <div 
                      className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        isActive ? 'bg-food-primary text-white' : 'bg-gray-200 text-gray-500'
                      } ${isCurrent ? 'animate-pulse-slow' : ''}`}
                    >
                      {status.icon}
                    </div>
                    <div className="ml-4 sm:ml-0 sm:mt-2 sm:text-center">
                      <p className={`font-medium ${isActive ? 'text-food-primary' : 'text-gray-500'}`}>
                        {status.label}
                      </p>
                      {isCurrent && (
                        <p className="text-xs text-gray-500 mt-1">
                          {currentStatus === "pending" && "Waiting for restaurant confirmation"}
                          {currentStatus === "preparing" && "Chef is preparing your delicious meal"}
                          {currentStatus === "on-the-way" && "Your food is on the way to you"}
                          {currentStatus === "delivered" && "Enjoy your meal!"}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          
          {currentStatus === "on-the-way" && (
            <div className="mt-8 p-4 bg-gray-50 rounded-lg">
              <div className="flex items-start">
                <div className="bg-food-primary text-white p-2 rounded-full mr-4">
                  <Truck size={20} />
                </div>
                <div>
                  <h3 className="font-semibold">Delivery Info</h3>
                  <p className="text-sm text-gray-600 mt-1">Your order is on the way with John D.</p>
                  <div className="flex items-center mt-2 text-sm text-gray-600">
                    <MapPin size={14} className="mr-1" />
                    <span>Estimated arrival: 15-20 minutes</span>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {currentStatus === "delivered" && !donationOpen && (
            <div className="mt-8 p-4 bg-food-accent rounded-lg animate-fade-in">
              <div className="flex items-start">
                <div className="bg-food-primary text-white p-2 rounded-full mr-4">
                  <Gift size={20} />
                </div>
                <div className="flex-grow">
                  <h3 className="font-semibold">Donate Leftover Food?</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Do you have leftover food? Consider donating to help those in need!
                  </p>
                  <button 
                    className="mt-3 btn-primary py-1.5 px-3 text-sm"
                    onClick={() => setDonationOpen(true)}
                  >
                    Donate Now
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
        
        {/* Order Details */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h2 className="text-xl font-semibold mb-4">Order Items</h2>
              
              <div className="divide-y">
                {order.items.map((item: any) => (
                  <OrderItem key={item.id} item={item} />
                ))}
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4">Delivery Information</h2>
              
              <div className="space-y-3">
                <div className="flex items-start">
                  <MapPin size={18} className="mr-2 mt-1 text-food-primary" />
                  <div>
                    <p className="font-medium">Delivery Address</p>
                    <p className="text-gray-600">{order.deliveryAddress}</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <Clock size={18} className="mr-2 mt-1 text-food-primary" />
                  <div>
                    <p className="font-medium">Order Time</p>
                    <p className="text-gray-600">
                      {new Date(order.orderDate).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-24">
              <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
              
              <div className="space-y-4 mb-6">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span>₹{(order.totalAmount - order.deliveryFee - order.tax + order.discount).toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Delivery Fee</span>
                  <span>₹{order.deliveryFee.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Tax</span>
                  <span>₹{order.tax.toFixed(2)}</span>
                </div>
                
                {order.discount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount ({order.couponApplied})</span>
                    <span>-₹{order.discount.toFixed(2)}</span>
                  </div>
                )}
                
                <div className="border-t pt-4 flex justify-between font-bold">
                  <span>Total</span>
                  <span>₹{order.totalAmount.toFixed(2)}</span>
                </div>
              </div>
              
              <div>
                <h3 className="font-semibold mb-2">Payment Method</h3>
                <p className="text-gray-700 capitalize">
                  {order.paymentMethod === "card" ? "Credit/Debit Card" : 
                   order.paymentMethod === "paypal" ? "PayPal" : 
                   "Cash on Delivery"}
                </p>
              </div>
              
              <div className="mt-6">
                <Link 
                  to="/customer/home" 
                  className="text-food-primary hover:text-food-secondary font-semibold text-center block w-full"
                >
                  Return to Restaurants
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Donation Dialog - Simplified */}
      <Dialog open={donationOpen} onOpenChange={setDonationOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Donate Leftover Food</DialogTitle>
            <DialogDescription>
              Your leftover food will be collected and distributed to those in need. Thank you for your generosity!
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <p className="text-sm text-gray-600 mb-4">
              By donating your leftover food, you're helping reduce food waste and supporting those facing food insecurity.
            </p>
            
            <button
              type="button"
              className="btn-primary w-full"
              onClick={handleDonate}
            >
              Confirm Donation
            </button>
          </div>
        </DialogContent>
      </Dialog>
      
      <Footer />
    </div>
  );
};

export default OrderTracking;
