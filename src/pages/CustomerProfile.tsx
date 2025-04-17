
import React, { useState } from "react";
import { Link } from "react-router-dom";
import NavBar from "../components/NavBar";
import Footer from "../components/Footer";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { MapPin, CreditCard, ShoppingBag, User, Save, Gift, Coins } from "lucide-react";
import { toast } from "sonner";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger,
} from "@/components/ui/tabs";
import { 
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const CustomerProfile: React.FC = () => {
  const { user } = useAuth();
  const { cart } = useCart();
  
  const [profile, setProfile] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: "9876543210",
    supercoins: 250,
    addresses: [
      {
        id: "addr1",
        type: "Home",
        address: "123 MG Road, Koramangala, Bengaluru",
        isDefault: true
      },
      {
        id: "addr2",
        type: "Work",
        address: "456 Tech Park, Whitefield, Bengaluru",
        isDefault: false
      }
    ],
    paymentMethods: [
      {
        id: "pm1",
        type: "UPI",
        upiId: "user@ybl",
        isDefault: true
      },
      {
        id: "pm2",
        type: "Credit Card",
        lastFour: "4242",
        expiryDate: "09/25",
        isDefault: false
      }
    ]
  });
  
  const [orders, setOrders] = useState([
    {
      id: "ord1",
      date: "2025-04-10",
      restaurantName: "Spice Garden",
      totalAmount: 899.00,
      status: "delivered",
      items: ["Butter Chicken", "Naan", "Pulao"]
    },
    {
      id: "ord2",
      date: "2025-04-05",
      restaurantName: "Pizza Paradise",
      totalAmount: 649.50,
      status: "delivered",
      items: ["Margherita Pizza", "Garlic Bread", "Coke"]
    }
  ]);
  
  const [editingProfile, setEditingProfile] = useState(false);
  const [formData, setFormData] = useState({
    name: profile.name,
    email: profile.email,
    phone: profile.phone
  });
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };
  
  const handleSaveProfile = () => {
    setProfile({
      ...profile,
      name: formData.name,
      email: formData.email,
      phone: formData.phone
    });
    setEditingProfile(false);
    toast.success("Profile updated successfully");
  };
  
  const setDefaultAddress = (id: string) => {
    const updatedAddresses = profile.addresses.map(addr => ({
      ...addr,
      isDefault: addr.id === id
    }));
    
    setProfile({
      ...profile,
      addresses: updatedAddresses
    });
    
    toast.success("Default address updated");
  };
  
  const setDefaultPayment = (id: string) => {
    const updatedPayments = profile.paymentMethods.map(pm => ({
      ...pm,
      isDefault: pm.id === id
    }));
    
    setProfile({
      ...profile,
      paymentMethods: updatedPayments
    });
    
    toast.success("Default payment method updated");
  };

  // New function to handle donation and earning supercoins
  const handleDonation = () => {
    toast.success("Thank you for your donation! 50 Supercoins added to your account.");
    setProfile({
      ...profile,
      supercoins: profile.supercoins + 50
    });
  };

  return (
    <div className="min-h-screen flex flex-col">
      <NavBar />
      
      <div className="flex-grow py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center">
          <div>
            <h1 className="text-2xl font-bold mb-2">My Profile</h1>
            <p className="text-gray-600">Manage your account settings and preferences</p>
          </div>
          
          <div className="mt-4 md:mt-0 flex items-center bg-amber-50 p-3 rounded-lg">
            <Coins className="text-amber-500 mr-2" size={20} />
            <div>
              <p className="text-sm text-gray-600">Your Supercoins</p>
              <p className="font-bold text-amber-600">{profile.supercoins}</p>
            </div>
          </div>
        </div>
        
        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="mb-8 bg-gray-100 w-full overflow-x-auto flex whitespace-nowrap">
            <TabsTrigger value="profile" className="data-[state=active]:bg-white">
              <User size={16} className="mr-2" />
              Profile
            </TabsTrigger>
            <TabsTrigger value="addresses" className="data-[state=active]:bg-white">
              <MapPin size={16} className="mr-2" />
              Addresses
            </TabsTrigger>
            <TabsTrigger value="payments" className="data-[state=active]:bg-white">
              <CreditCard size={16} className="mr-2" />
              Payment Methods
            </TabsTrigger>
            <TabsTrigger value="orders" className="data-[state=active]:bg-white">
              <ShoppingBag size={16} className="mr-2" />
              Order History
            </TabsTrigger>
            <TabsTrigger value="supercoins" className="data-[state=active]:bg-white">
              <Coins size={16} className="mr-2" />
              Supercoins
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="profile" className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">Personal Information</h2>
              {!editingProfile && (
                <button 
                  className="text-food-primary hover:text-food-secondary"
                  onClick={() => setEditingProfile(true)}
                >
                  Edit
                </button>
              )}
            </div>
            
            {editingProfile ? (
              <div className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    className="input-field"
                    value={formData.name}
                    onChange={handleInputChange}
                  />
                </div>
                
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    className="input-field"
                    value={formData.email}
                    onChange={handleInputChange}
                  />
                </div>
                
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    className="input-field"
                    value={formData.phone}
                    onChange={handleInputChange}
                  />
                </div>
                
                <div className="flex justify-end space-x-4 mt-6">
                  <button
                    className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                    onClick={() => setEditingProfile(false)}
                  >
                    Cancel
                  </button>
                  <button
                    className="btn-primary flex items-center"
                    onClick={handleSaveProfile}
                  >
                    <Save size={16} className="mr-2" />
                    Save Changes
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center mb-6">
                  <Avatar className="h-20 w-20 mr-6">
                    <AvatarImage src="https://source.unsplash.com/random/200x200/?face" />
                    <AvatarFallback>{profile.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="text-xl font-semibold">{profile.name}</h3>
                    <p className="text-gray-500">{profile.email}</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Full Name</p>
                    <p className="font-medium">{profile.name}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-500">Email Address</p>
                    <p className="font-medium">{profile.email}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-500">Phone Number</p>
                    <p className="font-medium">{profile.phone}</p>
                  </div>
                </div>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="addresses" className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">Saved Addresses</h2>
              <button className="btn-primary text-sm py-1.5">
                Add New Address
              </button>
            </div>
            
            <div className="space-y-4">
              {profile.addresses.map(address => (
                <div 
                  key={address.id} 
                  className={`border p-4 rounded-lg ${address.isDefault ? 'border-food-primary bg-food-accent/10' : ''}`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium">{address.type}</p>
                      <p className="text-gray-600 mt-1">{address.address}</p>
                    </div>
                    <div className="flex space-x-3">
                      {!address.isDefault && (
                        <button 
                          className="text-food-primary text-sm hover:underline"
                          onClick={() => setDefaultAddress(address.id)}
                        >
                          Set as Default
                        </button>
                      )}
                      <button className="text-gray-500 text-sm hover:underline">
                        Edit
                      </button>
                    </div>
                  </div>
                  {address.isDefault && (
                    <span className="inline-block mt-2 text-xs text-food-primary bg-food-accent/20 px-2 py-0.5 rounded">
                      Default Address
                    </span>
                  )}
                </div>
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="payments" className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">Payment Methods</h2>
              <button className="btn-primary text-sm py-1.5">
                Add New Payment Method
              </button>
            </div>
            
            <div className="space-y-4">
              {profile.paymentMethods.map(payment => (
                <div 
                  key={payment.id} 
                  className={`border p-4 rounded-lg ${payment.isDefault ? 'border-food-primary bg-food-accent/10' : ''}`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium">{payment.type}</p>
                      {payment.type === 'UPI' ? (
                        <p className="text-gray-600 mt-1">{payment.upiId}</p>
                      ) : (
                        <>
                          <p className="text-gray-600 mt-1">**** **** **** {payment.lastFour}</p>
                          <p className="text-gray-500 text-sm mt-1">Expires: {payment.expiryDate}</p>
                        </>
                      )}
                    </div>
                    <div className="flex space-x-3">
                      {!payment.isDefault && (
                        <button 
                          className="text-food-primary text-sm hover:underline"
                          onClick={() => setDefaultPayment(payment.id)}
                        >
                          Set as Default
                        </button>
                      )}
                      <button className="text-gray-500 text-sm hover:underline">
                        Edit
                      </button>
                    </div>
                  </div>
                  {payment.isDefault && (
                    <span className="inline-block mt-2 text-xs text-food-primary bg-food-accent/20 px-2 py-0.5 rounded">
                      Default Payment Method
                    </span>
                  )}
                </div>
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="orders" className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-6">Order History</h2>
            
            <div className="space-y-4">
              {orders.map(order => (
                <div key={order.id} className="border rounded-lg overflow-hidden">
                  <div className="bg-gray-50 p-4 flex flex-wrap justify-between">
                    <div>
                      <p className="font-medium">{order.restaurantName}</p>
                      <p className="text-sm text-gray-500">{new Date(order.date).toLocaleDateString()}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">₹{order.totalAmount.toFixed(2)}</p>
                      <span className="inline-block text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded capitalize">
                        {order.status}
                      </span>
                    </div>
                  </div>
                  <div className="p-4">
                    <p className="text-sm text-gray-600 mb-3">
                      {order.items.join(", ")}
                    </p>
                    <div className="flex justify-end">
                      <Link 
                        to={`/order-tracking?id=${order.id}`} 
                        className="text-food-primary text-sm hover:underline"
                      >
                        View Order Details
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="supercoins" className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-6">Supercoins</h2>
            
            <div className="bg-amber-50 rounded-lg p-6 mb-8">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Coins className="text-amber-500 mr-3" size={30} />
                  <div>
                    <h3 className="font-bold text-xl">{profile.supercoins}</h3>
                    <p className="text-sm text-gray-600">Available Supercoins</p>
                  </div>
                </div>
                <Link to="#" className="text-food-primary hover:underline text-sm">View History</Link>
              </div>
            </div>
            
            <h3 className="font-semibold text-lg mb-4">Earn More Supercoins</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              <div className="border rounded-lg p-4 hover:shadow-md transition">
                <div className="flex items-start">
                  <div className="bg-blue-100 p-2 rounded mr-3">
                    <ShoppingBag className="text-blue-500" size={20} />
                  </div>
                  <div>
                    <h4 className="font-medium">Order Food</h4>
                    <p className="text-sm text-gray-600 mt-1">Earn 10 Supercoins for every ₹100 spent on food orders</p>
                  </div>
                </div>
              </div>
              
              <div className="border rounded-lg p-4 hover:shadow-md transition">
                <div className="flex items-start">
                  <div className="bg-green-100 p-2 rounded mr-3">
                    <Gift className="text-green-500" size={20} />
                  </div>
                  <div>
                    <h4 className="font-medium">Make a Donation</h4>
                    <p className="text-sm text-gray-600 mt-1">Earn 50 Supercoins when you donate to a charity</p>
                    <button 
                      onClick={handleDonation}
                      className="mt-2 text-sm bg-green-500 text-white py-1 px-3 rounded hover:bg-green-600"
                    >
                      Donate Now
                    </button>
                  </div>
                </div>
              </div>
            </div>
            
            <h3 className="font-semibold text-lg mb-4">Redeem Supercoins</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="border rounded-lg overflow-hidden hover:shadow-md transition">
                <div className="h-32 bg-gray-100">
                  <img src="https://source.unsplash.com/random/300x200/?food" alt="Food discount" className="w-full h-full object-cover" />
                </div>
                <div className="p-3">
                  <h4 className="font-medium">₹100 Off</h4>
                  <div className="flex justify-between items-center mt-2">
                    <span className="font-bold text-amber-600 flex items-center">
                      <Coins size={14} className="mr-1" />
                      200
                    </span>
                    <button className="text-sm bg-food-primary text-white py-1 px-3 rounded hover:bg-food-secondary">
                      Redeem
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="border rounded-lg overflow-hidden hover:shadow-md transition">
                <div className="h-32 bg-gray-100">
                  <img src="https://source.unsplash.com/random/300x200/?delivery" alt="Free delivery" className="w-full h-full object-cover" />
                </div>
                <div className="p-3">
                  <h4 className="font-medium">Free Delivery (3 orders)</h4>
                  <div className="flex justify-between items-center mt-2">
                    <span className="font-bold text-amber-600 flex items-center">
                      <Coins size={14} className="mr-1" />
                      150
                    </span>
                    <button className="text-sm bg-food-primary text-white py-1 px-3 rounded hover:bg-food-secondary">
                      Redeem
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="border rounded-lg overflow-hidden hover:shadow-md transition">
                <div className="h-32 bg-gray-100">
                  <img src="https://source.unsplash.com/random/300x200/?dessert" alt="Free dessert" className="w-full h-full object-cover" />
                </div>
                <div className="p-3">
                  <h4 className="font-medium">Free Dessert</h4>
                  <div className="flex justify-between items-center mt-2">
                    <span className="font-bold text-amber-600 flex items-center">
                      <Coins size={14} className="mr-1" />
                      100
                    </span>
                    <button className="text-sm bg-food-primary text-white py-1 px-3 rounded hover:bg-food-secondary">
                      Redeem
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
      
      <Footer />
    </div>
  );
};

export default CustomerProfile;
