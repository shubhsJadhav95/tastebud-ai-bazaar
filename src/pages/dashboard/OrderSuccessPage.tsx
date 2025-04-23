import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { CheckCircle, ListOrdered } from 'lucide-react';

// Basic component without NavBar/Footer, assuming it's part of a dashboard layout
const DashboardOrderSuccessPage: React.FC = () => {
  const location = useLocation();
  const orderId = location.state?.orderId as string | undefined;

  return (
    <div className="p-6 bg-gray-100 min-h-screen flex items-center justify-center">
        <div className="max-w-lg w-full space-y-6 text-center bg-white p-8 rounded-lg shadow-md">
          <CheckCircle size={56} className="mx-auto text-green-500 mb-3" />
          <h2 className="text-2xl font-semibold text-gray-900">
            Order Action Completed
          </h2>
          <p className="text-sm text-gray-600">
            The order status has been updated successfully.
          </p>
          {orderId && (
            <p className="text-md text-gray-800">
              Order ID: <span className="font-medium text-indigo-600">{orderId}</span>
            </p>
          )}
           {/* Link back to the main dashboard orders list */}
          <Link
            to="/dashboard/orders"
            className="inline-flex items-center justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 mt-5"
          >
            <ListOrdered className="h-5 w-5 mr-2" aria-hidden="true" />
            Back to Orders List
          </Link>
        </div>
    </div>
  );
};

export default DashboardOrderSuccessPage; 