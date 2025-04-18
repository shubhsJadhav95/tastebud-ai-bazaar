import { db } from '@/integrations/firebase/client'; // Corrected import path
import { doc, updateDoc, Timestamp, collection, query, where, orderBy, onSnapshot, Unsubscribe, FirestoreError, getDoc, writeBatch } from 'firebase/firestore';
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
   * Updates the status of a specific order in both the main collection and the user's subcollection.
   * @param orderId - The ID of the order to update.
   * @param customerId - The ID of the customer who placed the order.
   * @param status - The new status for the order.
   */
  async updateOrderStatus(orderId: string, customerId: string, status: OrderStatus): Promise<void> {
    if (!orderId) {
      console.error('Order ID is required to update status.');
      throw new Error('Order ID is required.');
    }
    if (!customerId) {
      console.error('Customer ID is required to update status in user subcollection.');
      throw new Error('Customer ID is required.');
    }
    if (!status) {
      console.error('New status is required to update order.');
      throw new Error('New status is required.');
    }

    const batch = writeBatch(db);

    const mainOrderRef = doc(db, 'orders', orderId);
    const userOrderRef = doc(db, 'users', customerId, 'orders', orderId);

    const updateData = {
      status: status,
      updatedAt: Timestamp.now()
    };

    try {
      batch.update(mainOrderRef, updateData);
      batch.update(userOrderRef, updateData);

      await batch.commit();
      console.log(`Order ${orderId} status updated to ${status} in both locations`);
    } catch (error) {
      console.error(`Error updating order ${orderId} status:`, error);
      throw new Error('Failed to update order status.');
    }
  },

  /**
   * Listens for real-time updates on orders for a specific user from their subcollection.
   * @param userId The ID of the customer whose orders to fetch.
   * @param callback Function to call with the updated list of orders.
   * @returns An unsubscribe function to stop listening.
   */
  getOrdersByUser: (userId: string, callback: (orders: Order[]) => void): (() => void) => {
    console.log(`Setting up listener for orders SUBCOLLECTION for user: ${userId}`);
    const userOrdersRef = collection(db, 'users', userId, 'orders');
    const q = query(
      userOrdersRef,
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const orders: Order[] = [];
      querySnapshot.forEach((doc) => {
        orders.push({ id: doc.id, ...doc.data() } as Order);
      });
      console.log(`Received ${orders.length} orders for user ${userId}`);
      callback(orders);
    }, (error) => {
      console.error(`Error fetching orders for user ${userId}:`, error);
      callback([]);
    });

    return unsubscribe;
  },

  /**
   * Fetches the name of a single restaurant.
   * @param restaurantId The ID of the restaurant.
   * @returns The restaurant name or null if not found/error.
   */
  getRestaurantName: async (restaurantId: string): Promise<string | null> => {
    try {
      const restaurantDocRef = doc(db, 'restaurants', restaurantId); // Assuming 'restaurants' collection
      const docSnap = await getDoc(restaurantDocRef);
      if (docSnap.exists()) {
        // Assuming the restaurant document has a 'name' field
        return docSnap.data()?.name || null; 
      } else {
        console.warn(`Restaurant document not found for ID: ${restaurantId}`);
        return null;
      }
    } catch (error) {
      console.error(`Error fetching restaurant name for ID ${restaurantId}:`, error);
      return null;
    }
  }
}; 