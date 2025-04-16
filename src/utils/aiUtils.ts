
// AI recommendation utility

export interface AIRecommendation {
  type: "restaurant" | "food";
  id: string;
  name: string;
  reason: string;
}

// Simulate AI recommendation based on time of day and user preferences
export const getAIRecommendations = (
  timeOfDay: string,
  userLocation: string,
  previousOrders?: string[]
): Promise<AIRecommendation[]> => {
  return new Promise((resolve) => {
    // Simulate API call delay
    setTimeout(() => {
      const recommendations: AIRecommendation[] = [];
      
      // Breakfast recommendations (6am to 11am)
      const breakfastItems = [
        {
          type: "restaurant" as const,
          id: "r2",
          name: "Pizza Paradise",
          reason: "Their breakfast pizza is a popular morning option near your location."
        },
        {
          type: "food" as const,
          id: "m3",
          name: "Veggie Burger",
          reason: "A lighter option that's perfect for starting your day with plenty of nutrients."
        }
      ];
      
      // Lunch recommendations (11am to 3pm)
      const lunchItems = [
        {
          type: "restaurant" as const,
          id: "r1",
          name: "Burger Palace",
          reason: "Quick service perfect for your lunch break and close to your location."
        },
        {
          type: "food" as const,
          id: "m6",
          name: "Beef Tacos",
          reason: "A popular lunch option that's flavorful and filling."
        }
      ];
      
      // Dinner recommendations (3pm to 10pm)
      const dinnerItems = [
        {
          type: "restaurant" as const,
          id: "r5",
          name: "Curry House",
          reason: "Highly rated dinner options with rich flavors, perfect for evening meals."
        },
        {
          type: "food" as const,
          id: "m8",
          name: "Chicken Tikka Masala",
          reason: "One of the most ordered dinner items in your area."
        }
      ];
      
      // Late night recommendations (10pm to 6am)
      const lateNightItems = [
        {
          type: "restaurant" as const,
          id: "r6",
          name: "Noodle Palace",
          reason: "Open late and offering quick delivery to your location."
        },
        {
          type: "food" as const,
          id: "m9",
          name: "Beef Chow Mein",
          reason: "A satisfying late-night meal that's not too heavy."
        }
      ];
      
      // Get current hour to determine time of day
      const currentHour = new Date().getHours();
      
      // Select recommendations based on time of day
      if (currentHour >= 6 && currentHour < 11) {
        recommendations.push(...breakfastItems);
      } else if (currentHour >= 11 && currentHour < 15) {
        recommendations.push(...lunchItems);
      } else if (currentHour >= 15 && currentHour < 22) {
        recommendations.push(...dinnerItems);
      } else {
        recommendations.push(...lateNightItems);
      }
      
      // Add location-based recommendation
      recommendations.push({
        type: "restaurant",
        id: "r3",
        name: "Taco Temple",
        reason: `Closest to your location at ${userLocation} with fastest delivery time.`
      });
      
      resolve(recommendations);
    }, 1500);
  });
};

// Get calorie information for a food item
export const getCalorieInformation = (foodName: string): Promise<{
  calories: number;
  recommendation: string;
}> => {
  return new Promise((resolve) => {
    // Simulate API call delay
    setTimeout(() => {
      // Sample calorie data for common food items
      const calorieData: Record<string, number> = {
        "burger": 550,
        "cheeseburger": 650,
        "pizza": 300,
        "taco": 180,
        "burrito": 400,
        "sushi": 350,
        "fried rice": 450,
        "pasta": 380,
        "salad": 150,
        "sandwich": 350,
        "curry": 420,
        "noodles": 380,
        "ice cream": 250,
        "cake": 350,
        "donut": 240
      };
      
      // Find matching food item (case insensitive)
      const normalizedFoodName = foodName.toLowerCase();
      let calories = 0;
      
      for (const [key, value] of Object.entries(calorieData)) {
        if (normalizedFoodName.includes(key)) {
          calories = value;
          break;
        }
      }
      
      // If no match found, generate a random estimate
      if (calories === 0) {
        calories = Math.floor(Math.random() * 500) + 200;
      }
      
      // Generate recommendation based on calories
      let recommendation = "";
      if (calories < 250) {
        recommendation = "This is a low-calorie option, good for weight management.";
      } else if (calories < 400) {
        recommendation = "This is a moderate-calorie option, suitable for a balanced meal.";
      } else {
        recommendation = "This is a high-calorie option. Consider sharing or balancing with lighter meals.";
      }
      
      resolve({ calories, recommendation });
    }, 1000);
  });
};
