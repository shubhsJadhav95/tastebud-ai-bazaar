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
import { AlertCircle, CheckCircle, Clock, Package, Truck, XCircle, Utensils, IndianRupee, Eye } from 'lucide-react';
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
          <TableHead className="hidden sm:table-cell">Order ID</TableHead>
          <TableHead>Date</TableHead>
          <TableHead>Customer</TableHead>
          <TableHead className="text-right">Total</TableHead>
          <TableHead className="w-[180px]">Status</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {[...Array(5)].map((_, i) => (
          <TableRow key={i}>
            <TableCell className="hidden sm:table-cell"><Skeleton className="h-5 w-20 rounded" /></TableCell>
            <TableCell><Skeleton className="h-5 w-28 rounded" /></TableCell>
            <TableCell><Skeleton className="h-5 w-32 rounded" /></TableCell>
            <TableCell className="text-right"><Skeleton className="h-5 w-14 ml-auto rounded" /></TableCell>
            <TableCell><Skeleton className="h-8 w-full rounded" /></TableCell>
            <TableCell><Skeleton className="h-8 w-20 rounded" /></TableCell>
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
    <div className="overflow-x-auto border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="hidden sm:table-cell">Order ID</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Customer</TableHead>
            <TableHead className="text-right">Total</TableHead>
            <TableHead className="min-w-[160px]">Status</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.map((order) => {
            // Handle potential Date or Timestamp for createdAt
            const orderDate = order.createdAt 
              ? (typeof (order.createdAt as any).toDate === 'function' 
                  ? (order.createdAt as any).toDate() 
                  : order.createdAt as Date)
              : null;

            return (
              <TableRow 
                key={order.id} 
              >
                <TableCell className="hidden sm:table-cell font-mono text-xs pt-4" title={order.id}>{order.id.substring(0, 8)}...</TableCell>
                {/* Format the derived date object */}
                <TableCell className="pt-4">{orderDate ? format(orderDate, 'PP p') : 'N/A'}</TableCell>
                {/* Use optional chaining for customerName */}
                <TableCell className="pt-4">{order.customerName ?? order.customer_id?.substring(0,8) ?? 'N/A'}</TableCell>
                <TableCell className="text-right font-medium pt-4">
                   <span className="flex items-center justify-end">
                      <IndianRupee size={14} className="mr-0.5" />
                      {order.totalAmount.toFixed(2)}
                   </span>
                </TableCell>
                <TableCell className="min-w-[160px]">
                  <div onClick={(e) => e.stopPropagation()}> 
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
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </TableCell>
                <TableCell>
                  <Button 
                    variant="outline"
                    size="sm"
                    onClick={() => navigate(`/dashboard/orders/${order.id}`)}
                    className="h-8 px-2"
                    aria-label={`View details for order ${order.id.substring(0, 8)}`}
                  >
                    <Eye size={14} className="mr-1 sm:mr-2"/> 
                    <span className="hidden sm:inline">Details</span>
                  </Button>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
};

export default OrderManager; 