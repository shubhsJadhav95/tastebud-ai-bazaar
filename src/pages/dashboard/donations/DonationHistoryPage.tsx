import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuthContext } from '@/contexts/AuthContext';
import { orderService } from '@/services/orderService';
import { ngoService } from '@/services/ngoService'; // Import NGO service
import { Order } from '@/types';
import NavBar from '@/components/NavBar';
import Footer from '@/components/Footer';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, Inbox, Gift, Calendar, User, Loader2, Building2 } from 'lucide-react'; // Added Loader2, Building2
import { format } from 'date-fns';

const DonationHistoryPage: React.FC = () => {
  const { restaurantId } = useParams<{ restaurantId: string }>();
  const { user, loading: authLoading } = useAuthContext();
  const [donatedOrders, setDonatedOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // State for NGO names
  const [ngoNames, setNgoNames] = useState<Record<string, string>>({});
  const [loadingNgoNames, setLoadingNgoNames] = useState(false);

  // Effect to fetch donated orders
  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      setError('Please log in to view donation history.');
      setLoading(false);
      return;
    }
    if (!restaurantId) {
        setError('Restaurant ID is missing.');
        setLoading(false);
        return;
    }

    setLoading(true);
    setError(null);

    orderService.getDonatedOrdersByRestaurant(restaurantId)
      .then(orders => {
        setDonatedOrders(orders);
        setError(null);
      })
      .catch(err => {
        console.error("Error fetching donated orders:", err);
        setError('Failed to fetch donation history. ' + (err.message || ''));
      })
      .finally(() => {
        setLoading(false);
      });

  }, [restaurantId, user, authLoading]);

  // Effect to fetch NGO names after orders are loaded
  useEffect(() => {
    if (donatedOrders.length > 0) {
      const ngoIds = [...new Set(donatedOrders.map(order => order.donatedToNgoId).filter(id => !!id))] as string[];
      
      if (ngoIds.length > 0) {
        setLoadingNgoNames(true);
        const promises = ngoIds.map(id => 
            ngoService.getNgoById(id).then(ngo => ({ id, name: ngo?.name }))
        );

        Promise.all(promises)
            .then(results => {
                const namesMap = results.reduce((acc, current) => {
                    if (current.id && current.name) {
                        acc[current.id] = current.name;
                    }
                    return acc;
                }, {} as Record<string, string>);
                setNgoNames(namesMap);
            })
            .catch(err => {
                console.error("Error fetching some NGO names:", err);
                // Handle partial errors if needed, maybe set a generic error state
            })
            .finally(() => {
                setLoadingNgoNames(false);
            });
      }
    }
  }, [donatedOrders]); // Run when donatedOrders changes


  const renderSkeleton = () => (
    <div className="space-y-4">
      {[...Array(3)].map((_, i) => (
        // Adjusted skeleton height for more content
        <Skeleton key={i} className="h-36 w-full rounded-md" /> 
      ))}
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col">
      <NavBar /> 
      <div className="flex-grow container mx-auto py-8 px-4">
        <header className="mb-8">
          <h1 className="text-3xl font-bold">Donation History</h1>
          <p className="text-gray-600">Showing food items donated by customers for this restaurant.</p>
          {restaurantId && (
            <Link 
              to={`/dashboard/restaurants/${restaurantId}`} 
              className="text-sm text-food-primary hover:underline mt-2 inline-block"
            >
              &larr; Back to Restaurant Management
            </Link>
          )}
        </header>

        {loading ? (
          renderSkeleton()
        ) : error ? (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : donatedOrders.length === 0 ? (
          <Alert>
            <Inbox className="h-4 w-4" />
            <AlertTitle>No Donations Yet</AlertTitle>
            <AlertDescription>
              There are no recorded donations for this restaurant yet.
            </AlertDescription>
          </Alert>
        ) : (
          <div className="space-y-6">
            {donatedOrders.map(order => (
              <div key={order.id} className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
                <div className="flex justify-between items-center mb-4 pb-3 border-b flex-wrap gap-2">
                   <h2 className="text-lg font-semibold">Order ID: {order.id.substring(0, 8)}...</h2>
                   <span className="text-sm text-gray-500 flex items-center">
                     <Calendar size={14} className="mr-1.5" /> 
                     {order.createdAt && typeof order.createdAt === 'object' && 'toDate' in order.createdAt 
                       ? format(order.createdAt.toDate(), 'PPp') 
                       : 'Date N/A'}
                   </span>
                </div>
                
                {/* Donated To Section */}
                {order.donatedToNgoId && (
                    <div className="mb-4 pb-3 border-b">
                        <h3 className="text-md font-semibold mb-1 flex items-center text-blue-700">
                             <Building2 size={16} className="mr-2"/> Donated To:
                        </h3>
                        <p className="text-sm pl-6">
                            {loadingNgoNames ? (
                                <span className="flex items-center text-gray-500">
                                    <Loader2 size={14} className="animate-spin mr-1.5" /> Loading NGO...
                                </span>
                             ) : ngoNames[order.donatedToNgoId] ? (
                                ngoNames[order.donatedToNgoId]
                             ) : (
                                <span className="text-red-600 italic">NGO details not found (ID: {order.donatedToNgoId.substring(0,6)}...)</span>
                             )}
                        </p>
                    </div>
                )}

                <div className="mb-4">
                    <h3 className="text-md font-semibold mb-2 flex items-center">
                        <Gift size={16} className="mr-2 text-green-600"/> Donated Items
                    </h3>
                    <ul className="list-disc list-inside pl-2 space-y-1 text-sm text-gray-700">
                        {order.items.map((item, index) => (
                            <li key={`${item.menuItemId}-${index}`}>
                                {item.quantity} x {item.name} 
                            </li>
                        ))}
                    </ul>
                </div>
                 <div className="text-xs text-gray-500 flex items-center pt-3 border-t">
                    <User size={12} className="mr-1.5" /> 
                    Customer ID: {order.customer_id ? `${order.customer_id.substring(0, 6)}...` : 'N/A'} 
                 </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <Footer /> 
    </div>
  );
};

export default DonationHistoryPage; 