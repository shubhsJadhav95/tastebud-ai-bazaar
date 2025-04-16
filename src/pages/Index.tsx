import React from "react";
import { useNavigate } from "react-router-dom";
import LoginCard from "../components/LoginCard";
import Footer from "../components/Footer";

const Index: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-grow">
        <div className="bg-gradient-to-r from-food-accent to-food-muted py-16 px-6">
          <div className="max-w-7xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              <span className="text-food-primary">Swadisht</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-700 mb-12 max-w-3xl mx-auto">
              Connecting hungry customers with amazing local restaurants
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              <LoginCard 
                type="customer"
                title="Customer"
                description="Order delicious food from your favorite local restaurants and get it delivered to your doorstep."
              />
              <LoginCard 
                type="restaurant"
                title="Restaurant"
                description="Partner with us to reach more customers and grow your business with our delivery platform."
              />
            </div>
          </div>
        </div>
        
        <div className="py-16 px-6">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center p-6 rounded-lg bg-white shadow-md">
                <div className="w-16 h-16 bg-food-primary rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4">
                  1
                </div>
                <h3 className="text-xl font-semibold mb-2">Browse Restaurants</h3>
                <p className="text-gray-600">
                  Discover local restaurants and browse their menus to find your favorite dishes.
                </p>
              </div>
              
              <div className="text-center p-6 rounded-lg bg-white shadow-md">
                <div className="w-16 h-16 bg-food-secondary rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4">
                  2
                </div>
                <h3 className="text-xl font-semibold mb-2">Place Your Order</h3>
                <p className="text-gray-600">
                  Select your items, customize them to your liking, and place your order with just a few clicks.
                </p>
              </div>
              
              <div className="text-center p-6 rounded-lg bg-white shadow-md">
                <div className="w-16 h-16 bg-food-primary rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4">
                  3
                </div>
                <h3 className="text-xl font-semibold mb-2">Enjoy Your Food</h3>
                <p className="text-gray-600">
                  Track your order in real-time and enjoy delicious food delivered right to your door.
                </p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="py-16 px-6 bg-gray-50">
          <div className="max-w-7xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-12">Our Features</h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              <div className="p-6 bg-white rounded-lg shadow-md">
                <h3 className="font-semibold text-lg mb-2">AI Recommendations</h3>
                <p className="text-gray-600">
                  Get personalized restaurant and dish recommendations based on your preferences.
                </p>
              </div>
              
              <div className="p-6 bg-white rounded-lg shadow-md">
                <h3 className="font-semibold text-lg mb-2">Nutritional Info</h3>
                <p className="text-gray-600">
                  View detailed nutritional information for all menu items.
                </p>
              </div>
              
              <div className="p-6 bg-white rounded-lg shadow-md">
                <h3 className="font-semibold text-lg mb-2">Real-time Tracking</h3>
                <p className="text-gray-600">
                  Track your order status in real-time from preparation to delivery.
                </p>
              </div>
              
              <div className="p-6 bg-white rounded-lg shadow-md">
                <h3 className="font-semibold text-lg mb-2">Food Donation</h3>
                <p className="text-gray-600">
                  Donate leftover food to those in need with our donation program.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default Index;
