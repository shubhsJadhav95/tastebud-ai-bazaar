import React, { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthContext } from '@/contexts/AuthContext';
import { useMyRestaurant } from '@/hooks/useRestaurants';
import { useTodaysOrdersSummary } from '@/hooks/useTodaysOrdersSummary';
import { useMenuItemsCount } from '@/hooks/useMenuItemsCount';
import { useLiveOrders } from '@/hooks/useLiveOrders';
import NavBar from '@/components/NavBar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { Utensils, ListOrdered, Settings, Plus, Package, Edit, DollarSign, ShoppingCart, BookOpen, UserCircle, ExternalLink, Star } from 'lucide-react';

// Placeholder Widget Components (We'll build these later)
const DashboardStatCard = ({ title, value, icon, isLoading }: { title: string, value: string | number, icon: React.ReactNode, isLoading: boolean }) => (
  <Card className="hover:shadow-md transition-shadow">
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
      {icon}
    </CardHeader>
    <CardContent>
      {isLoading ? 
        <Skeleton className="h-8 w-3/4" /> : 
        <div className="text-2xl font-bold">{value}</div>
      }
      {/* Optional: Add percentage change here */}
      {/* <p className="text-xs text-muted-foreground">+20.1% from last month</p> */}
    </CardContent>
  </Card>
);

const LiveOrdersWidget = ({ orders, isLoading, error }: { orders: any[], isLoading: boolean, error: string | null }) => (
  <Card className="md:col-span-2 lg:col-span-3">
    <CardHeader>
      <CardTitle>Live Orders</CardTitle>
    </CardHeader>
    <CardContent>
      {isLoading ? <p>Loading live orders...</p> :
       error ? <p className="text-red-500">Error: {error}</p> :
       orders.length === 0 ? <p>No active orders right now.</p> :
       <p>{orders.length} active orders loaded. (UI coming soon)</p>}
       {/* TODO: Build the actual live order list UI */}
    </CardContent>
  </Card>
);

const RestaurantDashboard: React.FC = () => {
  const { user, profile, loading: authLoading, error: authError } = useAuthContext();
  const { myRestaurant, isLoading: restaurantIsLoading, error: restaurantError } = useMyRestaurant();
  const navigate = useNavigate();

  // Fetch dashboard data using new hooks
  const restaurantId = myRestaurant?.id;
  const { summary: orderSummary, isLoading: summaryLoading } = useTodaysOrdersSummary(restaurantId);
  const { count: menuCount, isLoading: menuCountLoading } = useMenuItemsCount(restaurantId);
  const { orders: liveOrders, isLoading: liveOrdersLoading, error: liveOrdersError } = useLiveOrders(restaurantId, 5); // Limit to 5 for feed

  // Authentication and authorization checks
  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      toast.error("Please log in to access the dashboard.");
      navigate('/restaurant/login');
      return;
    }

    if (profile?.user_type !== 'restaurant') {
      toast.error("Access denied. Only restaurant owners can access this page.");
      navigate('/customer/home');
      return;
    }
  }, [user, profile, authLoading, navigate]);

  // Error handling
  useEffect(() => {
    if (authError !== null) { 
      let message = "Authentication error";
      // If it's a string, use it directly
      if (typeof authError === 'string' && authError.length > 0) {
        message = authError;
      } 
      // Refined check: if it's an object and has a string message property
      else if (typeof authError === 'object' && authError !== null && typeof (authError as any).message === 'string') { 
        message = (authError as any).message;
      }
      // Otherwise, the default "Authentication error" is used
      
      toast.error(message);
    }
    if (restaurantError) {
      toast.error(restaurantError || "Failed to load restaurant data");
    }
  }, [authError, restaurantError]);

  const isLoading = authLoading || restaurantIsLoading;
  const overallError = authError || restaurantError;

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <NavBar />
        <div className="flex-grow container mx-auto py-8 px-4 space-y-6">
           {/* Header Skeleton */}
           <div className="flex justify-between items-center">
              <Skeleton className="h-9 w-1/2 rounded-md" />
              <Skeleton className="h-10 w-32 rounded-md" />
            </div>
           {/* Stats Skeleton */}
           <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
             {[...Array(4)].map((_, i) => (
               <Card key={i}><CardContent className="p-6"><Skeleton className="h-20 w-full" /></CardContent></Card>
             ))}
           </div>
           {/* Widgets Skeleton */}
           <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <Card className="md:col-span-1 lg:col-span-1"><CardContent className="p-6"><Skeleton className="h-40 w-full" /></CardContent></Card>
              <Card className="md:col-span-2 lg:col-span-2"><CardContent className="p-6"><Skeleton className="h-40 w-full" /></CardContent></Card>
           </div>
         </div>
        <Footer />
      </div>
    );
  }

  // Handle case where user is logged in but has no restaurant yet
  if (!isLoading && !myRestaurant && !overallError) {
     return (
       <div className="min-h-screen flex flex-col">
         <NavBar />
         <div className="flex-grow container mx-auto py-8 px-4 text-center">
           <h2 className="text-2xl font-semibold mb-4">Welcome!</h2>
           <p className="text-gray-600 mb-6">You need to create your restaurant profile to access the dashboard.</p>
           <Button onClick={() => navigate('/dashboard/restaurants/new')}>Create Restaurant Profile</Button>
         </div>
         <Footer />
       </div>
     );
  }
  
  // Handle general errors after loading attempt
  if (overallError) {
     return (
       <div className="min-h-screen flex flex-col">
         <NavBar />
         <div className="flex-grow container mx-auto py-8 px-4">
           <p className="text-red-600">Error loading dashboard data: {overallError}. Please try refreshing.</p>
         </div>
         <Footer />
       </div>
     );
  }

  // Main Dashboard Layout
  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      <NavBar />
      <div className="flex-grow container mx-auto py-8 px-4 space-y-6">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
          <div>
            <h1 className="text-3xl font-bold">Dashboard</h1>
            <p className="text-gray-600">
              Welcome back, {profile?.full_name || user?.email}!
            </p>
          </div>
          {/* Maybe add date range selector or other controls here */}
          <Button onClick={() => navigate(`/dashboard/restaurants/${restaurantId}`)}>
             <Settings className="mr-2 h-4 w-4" /> Manage Restaurant
          </Button>
        </div>

        {/* Stats Cards Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <DashboardStatCard 
            title="Today's Earnings" 
            value={`$${orderSummary.totalEarnings.toFixed(2)}`}
            icon={<DollarSign className="h-4 w-4 text-muted-foreground" />}
            isLoading={summaryLoading}
          />
          <DashboardStatCard 
            title="Today's Orders" 
            value={orderSummary.count}
            icon={<ShoppingCart className="h-4 w-4 text-muted-foreground" />}
            isLoading={summaryLoading}
          />
          <DashboardStatCard 
            title="Menu Items" 
            value={menuCount}
            icon={<BookOpen className="h-4 w-4 text-muted-foreground" />}
            isLoading={menuCountLoading}
          />
          {/* Placeholder for Ratings Card */}
          <DashboardStatCard 
            title="Avg Rating" 
            value="N/A" 
            icon={<Star className="h-4 w-4 text-muted-foreground" />}
            isLoading={false} // Replace with actual loading state for ratings
          />
        </div>

        {/* Main Content Grid (Profile Overview, Live Orders, Menu Shortcuts) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Profile Overview Widget (Placeholder Structure) */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center">
                 <UserCircle className="mr-2 h-5 w-5"/> Profile Overview
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
               {restaurantIsLoading ? <Skeleton className="h-20 w-full" /> : (
                 <>
                   <img src={myRestaurant?.logo_url || '/placeholder-logo.png'} alt="Logo" className="h-16 w-16 rounded-md object-contain mb-2 bg-gray-200" onError={(e) => { (e.target as HTMLImageElement).src = '/placeholder-logo.png'; }}/>
                   <h3 className="font-semibold text-lg">{myRestaurant?.name}</h3>
                   <p className="text-sm text-gray-600">{myRestaurant?.cuisine || 'Cuisine not set'}</p>
                   <p className="text-sm text-gray-600">{myRestaurant?.address || 'Address not set'}</p>
                   <Button size="sm" variant="outline" onClick={() => navigate(`/dashboard/restaurants/${restaurantId}`)} className="w-full mt-2">
                      <Edit className="mr-2 h-4 w-4"/> Edit Profile
                   </Button>
                 </>
               )}
            </CardContent>
          </Card>
          
          {/* Live Orders Feed Widget */}
          <div className="lg:col-span-2">
             <LiveOrdersWidget orders={liveOrders} isLoading={liveOrdersLoading} error={liveOrdersError} />
          </div>

          {/* Menu Management Shortcuts Widget (Placeholder Structure) */}
          <Card className="lg:col-span-1">
             <CardHeader><CardTitle>Menu Management</CardTitle></CardHeader>
             <CardContent className="space-y-2">
               <Button size="sm" variant="outline" onClick={() => navigate(`/dashboard/restaurants/${restaurantId}?tab=menu`)} className="w-full">
                 <BookOpen className="mr-2 h-4 w-4"/> View/Edit Menu
               </Button>
               <Button size="sm" variant="outline" onClick={() => navigate(`/dashboard/restaurants/${restaurantId}?tab=menu&action=add`)} className="w-full">
                 <Plus className="mr-2 h-4 w-4"/> Add New Item
               </Button>
             </CardContent>
          </Card>

          {/* Placeholder for other widgets */}

        </div>
      </div>
      <Footer />
    </div>
  );
};

export default RestaurantDashboard;