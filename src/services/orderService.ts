import { db } from '@/integrations/firebase/client'; // Corrected import path
import { doc, updateDoc, Timestamp, collection, query, where, orderBy, onSnapshot, Unsubscribe, FirestoreError } from 'firebase/firestore';
import { Order, OrderStatus } from '@/types'; // Import Order type as well

export const orderService = {
  /**
   * Sets up a real-time listener for orders belonging to a specific restaurant.
   * Orders are typically ordered by creation date, newest first.
   * Calls the onUpdate callback with the current orders whenever they change.
   * Returns an unsubscribe function to clean up the listener.
   */
  getOrdersByRestaurantRealtime(
    restaurantId: string,
    onUpdate: (orders: Order[]) => void,
    onError: (error: FirestoreError) => void
  ): Unsubscribe {
    if (!restaurantId) {
       console.error("Restaurant ID is required to fetch orders.");
       // Immediately call onError or handle appropriately
       onError(new Error("Missing restaurant ID") as FirestoreError);
       return () => {}; // Return a no-op unsubscribe function
    }

    console.log(`Setting up real-time listener for orders of restaurant: ${restaurantId}`);
    const ordersRef = collection(db, 'orders');
    // Query orders for the specific restaurant, order by creation time descending
    const q = query(
      ordersRef,
      where('restaurant_id', '==', restaurantId),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q,
      (snapshot) => {
        console.log(`Orders snapshot received for ${restaurantId} (${snapshot.docs.length} docs)`);
        const orders = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Order[];
        onUpdate(orders);
      },
      (error) => {
        console.error(`Error listening to orders for restaurant ${restaurantId}:`, error);
        onError(error);
      }
    );

    return unsubscribe;
  },

  /**
   * Updates the status of a specific order.
   * @param orderId - The ID of the order to update.
   * @param status - The new status for the order.
   */
  async updateOrderStatus(orderId: string, status: OrderStatus): Promise<void> {
    if (!orderId) {
      console.error('Order ID is required to update status.');
      throw new Error('Order ID is required.');
    }
    if (!status) {
      console.error('New status is required to update order.');
      throw new Error('New status is required.');
    }

    try {
      const orderRef = doc(db, 'orders', orderId);
      await updateDoc(orderRef, {
        status: status,
        updatedAt: Timestamp.now() // Update timestamp on status change
      });
      console.log(`Order ${orderId} status updated to ${status}`);
    } catch (error) {
      console.error(`Error updating order ${orderId} status:`, error);
      throw new Error('Failed to update order status.');
    }
  }

  // Add other order-related functions here if needed (e.g., getOrderById)
}; 