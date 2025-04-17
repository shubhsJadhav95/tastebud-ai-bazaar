
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { 
  ShoppingCart, 
  User, 
  LogOut, 
  Menu, 
  X, 
  Home, 
  UtensilsCrossed, 
  History, 
  Settings,
  IndianRupee,
  UserCircle,
  Coins
} from "lucide-react";

const NavBar: React.FC = () => {
  const { user, logout, userType } = useAuth();
  const { itemCount } = useCart();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <nav className="bg-white shadow-md py-4 px-6 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Link 
              to={userType === "customer" ? "/customer/home" : userType === "restaurant" ? "/restaurant/dashboard" : "/"} 
              className="flex items-center"
            >
              <span className="text-food-primary text-2xl font-bold">Swadisht</span>
            </Link>
          </div>

          <div className="hidden md:flex items-center space-x-8">
            {user ? (
              <>
                {userType === "customer" && (
                  <>
                    <Link to="/customer/home" className="text-gray-700 hover:text-food-primary transition-colors">
                      Home
                    </Link>
                    <Link to="/customer/orders" className="text-gray-700 hover:text-food-primary transition-colors">
                      Orders
                    </Link>
                    <Link to="/customer/profile" className="text-gray-700 hover:text-food-primary transition-colors">
                      <UserCircle className="inline mr-1" size={18} />
                      Profile
                    </Link>
                    <Link to="/cart" className="relative">
                      <ShoppingCart className="text-gray-700 hover:text-food-primary transition-colors" />
                      {itemCount > 0 && (
                        <span className="absolute -top-2 -right-2 bg-food-primary text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                          {itemCount}
                        </span>
                      )}
                    </Link>
                  </>
                )}
                {userType === "restaurant" && (
                  <>
                    <Link to="/restaurant/dashboard" className="text-gray-700 hover:text-food-primary transition-colors">
                      Dashboard
                    </Link>
                    <Link to="/restaurant/menu" className="text-gray-700 hover:text-food-primary transition-colors">
                      Menu
                    </Link>
                    <Link to="/restaurant/orders" className="text-gray-700 hover:text-food-primary transition-colors">
                      Orders
                    </Link>
                  </>
                )}
                <div className="flex items-center space-x-4">
                  <span className="text-gray-700">{user.name}</span>
                  <button 
                    onClick={handleLogout}
                    className="flex items-center text-gray-700 hover:text-food-primary transition-colors"
                  >
                    <LogOut size={18} className="mr-1" />
                    <span>Logout</span>
                  </button>
                </div>
              </>
            ) : (
              <>
                <Link to="/" className="text-gray-700 hover:text-food-primary transition-colors">
                  Home
                </Link>
                <Link to="/customer/login" className="text-gray-700 hover:text-food-primary transition-colors">
                  Login
                </Link>
              </>
            )}
          </div>

          <div className="md:hidden">
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-gray-700"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden mt-4 space-y-4">
            {user ? (
              <>
                {userType === "customer" && (
                  <>
                    <Link 
                      to="/customer/home" 
                      className="flex items-center text-gray-700 hover:text-food-primary transition-colors py-2"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <Home size={18} className="mr-2" />
                      <span>Home</span>
                    </Link>
                    <Link 
                      to="/customer/profile" 
                      className="flex items-center text-gray-700 hover:text-food-primary transition-colors py-2"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <UserCircle size={18} className="mr-2" />
                      <span>Profile</span>
                    </Link>
                    <Link 
                      to="/customer/orders" 
                      className="flex items-center text-gray-700 hover:text-food-primary transition-colors py-2"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <History size={18} className="mr-2" />
                      <span>Orders</span>
                    </Link>
                    <Link 
                      to="/cart" 
                      className="flex items-center text-gray-700 hover:text-food-primary transition-colors py-2"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <ShoppingCart size={18} className="mr-2" />
                      <span>Cart {itemCount > 0 && `(${itemCount})`}</span>
                    </Link>
                  </>
                )}
                {userType === "restaurant" && (
                  <>
                    <Link 
                      to="/restaurant/dashboard" 
                      className="flex items-center text-gray-700 hover:text-food-primary transition-colors py-2"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <Home size={18} className="mr-2" />
                      <span>Dashboard</span>
                    </Link>
                    <Link 
                      to="/restaurant/menu" 
                      className="flex items-center text-gray-700 hover:text-food-primary transition-colors py-2"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <UtensilsCrossed size={18} className="mr-2" />
                      <span>Menu</span>
                    </Link>
                    <Link 
                      to="/restaurant/orders" 
                      className="flex items-center text-gray-700 hover:text-food-primary transition-colors py-2"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <History size={18} className="mr-2" />
                      <span>Orders</span>
                    </Link>
                    <Link 
                      to="/restaurant/settings" 
                      className="flex items-center text-gray-700 hover:text-food-primary transition-colors py-2"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <Settings size={18} className="mr-2" />
                      <span>Settings</span>
                    </Link>
                  </>
                )}
                <div className="border-t pt-2">
                  <div className="flex items-center text-gray-700 py-2">
                    <User size={18} className="mr-2" />
                    <span>{user.name}</span>
                  </div>
                  <button 
                    onClick={() => {
                      handleLogout();
                      setMobileMenuOpen(false);
                    }}
                    className="flex items-center text-gray-700 hover:text-food-primary transition-colors py-2 w-full"
                  >
                    <LogOut size={18} className="mr-2" />
                    <span>Logout</span>
                  </button>
                </div>
              </>
            ) : (
              <>
                <Link 
                  to="/" 
                  className="flex items-center text-gray-700 hover:text-food-primary transition-colors py-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Home size={18} className="mr-2" />
                  <span>Home</span>
                </Link>
                <Link 
                  to="/customer/login" 
                  className="flex items-center text-gray-700 hover:text-food-primary transition-colors py-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <User size={18} className="mr-2" />
                  <span>Login</span>
                </Link>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

export default NavBar;
