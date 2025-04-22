import { OrderStatus } from "@/types";

// Helper to get appropriate badge variant based on status
export const getStatusVariant = (status: OrderStatus): "default" | "secondary" | "destructive" | "outline" => {
  switch (status) {
    case 'Pending': return 'outline';
    case 'Confirmed': return 'default';
    case 'Preparing': return 'default';
    case 'Ready for Pickup': return 'default';
    case 'Out for Delivery': return 'default';
    case 'Delivered': return 'secondary';
    case 'Cancelled': return 'destructive';
    case 'Failed': return 'destructive';
    default: return 'outline';
  }
}; 