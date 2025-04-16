
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import NavBar from "../components/NavBar";
import Footer from "../components/Footer";
import { useAuth } from "../context/AuthContext";
import { generateRestaurantOrders } from "../utils/mockData";
import { 
  ShoppingBag, 
  Clock, 
  CheckCircle, 
  Truck, 
  BarChart4, 
  DollarSign, 
  Users, 
  TrendingUp 
} from "lucide-react";

const RestaurantDashboard: React.FC = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState<any[]>([]);
  const [stats, setStats] = useState({
    totalOrders: 0,
    revenue: 0,
    pendingOrders: 0,
    completedOrders: 0
  });

  // Simulate loading orders for this restaurant
  useEffect(() => {
    const restaurantId = "r1"; // Mock restaurant ID
    const loadedOrders = generateRestaurantOrders(restaurantId);
    setOrders(loadedOrders);
    
    // Calculate stats
    const totalOrders = loadedOrders.length;
    const revenue = loadedOrders.reduce((sum, order) => sum + order.totalAmount, 0);
    const pendingOrders = loadedOrders.filter(order => 
      order.status === "pending" || order.status === "preparing" || order.status === "on-the-way"
    ).length;
    const completedOrders = loadedOrders.filter(order => order.status === "delivered").length;
    
    setStats({
      totalOrders,
      revenue,
      pendingOrders,
      completedOrders
    });
  }, []);

  // Helper function to get status icon
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock size={20} className="text-yellow-500" />;
      case "preparing":
        return <ShoppingBag size={20} className="text-blue-500" />;
      case "on-the-way":
        return <Truck size={20} className="text-purple-500" />;
      case "delivered":
        return <CheckCircle size={20} className="text-green-500" />;
      default:
        return null;
    }
  };

  // Helper function to get status text
  const getStatusText = (status: string) => {
    switch (status) {
      case "pending":
        return "Pending";
      case "preparing":
        return "Preparing";
      case "on-the-way":
        return "On the way";
      case "delivered":
        return "Delivered";
      default:
        return status;
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <NavBar />
      
      <div className="flex-grow bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-2xl font-bold mb-2">Restaurant Dashboard</h1>
            <p className="text-gray-600">
              Welcome back, {user?.name || "Restaurant Owner"}!
            </p>
          </div>
          
          {/* Stats Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex items-center mb-3">
                <div className="bg-blue-100 p-3 rounded-full mr-4">
                  <ShoppingBag size={24} className="text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Total Orders</p>
                  <h3 className="text-2xl font-bold">{stats.totalOrders}</h3>
                </div>
              </div>
              <div className="flex items-center text-sm text-green-600">
                <TrendingUp size={14} className="mr-1" />
                <span>8% from yesterday</span>
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex items-center mb-3">
                <div className="bg-green-100 p-3 rounded-full mr-4">
                  <DollarSign size={24} className="text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Revenue</p>
                  <h3 className="text-2xl font-bold">${stats.revenue.toFixed(2)}</h3>
                </div>
              </div>
              <div className="flex items-center text-sm text-green-600">
                <TrendingUp size={14} className="mr-1" />
                <span>12% from last week</span>
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex items-center mb-3">
                <div className="bg-yellow-100 p-3 rounded-full mr-4">
                  <Clock size={24} className="text-yellow-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Pending Orders</p>
                  <h3 className="text-2xl font-bold">{stats.pendingOrders}</h3>
                </div>
              </div>
              <div className="flex items-center text-sm text-yellow-600">
                <span>Need attention</span>
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex items-center mb-3">
                <div className="bg-purple-100 p-3 rounded-full mr-4">
                  <Users size={24} className="text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Customers</p>
                  <h3 className="text-2xl font-bold">{Math.floor(stats.totalOrders * 0.8)}</h3>
                </div>
              </div>
              <div className="flex items-center text-sm text-green-600">
                <TrendingUp size={14} className="mr-1" />
                <span>5% new customers</span>
              </div>
            </div>
          </div>
          
          {/* Recent Orders Section */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Recent Orders</h2>
              <Link to="/restaurant/orders" className="text-food-secondary hover:text-teal-600 text-sm font-medium">
                View all orders
              </Link>
            </div>
            
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Order ID
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Customer
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Items
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Total
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Time
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {orders.slice(0, 5).map((order) => (
                      <tr key={order.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          #{order.id.split('-').pop()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {order.customerName}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {order.items.length} items
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          ${order.totalAmount.toFixed(2)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            {getStatusIcon(order.status)}
                            <span className="ml-2 text-sm text-gray-900">
                              {getStatusText(order.status)}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <Link to={`/restaurant/orders/${order.id}`} className="text-food-secondary hover:text-teal-600">
                            View
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
          
          {/* Quick Links Section */}
          <div>
            <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              <Link to="/restaurant/menu" className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
                <h3 className="font-semibold mb-2">Manage Menu</h3>
                <p className="text-sm text-gray-600">Update your menu items, prices, and availability</p>
              </Link>
              
              <Link to="/restaurant/settings" className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
                <h3 className="font-semibold mb-2">Restaurant Settings</h3>
                <p className="text-sm text-gray-600">Update your restaurant profile, hours, and delivery settings</p>
              </Link>
              
              <Link to="/restaurant/reports" className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
                <h3 className="font-semibold mb-2">View Reports</h3>
                <p className="text-sm text-gray-600">See detailed analytics and performance reports</p>
              </Link>
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default RestaurantDashboard;
