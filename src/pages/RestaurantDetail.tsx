import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/integrations/firebase/client";
import { useMenuItems } from "@/hooks/useMenuItems";
import { Restaurant, MenuItem as MenuItemType } from "@/types";
import NavBar from "@/components/NavBar";
import Footer from "@/components/Footer";
import MenuItemComponent from "@/components/MenuItem";
import { toast } from "sonner";
import { 
  Star, Clock, DollarSign, MapPin, Phone, Globe, Search, 
  ChevronLeft, Loader2, AlertCircle 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

const RestaurantDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [imageError, setImageError] = useState(false);

  const { 
    menuItems, 
    isLoading: menuItemsLoading,
    error: menuItemsError 
  } = useMenuItems(id);

  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (!id) {
      toast.error("Invalid restaurant ID.");
      navigate("/");
      return;
    }
    
    console.log(`[Effect fetchRestaurant] Running for ID: ${id}`);

    const fetchRestaurant = async () => {
      console.log(`[fetchRestaurant] Setting loading true for ID: ${id}`);
      setLoading(true);
      setError(null);
      setImageError(false);
      try {
        const restaurantDocRef = doc(db, "restaurants", id);
        const docSnap = await getDoc(restaurantDocRef);
        
        console.log(`[fetchRestaurant] docSnap.exists() for ID ${id}:`, docSnap.exists());

        if (docSnap.exists()) {
          const fetchedData = { id: docSnap.id, ...docSnap.data() } as Restaurant;
          console.log(`[fetchRestaurant] Data found for ID ${id}. Preparing to set state:`, fetchedData);
          setRestaurant(fetchedData);
          console.log(`[fetchRestaurant] setRestaurant called for ID ${id}.`);
        } else {
          console.log(`[fetchRestaurant] No document found for ID ${id}. Setting error.`);
          setError("Restaurant not found.");
          toast.error("Restaurant not found");
        }
      } catch (err) {
        console.error(`[fetchRestaurant] Error fetching restaurant ID ${id}:`, err);
        const errorMessage = err instanceof Error ? err.message : "Failed to load restaurant details.";
        setError(errorMessage);
        toast.error(errorMessage);
      } finally {
        console.log(`[fetchRestaurant] Setting loading false for ID: ${id}`);
        setLoading(false);
      }
    };

    fetchRestaurant();
  }, [id, navigate]);

  const filteredMenu = menuItems.filter(item => 
    item.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.category?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <NavBar />
        <div className="flex-grow">
          <div className="relative h-64 md:h-80 lg:h-96 bg-gray-200">
            <Skeleton className="w-full h-full" />
          </div>
          <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="md:col-span-2 space-y-4">
                <Skeleton className="h-8 w-64" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </div>
              <div className="space-y-4">
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-32 w-full" />
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !restaurant) {
    return (
      <div className="min-h-screen flex flex-col">
        <NavBar />
        <div className="flex-grow flex items-center justify-center">
          <div className="text-center p-8 max-w-md">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">{error || "Restaurant not found"}</h2>
            <p className="text-gray-600 mb-6">Please check the URL or go back to our homepage.</p>
            <Button onClick={() => navigate("/")}>
              <ChevronLeft className="mr-2" size={16} />
              Back to Home
            </Button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  console.log('Image URLs for Render:', { 
    cover: restaurant.coverImageUrl, 
    image: restaurant.image_url 
  });
  console.log('Website:', restaurant.website);
  console.log('Opening Hours:', restaurant.opening_hours);

  const coverImage = restaurant.coverImageUrl || restaurant.image_url;
  const placeholderImage = "https://placehold.co/1200x400/png?text=Restaurant+Image";
  const imageSource = imageError || !coverImage ? placeholderImage : coverImage;

  return (
    <div className="min-h-screen flex flex-col">
      <NavBar />
      
      <div className="flex-grow">
        <div className="relative h-64 md:h-80 lg:h-96">
          <img
            src={imageSource}
            alt={restaurant.name}
            className="w-full h-full object-cover"
            onError={() => setImageError(true)}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
          <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
            <h1 className="text-3xl md:text-4xl font-bold mb-2">{restaurant.name}</h1>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
              {restaurant.cuisine && (
                <span className="bg-white/20 backdrop-blur-sm px-2 py-1 rounded">
                  {restaurant.cuisine}
                </span>
              )}
              {restaurant.rating && (
                <div className="flex items-center">
                  <Star size={16} className="text-yellow-400 mr-1" />
                  <span>{restaurant.rating.toFixed(1)}</span>
                </div>
              )}
              {restaurant.delivery_time && (
                <div className="flex items-center">
                  <Clock size={16} className="mr-1" />
                  <span>{restaurant.delivery_time} min</span>
                </div>
              )}
              {restaurant.price_range && (
                <div className="flex items-center">
                  <DollarSign size={16} className="mr-1" />
                  <span>{restaurant.price_range}</span>
                </div>
              )}
            </div>
          </div>
        </div>
        
        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            <div className="md:col-span-2">
              <h2 className="text-xl font-bold mb-4">About</h2>
              <p className="text-gray-700 mb-6">
                {restaurant.description || "No description available."}
              </p>
              
              <h2 className="text-xl font-bold mb-4">Location & Contact</h2>
              <div className="space-y-3 text-gray-700">
                {restaurant.address && (
                  <div className="flex items-start">
                    <MapPin size={18} className="mr-2 mt-1 text-primary" />
                    <span>{restaurant.address}</span>
                  </div>
                )}
                {restaurant.phone && (
                  <div className="flex items-center">
                    <Phone size={18} className="mr-2 text-primary" />
                    <a href={`tel:${restaurant.phone}`} className="hover:underline">
                      {restaurant.phone}
                    </a>
                  </div>
                )}
                <div className="flex items-center">
                  <Globe size={18} className="mr-2 text-primary" />
                  <a 
                    href={restaurant.website ?? "#"}
                    target="_blank" 
                    rel="noopener noreferrer"
                    className={`text-primary hover:underline ${!restaurant.website ? 'text-gray-400 italic pointer-events-none' : ''}`}
                  >
                    {restaurant.website ?? "Website not available"}
                  </a>
                </div>
              </div>
            </div>
            
            <div className="md:col-span-1">
              <h2 className="text-xl font-bold mb-4">Opening Hours</h2>
              <div className="bg-gray-50 p-4 rounded-lg">
                {restaurant.opening_hours && typeof restaurant.opening_hours === 'object' ? (
                  Object.entries(restaurant.opening_hours).map(([day, hours]) => (
                    <div key={day} className="flex justify-between py-1 border-b last:border-b-0">
                      <span className="font-medium capitalize">{day}</span>
                      <span>{typeof hours === 'string' ? hours : "N/A"}</span>
                    </div>
                  ))
                ) : (
                   <p className="text-sm text-gray-500">Opening hours not available.</p>
                )}
              </div>
            </div>
          </div>
          
          <div>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
              <h2 className="text-2xl font-bold">Menu</h2>
              <div className="relative w-full sm:w-64">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search size={16} className="text-gray-500" />
                </div>
                <input
                  type="text"
                  placeholder="Search menu items..."
                  className="pl-9 w-full py-2 pr-4 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  aria-label="Search menu items"
                />
              </div>
            </div>

            {menuItemsLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : menuItemsError ? (
              <div className="text-center py-8 text-red-600">
                <AlertCircle className="h-8 w-8 mx-auto mb-2" />
                Error loading menu: {menuItemsError}
              </div>
            ) : filteredMenu.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">
                  {searchTerm 
                    ? "No menu items found matching your search." 
                    : "This restaurant hasn't added any menu items yet."}
                </p>
              </div>
            ) : (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {filteredMenu.map(item => (
                  <MenuItemComponent key={item.id} item={item} />
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