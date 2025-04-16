
import React, { useState, useEffect } from "react";
import { getAIRecommendations } from "../utils/aiUtils";
import { Sparkles, Clock, MapPin } from "lucide-react";
import { Link } from "react-router-dom";

interface AIRecommendationProps {
  userLocation: string;
}

const AIRecommendation: React.FC<AIRecommendationProps> = ({ userLocation }) => {
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Get time of day
  const getTimeOfDay = () => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return "morning";
    if (hour >= 12 && hour < 17) return "afternoon";
    if (hour >= 17 && hour < 21) return "evening";
    return "night";
  };

  useEffect(() => {
    const loadRecommendations = async () => {
      try {
        setIsLoading(true);
        const timeOfDay = getTimeOfDay();
        const results = await getAIRecommendations(timeOfDay, userLocation);
        setRecommendations(results);
      } catch (error) {
        console.error("Error fetching AI recommendations:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadRecommendations();
  }, [userLocation]);

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 animate-pulse">
        <div className="flex items-center mb-4">
          <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
          <div className="h-6 bg-gray-200 rounded w-48 ml-3"></div>
        </div>
        <div className="space-y-3">
          <div className="h-4 bg-gray-200 rounded w-full"></div>
          <div className="h-4 bg-gray-200 rounded w-5/6"></div>
          <div className="h-4 bg-gray-200 rounded w-4/6"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg shadow-md p-6 animate-fade-in">
      <div className="flex items-center mb-4">
        <Sparkles className="text-purple-500" size={24} />
        <h3 className="text-lg font-semibold ml-2">AI Powered Recommendations</h3>
      </div>
      
      <div className="mb-4 text-sm text-gray-600 flex items-center">
        <Clock className="mr-2" size={16} />
        <span>Based on time: {getTimeOfDay()}</span>
        <MapPin className="ml-4 mr-2" size={16} />
        <span>Location: {userLocation}</span>
      </div>
      
      <div className="space-y-4">
        {recommendations.map((rec, index) => (
          <div key={index} className="bg-white rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex justify-between">
              <h4 className="font-medium text-gray-800">{rec.name}</h4>
              <span className="text-xs text-purple-600 uppercase font-semibold">
                {rec.type === "restaurant" ? "Restaurant" : "Food"}
              </span>
            </div>
            <p className="text-gray-600 text-sm mt-1">{rec.reason}</p>
            {rec.type === "restaurant" && (
              <Link 
                to={`/customer/restaurant/${rec.id}`}
                className="mt-2 text-food-primary hover:text-food-secondary text-sm font-medium inline-block"
              >
                View Restaurant
              </Link>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default AIRecommendation;
