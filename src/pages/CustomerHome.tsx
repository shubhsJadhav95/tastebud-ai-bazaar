import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuthContext } from "@/contexts/AuthContext";
import { useAllRestaurants } from "@/hooks/useAllRestaurants";
import { Restaurant as RestaurantType } from "@/types";
import NavBar from "@/components/NavBar";
import Footer from "@/components/Footer";
import RestaurantCard from "@/components/RestaurantCard";
import AIRecommendation from "@/components/AIRecommendation";
import { offers, cuisineFilters } from "../utils/mockData";
import { Search, Filter, MapPin } from "lucide-react";
import { toast } from "sonner";

const CustomerHome: React.FC = () => {
  const { user, profile, loading: authLoading } = useAuthContext();
  const navigate = useNavigate();
  const { restaurants, loading: restaurantsLoading, error: restaurantsError } = useAllRestaurants();
  
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCuisine, setSelectedCuisine] = useState("All");
  const [filteredRestaurants, setFilteredRestaurants] = useState<RestaurantType[]>([]);
  const [userLocation, setUserLocation] = useState("123 MG Road, Bengaluru");

  // Redirect if not authenticated or not a customer
  useEffect(() => {
    if (authLoading) return;
    
    if (!user) {
      navigate("/customer/login");
    } else if (profile?.user_type !== "customer") {
      navigate("/restaurant/dashboard");
      toast.error("Access denied. This page is for customers only.");
    }
  }, [user, profile, authLoading, navigate]);

  // Filter restaurants based on search term and cuisine
  useEffect(() => {
    if (!restaurants || restaurantsLoading || restaurantsError) {
        setFilteredRestaurants([]);
        return;
    }
    
    const results = restaurants.filter(restaurant => {
      const nameMatch = restaurant.name?.toLowerCase().includes(searchTerm.toLowerCase()) || false;
      const cuisineMatch = restaurant.cuisine?.toLowerCase().includes(searchTerm.toLowerCase()) || false;
      const matchesSearch = nameMatch || cuisineMatch;
      
      const matchesCuisine = selectedCuisine === "All" || restaurant.cuisine === selectedCuisine;
      
      return matchesSearch && matchesCuisine;
    });
    
    setFilteredRestaurants(results);
  }, [searchTerm, selectedCuisine, restaurants, restaurantsLoading, restaurantsError]);

  return (
    <div className="min-h-screen flex flex-col">
      <NavBar />
      
      <div className="flex-grow">
        {/* Hero Section with Offers */}
        <section className="bg-gradient-to-r from-food-accent to-food-muted py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl font-bold mb-6">Special Offers</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {offers.map(offer => (
                <div 
                  key={offer.id} 
                  className="bg-white rounded-lg shadow-md overflow-hidden animate-fade-in"
                  style={{ animationDelay: `${parseInt(offer.id.slice(1)) * 100}ms` }}
                >
                  <div className="h-40 w-full overflow-hidden">
                    <img 
                      src={offer.image} 
                      alt={offer.title} 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="font-bold text-lg mb-1">{offer.title}</h3>
                    <p className="text-gray-600 text-sm mb-2">{offer.description}</p>
                    <div className="bg-gray-100 px-3 py-1 rounded text-sm font-bold inline-block">
                      {offer.code}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
        
        {/* Search and Filter Section */}
        <section className="py-8 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center mb-3">
              <MapPin size={18} className="text-gray-600 mr-2" />
              <span className="text-gray-600">{userLocation}</span>
            </div>
            
            <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4">
              <div className="flex-grow relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search size={18} className="text-gray-500" />
                </div>
                <input
                  type="text"
                  placeholder="Search for restaurants or cuisines..."
                  className="pl-10 input-field w-full"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
              <div className="relative inline-block w-full md:w-auto">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Filter size={18} className="text-gray-500" />
                </div>
                <select
                  className="pl-10 input-field appearance-none w-full"
                  value={selectedCuisine}
                  onChange={(e) => setSelectedCuisine(e.target.value)}
                >
                  {cuisineFilters.map(cuisine => (
                    <option key={cuisine} value={cuisine}>
                      {cuisine}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                  <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                    <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </section>
        
        {/* AI Recommendation Section */}
        <section className="py-6 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <AIRecommendation userLocation={userLocation} />
          </div>
        </section>
        
        {/* Restaurants Section */}
        <section className="py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl font-bold mb-6">Restaurants Near You</h2>
            
            {restaurantsLoading && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((item) => (
                  <div key={item} className="bg-white rounded-lg shadow-md overflow-hidden animate-pulse">
                    <div className="h-48 bg-gray-300"></div>
                    <div className="p-4">
                      <div className="h-6 bg-gray-300 rounded w-3/4 mb-2"></div>
                      <div className="h-4 bg-gray-300 rounded w-1/2 mb-2"></div>
                      <div className="h-4 bg-gray-300 rounded w-full mb-2"></div>
                      <div className="flex space-x-2 mt-4">
                        <div className="h-8 bg-gray-300 rounded w-16"></div>
                        <div className="h-8 bg-gray-300 rounded w-16"></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {!restaurantsLoading && restaurantsError && (
              <div className="text-center py-8 text-red-600">
                <p>Error loading restaurants: {restaurantsError}</p>
              </div>
            )}

            {!restaurantsLoading && !restaurantsError && filteredRestaurants.length === 0 && (
              <div className="text-center py-8">
                <p className="text-gray-500">
                  {searchTerm || selectedCuisine !== 'All' 
                    ? "No restaurants found matching your search criteria."
                    : "No restaurants available at the moment."} 
                </p>
              </div>
            )}

            {!restaurantsLoading && !restaurantsError && filteredRestaurants.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredRestaurants.map((restaurant) => (
                  <RestaurantCard 
                    key={restaurant.id} 
                    restaurant={restaurant} 
                  />
                ))}
              </div>
            )}
          </div>
        </section>
      </div>
      
      <Footer />
    </div>
  );
};

export default CustomerHome;
