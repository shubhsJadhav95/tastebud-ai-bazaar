import React, { useEffect } from 'react';
import { useAuthContext } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const { user, profile, loading: authLoading, error: authError } = useAuthContext();
const navigate = useNavigate();

useEffect(() => {
  // Enhanced logging for better debugging
  console.log(`REDIRECT EFFECT Triggered. State: {authLoading: ${authLoading}, userId: ${user?.uid}, profileExists: ${!!profile}, profileUserType: ${JSON.stringify(profile?.user_type)}}`);

  // Wait until loading is explicitly finished before checking redirect conditions
  if (authLoading) {
    console.log('REDIRECT EFFECT: Still loading auth/profile, waiting.');
    return;
  }

  // Now that loading is false, check the user and profile state
  if (user && profile?.user_type === "customer") {
    console.log('REDIRECT EFFECT: Condition MET! Navigating to /customer/home...');
    navigate("/customer/home");
  } else if (user && profile?.user_type === "restaurant") {
    // Although this is CustomerLogin, handle restaurant just in case for robustness or future reuse
    console.log('REDIRECT EFFECT: Unexpected state - Restaurant user on customer login. Navigating to /restaurant/dashboard...');
    navigate("/restaurant/dashboard");
  } else {
    // Log other scenarios if needed after loading is complete
    if (!user) {
        console.log('REDIRECT EFFECT: Loading finished, but user is null.');
    } else if (!profile) {
        // This might happen briefly if Firestore read is slow or profile doesn't exist
        console.log('REDIRECT EFFECT: Loading finished, user exists, but profile is null/missing.');
    } else {
        console.log(`REDIRECT EFFECT: Loading finished, conditions not met (e.g., wrong user type?). User Type: ${profile?.user_type}`);
    }
  }
  // Dependencies remain the same
}, [user, profile, authLoading, navigate]);

// ... existing code ...
