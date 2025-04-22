import * as React from 'react';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FirestoreError } from 'firebase/firestore';
import { orderService } from '@/services/orderService'; // Adjust path if needed
import { Order, OrderStatus } from '@/types'; // Adjust path if needed
import { Button } from '@/components/ui/button';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { toast } from 'sonner';
import { AlertCircle, CheckCircle, Clock, Package, Truck, XCircle, Utensils } from 'lucide-react';
import { format } from 'date-fns'; // For formatting timestamps

interface OrderManagerProps {
  restaurantId: string;
}

// Define the possible order statuses for the dropdown
const availableStatuses: OrderStatus[] = [
  'Pending',
  'Confirmed', 
  'Preparing', 
  'Ready for Pickup', 
  'Out for Delivery', 
  'Delivered', 
  'Cancelled',
  'Failed'
];

// Helper to get appropriate badge variant based on status
const getStatusVariant = (status: OrderStatus): "default" | "secondary" | "destructive" | "outline" => {
  switch (status) {
    case 'Pending': return 'outline';
    case 'Confirmed': return 'default'; // Or another color
    case 'Preparing': return 'default';
    case 'Ready for Pickup': return 'default';
    case 'Out for Delivery': return 'default';
    case 'Delivered': return 'secondary';
    case 'Cancelled': return 'destructive';
    case 'Failed': return 'destructive';
    default: return 'outline';
  }
};

const OrderManager: React.FC<OrderManagerProps> = ({ restaurantId }) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState<Record<string, boolean>>({}); // Track loading state per order
  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    setError(null);

    const handleUpdate = (fetchedOrders: Order[]) => {
      setOrders(fetchedOrders);
      setError(null);
      setLoading(false);
    };

    const handleError = (err: FirestoreError) => {
      console.error("Error fetching orders:", err);
      const message = `Failed to load orders: ${err.message || 'Unknown error'}`;
      setError(message);
      setLoading(false);
      toast.error(message);
    };

    const unsubscribe = orderService.getOrdersByRestaurantRealtime(
      restaurantId,
      handleUpdate,
      handleError
    );

    return () => unsubscribe();
  }, [restaurantId]);

  const handleStatusChange = async (orderId: string, customerId: string, newStatus: OrderStatus) => {
    if (!customerId) {
      toast.error("Customer ID is missing for this order. Cannot update status.");
      return;
    }
    setUpdatingStatus(prev => ({ ...prev, [orderId]: true }));
    try {
      await orderService.updateOrderStatus(orderId, customerId, newStatus);
      toast.success(`Order #${orderId.substring(0, 6)} status updated to ${newStatus}.`);
      // Real-time listener will update the local state
    } catch (err: any) {
      console.error(`Error updating status for order ${orderId}:`, err);
      toast.error(`Failed to update status: ${err.message || 'Unknown error'}`);
    } finally {
      setUpdatingStatus(prev => ({ ...prev, [orderId]: false }));
    }
  };

  const renderSkeleton = () => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Order ID</TableHead>
          <TableHead>Date</TableHead>
          <TableHead>Customer</TableHead>
          <TableHead className="text-right">Total</TableHead>
          <TableHead>Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {[...Array(5)].map((_, i) => (
          <TableRow key={i}>
            <TableCell><Skeleton className="h-5 w-24 rounded" /></TableCell>
            <TableCell><Skeleton className="h-5 w-32 rounded" /></TableCell>
            <TableCell><Skeleton className="h-5 w-40 rounded" /></TableCell>
            <TableCell className="text-right"><Skeleton className="h-5 w-16 ml-auto rounded" /></TableCell>
            <TableCell><Skeleton className="h-8 w-32 rounded" /></TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );

  if (loading) {
    return renderSkeleton();
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error Loading Orders</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (orders.length === 0) {
    return (
      <Alert>
        <Utensils className="h-4 w-4" />
        <AlertTitle>No Orders Found</AlertTitle>
        <AlertDescription>
          There are currently no orders for this restaurant.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order ID</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Customer</TableHead>
              {/* Add More Columns if needed: Items summary, Address? */}
              <TableHead className="text-right">Total</TableHead>
              <TableHead className="w-[180px]">Status</TableHead> {/* Give status column enough width */}
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.map((order) => (
              <TableRow 
                key={order.id} 
                onClick={() => navigate(`/dashboard/orders/${order.id}`)}
                className="cursor-pointer hover:bg-muted/50"
              >
                <TableCell className="font-mono text-xs" title={order.id}>{order.id.substring(0, 8)}...</TableCell>
                <TableCell>{order.createdAt ? format(order.createdAt.toDate(), 'PPpp') : 'N/A'}</TableCell>
                <TableCell>{order.customerName || order.customer_id.substring(0,8) || 'N/A'}</TableCell>
                <TableCell className="text-right font-medium">${order.totalAmount.toFixed(2)}</TableCell>
                <TableCell>
                  <Select 
                    value={order.status}
                    onValueChange={(newStatus) => handleStatusChange(order.id, order.customer_id, newStatus as OrderStatus)}
                    disabled={updatingStatus[order.id]}
                  >
                    <SelectTrigger className={`w-full h-8 text-xs ${updatingStatus[order.id] ? 'opacity-50' : ''}`}> 
                      <SelectValue placeholder="Set status" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableStatuses.map((status) => (
                        <SelectItem key={status} value={status} className="text-xs">
                          {status} 
                          {/* Optionally add icons based on status */}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {/* <Badge variant={getStatusVariant(order.status)}>{order.status}</Badge> */} 
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
    </div>
  );
};

export default OrderManager; 