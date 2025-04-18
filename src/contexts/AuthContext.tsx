import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useMemo,
  useCallback,
} from 'react';
import { User as FirebaseUser, onAuthStateChanged } from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore';
import { auth, db } from '@/integrations/firebase/client'; // Ensure this path is correct
import { UserProfile } from '@/types';
import { UserType } from '@/types/auth';
import { toast } from 'sonner';
import { authService } from '@/services/authService'; // Correctly import the exported object

// Define the shape of the context value
interface AuthContextProps {
  user: FirebaseUser | null;
  profile: UserProfile | null;
  loading: boolean;
  error: string | null; // Store error messages
  // Add signIn and signUp function types based on authService
  signIn: (email: string, password: string, type: UserType) => Promise<boolean>; 
  signUp: (email: string, password: string, type: UserType, fullName?: string) => Promise<boolean>;
  signOut: () => Promise<void>; // Add signOut function type
  signInWithGoogle: () => Promise<boolean>; // Add Google sign-in
}

// Create the context
const AuthContext = createContext<AuthContextProps | undefined>(undefined);

// Create the provider component
export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true); // Start loading initially
  const [error, setError] = useState<string | null>(null);

  // Define the signOut function using the imported authService object
  const signOut = useCallback(async () => {
    try {
      await authService.logout(); // Call the method on the object
      // State updates (user, profile to null) are handled by onAuthStateChanged
    } catch (err: any) {
      console.error("Logout failed in AuthContext:", err);
      toast.error(err.message || 'Logout failed. Please try again.');
      throw err; // Re-throw if needed
    }
  }, []);

  useEffect(() => {
    setLoading(true);
    setError(null);
    let profileListenerUnsubscribe: (() => void) | null = null;

    // Listen to Firebase Auth state changes
    const authUnsubscribe = onAuthStateChanged(auth, (authUser) => {
      setUser(authUser);

      // Clean up previous profile listener if user changes/logs out
      if (profileListenerUnsubscribe) {
        profileListenerUnsubscribe();
        profileListenerUnsubscribe = null;
      }

      if (authUser) {
        // User is logged in, listen to their profile document in Firestore
        const userDocRef = doc(db, 'users', authUser.uid);
        profileListenerUnsubscribe = onSnapshot(userDocRef,
          (docSnap) => {
            if (docSnap.exists()) {
              // Use authUser.uid for the 'uid' field to match UserProfile interface
              const profileData = {
                uid: authUser.uid, // Use uid from authUser
                ...docSnap.data(), // Spread the rest of the data from Firestore
              } as UserProfile;
              // Add type assertion safety check (optional but recommended)
              if (typeof profileData.email !== 'string' || typeof profileData.user_type === 'undefined') {
                  console.error("Firestore profile data is missing required fields (email, user_type)", profileData);
                  setError('Incomplete user profile data.');
                  setProfile(null);
              } else {
                 setProfile(profileData);
                 setError(null); // Clear error on successful profile load
              }
            } else {
              // Profile doesn't exist in Firestore for this authenticated user
              setProfile(null);
              setError('User profile not found in database.');
              console.warn(`Profile not found for UID: ${authUser.uid}`);
            }
            setLoading(false); // Loading finished after profile check
          },
          (err) => {
            // Error listening to Firestore document
            console.error("Error fetching user profile:", err);
            setError('Failed to load user profile.');
            setProfile(null);
            setLoading(false);
          }
        );
      } else {
        // User is logged out
        setProfile(null);
        setLoading(false); // Loading finished
      }
    }, (authError) => {
        // Error from onAuthStateChanged itself
        console.error("Authentication error:", authError);
        setError(authError.message || "An authentication error occurred.");
        setUser(null);
        setProfile(null);
        setLoading(false);
    });

    // Cleanup function
    return () => {
      authUnsubscribe();
      if (profileListenerUnsubscribe) {
        profileListenerUnsubscribe();
      }
    };
  }, []); // Empty dependency array ensures this runs only on mount/unmount

  // Memoize the context value to prevent unnecessary re-renders
  const value = useMemo(() => ({
    user,
    profile,
    loading,
    error,
    // Pass the authService methods directly
    signIn: authService.login, 
    signUp: authService.signup,
    signOut, // Include signOut in the context value
    signInWithGoogle: authService.signInWithGoogle, // Add Google sign-in method
  }), [user, profile, loading, error, signOut]); // Add signOut to dependencies

  // Render children only when initial loading is complete
  return (
    <AuthContext.Provider value={value}>
      {children} 
    </AuthContext.Provider>
  );
};

// Create the consumer hook
export const useAuthContext = (): AuthContextProps => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    // This error means you tried to use the context outside of its provider
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
}; 