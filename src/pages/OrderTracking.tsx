import * as React from "react";
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuthContext } from "@/contexts/AuthContext"; // Import AuthContext
import { orderService } from "@/services/orderService"; // Import orderService
import { userService } from "@/services/userService"; // Import userService
import { ngoService, NGO } from "@/services/ngoService"; // Import NGO service and type
import { Order, OrderItem as OrderItemType, OrderStatus } from "@/types"; // Import Order types
import NavBar from "../components/NavBar";
import Footer from "../components/Footer";
import OrderItem from "../components/OrderItem";
import { Check, Clock, Utensils, Truck, Gift, MapPin, IndianRupee, ShoppingBag, Package, CheckCircle, Heart, Loader2 } from "lucide-react"; // Added more icons and Loader2
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { toast } from "sonner";
import { format } from 'date-fns'; // For formatting timestamps
// Make sure statusUtils exists and exports this function
// import { getStatusVariant } from '@/utils/statusUtils'; // If using statusUtils
import { Skeleton } from "@/components/ui/skeleton"; // Import Skeleton
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"; // Import Alert
import { AlertCircle } from "lucide-react"; // Import AlertCircle
import { serverTimestamp } from "firebase/firestore"; // Import serverTimestamp
// import RewardsPage from "./pages/customer/RewardsPage"; // Remove this incorrect import
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button"; // Import Button

// Define the statuses matching your OrderStatus type for the progress bar
const trackingStatuses: { key: OrderStatus; label: string; icon: React.ReactNode; description: string }[] = [
  { key: "Pending", label: "Pending", icon: <Clock size={18}/>, description: "Waiting for restaurant confirmation." },
  { key: "Confirmed", label: "Confirmed", icon: <CheckCircle size={18}/>, description: "Restaurant accepted your order." },
  { key: "Preparing", label: "Preparing", icon: <Utensils size={18}/>, description: "Chef is preparing your meal." },
  { key: "Ready for Pickup", label: "Ready", icon: <Package size={18}/>, description: "Your order is ready." }, // Using Package icon
  { key: "Out for Delivery", label: "On the Way", icon: <Truck size={18}/>, description: "Your food is heading your way!" },
  { key: "Delivered", label: "Delivered", icon: <Check size={18}/>, description: "Enjoy your meal!" },
];
// Filter out statuses not typically shown in linear progress (optional, adjust as needed)
const activeDisplayStatuses = trackingStatuses.filter(s => s.key !== 'Cancelled' && s.key !== 'Failed');

const OrderTracking: React.FC = () => {
  console.log("OrderTracking component mounted");
  const { user, loading: authLoading } = useAuthContext();
  const [order, setOrder] = useState<Order | null>(null); // This WILL hold the real-time order
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [donationOpen, setDonationOpen] = useState(false);
  const navigate = useNavigate(); // Initialize navigate
  const [availableNgos, setAvailableNgos] = useState<NGO[]>([]);
  const [selectedNgoId, setSelectedNgoId] = useState<string | null>(null);
  const [loadingNgos, setLoadingNgos] = useState(false);
  const [ngoError, setNgoError] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading) return; // Wait for auth state
    if (!user?.uid) {
        toast.error("Please log in to view your rewards.");
        navigate('/login'); // Redirect to login if not authenticated
        setLoading(false);
        return;
    }
    setLoading(true);
    setError(null);
    setOrder(null); // Clear previous order state on load

    const latestOrderId = localStorage.getItem("latestOrderId");

    if (!latestOrderId) {
      setError("No recent order found to track.");
      setLoading(false);
      return;
    }

    console.log(`Setting up REAL-TIME listener for order: ${latestOrderId} for user: ${user.uid}`);

    // This listener fetches and updates the order state in real-time
    const unsubscribe = orderService.getOrderByIdRealtime(
      user.uid,
      latestOrderId,
      (fetchedOrder) => { // onUpdate callback
        console.log('Real-time Order Update Received:', fetchedOrder);
        if (fetchedOrder) {
            setOrder(fetchedOrder); // Update state with live data
            setError(null); // Clear any previous error
        } else {
            // Order deleted or access denied by rules
            setOrder(null);
            setError(`Order ${latestOrderId} not found or access denied.`);
        }
        // Stop loading indicator only after first data/error received
        // Subsequent updates won't show the loader
        if(loading) setLoading(false);
      },
      (err) => { // onError callback
        console.error("Error tracking order:", err);
        setError(`Failed to track order: ${err.message || 'Unknown error'}`);
        setOrder(null); // Clear order on error
        setLoading(false); // Stop loading on error
      }
    );

    // Cleanup listener on component unmount or user change
    return () => {
        console.log(`Cleaning up REAL-TIME listener for order: ${latestOrderId}`);
        unsubscribe();
    }

  }, [user, authLoading, navigate]); // Dependency: run when user context changes

  // Effect for fetching NGOs when donation dialog opens
  useEffect(() => {
    if (donationOpen) {
      console.log("Donation dialog opened, fetching NGOs...");
      setLoadingNgos(true);
      setNgoError(null);
      setSelectedNgoId(null); // Reset selection when dialog opens
      
      ngoService.getAllNGOs()
        .then(ngos => {
          setAvailableNgos(ngos);
          console.log("Fetched NGOs:", ngos);
        })
        .catch(err => {
          console.error("Error fetching NGOs:", err);
          setNgoError("Could not load list of NGOs. Please try again later.");
          setAvailableNgos([]); // Clear any previous list
        })
        .finally(() => {
          setLoadingNgos(false);
        });
    }
  }, [donationOpen]); // Rerun when donationOpen changes

  // Modify handleDonate to be async and perform new actions
  const handleDonate = async () => {
    if (!user?.uid || !order?.id) {
        toast.error("Could not process donation. User or Order information missing.");
        setDonationOpen(false);
        return;
    }
    if (!selectedNgoId) { // Check if an NGO is selected
        toast.error("Please select an NGO to donate to.");
        return;
    }

    setDonationOpen(false); // Close dialog immediately
    toast.info("Processing your donation...");

    try {
        // Perform actions concurrently (or sequentially if needed)
        // Ensure customer_id is present on the order object
        if (!order.customer_id) {
            throw new Error("Customer ID missing from order data.");
        }
        
        await Promise.all([
            userService.awardSupercoins(user.uid, 100),
            userService.generateOrRetrieveReferralCode(user.uid),
            // Update order details including the selected NGO ID
            orderService.updateOrderDetails(order.id, order.customer_id, { 
                didDonate: true, 
                donatedToNgoId: selectedNgoId, // Add selected NGO ID
                updatedAt: serverTimestamp() 
            })
        ]);

        toast.success("Thank you for donating! You've earned Supercoins.");

    } catch (err) {
        console.error("Error processing donation actions:", err);
        toast.error("An error occurred while processing your donation. Please try again.");
        // Optionally re-open dialog or handle error state
    } finally {
        setSelectedNgoId(null); // Reset selection after attempt
    }
  };

  // --- Loading State ---
  if (loading) {
    // Show skeletons or a simple loading message
    return (
      <div className="min-h-screen flex flex-col">
        <NavBar />
        <div className="flex-grow container mx-auto p-4 md:p-6 flex items-center justify-center">
             <p>Loading Order Details...</p>
             {/* Or render skeletons */}
        </div>
        <Footer />
      </div>
    );
  }

  // --- Error State ---
   if (error) {
     // Display error message
     return (
        <div className="min-h-screen flex flex-col">
            <NavBar />
            <div className="flex-grow container mx-auto p-4 md:p-6 flex items-center justify-center">
                 <Alert variant="destructive" className="max-w-md mx-auto">
                   <AlertCircle className="h-4 w-4" />
                   <AlertTitle>Error Loading Order</AlertTitle>
                   <AlertDescription>{error}</AlertDescription>
                 </Alert>
            </div>
            <Footer />
        </div>
     );
   }

  // --- No Order Found State ---
  if (!order) {
    // Display if order is null after loading and no error
     return (
      <div className="min-h-screen flex flex-col">
        <NavBar />
        <div className="flex-grow flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <ShoppingBag size={64} className="mx-auto text-gray-300 mb-4" />
            <h2 className="text-2xl font-bold mb-2">Order Not Available</h2>
            <p className="text-gray-600 mb-6">
              The order details could not be loaded or found.
            </p>
            <Link to="/customer/home" className="btn-primary inline-block">
              Back to Home
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // --- Main Tracking UI ---
  // Calculate progress based on the REAL order.status
  const currentVisibleStatusIndex = activeDisplayStatuses.findIndex(s => s.key === order.status);
  const progressBarWidth = currentVisibleStatusIndex >= 0
    ? ((currentVisibleStatusIndex + 1) / activeDisplayStatuses.length) * 100
    : 0;

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <NavBar />
      <div className="flex-grow py-8 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto"> {/* Centered content */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-1">Track Your Order</h1>
          <p className="text-gray-600">Order #{order.id.substring(0, 8)}...</p>
          {/* TODO: Fetch/Display Restaurant Name if needed */}
        </div>

        {/* Status Tracking Component */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="relative mb-4">
            {/* Progress bar */}
            <div className="hidden sm:block absolute left-0 right-0 h-1 bg-gray-200 top-5 z-0 mx-5">
              <div
                className="h-1 bg-green-500 transition-all duration-1000 ease-linear"
                style={{ width: `${progressBarWidth}%` }}
              ></div>
            </div>
            {/* Status steps */}
            <div className="flex flex-row justify-between items-start relative z-10 text-center">
              {activeDisplayStatuses.map((status, index) => {
                const isActive = currentVisibleStatusIndex >= index;
                const isCurrent = order.status === status.key; // Use real status
                return (
                  <div key={status.key} className="flex-1 flex flex-col items-center">
                    <div className={`w-10 h-10 mb-2 rounded-full flex items-center justify-center transition-colors duration-500 ${ isActive ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-500' } ${isCurrent ? 'ring-2 ring-green-500 ring-offset-2' : ''}`}>
                      {status.icon}
                    </div>
                    <p className={`font-medium text-xs sm:text-sm transition-colors duration-500 ${isActive ? 'text-green-600' : 'text-gray-500'}`}>
                      {status.label}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
           {/* Current Status Description */}
           {activeDisplayStatuses[currentVisibleStatusIndex] && (
                <p className="text-center text-gray-600 text-sm mt-4">
                    {activeDisplayStatuses[currentVisibleStatusIndex].description}
                </p>
            )}

           {/* Conditional sections based on REAL order.status */}
           {order.status === "Out for Delivery" && (
             <div className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-200 animate-fade-in">
               {/* ... Delivery Info ... */}
                <div className="flex items-start">
                  <div className="bg-blue-500 text-white p-2 rounded-full mr-4"><Truck size={20} /></div>
                  <div>
                    <h3 className="font-semibold text-blue-800">On The Way</h3>
                    <p className="text-sm text-blue-700 mt-1">Your order is currently out for delivery!</p>
                  </div>
                </div>
             </div>
           )}
           {order.status === "Delivered" && order.didDonate && (
             <div className="mt-6 p-4 bg-blue-50 text-blue-700 rounded-lg border border-blue-200 flex items-center animate-fade-in">
                <Heart size={20} className="mr-3 flex-shrink-0"/>
                {/* TODO: Enhance this message later to show NGO name if order.donatedToNgoId exists */}
                <p className="text-sm font-medium">Thank you for donating a meal!</p>
             </div>
           )}
           {order.status === "Delivered" && !order.didDonate && ( // Show donation prompt only if not donated
            <div className="mt-8 p-4 bg-green-50 rounded-lg border border-green-200 animate-fade-in">
              <div className="flex items-start">
                <div className="bg-green-500 text-white p-2 rounded-full mr-4"><Gift size={20} /></div>
                <div className="flex-grow">
                  <h3 className="font-semibold text-green-800">Donate Leftover Food?</h3>
                  <p className="text-sm text-green-700 mt-1">Help reduce food waste and support those in need!</p>
                  <button className="mt-3 btn-primary bg-green-600 hover:bg-green-700 py-1.5 px-3 text-sm" onClick={() => setDonationOpen(true)}>Donate Now</button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Order Details Section (Uses real 'order' state) */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Order Items</h2>
          <div className="divide-y divide-gray-100">
            {order.items.map((item: OrderItemType, index: number) => {
              // Adapt data for OrderItem component
              const displayItem = {
                  id: item.menuItemId || `item-${index}`,
                  name: item.name,
                  price: item.price,
                  quantity: item.quantity,
                  image_url: item.image_url || '/placeholder.svg',
                  // Add dummy props needed by OrderItem if any
                  restaurant_id: order.restaurant_id,
                  description: '', category: '', is_available: true, createdAt: undefined, updatedAt: undefined
              };
              return (<OrderItem key={displayItem.id} item={displayItem} showControls={false}/>);
            })}
          </div>
        </div>

         <div className="bg-white rounded-lg shadow-md p-6">
           <h2 className="text-xl font-semibold mb-4">Details</h2>
           <div className="space-y-3">
             <div className="flex items-start">
               <MapPin size={16} className="mr-3 mt-1 text-gray-500 flex-shrink-0" />
               <div>
                 <p className="font-medium text-sm">Delivery Address</p>
                 {order.deliveryAddress ? (
                   <p className="text-gray-600 text-sm">
                     {order.deliveryAddress.street}{order.deliveryAddress.city ? `, ${order.deliveryAddress.city}` : ''}
                     {order.deliveryAddress.state ? `, ${order.deliveryAddress.state}` : ''}
                     {order.deliveryAddress.zip ? ` ${order.deliveryAddress.zip}` : ''}
                     {order.deliveryAddress.notes ? ` (${order.deliveryAddress.notes})` : ''}
                   </p>
                 ) : <p className="text-gray-500 text-sm italic">Not specified</p>}
               </div>
             </div>
             <div className="flex items-start">
               <Clock size={16} className="mr-3 mt-1 text-gray-500 flex-shrink-0" />
               <div>
                 <p className="font-medium text-sm">Order Time</p>
                 <p className="text-gray-600 text-sm">
                    {/* Updated formatting logic */}
                    {order.createdAt instanceof Date ? format(order.createdAt, 'PPpp') :
                     (order.createdAt && typeof order.createdAt === 'object' && 'toDate' in order.createdAt) ? format(order.createdAt.toDate(), 'PPpp') :
                     'N/A'}
                 </p>
               </div>
             </div>
             {/* Add Payment Method if needed */}
             {/* ... */}
           </div>
         </div>

         {/* Order Summary could be a separate component or here */}
         <div className="bg-white rounded-lg shadow-md p-6 mt-6">
            <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
            <div className="space-y-2 mb-6 text-sm">
               <div className="flex justify-between"><span className="text-gray-600">Subtotal</span><span><IndianRupee size={12} className="inline mr-0.5"/>{order.items.reduce((sum, item) => sum + (item.price * item.quantity), 0).toFixed(2)}</span></div>
               {/* TODO: Add Delivery Fee, Tax, Discount display if available on 'order' object */}
               <div className="border-t pt-3 mt-3 flex justify-between font-bold text-base"><span>Total</span><span><IndianRupee size={14} className="inline mr-0.5"/>{order.totalAmount.toFixed(2)}</span></div>
            </div>
            <div><h3 className="font-semibold mb-1 text-sm">Payment Method</h3><p className="text-gray-700 capitalize text-sm">{order.paymentMethod || 'N/A'}</p></div>
            <div className="mt-6"><Link to="/customer/home" className="text-food-primary hover:text-food-secondary font-semibold text-center block w-full text-sm">Browse More Restaurants</Link></div>
         </div>

      </div>

      {/* MODIFIED Donation Dialog */}
      <Dialog open={donationOpen} onOpenChange={setDonationOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
                <DialogTitle>Donate Leftover Food</DialogTitle>
                <DialogDescription>Choose an NGO to donate this order's value to. Thank you!</DialogDescription>
            </DialogHeader>
            <div className="py-4">
                {loadingNgos ? (
                    <div className="flex items-center justify-center space-x-2">
                        <Loader2 className="h-5 w-5 animate-spin" />
                        <span>Loading NGOs...</span>
                    </div>
                ) : ngoError ? (
                    <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>Error Loading NGOs</AlertTitle>
                        <AlertDescription>{ngoError}</AlertDescription>
                    </Alert>
                ) : availableNgos.length === 0 ? (
                    <p className="text-center text-sm text-gray-500">No NGOs available for donation at this time.</p>
                ) : (
                    <RadioGroup 
                        value={selectedNgoId ?? undefined} 
                        onValueChange={setSelectedNgoId} 
                        className="space-y-3"
                    >
                        <p className="text-sm font-medium mb-2">Select an NGO:</p>
                        {availableNgos.map((ngo) => (
                            <div key={ngo.id} className="flex items-center space-x-3 border rounded-md p-3 hover:bg-gray-50">
                                <RadioGroupItem value={ngo.id!} id={`ngo-${ngo.id}`} />
                                <Label htmlFor={`ngo-${ngo.id}`} className="flex flex-col cursor-pointer">
                                    <span className="font-semibold">{ngo.name}</span>
                                    <span className="text-xs text-gray-500">{ngo.category} - {ngo.address.city}, {ngo.address.state}</span>
                                </Label>
                            </div>
                        ))}
                    </RadioGroup>
                )}
            </div>
            <div className="pt-4 border-t">
                 {/* Use Shadcn Button component */}
                <Button 
                    type="button" 
                    className="w-full" 
                    onClick={handleDonate} 
                    disabled={loadingNgos || !selectedNgoId || availableNgos.length === 0}
                >
                    Confirm Donation to Selected NGO
                </Button>
            </div>
          </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
};

export default OrderTracking;
