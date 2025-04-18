import React from "react";
import { Link } from "react-router-dom";
import { Star, Clock } from "lucide-react";
import { Restaurant } from "@/types";

interface RestaurantCardProps {
  restaurant: Restaurant;
}

const RestaurantCard: React.FC<RestaurantCardProps> = ({ restaurant }) => {
  const imageUrl = restaurant.image_url || restaurant.image || "https://placehold.co/600x400/png?text=Restaurant";
  const deliveryTime = restaurant.delivery_time || restaurant.deliveryTime || "N/A";
  const priceRange = restaurant.price_range || restaurant.priceRange || "N/A";
  const rating = restaurant.rating || 0;

  return (
    <Link to={`/customer/restaurant/${restaurant.id}`} className="restaurant-card block animate-scale-in">
      <div className="relative h-48 overflow-hidden rounded-t-lg">
        <img
          src={imageUrl}
          alt={restaurant.name}
          className="w-full h-full object-cover transition-transform hover:scale-105"
        />
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
          <span className="bg-white px-2 py-1 rounded text-xs font-semibold">
            {restaurant.cuisine || 'Various'}
          </span>
        </div>
      </div>
      <div className="p-4">
        <div className="flex justify-between items-start">
          <h3 className="font-bold text-lg truncate">{restaurant.name}</h3>
          <div className="flex items-center bg-green-100 px-2 py-1 rounded">
            <Star size={14} className="text-yellow-500 mr-1" />
            <span className="text-sm font-semibold">{rating > 0 ? rating.toFixed(1) : 'New'}</span>
          </div>
        </div>
        <p className="text-gray-500 text-sm mt-1 mb-3 truncate">{restaurant.address || 'Address not specified'}</p>
        <div className="flex justify-between items-center">
          <div className="flex items-center text-gray-600">
            <Clock size={14} className="mr-1" />
            <span className="text-sm">{deliveryTime}</span>
          </div>
          <div className="text-sm text-gray-600">
            Price: {priceRange}
          </div>
        </div>
      </div>
    </Link>
  );
};

export default RestaurantCard;
