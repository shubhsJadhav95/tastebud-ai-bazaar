
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useRestaurants } from "../hooks/useRestaurants";
import NavBar from "../components/NavBar";
import Footer from "../components/Footer";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { SaveIcon, ImageIcon, MapPinIcon, ClockIcon, DollarSignIcon, UtensilsIcon } from "lucide-react";

const cuisineOptions = [
  "Indian", "Chinese", "Italian", "Mexican", "Japanese", 
  "Thai", "American", "Mediterranean", "Lebanese", "Korean"
];

const priceRangeOptions = ["$", "$$", "$$$", "$$$$"];

const RestaurantProfile: React.FC = () => {
  const { isAuthenticated, userType } = useAuth();
  const { myRestaurant, saveRestaurant } = useRestaurants();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    cuisine: "",
    address: "",
    price_range: "",
    delivery_time: "",
    image_url: "",
    logo_url: ""
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Redirect if not authenticated or not a restaurant user
  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/restaurant/login");
    } else if (userType !== "restaurant") {
      navigate("/");
      toast.error("Access denied. This page is for restaurants only.");
    }
  }, [isAuthenticated, userType, navigate]);
  
  // Populate form with existing restaurant data
  useEffect(() => {
    if (myRestaurant) {
      setFormData({
        name: myRestaurant.name || "",
        description: myRestaurant.description || "",
        cuisine: myRestaurant.cuisine || "",
        address: myRestaurant.address || "",
        price_range: myRestaurant.price_range || "",
        delivery_time: myRestaurant.delivery_time || "",
        image_url: myRestaurant.image_url || "",
        logo_url: myRestaurant.logo_url || ""
      });
    }
  }, [myRestaurant]);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Validate required fields
      if (!formData.name) {
        toast.error("Restaurant name is required");
        return;
      }
      
      const result = await saveRestaurant(formData);
      
      if (result) {
        toast.success("Restaurant profile saved successfully");
        
        // If this was initial setup, redirect to menu page
        if (!myRestaurant?.id) {
          navigate("/restaurant/menu");
        }
      }
    } catch (error) {
      console.error("Error saving restaurant profile:", error);
      toast.error("Failed to save restaurant profile");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <NavBar />
      
      <div className="flex-grow py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <Card className="w-full">
          <CardHeader>
            <CardTitle className="text-2xl font-bold">Restaurant Profile</CardTitle>
            <CardDescription>
              {myRestaurant?.id 
                ? "Update your restaurant details" 
                : "Complete your restaurant profile to start receiving orders"}
            </CardDescription>
          </CardHeader>
          
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Restaurant Name*</Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Enter restaurant name"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="cuisine">Cuisine</Label>
                  <Select
                    value={formData.cuisine}
                    onValueChange={(value) => handleSelectChange('cuisine', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select cuisine" />
                    </SelectTrigger>
                    <SelectContent>
                      {cuisineOptions.map(cuisine => (
                        <SelectItem key={cuisine} value={cuisine}>
                          {cuisine}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    name="description"
                    value={formData.description || ""}
                    onChange={handleInputChange}
                    placeholder="Describe your restaurant"
                    rows={3}
                  />
                </div>
                
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="address">Address</Label>
                  <Input
                    id="address"
                    name="address"
                    value={formData.address || ""}
                    onChange={handleInputChange}
                    placeholder="Enter restaurant address"
                    icon={<MapPinIcon size={16} />}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="price_range">Price Range</Label>
                  <Select
                    value={formData.price_range || ""}
                    onValueChange={(value) => handleSelectChange('price_range', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select price range" />
                    </SelectTrigger>
                    <SelectContent>
                      {priceRangeOptions.map(range => (
                        <SelectItem key={range} value={range}>
                          {range}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="delivery_time">Delivery Time</Label>
                  <Input
                    id="delivery_time"
                    name="delivery_time"
                    value={formData.delivery_time || ""}
                    onChange={handleInputChange}
                    placeholder="e.g. 25-30 minutes"
                    icon={<ClockIcon size={16} />}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="image_url">Cover Image URL</Label>
                  <Input
                    id="image_url"
                    name="image_url"
                    value={formData.image_url || ""}
                    onChange={handleInputChange}
                    placeholder="Enter image URL"
                    icon={<ImageIcon size={16} />}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="logo_url">Logo URL</Label>
                  <Input
                    id="logo_url"
                    name="logo_url"
                    value={formData.logo_url || ""}
                    onChange={handleInputChange}
                    placeholder="Enter logo URL"
                    icon={<ImageIcon size={16} />}
                  />
                </div>
              </div>
            </CardContent>
            
            <CardFooter>
              <Button type="submit" className="w-full md:w-auto" disabled={isSubmitting}>
                <SaveIcon className="mr-2 h-4 w-4" />
                {isSubmitting ? "Saving..." : "Save Restaurant Profile"}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
      
      <Footer />
    </div>
  );
};

export default RestaurantProfile;
