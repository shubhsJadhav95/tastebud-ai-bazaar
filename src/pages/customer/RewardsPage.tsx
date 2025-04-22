import React, { useState, useEffect } from 'react';
import { useAuthContext } from '@/contexts/AuthContext';
import { userService } from '@/services/userService';
import { UserProfile } from '@/types';
import NavBar from '@/components/NavBar';
import Footer from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Copy, Gift, Users, AlertCircle, Loader2, Coins } from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

// --- Discount Tier Definition ---
interface DiscountTierInfo {
  coinsNeeded: number;
  discountPercent: number;
  label: string; // e.g., "10% Off"
}

const discountTiers: DiscountTierInfo[] = [
  { coinsNeeded: 100, discountPercent: 10, label: "10% Off" },
  { coinsNeeded: 200, discountPercent: 20, label: "20% Off" },
  { coinsNeeded: 300, discountPercent: 30, label: "30% Off" },
  { coinsNeeded: 400, discountPercent: 40, label: "40% Off" },
  { coinsNeeded: 500, discountPercent: 60, label: "60% Off" },
  { coinsNeeded: 700, discountPercent: 70, label: "70% Off" },
  { coinsNeeded: 800, discountPercent: 80, label: "80% Off" },
];
// --- End Discount Tier Definition ---

const RewardsPage: React.FC = () => {
  const { user, loading: authLoading } = useAuthContext();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (authLoading) return; // Wait for auth state
    if (!user?.uid) {
        toast.error("Please log in to view your rewards.");
        navigate('/login'); // Redirect to login if not authenticated
        setLoading(false);
        return;
    }

    const fetchProfile = async () => {
      setLoading(true);
      setError(null);
      try {
        const userProfile = await userService.getUserProfile(user.uid);
        if (userProfile) {
          setProfile(userProfile);
          // If referral code doesn't exist yet, generate/retrieve it silently
          if (!userProfile.referralCode) {
              console.log("Referral code missing, attempting to generate...");
              const code = await userService.generateOrRetrieveReferralCode(user.uid);
              if (code) {
                  console.log("Referral code generated/retrieved successfully:", code);
                  // Update state directly to reflect the newly generated code
                  setProfile(prev => prev ? { ...prev, referralCode: code } : null);
              } else {
                  console.warn("Failed to generate/retrieve referral code.");
              }
          }
        } else {
          setError("Could not load your profile information.");
        }
      } catch (err: any) {
        setError(err.message || "An error occurred while fetching rewards data.");
        console.error("Error fetching profile for rewards:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user, authLoading, navigate]);

  const handleCopyCode = () => {
    if (profile?.referralCode) {
      navigator.clipboard.writeText(profile.referralCode)
        .then(() => {
          toast.success("Referral code copied to clipboard!");
        })
        .catch(err => {
          toast.error("Failed to copy code.");
          console.error('Failed to copy text: ', err);
        });
    }
  };

  const renderLoading = () => (
      <div className="space-y-6">
          <Card>
              <CardHeader>
                  <Skeleton className="h-6 w-1/2 mb-2" />
                  <Skeleton className="h-4 w-3/4" />
              </CardHeader>
              <CardContent>
                  <Skeleton className="h-8 w-1/4" />
              </CardContent>
          </Card>
          <Card>
              <CardHeader>
                   <Skeleton className="h-6 w-1/3 mb-2" />
                   <Skeleton className="h-4 w-full" />
              </CardHeader>
              <CardContent className="flex items-center space-x-4">
                   <Skeleton className="h-8 flex-grow" />
                   <Skeleton className="h-9 w-20" />
              </CardContent>
          </Card>
      </div>
  );

  // Get user's current coin balance
  const availableCoins = profile?.supercoins || 0;

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <NavBar />
      <div className="flex-grow container mx-auto p-4 md:p-6 lg:p-8">
        <h1 className="text-3xl font-bold mb-8">My Rewards</h1>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {loading ? (
          renderLoading()
        ) : !profile ? (
           <p>Could not load profile data.</p> // Should have been caught by error state mostly
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             {/* Left Column: Balance and Referrals */}
             <div className="space-y-6">
                {/* Supercoins Card */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                       <Gift className="mr-2 h-5 w-5 text-yellow-500" /> Supercoins Balance
                    </CardTitle>
                    <CardDescription>Coins earned from activities like donating meals.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-4xl font-bold text-yellow-600">
                      {availableCoins}
                    </p>
                    {/* Add info on how to spend coins later */}
                  </CardContent>
                </Card>
    
                {/* Referral Card */} 
                <Card>
                   <CardHeader>
                       <CardTitle className="flex items-center">
                           <Users className="mr-2 h-5 w-5 text-blue-500" /> Refer & Earn
                       </CardTitle>
                       <CardDescription>Share your code! New users get 10% off their first order using your code.</CardDescription>
                   </CardHeader>
                   <CardContent>
                     {profile.referralCode ? (
                         <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-4">
                             <p className="text-lg font-mono bg-gray-100 px-4 py-2 rounded flex-grow text-center sm:text-left">
                                 {profile.referralCode}
                             </p>
                             <Button onClick={handleCopyCode} variant="outline" size="sm">
                                 <Copy className="mr-2 h-4 w-4" /> Copy Code
                             </Button>
                         </div>
                     ) : (
                         <div className="flex items-center text-gray-500">
                             <Loader2 className="mr-2 h-4 w-4 animate-spin"/>
                             Generating your referral code...
                         </div>
                     )}
                      {/* Add info on rewards for the referrer later */}
                   </CardContent>
                 </Card>
             </div>

             {/* Right Column: Discount Tiers */} 
             <div className="space-y-6">
                 <Card>
                     <CardHeader>
                         <CardTitle className="flex items-center">
                             <Coins className="mr-2 h-5 w-5 text-yellow-500" /> Supercoin Discounts
                         </CardTitle>
                         <CardDescription>Use your Supercoins for discounts on your orders.</CardDescription>
                     </CardHeader>
                     <CardContent>
                         <ul className="space-y-3">
                             {discountTiers.map((tier) => {
                                 const isEligible = availableCoins >= tier.coinsNeeded;
                                 return (
                                     <li 
                                         key={tier.coinsNeeded}
                                         className={`flex justify-between items-center p-3 rounded-md border ${isEligible ? 'border-green-200 bg-green-50' : 'border-gray-200 bg-gray-50 opacity-70'}`}
                                     >
                                         <span className={`font-medium ${isEligible ? 'text-green-800' : 'text-gray-600'}`}>
                                             {tier.label}
                                         </span>
                                         <span className={`text-sm font-semibold ${isEligible ? 'text-green-700' : 'text-gray-500'}`}>
                                             {tier.coinsNeeded} Coins
                                         </span>
                                     </li>
                                 );
                             })}
                         </ul>
                          <p className="text-xs text-gray-500 mt-4 italic">Discount applied to order subtotal. Only one discount (coupon or Supercoins) can be applied per order.</p>
                     </CardContent>
                 </Card>
             </div>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default RewardsPage; 