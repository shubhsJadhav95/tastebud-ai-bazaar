import { db } from '@/integrations/firebase/client'; // Corrected import path
import { doc, updateDoc, Timestamp, collection, query, where, orderBy, onSnapshot, Unsubscribe, FirestoreError, getDoc, writeBatch, getDocs, serverTimestamp, FieldValue } from 'firebase/firestore';
import { Order, OrderStatus, OrderItem } from '@/types'; // Import Order type as well
import { useAuthContext } from "@/contexts/AuthContext"; // Might be needed if service needs user ID directly
import { restaurantService } from './restaurantService'; // Import restaurantService to get restaurant IDs

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
   * Updates specific details of an order in both the main collection and the user's subcollection.
   * @param orderId - The ID of the order to update.
   * @param customerId - The ID of the customer who placed the order.
   * @param updates - An object containing the fields to update (e.g., { didDonate: true }). 
   *                 Allows FieldValue for timestamp fields.
   */
  async updateOrderDetails(orderId: string, customerId: string, updates: Partial<Omit<Order, 'id' | 'items' | 'updatedAt'> & { updatedAt?: FieldValue }>): Promise<void> {
    if (!orderId || !customerId || !updates || Object.keys(updates).length === 0) {
      console.error('Order ID, Customer ID, and updates are required.');
      throw new Error('Missing required parameters for updating order details.');
    }

    const batch = writeBatch(db);
    const mainOrderRef = doc(db, 'orders', orderId);
    const userOrderRef = doc(db, 'users', customerId, 'orders', orderId);

    // Ensure updatedAt is always included in the update using serverTimestamp()
    // The type definition now correctly handles this FieldValue
    const updateData = { ...updates, updatedAt: serverTimestamp() };

    try {
      // Check if refs point to valid locations if necessary (optional)
      // const mainDocSnap = await getDoc(mainOrderRef); // Example check
      // if (!mainDocSnap.exists()) throw new Error(`Main order ${orderId} not found.`);
      
      batch.update(mainOrderRef, updateData);
      batch.update(userOrderRef, updateData);

      await batch.commit();
      console.log(`Order ${orderId} details updated in both locations:`, updateData);
    } catch (error) {
      console.error(`Error updating order ${orderId} details:`, error);
      throw new Error('Failed to update order details.');
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
  },

  /**
   * Fetches a summary of today's orders for a restaurant.
   * @param restaurantId The ID of the restaurant.
   * @returns A promise resolving to an object with order count and total earnings for today.
   */
  async getTodaysOrderSummary(restaurantId: string): Promise<{ count: number; totalEarnings: number }> {
    if (!restaurantId) {
      console.error("Restaurant ID required for order summary.");
      return { count: 0, totalEarnings: 0 };
    }
    try {
      const now = new Date();
      const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
      console.log(`[getTodaysOrderSummary] Fetching orders for restaurant ${restaurantId} since ${todayStart.toISOString()}`);
      
      const ordersRef = collection(db, 'orders');
      const q = query(
        ordersRef,
        where('restaurant_id', '==', restaurantId),
        where('createdAt', '>=', Timestamp.fromDate(todayStart))
      );

      const querySnapshot = await getDocs(q);
      console.log(`[getTodaysOrderSummary] Query returned ${querySnapshot.size} documents.`); // Log number of docs found
      
      let count = 0;
      let totalEarnings = 0;
      querySnapshot.forEach((doc) => {
        const order = doc.data() as Order;
        console.log(`[getTodaysOrderSummary] Processing order ${doc.id}: CreatedAt=${order.createdAt?.toDate().toISOString()}, TotalAmount=${order.totalAmount}`); // Log details
        count++;
        // Ensure totalAmount is a number before adding
        totalEarnings += (typeof order.totalAmount === 'number') ? order.totalAmount : 0;
      });

      console.log(`[getTodaysOrderSummary] Final summary for ${restaurantId}: ${count} orders, $${totalEarnings.toFixed(2)} earnings`);
      return { count, totalEarnings };

    } catch (error) {
      console.error(`[getTodaysOrderSummary] Error fetching summary for ${restaurantId}:`, error);
      return { count: 0, totalEarnings: 0 }; 
    }
  },

  /**
   * Fetches a single order by its ID from the main orders collection.
   * @param orderId The ID of the order to fetch.
   * @returns A promise resolving to the Order object or null if not found/error.
   */
  async getOrderById(orderId: string): Promise<Order | null> {
    if (!orderId) {
      console.error('Order ID is required to fetch an order.');
      return null; // Or throw an error
    }
    try {
      const orderDocRef = doc(db, 'orders', orderId);
      const docSnap = await getDoc(orderDocRef);

      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as Order;
      } else {
        console.warn(`Order document not found for ID: ${orderId}`);
        return null;
      }
    } catch (error) {
      console.error(`Error fetching order details for ID ${orderId}:`, error);
      return null; // Or throw error depending on desired handling
    }
  },

  /**
   * Fetches a single order by its ID and listens for real-time updates 
   * from the user's specific order subcollection.
   * @param userId The ID of the customer.
   * @param orderId The ID of the order to fetch and track.
   * @param onUpdate Callback function called with the updated Order data.
   * @param onError Callback function called on error.
   * @returns An unsubscribe function to stop listening.
   */
  getOrderByIdRealtime(
    userId: string,
    orderId: string,
    onUpdate: (order: Order | null) => void,
    onError: (error: FirestoreError) => void
  ): Unsubscribe {
    if (!userId || !orderId) {
      console.error("User ID and Order ID are required to fetch order details.");
      onError(new Error("Missing User ID or Order ID") as FirestoreError);
      return () => {};
    }

    console.log(`Setting up real-time listener for order ${orderId} for user ${userId}`);
    const userOrderDocRef = doc(db, 'users', userId, 'orders', orderId);

    const unsubscribe = onSnapshot(userOrderDocRef, 
      (docSnap) => {
        if (docSnap.exists()) {
          const orderData = { id: docSnap.id, ...docSnap.data() } as Order;
          console.log(`Received update for order ${orderId}:`, orderData);
          onUpdate(orderData);
        } else {
          console.warn(`Order document ${orderId} not found in user ${userId}'s subcollection.`);
          onUpdate(null); // Explicitly send null if document is deleted or not found
        }
      },
      (error) => {
        console.error(`Error listening to order ${orderId} for user ${userId}:`, error);
        onError(error);
      }
    );

    return unsubscribe;
  },

  /**
   * Fetches all orders for a specific restaurant that have been marked as donated.
   * @param restaurantId The ID of the restaurant.
   * @returns A promise resolving to an array of donated Order objects.
   */
  async getDonatedOrdersByRestaurant(restaurantId: string): Promise<Order[]> {
    if (!restaurantId) {
      console.error("Restaurant ID required for fetching donated orders.");
      throw new Error("Restaurant ID is required.");
    }
    try {
      console.log(`[getDonatedOrdersByRestaurant] Fetching donated orders for restaurant ${restaurantId}`);
      
      const ordersRef = collection(db, 'orders');
      const q = query(
        ordersRef,
        where('restaurant_id', '==', restaurantId),
        where('didDonate', '==', true),
        orderBy('createdAt', 'desc') // Show most recent donations first
      );

      const querySnapshot = await getDocs(q);
      console.log(`[getDonatedOrdersByRestaurant] Query returned ${querySnapshot.size} donated orders.`);
      
      const donatedOrders: Order[] = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Order[];
      
      return donatedOrders;

    } catch (error) {
      console.error(`[getDonatedOrdersByRestaurant] Error fetching donated orders for ${restaurantId}:`, error);
      throw new Error('Failed to fetch donated orders.'); // Re-throw for the component to catch
    }
  },

  /**
   * Fetches all donated orders across all restaurants owned by a specific user.
   * @param ownerId The ID of the restaurant owner.
   * @returns A promise resolving to an array of donated Order objects.
   */
  async getAllDonatedOrdersByOwner(ownerId: string): Promise<Order[]> {
    if (!ownerId) {
      console.error("Owner ID required for fetching all donated orders.");
      throw new Error("Owner ID is required.");
    }

    try {
      // 1. Get restaurants owned by the user
      const ownedRestaurants = await restaurantService.getRestaurantsByOwner(ownerId);
      if (ownedRestaurants.length === 0) {
        console.log(`[getAllDonatedOrdersByOwner] Owner ${ownerId} has no restaurants.`);
        return []; // No restaurants, so no orders
      }

      const restaurantIds = ownedRestaurants.map(r => r.id);
      console.log(`[getAllDonatedOrdersByOwner] Found ${restaurantIds.length} restaurants for owner ${ownerId}.`);

      // 2. Handle Firestore 'in' query limit (max 30 values)
      if (restaurantIds.length > 30) {
        console.warn(`[getAllDonatedOrdersByOwner] Owner ${ownerId} has more than 30 restaurants (${restaurantIds.length}). Querying only the first 30.`);
        // Consider implementing multiple queries or alternative approach for > 30 restaurants
        restaurantIds.splice(30); // Query only the first 30 for now
      }

      // 3. Query donated orders for these restaurants
      const ordersRef = collection(db, 'orders');
      const q = query(
        ordersRef,
        where('restaurant_id', 'in', restaurantIds),
        where('didDonate', '==', true),
        orderBy('createdAt', 'desc')
      );

      const querySnapshot = await getDocs(q);
      console.log(`[getAllDonatedOrdersByOwner] Query returned ${querySnapshot.size} total donated orders.`);

      const allDonatedOrders: Order[] = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as Order[];

      return allDonatedOrders;

    } catch (error) {
      console.error(`[getAllDonatedOrdersByOwner] Error fetching orders for owner ${ownerId}:`, error);
      // Check if the error is specifically the index required error
      if (error instanceof Error && error.message.includes('requires an index')) {
         console.error("Firestore composite index required for getAllDonatedOrdersByOwner query. Please create it in the Firebase console.");
         // Potentially provide the index creation link format if possible, although Firebase usually does this
      }
      throw new Error('Failed to fetch all donated orders.'); // Re-throw
    }
  },
}; 