
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
    name: "Spice Paradise",
    image: "https://images.unsplash.com/photo-1571091718767-18b5b1457add?ixlib=rb-4.0.3",
    cuisine: "North Indian",
    rating: 4.5,
    deliveryTime: "25-35 min",
    priceRange: "$$",
    address: "123 Gandhi Road, Mumbai",
    description: "Authentic North Indian cuisine with a modern twist."
  },
  {
    id: "r2",
    name: "Dosa House",
    image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?ixlib=rb-4.0.3",
    cuisine: "South Indian",
    rating: 4.2,
    deliveryTime: "30-45 min",
    priceRange: "$$",
    address: "456 MG Road, Bangalore",
    description: "Authentic South Indian dosas and idlis."
  },
  {
    id: "r3",
    name: "Street Food Corner",
    image: "https://images.unsplash.com/photo-1565299715199-866c917206bb?ixlib=rb-4.0.3",
    cuisine: "Chaat & Snacks",
    rating: 4.7,
    deliveryTime: "20-30 min",
    priceRange: "$",
    address: "789 Chandni Chowk, Delhi",
    description: "Fresh, flavorful street food and chaat."
  },
  {
    id: "r4",
    name: "Mumbai Tadka",
    image: "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?ixlib=rb-4.0.3",
    cuisine: "Mumbai Street Food",
    rating: 4.8,
    deliveryTime: "40-50 min",
    priceRange: "$$$",
    address: "101 Marine Drive, Mumbai",
    description: "Premium Mumbai street food with a twist."
  },
  {
    id: "r5",
    name: "Curry House",
    image: "https://images.unsplash.com/photo-1585937421612-70a008356fbe?ixlib=rb-4.0.3",
    cuisine: "Indian",
    rating: 4.4,
    deliveryTime: "35-45 min",
    priceRange: "$$",
    address: "202 Spice Road, Jaipur",
    description: "Authentic Indian curries with aromatic spices."
  },
  {
    id: "r6",
    name: "Biryani Palace",
    image: "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?ixlib=rb-4.0.3",
    cuisine: "Hyderabadi",
    rating: 4.3,
    deliveryTime: "25-40 min",
    priceRange: "$",
    address: "303 Nizam Street, Hyderabad",
    description: "Authentic Hyderabadi biryani made with premium basmati rice."
  }
];

export const menuItems: Record<string, MenuItem[]> = {
  r1: [
    {
      id: "m1",
      name: "Butter Chicken",
      description: "Tender chicken cooked in a rich tomato and butter gravy with aromatic spices.",
      price: 299,
      image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?ixlib=rb-4.0.3",
      calories: 650,
      restaurantId: "r1",
      restaurantName: "Spice Paradise",
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
      name: "Paneer Tikka Masala",
      description: "Cottage cheese cubes marinated with spices and grilled in tandoor, served in a creamy tomato gravy.",
      price: 249,
      image: "https://images.unsplash.com/photo-1553979459-d2229ba7433b?ixlib=rb-4.0.3",
      calories: 580,
      restaurantId: "r1",
      restaurantName: "Spice Paradise",
      nutrients: {
        protein: 25,
        carbs: 42,
        fat: 28,
        fiber: 3
      },
      servingSize: "300g"
    },
    {
      id: "m3",
      name: "Vegetable Biryani",
      description: "Fragrant basmati rice cooked with mixed vegetables and aromatic spices.",
      price: 199,
      image: "https://images.unsplash.com/photo-1520072959219-c595dc870360?ixlib=rb-4.0.3",
      calories: 450,
      restaurantId: "r1",
      restaurantName: "Spice Paradise",
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
      name: "Masala Dosa",
      description: "Crispy rice crepe filled with spiced potato filling, served with sambar and chutney.",
      price: 149,
      image: "https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?ixlib=rb-4.0.3",
      calories: 380,
      restaurantId: "r2",
      restaurantName: "Dosa House",
      nutrients: {
        protein: 8,
        carbs: 60,
        fat: 14,
        fiber: 4
      },
      servingSize: "Medium (12\")"
    },
    {
      id: "m5",
      name: "Idli Sambar",
      description: "Steamed rice cakes served with lentil soup and coconut chutney.",
      price: 129,
      image: "https://images.unsplash.com/photo-1628840042765-356cda07504e?ixlib=rb-4.0.3",
      calories: 280,
      restaurantId: "r2",
      restaurantName: "Dosa House",
      nutrients: {
        protein: 10,
        carbs: 48,
        fat: 8,
        fiber: 5
      },
      servingSize: "4 pieces"
    }
  ],
  r3: [
    {
      id: "m6",
      name: "Pav Bhaji",
      description: "Spiced vegetable mash served with buttered bread rolls.",
      price: 149,
      image: "https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?ixlib=rb-4.0.3",
      calories: 420,
      restaurantId: "r3",
      restaurantName: "Street Food Corner",
      nutrients: {
        protein: 12,
        carbs: 65,
        fat: 18,
        fiber: 8
      },
      servingSize: "1 plate (250g)"
    }
  ],
  r4: [
    {
      id: "m7",
      name: "Vada Pav",
      description: "Spicy potato fritter served in a bun with chutneys.",
      price: 79,
      image: "https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?ixlib=rb-4.0.3",
      calories: 320,
      restaurantId: "r4",
      restaurantName: "Mumbai Tadka",
      nutrients: {
        protein: 8,
        carbs: 42,
        fat: 14,
        fiber: 3
      },
      servingSize: "1 piece (180g)"
    }
  ],
  r5: [
    {
      id: "m8",
      name: "Chicken Tikka Masala",
      description: "Grilled chicken in a creamy tomato sauce with aromatic spices.",
      price: 289,
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
      name: "Hyderabadi Biryani",
      description: "Fragrant basmati rice cooked with tender meat and aromatic spices.",
      price: 259,
      image: "https://images.unsplash.com/photo-1585032226651-759b368d7246?ixlib=rb-4.0.3",
      calories: 580,
      restaurantId: "r6",
      restaurantName: "Biryani Palace",
      nutrients: {
        protein: 28,
        carbs: 65,
        fat: 18,
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
      customerAddress: `${Math.floor(Math.random() * 1000) + 1} ${['Gandhi Road', 'MG Road', 'Nehru Street', 'Rajiv Chowk'][Math.floor(Math.random() * 4)]}, ${['Mumbai', 'Delhi', 'Bangalore', 'Chennai', 'Kolkata'][Math.floor(Math.random() * 5)]}`,
      paymentMethod: Math.random() > 0.5 ? "UPI" : "Cash on Delivery"
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
    title: "Free delivery on orders above ₹300",
    description: "Use code FREEDEL",
    image: "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?ixlib=rb-4.0.3",
    code: "FREEDEL",
    discount: 0,
    expiry: "2025-12-31"
  },
  {
    id: "o3",
    title: "Buy 1 Get 1 Free on Thalis",
    description: "Only at Spice Paradise",
    image: "https://images.unsplash.com/photo-1550547660-d9450f859349?ixlib=rb-4.0.3",
    code: "THALI2X",
    discount: 100,
    expiry: "2025-06-30"
  }
];

export const cuisineFilters = [
  "All", "North Indian", "South Indian", "Street Food", "Biryani", "Chaat", "Punjabi", "Gujarati", "Bengali", "Hyderabadi"
];
