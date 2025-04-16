
import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import NavBar from "../components/NavBar";
import Footer from "../components/Footer";
import MenuItem from "../components/MenuItem";
import { restaurants, menuItems } from "../utils/mockData";
import { toast } from "sonner";
import { Star, Clock, DollarSign, MapPin, Phone, Globe, Search } from "lucide-react";

const RestaurantDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [restaurant, setRestaurant] = useState<any>(null);
  const [menu, setMenu] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  // Fetch restaurant details and menu
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 500));
        
        const restaurantData = restaurants.find(r => r.id === id);
        if (!restaurantData) {
          toast.error("Restaurant not found");
          return;
        }
        
        setRestaurant(restaurantData);
        setMenu(menuItems[id || ""] || []);
      } catch (error) {
        toast.error("Failed to load restaurant details");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [id]);

  // Filter menu items based on search term
  const filteredMenu = menu.filter(item => 
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <NavBar />
        <div className="flex-grow py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-56 bg-gray-300 rounded-lg mb-6"></div>
            <div className="h-8 bg-gray-300 rounded w-1/3 mb-4"></div>
            <div className="h-4 bg-gray-300 rounded w-2/3 mb-8"></div>
            <div className="h-10 bg-gray-300 rounded mb-8"></div>
            <div className="space-y-6">
              {[1, 2, 3].map(i => (
                <div key={i} className="flex">
                  <div className="h-24 w-24 bg-gray-300 rounded-l-lg"></div>
                  <div className="flex-grow p-4 border-t border-r border-b rounded-r-lg">
                    <div className="h-5 bg-gray-300 rounded w-1/3 mb-2"></div>
                    <div className="h-4 bg-gray-300 rounded w-2/3 mb-4"></div>
                    <div className="flex justify-between">
                      <div className="h-4 bg-gray-300 rounded w-16"></div>
                      <div className="h-8 w-8 bg-gray-300 rounded-full"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!restaurant) {
    return (
      <div className="min-h-screen flex flex-col">
        <NavBar />
        <div className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-2">Restaurant not found</h2>
            <p className="text-gray-600">The restaurant you're looking for doesn't exist or has been removed.</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <NavBar />
      
      <div className="flex-grow">
        {/* Hero Section */}
        <div className="relative h-64 md:h-80 lg:h-96">
          <img
            src={restaurant.image}
            alt={restaurant.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
          <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
            <h1 className="text-3xl md:text-4xl font-bold mb-2">{restaurant.name}</h1>
            <div className="flex flex-wrap items-center gap-4">
              <span className="bg-white/20 backdrop-blur-sm px-2 py-1 rounded text-sm">
                {restaurant.cuisine}
              </span>
              <div className="flex items-center">
                <Star size={16} className="text-yellow-400 mr-1" />
                <span>{restaurant.rating}</span>
              </div>
              <div className="flex items-center">
                <Clock size={16} className="mr-1" />
                <span>{restaurant.deliveryTime}</span>
              </div>
              <div className="flex items-center">
                <DollarSign size={16} className="mr-1" />
                <span>{restaurant.priceRange}</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Restaurant Info Section */}
        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            <div className="md:col-span-2">
              <h2 className="text-xl font-bold mb-4">About</h2>
              <p className="text-gray-700 mb-6">{restaurant.description}</p>
              
              <h2 className="text-xl font-bold mb-4">Location & Contact</h2>
              <div className="space-y-3 text-gray-700">
                <div className="flex items-start">
                  <MapPin size={18} className="mr-2 mt-1 text-food-primary" />
                  <span>{restaurant.address}</span>
                </div>
                <div className="flex items-center">
                  <Phone size={18} className="mr-2 text-food-primary" />
                  <span>(123) 456-7890</span>
                </div>
                <div className="flex items-center">
                  <Globe size={18} className="mr-2 text-food-primary" />
                  <a href="#" className="text-food-primary hover:underline">
                    www.{restaurant.name.toLowerCase().replace(/\s+/g, '')}.com
                  </a>
                </div>
              </div>
            </div>
            
            <div className="md:col-span-1">
              <h2 className="text-xl font-bold mb-4">Opening Hours</h2>
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="grid grid-cols-2 gap-2">
                  <div className="text-gray-700">Monday</div>
                  <div>10:00 AM - 10:00 PM</div>
                  <div className="text-gray-700">Tuesday</div>
                  <div>10:00 AM - 10:00 PM</div>
                  <div className="text-gray-700">Wednesday</div>
                  <div>10:00 AM - 10:00 PM</div>
                  <div className="text-gray-700">Thursday</div>
                  <div>10:00 AM - 10:00 PM</div>
                  <div className="text-gray-700">Friday</div>
                  <div>10:00 AM - 11:00 PM</div>
                  <div className="text-gray-700">Saturday</div>
                  <div>10:00 AM - 11:00 PM</div>
                  <div className="text-gray-700">Sunday</div>
                  <div>11:00 AM - 9:00 PM</div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Menu Section */}
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Menu</h2>
              
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search size={16} className="text-gray-500" />
                </div>
                <input
                  type="text"
                  placeholder="Search menu items..."
                  className="pl-9 py-2 pr-4 border rounded-md focus:outline-none focus:ring-2 focus:ring-food-primary"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            
            {filteredMenu.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">No menu items found matching your search.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredMenu.map(item => (
                  <MenuItem key={item.id} item={item} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default RestaurantDetail;
