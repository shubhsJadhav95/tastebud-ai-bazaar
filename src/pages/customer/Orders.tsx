import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthContext } from '@/contexts/AuthContext';
import { orderService } from '@/services/orderService';
import { Order } from '@/types'; // Assuming Order type is defined in @/types
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { format } from 'date-fns'; // For formatting timestamps

const CustomerOrdersPage: React.FC = () => {
  const { user } = useAuthContext();
  const [orders, setOrders] = useState<Order[]>([]);
  const [restaurantNames, setRestaurantNames] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user?.uid) {
      setLoading(false);
      // Optionally show a message prompting login
      // setError("Please log in to view your orders.");
      return;
    }

    setLoading(true);
    setError(null);

    const unsubscribe = orderService.getOrdersByUser(user.uid, async (fetchedOrders) => {
      setOrders(fetchedOrders);
      setError(null);
      
      // Fetch restaurant names for new orders
      if (fetchedOrders.length > 0) {
        const uniqueRestaurantIds = [...new Set(fetchedOrders.map(o => o.restaurant_id))];
        const namesToFetch = uniqueRestaurantIds.filter(id => !restaurantNames[id]); // Only fetch if not already fetched
        
        if (namesToFetch.length > 0) {
          try {
            const namePromises = namesToFetch.map(id => 
              orderService.getRestaurantName(id).then(name => ({ id, name }))
            );
            const results = await Promise.all(namePromises);
            
            setRestaurantNames(prevNames => {
              const newNames = { ...prevNames };
              results.forEach(({ id, name }) => {
                if (name) {
                  newNames[id] = name;
                }
              });
              return newNames;
            });
          } catch (fetchError) {
            console.error("Error fetching some restaurant names:", fetchError);
            // Decide if this is a critical error to show the user
            // setError("Could not load restaurant details for some orders.");
          }
        }
      }
      setLoading(false);
    });

    // Cleanup listener on component unmount or user change
    return () => {
      console.log("Cleaning up order listener");
      unsubscribe();
    };

  }, [user?.uid]); // Rerun effect if user ID changes

  const renderSkeleton = () => (
    <div className="space-y-4">
      {[...Array(3)].map((_, i) => (
        <Card key={i}>
          <CardHeader>
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-4 w-1/4" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-2/3" />
          </CardContent>
        </Card>
      ))}
    </div>
  );

  const getStatusBadgeVariant = (status: Order['status']): "default" | "secondary" | "destructive" | "outline" => {
    switch (status) {
      case 'Pending': return 'default';
      case 'Preparing': return 'secondary';
      case 'Delivered': return 'outline'; // Or a success variant if you add one
      case 'Cancelled': return 'destructive';
      default: return 'default';
    }
  };

  const handleOrderClick = (orderId: string) => {
    console.log(`Clicked order: ${orderId}, setting localStorage and navigating...`);
    localStorage.setItem("latestOrderId", orderId);
    navigate("/cart/order-tracking");
  };

  return (
    <div className="container mx-auto p-4 md:p-6 lg:p-8">
      <h1 className="text-3xl font-bold mb-6">My Orders</h1>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {loading ? (
        renderSkeleton()
      ) : orders.length === 0 ? (
        <p>You haven't placed any orders yet.</p>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <Card 
              key={order.id}
              onClick={() => handleOrderClick(order.id)}
              className="cursor-pointer hover:shadow-md transition-shadow duration-200"
            >
              <CardHeader>
                <CardTitle className="flex justify-between items-center">
                  <span>{restaurantNames[order.restaurant_id] || 'Loading Restaurant...'}</span>
                  <Badge variant={getStatusBadgeVariant(order.status)}>{order.status}</Badge>
                </CardTitle>
                <CardDescription>
                  Order ID: {order.id} | Placed on: {order.createdAt ? format(order.createdAt.toDate(), 'PPP p') : 'N/A'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <h4 className="font-semibold mb-2">Items:</h4>
                <ul className="list-disc list-inside mb-3 text-sm">
                  {order.items.map((item, index) => (
                    <li key={index}>
                      {item.quantity} x {item.name} (@ ₹{item.price?.toFixed(2) ?? 'N/A'} each)
                    </li>
                  ))}
                </ul>
                <Separator className="my-3"/>
                <p className="text-right font-semibold">
                  Total: ₹{order.totalAmount?.toFixed(2) ?? 'N/A'}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default CustomerOrdersPage; 