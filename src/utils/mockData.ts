import { MenuItem } from "../context/CartContext";

export interface Restaurant {
  id: string;
  name: string;
  image: string;
  cuisine: string;
  rating: number;
  deliveryTime: string;
  priceRange: string;
  address: string;
  description: string;
  logo?: string;
  openingHours?: {
    monday: { open: string; close: string };
    tuesday: { open: string; close: string };
    wednesday: { open: string; close: string };
    thursday: { open: string; close: string };
    friday: { open: string; close: string };
    saturday: { open: string; close: string };
    sunday: { open: string; close: string };
  };
  contactInfo?: {
    phone: string;
    email: string;
    website: string;
  };
}

export interface Order {
  id: string;
  restaurantId: string;
  restaurantName: string;
  items: Array<MenuItem & { quantity: number }>;
  totalAmount: number;
  status: "pending" | "preparing" | "on-the-way" | "delivered";
  createdAt: string;
  customerName: string;
  customerAddress: string;
  paymentMethod: string;
}

export const restaurants: Restaurant[] = [
  {
    id: "r1",
    name: "Burger Palace",
    image: "https://images.unsplash.com/photo-1571091718767-18b5b1457add?ixlib=rb-4.0.3",
    cuisine: "American",
    rating: 4.5,
    deliveryTime: "25-35 min",
    priceRange: "$$",
    address: "123 Main St, Foodville",
    description: "The best burgers in town, made with 100% fresh Angus beef."
  },
  {
    id: "r2",
    name: "Pizza Paradise",
    image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?ixlib=rb-4.0.3",
    cuisine: "Italian",
    rating: 4.2,
    deliveryTime: "30-45 min",
    priceRange: "$$",
    address: "456 Park Ave, Foodville",
    description: "Authentic Italian pizzas baked in a wood-fired oven."
  },
  {
    id: "r3",
    name: "Taco Temple",
    image: "https://images.unsplash.com/photo-1565299715199-866c917206bb?ixlib=rb-4.0.3",
    cuisine: "Mexican",
    rating: 4.7,
    deliveryTime: "20-30 min",
    priceRange: "$",
    address: "789 Taco St, Foodville",
    description: "Fresh, flavorful tacos made with traditional recipes."
  },
  {
    id: "r4",
    name: "Sushi Supreme",
    image: "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?ixlib=rb-4.0.3",
    cuisine: "Japanese",
    rating: 4.8,
    deliveryTime: "40-50 min",
    priceRange: "$$$",
    address: "101 Ocean Blvd, Foodville",
    description: "Premium sushi made with the freshest seafood."
  },
  {
    id: "r5",
    name: "Curry House",
    image: "https://images.unsplash.com/photo-1585937421612-70a008356fbe?ixlib=rb-4.0.3",
    cuisine: "Indian",
    rating: 4.4,
    deliveryTime: "35-45 min",
    priceRange: "$$",
    address: "202 Spice Rd, Foodville",
    description: "Authentic Indian curries with aromatic spices."
  },
  {
    id: "r6",
    name: "Noodle Palace",
    image: "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?ixlib=rb-4.0.3",
    cuisine: "Chinese",
    rating: 4.3,
    deliveryTime: "25-40 min",
    priceRange: "$",
    address: "303 Dragon St, Foodville",
    description: "Handmade noodles and dumplings made fresh daily."
  }
];

export const menuItems: Record<string, MenuItem[]> = {
  r1: [
    {
      id: "m1",
      name: "Classic Cheeseburger",
      description: "Juicy beef patty with melted cheese, lettuce, tomato, and special sauce.",
      price: 9.99,
      image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?ixlib=rb-4.0.3",
      calories: 650,
      restaurantId: "r1",
      restaurantName: "Burger Palace",
      nutrients: {
        protein: 35,
        carbs: 40,
        fat: 30,
        fiber: 2
      },
      servingSize: "250g"
    },
    {
      id: "m2",
      name: "Bacon Deluxe Burger",
      description: "Beef patty topped with crispy bacon, cheddar cheese, and BBQ sauce.",
      price: 12.99,
      image: "https://images.unsplash.com/photo-1553979459-d2229ba7433b?ixlib=rb-4.0.3",
      calories: 850,
      restaurantId: "r1",
      restaurantName: "Burger Palace",
      nutrients: {
        protein: 45,
        carbs: 42,
        fat: 48,
        fiber: 1
      },
      servingSize: "300g"
    },
    {
      id: "m3",
      name: "Veggie Burger",
      description: "Plant-based patty with fresh vegetables and vegan mayo.",
      price: 10.99,
      image: "https://images.unsplash.com/photo-1520072959219-c595dc870360?ixlib=rb-4.0.3",
      calories: 450,
      restaurantId: "r1",
      restaurantName: "Burger Palace",
      nutrients: {
        protein: 15,
        carbs: 55,
        fat: 18,
        fiber: 8
      },
      servingSize: "240g"
    }
  ],
  r2: [
    {
      id: "m4",
      name: "Margherita Pizza",
      description: "Classic pizza with tomato sauce, mozzarella, and fresh basil.",
      price: 14.99,
      image: "https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?ixlib=rb-4.0.3",
      calories: 780,
      restaurantId: "r2",
      restaurantName: "Pizza Paradise",
      nutrients: {
        protein: 28,
        carbs: 90,
        fat: 24,
        fiber: 4
      },
      servingSize: "Medium (12\")"
    },
    {
      id: "m5",
      name: "Pepperoni Pizza",
      description: "Tomato sauce, mozzarella, and spicy pepperoni slices.",
      price: 16.99,
      image: "https://images.unsplash.com/photo-1628840042765-356cda07504e?ixlib=rb-4.0.3",
      calories: 900,
      restaurantId: "r2",
      restaurantName: "Pizza Paradise",
      nutrients: {
        protein: 36,
        carbs: 88,
        fat: 38,
        fiber: 3
      },
      servingSize: "Medium (12\")"
    }
  ],
  r3: [
    {
      id: "m6",
      name: "Beef Tacos",
      description: "Three soft corn tortillas with seasoned beef, lettuce, tomato, and cheese.",
      price: 8.99,
      image: "https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?ixlib=rb-4.0.3",
      calories: 520,
      restaurantId: "r3",
      restaurantName: "Taco Temple",
      nutrients: {
        protein: 28,
        carbs: 45,
        fat: 26,
        fiber: 6
      },
      servingSize: "3 tacos (250g)"
    }
  ],
  r4: [
    {
      id: "m7",
      name: "California Roll",
      description: "Crab, avocado, and cucumber wrapped in seaweed and rice.",
      price: 12.99,
      image: "https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?ixlib=rb-4.0.3",
      calories: 320,
      restaurantId: "r4",
      restaurantName: "Sushi Supreme",
      nutrients: {
        protein: 12,
        carbs: 40,
        fat: 9,
        fiber: 3
      },
      servingSize: "8 pieces (180g)"
    }
  ],
  r5: [
    {
      id: "m8",
      name: "Chicken Tikka Masala",
      description: "Grilled chicken in a creamy tomato sauce with aromatic spices.",
      price: 15.99,
      image: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?ixlib=rb-4.0.3",
      calories: 550,
      restaurantId: "r5",
      restaurantName: "Curry House",
      nutrients: {
        protein: 32,
        carbs: 30,
        fat: 28,
        fiber: 4
      },
      servingSize: "350g"
    }
  ],
  r6: [
    {
      id: "m9",
      name: "Beef Chow Mein",
      description: "Stir-fried noodles with beef and mixed vegetables.",
      price: 11.99,
      image: "https://images.unsplash.com/photo-1585032226651-759b368d7246?ixlib=rb-4.0.3",
      calories: 480,
      restaurantId: "r6",
      restaurantName: "Noodle Palace",
      nutrients: {
        protein: 25,
        carbs: 60,
        fat: 15,
        fiber: 5
      },
      servingSize: "400g"
    }
  ]
};

export const generateRestaurantOrders = (restaurantId: string): Order[] => {
  const statuses: Array<"pending" | "preparing" | "on-the-way" | "delivered"> = [
    "pending", "preparing", "on-the-way", "delivered"
  ];
  
  return Array(5).fill(null).map((_, index) => {
    const items = menuItems[restaurantId] || [];
    const selectedItems = items.slice(0, Math.min(items.length, Math.floor(Math.random() * 3) + 1))
      .map(item => ({
        ...item,
        quantity: Math.floor(Math.random() * 3) + 1
      }));
    
    const totalAmount = selectedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const restaurant = restaurants.find(r => r.id === restaurantId);
    
    return {
      id: `order-${restaurantId}-${index}`,
      restaurantId,
      restaurantName: restaurant?.name || "Restaurant",
      items: selectedItems,
      totalAmount,
      status: statuses[Math.floor(Math.random() * statuses.length)],
      createdAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
      customerName: `Customer ${index + 1}`,
      customerAddress: `${Math.floor(Math.random() * 1000) + 1} Customer St, Cityville`,
      paymentMethod: Math.random() > 0.5 ? "Credit Card" : "Cash"
    };
  });
};

export const offers = [
  {
    id: "o1",
    title: "50% OFF on your first order",
    description: "Use code WELCOME50",
    image: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?ixlib=rb-4.0.3",
    code: "WELCOME50",
    discount: 50,
    expiry: "2025-12-31"
  },
  {
    id: "o2",
    title: "Free delivery on orders above $30",
    description: "Use code FREEDEL",
    image: "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?ixlib=rb-4.0.3",
    code: "FREEDEL",
    discount: 0,
    expiry: "2025-12-31"
  },
  {
    id: "o3",
    title: "Buy 1 Get 1 Free on Burgers",
    description: "Only at Burger Palace",
    image: "https://images.unsplash.com/photo-1550547660-d9450f859349?ixlib=rb-4.0.3",
    code: "BURGER2X",
    discount: 100,
    expiry: "2025-06-30"
  }
];

export const cuisineFilters = [
  "All", "American", "Italian", "Mexican", "Japanese", "Indian", "Chinese", "Thai", "Mediterranean"
];
