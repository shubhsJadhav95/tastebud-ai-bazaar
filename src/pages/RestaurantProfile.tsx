import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import NavBar from "../components/NavBar";
import Footer from "../components/Footer";
import { useAuth } from "../context/AuthContext";
import { Save, MapPin, Clock, DollarSign, Utensils, Image, Phone, Globe } from "lucide-react";
import { toast } from "sonner";
import { restaurants } from "../utils/mockData";

const RestaurantProfile: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>({
    id: "",
    name: "",
    description: "",
    cuisine: "",
    address: "",
    image: "https://source.unsplash.com/random/800x400/?restaurant",
    logo: "https://source.unsplash.com/random/200x200/?logo",
    rating: 0,
    deliveryTime: "30-45 min",
    priceRange: "₹₹",
    openingHours: {
      monday: { open: "10:00", close: "22:00" },
      tuesday: { open: "10:00", close: "22:00" },
      wednesday: { open: "10:00", close: "22:00" },
      thursday: { open: "10:00", close: "22:00" },
      friday: { open: "10:00", close: "23:00" },
      saturday: { open: "10:00", close: "23:00" },
      sunday: { open: "11:00", close: "21:00" }
    },
    contactInfo: {
      phone: "",
      email: "",
      website: ""
    }
  });
  
  useEffect(() => {
    if (!user) {
      navigate("/restaurant/login");
      return;
    }
    
    setLoading(true);
    
    setTimeout(() => {
      if (user.email === "posj2004@gmail.com") {
        const restaurantData = restaurants[0];
        setProfile({
          ...restaurantData,
          openingHours: restaurantData.openingHours || {
            monday: { open: "10:00", close: "22:00" },
            tuesday: { open: "10:00", close: "22:00" },
            wednesday: { open: "10:00", close: "22:00" },
            thursday: { open: "10:00", close: "22:00" },
            friday: { open: "10:00", close: "23:00" },
            saturday: { open: "10:00", close: "23:00" },
            sunday: { open: "11:00", close: "21:00" }
          },
          contactInfo: restaurantData.contactInfo || {
            phone: "(123) 456-7890",
            email: user.email,
            website: `www.${restaurantData.name.toLowerCase().replace(/\s+/g, '')}.com`
          }
        });
      } else {
        setProfile({
          ...profile,
          id: user.id,
          name: user.name || "New Restaurant",
          contactInfo: {
            ...profile.contactInfo,
            email: user.email
          }
        });
      }
      
      setLoading(false);
    }, 1000);
  }, [user, navigate]);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if (name.includes('.')) {
      const [parent, child, subchild] = name.split('.');
      
      if (subchild) {
        setProfile({
          ...profile,
          [parent]: {
            ...profile[parent],
            [child]: {
              ...profile[parent][child],
              [subchild]: value
            }
          }
        });
      } else {
        setProfile({
          ...profile,
          [parent]: {
            ...profile[parent],
            [child]: value
          }
        });
      }
    } else {
      setProfile({
        ...profile,
        [name]: value
      });
    }
  };
  
  const handleSaveProfile = () => {
    if (!profile.name || !profile.description || !profile.cuisine || !profile.address) {
      toast.error("Please fill in all required fields");
      return;
    }
    
    toast.success("Restaurant profile updated successfully");
    
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
    }, 500);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <NavBar />
        <div className="flex-grow py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
            <div className="h-48 bg-gray-200 rounded-lg mb-8"></div>
            <div className="space-y-4">
              <div className="h-8 bg-gray-200 rounded w-1/4"></div>
              <div className="h-24 bg-gray-200 rounded"></div>
              <div className="h-8 bg-gray-200 rounded w-1/4"></div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="h-12 bg-gray-200 rounded"></div>
                <div className="h-12 bg-gray-200 rounded"></div>
              </div>
            </div>
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
        <div className="mb-8">
          <h1 className="text-2xl font-bold mb-2">Restaurant Profile</h1>
          <p className="text-gray-600">Manage your restaurant information</p>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <Image size={18} className="mr-2 text-food-primary" />
            Restaurant Images
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cover Image
              </label>
              <div className="relative h-48 bg-gray-100 rounded-lg overflow-hidden mb-2">
                <img 
                  src={profile.image}
                  alt="Restaurant Cover"
                  className="w-full h-full object-cover"
                />
                <button className="absolute bottom-2 right-2 btn-primary text-sm py-1">
                  Change
                </button>
              </div>
              <p className="text-xs text-gray-500">
                Recommended: 1200 x 400 pixels, JPG or PNG
              </p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Restaurant Logo
              </label>
              <div className="relative h-48 bg-gray-100 rounded-lg overflow-hidden mb-2 flex items-center justify-center">
                <img 
                  src={profile.logo || "https://via.placeholder.com/200"}
                  alt="Restaurant Logo"
                  className="max-w-[200px] max-h-[200px] object-contain"
                />
                <button className="absolute bottom-2 right-2 btn-primary text-sm py-1">
                  Change
                </button>
              </div>
              <p className="text-xs text-gray-500">
                Recommended: Square logo, at least 200 x 200 pixels
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <Utensils size={18} className="mr-2 text-food-primary" />
            Basic Information
          </h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Restaurant Name *
              </label>
              <input
                type="text"
                name="name"
                className="input-field"
                value={profile.name}
                onChange={handleInputChange}
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description *
              </label>
              <textarea
                name="description"
                rows={4}
                className="input-field"
                value={profile.description}
                onChange={handleInputChange}
                required
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Cuisine Type *
                </label>
                <select
                  name="cuisine"
                  className="input-field"
                  value={profile.cuisine}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Select cuisine</option>
                  <option value="Indian">Indian</option>
                  <option value="Chinese">Chinese</option>
                  <option value="Italian">Italian</option>
                  <option value="Mexican">Mexican</option>
                  <option value="Japanese">Japanese</option>
                  <option value="Thai">Thai</option>
                  <option value="American">American</option>
                  <option value="Mediterranean">Mediterranean</option>
                  <option value="South Indian">South Indian</option>
                  <option value="North Indian">North Indian</option>
                  <option value="Fast Food">Fast Food</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Price Range
                </label>
                <select
                  name="priceRange"
                  className="input-field"
                  value={profile.priceRange}
                  onChange={handleInputChange}
                >
                  <option value="₹">₹ (Budget)</option>
                  <option value="₹₹">₹₹ (Moderate)</option>
                  <option value="₹₹₹">₹₹₹ (Expensive)</option>
                  <option value="₹₹₹₹">₹₹₹₹ (Very Expensive)</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Estimated Delivery Time
                </label>
                <input
                  type="text"
                  name="deliveryTime"
                  className="input-field"
                  placeholder="e.g. 30-45 min"
                  value={profile.deliveryTime}
                  onChange={handleInputChange}
                />
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <MapPin size={18} className="mr-2 text-food-primary" />
            Location & Contact
          </h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Address *
              </label>
              <input
                type="text"
                name="address"
                className="input-field"
                value={profile.address}
                onChange={handleInputChange}
                required
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  name="contactInfo.phone"
                  className="input-field"
                  value={profile.contactInfo.phone}
                  onChange={handleInputChange}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  name="contactInfo.email"
                  className="input-field"
                  value={profile.contactInfo.email}
                  onChange={handleInputChange}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Website
                </label>
                <input
                  type="text"
                  name="contactInfo.website"
                  className="input-field"
                  value={profile.contactInfo.website}
                  onChange={handleInputChange}
                />
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <Clock size={18} className="mr-2 text-food-primary" />
            Operating Hours
          </h2>
          
          <div className="space-y-4">
            {Object.entries(profile.openingHours).map(([day, hours]: [string, any]) => (
              <div key={day} className="grid grid-cols-6 gap-4 items-center">
                <div className="col-span-2 md:col-span-1 capitalize">
                  {day}
                </div>
                <div className="col-span-2">
                  <label className="block text-xs text-gray-500 mb-1">
                    Opening Time
                  </label>
                  <input
                    type="time"
                    name={`openingHours.${day}.open`}
                    className="input-field"
                    value={hours.open}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs text-gray-500 mb-1">
                    Closing Time
                  </label>
                  <input
                    type="time"
                    name={`openingHours.${day}.close`}
                    className="input-field"
                    value={hours.close}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="flex justify-end">
          <button
            className="btn-primary flex items-center"
            onClick={handleSaveProfile}
          >
            <Save size={16} className="mr-2" />
            Save Profile
          </button>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default RestaurantProfile;
