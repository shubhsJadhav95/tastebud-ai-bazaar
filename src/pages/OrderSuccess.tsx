import React, { useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { CheckCircle, ShoppingBag } from 'lucide-react';
import NavBar from '../components/NavBar';
import Footer from '../components/Footer';

const OrderSuccess: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const orderId = location.state?.orderId as string | undefined;

  // Redirect if orderId is missing in state (e.g., direct navigation)
  useEffect(() => {
    if (!orderId) {
      console.warn("Order ID missing, redirecting to home.");
      // Optional: Show a message before redirecting
      // toast.info("Order details not found, redirecting...");
      navigate('/'); 
    }
  }, [orderId, navigate]);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <NavBar />
      <div className="flex-grow flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8 text-center bg-white p-10 rounded-lg shadow-lg">
          <CheckCircle size={64} className="mx-auto text-green-500 mb-4" />
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Order Placed Successfully!
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Thank you for your order. Your delicious food is on its way.
          </p>
          {orderId && (
            <p className="mt-4 text-center text-md text-gray-800 font-medium">
              Order ID: <span className="text-indigo-600">{orderId}</span>
            </p>
          )}
          <p className="mt-2 text-center text-sm text-gray-500">
            You can track your order status in your order history (coming soon!).
          </p>
          <div>
            <Link
              to="/customer/home" 
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-food-primary hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 mt-6"
            >
              <ShoppingBag className="h-5 w-5 mr-2" aria-hidden="true" />
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default OrderSuccess; 