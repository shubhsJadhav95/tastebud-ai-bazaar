import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { CartProvider } from "./context/CartContext";

// Pages
import Index from "./pages/Index";
import CustomerLogin from "./pages/CustomerLogin";
import RestaurantLogin from "./pages/RestaurantLogin";
import CustomerHome from "./pages/CustomerHome";
// import RestaurantDashboard from "./pages/RestaurantDashboard"; // Keep old one commented/removed for now
import RestaurantSelect from "./pages/RestaurantSelect"; // Import the new select page
import RestaurantDetail from "./pages/RestaurantDetail";
import RestaurantMenu from "./pages/RestaurantMenu";
import RestaurantProfile from "./pages/RestaurantProfile";
import CustomerProfile from "./pages/CustomerProfile";
import Cart from "./pages/Cart";
import OrderTracking from "./pages/OrderTracking";
import RestaurantOrders from "./pages/RestaurantOrders";
import CustomerOrdersPage from "./pages/customer/Orders";
import NotFound from "./pages/NotFound";

// Import the new restaurant dashboard pages
import RestaurantListPage from "./pages/dashboard/restaurants/RestaurantListPage";
import RestaurantCreatePage from "./pages/dashboard/restaurants/RestaurantCreatePage";
import RestaurantManagePage from "./pages/dashboard/restaurants/RestaurantManagePage";
// Import the new orders page
import RestaurantOrdersPage from "./pages/dashboard/orders/RestaurantOrdersPage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/customer/login" element={<CustomerLogin />} />
              <Route path="/restaurant/login" element={<RestaurantLogin />} />
              <Route path="/customer/home" element={<CustomerHome />} />
              <Route path="/customer/profile" element={<CustomerProfile />} />
              <Route path="/customer/orders" element={<CustomerOrdersPage />} />
              <Route path="/customer/restaurant/:id" element={<RestaurantDetail />} />
              <Route path="/restaurant/select" element={<RestaurantSelect />} />
              <Route path="/restaurant/menu" element={<RestaurantMenu />} />
              <Route path="/restaurant/profile" element={<RestaurantProfile />} />
              {/* <Route path="/restaurant/orders" element={<RestaurantOrders />} /> */}
              <Route path="/cart" element={<Cart />} />
              <Route path="/order-tracking" element={<OrderTracking />} />

              {/* --- New Restaurant Dashboard Routes --- */}
              <Route path="/dashboard/restaurants" element={<RestaurantListPage />} />
              <Route path="/dashboard/restaurants/new" element={<RestaurantCreatePage />} />
              <Route path="/dashboard/restaurants/:restaurantId" element={<RestaurantManagePage />} />
              {/* Add Order Management Route */}
              <Route path="/dashboard/orders" element={<RestaurantOrdersPage />} /> 
              {/* --- End New Routes --- */}

              <Route path="*" element={<NotFound />} />
            </Routes>
          </TooltipProvider>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  </QueryClientProvider>
);

export default App;
