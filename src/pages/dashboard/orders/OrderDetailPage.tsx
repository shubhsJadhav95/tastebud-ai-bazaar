import * as React from 'react';
import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { orderService } from '@/services/orderService';
import { Order, OrderItem as OrderItemType } from '@/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { AlertCircle, ArrowLeft, User, MapPin, Hash, IndianRupee, ClipboardList } from 'lucide-react';
import { format } from 'date-fns';
import { getStatusVariant } from '@/utils/statusUtils'; // Assuming a utility function for status variants

const OrderDetailPage: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!orderId) {
      setError("Order ID is missing from the URL.");
      setLoading(false);
      return;
    }

    const fetchOrder = async () => {
      setLoading(true);
      setError(null);
      try {
        const fetchedOrder = await orderService.getOrderById(orderId);
        if (fetchedOrder) {
          setOrder(fetchedOrder);
        } else {
          setError(`Order with ID ${orderId} not found.`);
        }
      } catch (err: any) {
        console.error("Error fetching order details:", err);
        setError(`Failed to load order details: ${err.message || 'Unknown error'}`);
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId]);

  // --- Loading State ---
  if (loading) {
    return (
      <div className="container mx-auto p-4 md:p-6 space-y-4">
         <Skeleton className="h-8 w-32 rounded-md mb-4" /> {/* Back button */}
         <Skeleton className="h-10 w-1/2 rounded-md mb-4" /> {/* Title */}
         <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Skeleton className="h-48 w-full rounded-md" /> {/* Customer Card */}
            <Skeleton className="h-48 w-full rounded-md" /> {/* Address Card */}
            <Skeleton className="h-48 w-full rounded-md" /> {/* Status Card */}
         </div>
         <Skeleton className="h-64 w-full rounded-md" /> {/* Items Table */}
      </div>
    );
  }

  // --- Error State ---
  if (error) {
    return (
      <div className="container mx-auto p-4 md:p-6">
        <Button variant="outline" size="sm" asChild className="mb-4">
          <Link to="/dashboard/orders"><ArrowLeft className="mr-2 h-4 w-4" />Back to Orders</Link>
        </Button>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error Loading Order</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  // --- No Order Found State (redundant due to error state, but good practice) ---
  if (!order) {
    return (
       <div className="container mx-auto p-4 md:p-6">
         <Button variant="outline" size="sm" asChild className="mb-4">
           <Link to="/dashboard/orders"><ArrowLeft className="mr-2 h-4 w-4" />Back to Orders</Link>
         </Button>
         <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Order Not Found</AlertTitle>
            <AlertDescription>The requested order could not be found.</AlertDescription>
         </Alert>
       </div>
    );
  }

  // --- Main Content ---
  return (
    <div className="container mx-auto p-4 md:p-6 space-y-6">
       <Button variant="outline" size="sm" asChild className="mb-4">
         <Link to="/dashboard/orders"><ArrowLeft className="mr-2 h-4 w-4" />Back to Orders</Link>
       </Button>

       <h1 className="text-2xl md:text-3xl font-bold">
         Order Details <span className="text-muted-foreground font-mono text-lg">#{order.id.substring(0, 8)}...</span>
       </h1>

       <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
           {/* Customer Info Card */}
           <Card>
             <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
               <CardTitle className="text-sm font-medium">Customer</CardTitle>
               <User className="h-4 w-4 text-muted-foreground" />
             </CardHeader>
             <CardContent>
               <div className="text-lg font-semibold">{order.customerName || 'N/A'}</div>
               <p className="text-xs text-muted-foreground">
                 ID: {order.customer_id?.substring(0, 8) || 'N/A'}...
               </p>
               <p className="text-sm text-muted-foreground">
                 Phone: {order.customerPhone || 'N/A'}
               </p>
             </CardContent>
           </Card>

           {/* Delivery Address Card */}
           <Card>
             <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
               <CardTitle className="text-sm font-medium">Delivery Address</CardTitle>
               <MapPin className="h-4 w-4 text-muted-foreground" />
             </CardHeader>
             <CardContent>
                {order.deliveryAddress ? (
                    <>
                        <p className="text-sm font-medium">{order.deliveryAddress.street}</p>
                        <p className="text-sm text-muted-foreground">
                           {order.deliveryAddress.city}{order.deliveryAddress.state ? `, ${order.deliveryAddress.state}` : ''} {order.deliveryAddress.zip}
                        </p>
                        {order.deliveryAddress.notes && (
                            <p className="text-xs text-muted-foreground mt-1">Notes: {order.deliveryAddress.notes}</p>
                        )}
                    </>
                ) : (
                    <p className="text-sm text-muted-foreground">Address not provided.</p>
                )}
             </CardContent>
           </Card>

           {/* Order Status & Meta Card */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Status & Info</CardTitle>
                <Hash className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="mb-2">
                    <span className="text-sm font-medium mr-2">Status:</span>
                    <Badge variant={getStatusVariant ? getStatusVariant(order.status) : 'default'}>{order.status}</Badge>
                </div>
                 <p className="text-xs text-muted-foreground">
                    Order Placed: {order.createdAt ? format(order.createdAt.toDate(), 'PPpp') : 'N/A'}
                 </p>
                 <p className="text-xs text-muted-foreground">
                    Payment Method: {order.paymentMethod || 'N/A'}
                 </p>
              </CardContent>
              <CardFooter>
                 <div className="text-lg font-bold flex items-center">
                   Total: <IndianRupee className="h-5 w-5 mx-1" /> {order.totalAmount.toFixed(2)}
                 </div>
              </CardFooter>
            </Card>
       </div>

       {/* Order Items Table */}
       <Card>
         <CardHeader>
           <CardTitle className="flex items-center"><ClipboardList className="mr-2 h-5 w-5"/>Order Items</CardTitle>
         </CardHeader>
         <CardContent>
           <Table>
             <TableHeader>
               <TableRow>
                 <TableHead>Item</TableHead>
                 <TableHead className="text-right">Quantity</TableHead>
                 <TableHead className="text-right">Price</TableHead>
                 <TableHead className="text-right">Subtotal</TableHead>
               </TableRow>
             </TableHeader>
             <TableBody>
               {order.items.map((item: OrderItemType, index: number) => (
                 <TableRow key={item.menuItemId || index}>
                   <TableCell className="font-medium">{item.name}</TableCell>
                   <TableCell className="text-right">{item.quantity}</TableCell>
                   <TableCell className="text-right"><span className="flex items-center justify-end"><IndianRupee size={12} className="mr-0.5" />{item.price.toFixed(2)}</span></TableCell>
                   <TableCell className="text-right font-medium"><span className="flex items-center justify-end"><IndianRupee size={14} className="mr-0.5" />{(item.price * item.quantity).toFixed(2)}</span></TableCell>
                 </TableRow>
               ))}
             </TableBody>
           </Table>
         </CardContent>
       </Card>
    </div>
  );
};

export default OrderDetailPage; 