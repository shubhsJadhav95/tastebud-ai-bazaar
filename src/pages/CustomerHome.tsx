import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthContext } from "@/contexts/AuthContext";
import { useAllRestaurants } from "@/hooks/useAllRestaurants";
import { Restaurant as RestaurantType } from "@/types";
import NavBar from "@/components/NavBar";
import Footer from "@/components/Footer";
import { Search, Filter, MapPin, Clock, IndianRupee, AlertCircle, Utensils, Star, History, Heart } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { authService } from '@/services/authService';

const CustomerHome: React.FC = () => {
  const { user, profile, loading: authLoading } = useAuthContext();
  const navigate = useNavigate();
  const { restaurants: allRestaurants, isLoading, error } = useAllRestaurants();
  
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCuisine, setSelectedCuisine] = useState("All");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [filteredRestaurants, setFilteredRestaurants] = useState<RestaurantType[]>([]);
  const [updatingFavorite, setUpdatingFavorite] = useState<Record<string, boolean>>({});

  const categories = ["All", "Trending", "Top Rated", "New"];
  const recentOrders = [];
  const favoriteRestaurants = [];

  useEffect(() => {
    if (authLoading) return;
    
    if (!user) {
      navigate("/customer/login");
    } else if (profile?.user_type !== "customer") {
      navigate("/restaurant/dashboard");
      toast.error("Access denied. This page is for customers only.");
    }
  }, [user, profile, authLoading, navigate]);

  const cuisineOptions = useMemo(() => {
    const cuisines = new Set<string>(['All']);
    allRestaurants.forEach(r => {
      if (r.cuisine) {
        cuisines.add(r.cuisine);
      }
    });
    return Array.from(cuisines).sort();
  }, [allRestaurants]);

  useEffect(() => {
    let results = allRestaurants;

    if (selectedCategory !== 'All') {
      // TODO: Implement actual category filtering logic later
    }

    if (searchTerm) {
      results = results.filter(r => 
        r.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedCuisine !== 'All') {
      results = results.filter(r => r.cuisine === selectedCuisine);
    }

    setFilteredRestaurants(results);
  }, [searchTerm, selectedCuisine, selectedCategory, allRestaurants]);

  const handleToggleFavorite = async (restaurantId: string) => {
    if (!user?.uid) {
      toast.error("Please log in to manage favorites.");
      return;
    }
    if (updatingFavorite[restaurantId]) return;

    setUpdatingFavorite(prev => ({ ...prev, [restaurantId]: true }));
    
    const isCurrentlyFavorite = profile?.favoriteRestaurantIds?.includes(restaurantId);

    try {
      if (isCurrentlyFavorite) {
        await authService.removeFavoriteRestaurant(user.uid, restaurantId);
        toast.success("Removed from favorites");
      } else {
        await authService.addFavoriteRestaurant(user.uid, restaurantId);
        toast.success("Added to favorites");
      }
    } catch (err) {
      console.error("Failed to toggle favorite", err);
    } finally {
      setUpdatingFavorite(prev => ({ ...prev, [restaurantId]: false }));
    }
  };

  const renderSkeleton = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {[...Array(8)].map((_, i) => (
        <Card key={i} className="overflow-hidden">
          <Skeleton className="h-40 w-full" />
          <CardContent className="p-4 space-y-2">
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-4 w-1/4" />
            <Skeleton className="h-4 w-2/3" />
          </CardContent>
        </Card>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <NavBar />
      <div className="flex-grow container mx-auto py-8 px-4">
        <header className="mb-8 text-center">
          <h1 className="text-4xl font-bold mb-2">Welcome, {profile?.full_name || 'Food Lover'}!</h1>
          <p className="text-lg text-gray-600">Find your next delicious meal.</p>
        </header>

        <div className="mb-8 flex flex-col sm:flex-row gap-4 sticky top-[73px] bg-gray-50 py-4 z-40 border-b">
          <div className="relative flex-grow">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <Input 
              type="text"
              placeholder="Search restaurants by name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 input-field"
            />
          </div>
          <div className="w-full sm:w-auto sm:min-w-[200px]">
            <Select 
              value={selectedCuisine}
              onValueChange={setSelectedCuisine}
            >
              <SelectTrigger>
                <SelectValue placeholder="Filter by Cuisine" />
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
        </div>

        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-3">Categories</h2>
          <div className="flex space-x-2 overflow-x-auto pb-2">
            {categories.map(category => (
              <Button 
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category)}
                className="whitespace-nowrap"
              >
                {category}
              </Button>
            ))}
          </div>
        </div>

        {recentOrders.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-3 flex items-center">
              <History size={20} className="mr-2"/> Recent Orders
            </h2>
            <p className="text-gray-500 text-sm">Recent orders feature coming soon.</p>
          </div>
        )}

        {favoriteRestaurants.length > 0 && (
           <div className="mb-8">
             <h2 className="text-xl font-semibold mb-3 flex items-center">
               <Heart size={20} className="mr-2"/> Favorite Restaurants
             </h2>
             <p className="text-gray-500 text-sm">Favorites feature coming soon.</p>
           </div>
        )}

        {isLoading ? (
          renderSkeleton()
        ) : error ? (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error Loading Restaurants</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : filteredRestaurants.length === 0 ? (
          <Alert>
            <Utensils className="h-4 w-4" />
            <AlertTitle>No Restaurants Found</AlertTitle>
            <AlertDescription>
              No restaurants match your current search or filter criteria.
            </AlertDescription>
          </Alert>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredRestaurants.map((restaurant) => {
              const isFavorited = profile?.favoriteRestaurantIds?.includes(restaurant.id);

              return (
                <Card key={restaurant.id} className="overflow-hidden h-full flex flex-col hover:shadow-lg transition-shadow duration-300 group">
                  <div className="block relative">
                     <Button 
                        variant="ghost" 
                        size="icon" 
                        className={`absolute top-2 right-2 z-10 bg-white/70 hover:bg-white rounded-full h-8 w-8 ${updatingFavorite[restaurant.id] ? 'animate-pulse' : ''}`}
                        onClick={(e) => { 
                          e.preventDefault();
                          handleToggleFavorite(restaurant.id);
                        }}
                        disabled={updatingFavorite[restaurant.id]}
                        aria-label={isFavorited ? "Remove from favorites" : "Add to favorites"}
                      >
                       <Heart 
                         size={16} 
                         className={`${isFavorited ? 'text-red-500 fill-red-500' : 'text-gray-600'}`}
                       />
                     </Button>
                    <Link to={`/customer/restaurant/${restaurant.id}`}>
                      <img 
                        src={restaurant.image_url || '/placeholder-image.jpg'}
                        alt={restaurant.name}
                        className="h-40 w-full object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => { (e.target as HTMLImageElement).src = '/placeholder-image.jpg'; }}
                      />
                    </Link>
                  </div>
                  <CardHeader className="p-4 pb-2">
                    <CardTitle className="text-lg truncate">{restaurant.name}</CardTitle>
                     {restaurant.rating !== undefined && (
                         <div className="flex items-center mt-1">
                           <Star size={16} className="text-yellow-500 fill-yellow-400 mr-1" />
                           <span className="text-sm font-medium">{restaurant.rating.toFixed(1)}</span>
                         </div>
                      )}
                  </CardHeader>
                  <CardContent className="p-4 pt-0 flex-grow flex flex-col justify-between">
                    <div className="space-y-2 text-sm text-gray-600 mb-4">
                      {restaurant.cuisine && (
                         <div className="flex items-center">
                           <Utensils size={14} className="mr-2 text-gray-500" />
                           <span>{restaurant.cuisine}</span>
                         </div>
                      )}
                      {restaurant.address && (
                         <div className="flex items-center">
                            <MapPin size={14} className="mr-2 text-gray-500" />
                            <span className="truncate">{restaurant.address}</span>
                          </div>
                      )}
                      <div className="flex items-center justify-between">
                        {restaurant.delivery_time && (
                          <Badge variant="outline" className="text-xs">
                            <Clock size={12} className="mr-1" />
                            {restaurant.delivery_time}
                          </Badge>
                        )}
                        {restaurant.price_range && (
                          <Badge variant="secondary" className="text-xs">
                            <IndianRupee size={12} className="mr-0.5" /> 
                            {restaurant.price_range}
                          </Badge>
                        )}
                      </div>
                    </div>
                    <Link to={`/customer/restaurant/${restaurant.id}`} className="mt-auto">
                       <Button variant="outline" size="sm" className="w-full">View Menu</Button>
                    </Link>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default CustomerHome;
