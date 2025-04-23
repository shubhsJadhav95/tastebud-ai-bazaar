import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom'; // Import Link for navigation
import NGOForm from '@/components/forms/NGOForm';
import { ngoService, NGO } from '@/services/ngoService';
import { orderService } from '@/services/orderService';
import { restaurantService } from '@/services/restaurantService'; // Import restaurant service
import { useAuthContext } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import NavBar from '@/components/NavBar';
import Footer from '@/components/Footer';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'; // Use Card for layout
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"; // For listing NGOs
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"; // To make Add form collapsible
import { Skeleton } from "@/components/ui/skeleton";
import { format } from 'date-fns';
import { AlertCircle, Inbox, Gift, Calendar, User, Loader2, Building2, PlusCircle } from 'lucide-react';
import { Order, Restaurant } from '@/types'; // Import Order and Restaurant types
import { Timestamp } from 'firebase/firestore'; // Import Timestamp for date checking

// Define the structure of form data expected by the form component
type NGOFormValues = {
    name: string;
    address: {
        street: string;
        city: string;
        state: string;
        zip: string;
    };
    phone: string;
    category: string;
};

const ManageNGOsPage: React.FC = () => {
  const { user, loading: authLoading } = useAuthContext();
  
  // State for this page
  const [isSubmittingForm, setIsSubmittingForm] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  
  // State for listing NGOs
  const [ngosList, setNgosList] = useState<NGO[]>([]);
  const [loadingNgosList, setLoadingNgosList] = useState(true);
  const [ngosListError, setNgosListError] = useState<string | null>(null);

  // State for combined donation history
  const [allDonatedOrders, setAllDonatedOrders] = useState<Order[]>([]);
  const [loadingDonationHistory, setLoadingDonationHistory] = useState(true);
  const [donationHistoryError, setDonationHistoryError] = useState<string | null>(null);
  const [ngoNames, setNgoNames] = useState<Record<string, string>>({}); // For donation history
  const [restaurantNames, setRestaurantNames] = useState<Record<string, string>>({}); // For donation history
  const [loadingExtraNames, setLoadingExtraNames] = useState(false); // Loading for NGO/Restaurant names

  // Fetch NGOs owned by the user
  useEffect(() => {
    if (!user) return;
    setLoadingNgosList(true);
    setNgosListError(null);
    ngoService.getNGOsByOwner(user.uid)
      .then(data => setNgosList(data))
      .catch(err => {
          console.error("Error fetching owner NGOs:", err);
          setNgosListError("Failed to load your NGOs.");
      })
      .finally(() => setLoadingNgosList(false));
  }, [user]);

  // Fetch combined donation history for the owner
  useEffect(() => {
      if (!user) return;
      setLoadingDonationHistory(true);
      setDonationHistoryError(null);
      orderService.getAllDonatedOrdersByOwner(user.uid)
        .then(data => setAllDonatedOrders(data))
        .catch(err => {
            console.error("Error fetching combined donation history:", err);
            setDonationHistoryError("Failed to load donation history. Check console (you might need to create a Firestore index).");
        })
        .finally(() => setLoadingDonationHistory(false));
  }, [user]);

  // Fetch NGO and Restaurant names needed for the combined history
  useEffect(() => {
    if (allDonatedOrders.length > 0) {
      const ngoIds = [...new Set(allDonatedOrders.map(order => order.donatedToNgoId).filter(id => !!id))] as string[];
      const restaurantIds = [...new Set(allDonatedOrders.map(order => order.restaurant_id).filter(id => !!id))] as string[];
      
      const needsFetching = ngoIds.length > 0 || restaurantIds.length > 0;

      if (needsFetching) {
        setLoadingExtraNames(true);
        
        const ngoPromises = ngoIds.map(id => 
            ngoService.getNgoById(id).then(ngo => ({ id, name: ngo?.name }))
        );
        const restaurantPromises = restaurantIds.map(id =>
            restaurantService.getRestaurant(id).then(r => ({ id, name: r?.name }))
        );

        Promise.all([...ngoPromises, ...restaurantPromises])
            .then(results => {
                const newNgoNames: Record<string, string> = {};
                const newRestaurantNames: Record<string, string> = {};
                results.forEach(result => {
                    if (result && result.id && result.name) {
                        // Check if it's likely an NGO ID or restaurant ID (heuristic, improve if IDs overlap)
                        if (ngoIds.includes(result.id)) {
                            newNgoNames[result.id] = result.name;
                        } else if (restaurantIds.includes(result.id)) {
                            newRestaurantNames[result.id] = result.name;
                        }
                    }
                });
                setNgoNames(prev => ({ ...prev, ...newNgoNames }));
                setRestaurantNames(prev => ({ ...prev, ...newRestaurantNames }));
            })
            .catch(err => {
                console.error("Error fetching some NGO or Restaurant names:", err);
            })
            .finally(() => {
                setLoadingExtraNames(false);
            });
      }
    }
  }, [allDonatedOrders]);


  // Handler for the Add NGO Form submission
  const handleCreateNGO = async (data: NGOFormValues) => {
    if (!user) {
      toast.error('You must be logged in to add an NGO.');
      setFormError('Authentication required.');
      return;
    }

    setIsSubmittingForm(true);
    setFormError(null);

    try {
      const newNgoId = await ngoService.createNGO({
        ...data,
        ownerId: user.uid,
      });

      if (newNgoId) {
        // Refetch the list of NGOs to include the new one
        setLoadingNgosList(true);
        ngoService.getNGOsByOwner(user.uid)
            .then(updatedList => setNgosList(updatedList))
            .catch(err => setNgosListError("Failed to refresh NGO list."))
            .finally(() => setLoadingNgosList(false));
        // Consider resetting the form here if needed
      } else {
        setFormError('Failed to save NGO. Check console for details.');
      }
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'An unexpected error occurred.');
    } finally {
      setIsSubmittingForm(false);
    }
  };

  // Helper to safely format dates
  const formatDate = (dateInput: Timestamp | Date | undefined): string => {
      if (!dateInput) return 'N/A';
      try {
          if (dateInput instanceof Timestamp) {
              return format(dateInput.toDate(), 'PPp');
          } else if (dateInput instanceof Date) {
              return format(dateInput, 'PPp');
          }
          return 'Invalid Date';
      } catch { 
          return 'Invalid Date';
      }
  };

  // Loading state for initial auth check
  if (authLoading) {
    return (
        <div className="min-h-screen flex flex-col">
            <NavBar />
            <div className="flex-grow container mx-auto p-6 flex justify-center items-center"><Loader2 className="h-8 w-8 animate-spin" /></div>
            <Footer />
        </div>
    );
  }
  
  // Render message if user is not logged in
  if (!user) {
      return (
        <div className="min-h-screen flex flex-col">
            <NavBar />
            <div className="flex-grow container mx-auto p-6">
                 <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Not Logged In</AlertTitle>
                    <AlertDescription>
                        Please <Link to="/restaurant/login" className="underline">log in</Link> as a restaurant owner to manage NGOs.
                    </AlertDescription>
                 </Alert>
            </div>
            <Footer />
        </div>
      );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <NavBar />
      <div className="flex-grow container mx-auto py-8 px-4 space-y-10">
        <header>
          <h1 className="text-3xl font-bold">Manage NGOs & Donations</h1>
          <p className="text-gray-600 mt-1">View your registered NGOs, add new ones, and see your restaurants' donation history.</p>
        </header>

        {/* Section 1: List of Owner's NGOs */}
        <section>
            <h2 className="text-2xl font-semibold mb-4 border-b pb-2">Your Registered NGOs</h2>
            {loadingNgosList ? (
                <div className="space-y-3">
                    <Skeleton className="h-16 w-full" />
                    <Skeleton className="h-16 w-full" />
                </div>
            ) : ngosListError ? (
                 <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Error Loading NGOs</AlertTitle>
                    <AlertDescription>{ngosListError}</AlertDescription>
                 </Alert>
            ) : ngosList.length === 0 ? (
                <p className="text-gray-500 italic">You haven't added any NGOs yet.</p>
            ) : (
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>Category</TableHead>
                                <TableHead>Location</TableHead>
                                <TableHead>Phone</TableHead>
                                {/* Add Actions column later */}
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {ngosList.map(ngo => (
                                <TableRow key={ngo.id}>
                                    <TableCell className="font-medium">{ngo.name}</TableCell>
                                    <TableCell>{ngo.category}</TableCell>
                                    <TableCell>{ngo.address.city}, {ngo.address.state}</TableCell>
                                    <TableCell>{ngo.phone}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            )}
        </section>

        {/* Section 2: Add New NGO Form (Accordion) */}
        <section>
             <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="add-ngo">
                    <AccordionTrigger className="text-2xl font-semibold">
                        <div className="flex items-center gap-2">
                            <PlusCircle size={24}/> Add New NGO
                        </div>
                    </AccordionTrigger>
                    <AccordionContent className="pt-4">
                        {formError && (
                            <Alert variant="destructive" className="mb-4">
                                <AlertCircle className="h-4 w-4" />
                                <AlertTitle>Form Error</AlertTitle>
                                <AlertDescription>{formError}</AlertDescription>
                            </Alert>
                        )}
                        <NGOForm onSubmit={handleCreateNGO} isSubmitting={isSubmittingForm} />
                    </AccordionContent>
                </AccordionItem>
            </Accordion>
        </section>

        {/* Section 3: Combined Donation History */}
        <section>
            <h2 className="text-2xl font-semibold mb-4 border-b pb-2">Donation History (All Restaurants)</h2>
             {loadingDonationHistory ? (
                <div className="space-y-3">
                    <Skeleton className="h-28 w-full" />
                    <Skeleton className="h-28 w-full" />
                </div>
             ) : donationHistoryError ? (
                 <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Error Loading History</AlertTitle>
                    <AlertDescription>{donationHistoryError}</AlertDescription>
                 </Alert>
             ) : allDonatedOrders.length === 0 ? (
                 <Alert>
                    <Inbox className="h-4 w-4" />
                    <AlertTitle>No Donation History</AlertTitle>
                    <AlertDescription>
                      No donations have been recorded across your restaurants yet.
                    </AlertDescription>
                 </Alert>
             ) : (
                 <div className="space-y-6">
                    {allDonatedOrders.map(order => (
                        <Card key={order.id} className="overflow-hidden">
                            <CardHeader className="bg-gray-50 dark:bg-gray-800 p-4">
                                <div className="flex justify-between items-center flex-wrap gap-2">
                                    <CardTitle className="text-base font-semibold">Order ID: {order.id.substring(0, 8)}...</CardTitle>
                                    <span className="text-xs text-gray-500 flex items-center">
                                        <Calendar size={12} className="mr-1" /> 
                                        {formatDate(order.createdAt)}
                                    </span>
                                </div>
                                <CardDescription className="text-xs pt-1">
                                    Restaurant: {loadingExtraNames ? <Skeleton className="h-3 w-20 inline-block"/> : (restaurantNames[order.restaurant_id] || 'Unknown')}
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="p-4 space-y-3">
                                {order.donatedToNgoId && (
                                    <div className="text-sm">
                                        <span className="font-semibold text-blue-700 flex items-center">
                                             <Building2 size={14} className="mr-1.5"/> Donated To:
                                        </span>
                                        <span className="ml-1">
                                             {loadingExtraNames ? <Skeleton className="h-4 w-24 inline-block"/> : (ngoNames[order.donatedToNgoId] || 'Details Unavailable')}
                                        </span>
                                    </div>
                                )}
                                <div>
                                    <h4 className="text-sm font-semibold mb-1 flex items-center">
                                        <Gift size={14} className="mr-1.5 text-green-600"/> Donated Items:
                                    </h4>
                                    <ul className="list-disc list-inside pl-5 space-y-0.5 text-xs text-gray-700">
                                        {order.items.map((item, index) => (
                                            <li key={`${item.menuItemId}-${index}`}>
                                                {item.quantity} x {item.name} 
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                                 <div className="text-xs text-gray-500 flex items-center pt-2 border-t border-dashed">
                                    <User size={12} className="mr-1" /> 
                                    Customer ID: {order.customer_id ? `${order.customer_id.substring(0, 6)}...` : 'N/A'} 
                                 </div>
                            </CardContent>
                        </Card>
                    ))}
                 </div>
             )}
        </section>

      </div>
      <Footer />
    </div>
  );
};

export default ManageNGOsPage; 