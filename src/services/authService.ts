import { 
  getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut,
  GoogleAuthProvider,
  signInWithPopup,
  User as FirebaseUser, // Rename to avoid conflict if UserProfile uses 'User'
} from "firebase/auth";
import { doc, getDoc, setDoc, getFirestore, serverTimestamp } from "firebase/firestore"; 
import { auth, db } from "@/integrations/firebase/client"; // Import initialized auth and db
import { UserProfile } from "@/types";
import { toast } from "sonner";

// Define the literal type directly if UserType isn't exported
type UserTypeValue = 'customer' | 'restaurant';

// Helper function to fetch user profile from Firestore
async function fetchFirestoreUserProfile(userId: string): Promise<UserProfile | null> {
  try {
    const userDocRef = doc(db, "users", userId);
    const docSnap = await getDoc(userDocRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      
      // --- Correctly extract the user_type string FIRST ---
      let finalUserType: UserTypeValue | undefined;
      if (typeof data.user_type === 'string') {
        // Case 1: Data is correct (string)
        finalUserType = data.user_type as UserTypeValue;
      } else if (typeof data.user_type === 'object' && data.user_type !== null && typeof data.user_type.user_type === 'string'){
        // Case 2: Data is incorrect (nested object)
        console.warn(`Firestore data issue: user_type field contained an object for user ${userId}. Reading nested value.`);
        finalUserType = data.user_type.user_type as UserTypeValue;
      } else {
         // Case 3: Data is missing or completely wrong format
         console.error(`Firestore data issue: Invalid or missing user_type field for user ${userId}.`, data.user_type);
         return null; // Cannot proceed without a valid type
      }
      // --- End extraction ---

      // --- Validate the extracted type BEFORE creating the profile object ---
      console.log(`Validating extracted user type for user ${userId}. Found:`, finalUserType);
      if (!finalUserType || (finalUserType !== 'customer' && finalUserType !== 'restaurant')) {
        console.error(`Validation FAILED: Invalid user_type extracted: "${finalUserType}". Expected 'customer' or 'restaurant'.`, data);
        return null; 
      }
      // --- End validation ---

      // --- Now construct the profile object using the *validated* finalUserType ---
      const profile: UserProfile = {
        uid: docSnap.id,
        email: data.email ?? '',
        full_name: data.full_name ?? null,
        user_type: finalUserType, // Use the validated string type
        address: data.address ?? null,
        phone: data.phone ?? null,
      };

      console.log(`Validation PASSED for user ${userId}. Returning profile:`, profile);
      return profile; // Return the correctly structured profile
    } else {
      console.log("No Firestore profile document found for user:", userId);
      return null;
    }
  } catch (error) {
    console.error("Error fetching Firestore profile:", error);
    throw error; 
  }
}

// Create a Google Auth Provider
const googleProvider = new GoogleAuthProvider();

// Reverted to exporting an object
export const authService = {
  // Simplified login - returns boolean, takes email/password/type
  async login(email: string, password: string, type: UserTypeValue): Promise<boolean> {
    try {
      console.log(`Logging in user with email: ${email}, type: ${type}`);
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      if (user) {
        // Optional: Verify user type against Firestore profile
        const profile = await fetchFirestoreUserProfile(user.uid);
        if (!profile) {
          console.error("Profile not found for user:", user.uid);
          toast.error("User profile not found. Please contact support.");
          await authService.logout(); // Use authService instead of this
          return false;
        }
        if (profile.user_type !== type) {
          console.error(`User type mismatch. Expected: ${type}, Got: ${profile.user_type}`);
          toast.error(`This account is not registered as a ${type}.`);
          await authService.logout(); // Use authService instead of this
          return false;
        }
        console.log("Login successful");
        return true;
      }
      // Should not be reached if signInWithEmailAndPassword resolves
      console.error("No user returned from signInWithEmailAndPassword");
      toast.error("Login failed. Please try again.");
      return false;
    } catch (error: any) {
      console.error("Login error:", error);
      toast.error(error.message || "An error occurred during login.");
      return false;
    }
  },

  // Simplified signup - returns boolean, takes email/password/type/name
  // Creates user in Auth and profile in Firestore
  async signup(email: string, password: string, type: UserTypeValue, fullName?: string): Promise<boolean> {
    try {
      console.log("Signing up user:", email, type, fullName);
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      if (!user) {
         console.error("No user returned from createUserWithEmailAndPassword");
         toast.error("Failed to create account.");
         return false;
      }

      console.log("Firebase Auth user created:", user.uid);
      // Create user profile document in Firestore
      const userDocRef = doc(db, "users", user.uid);
      await setDoc(userDocRef, {
        email: user.email,
        user_type: type,
        full_name: fullName || null,
        address: null, // Default values
        phone: null,
        createdAt: serverTimestamp() // Use serverTimestamp
      });
      console.log("Firestore profile created for user:", user.uid);
      toast.success("Account created successfully!");
      return true;
    } catch (error: any) {
      console.error("Signup error:", error);
      toast.error(error.message || "An error occurred during signup.");
      return false;
    }
  },

  /**
   * Logs the current user out.
   */
  async logout(): Promise<void> {
    try {
      // Note: Firestore might attempt to terminate active listeners after sign-out.
      // Browser extensions (ad blockers, privacy tools) can sometimes block these
      // internal Firestore cleanup requests, leading to a benign
      // 'net::ERR_BLOCKED_BY_CLIENT' error in the console. This does not
      // affect the sign-out functionality itself.
      await signOut(auth);
      console.log('User logged out successfully');
      // Clear any local user state if necessary (often handled by AuthProvider)
    } catch (error) {
      console.error('Error signing out:', error);
      // Re-throw or handle error appropriately for UI feedback
      throw error;
    }
  },

  // Add Google Sign In method
  async signInWithGoogle(): Promise<boolean> {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;

      if (!user) {
        console.error("No user returned from Google sign in");
        toast.error("Google sign in failed");
        return false;
      }

      // Check if user profile exists
      const profile = await fetchFirestoreUserProfile(user.uid);
      
      if (!profile) {
        // Create a new profile for Google sign-in users
        const userDocRef = doc(db, "users", user.uid);
        await setDoc(userDocRef, {
          email: user.email,
          user_type: "customer", // Default to customer for Google sign-ins
          full_name: user.displayName || null,
          address: null,
          phone: null,
          createdAt: serverTimestamp()
        });
        console.log("Created new profile for Google user:", user.uid);
      }

      return true;
    } catch (error: any) {
      console.error("Google sign in error:", error);
      // Don't show error toast if user just closed the popup
      if (error.code !== 'auth/popup-closed-by-user') {
        toast.error(error.message || "Failed to sign in with Google");
      }
      return false;
    }
  },

  // Add other methods if they existed in your original object (e.g., fetchUserProfile)
  // async fetchUserProfile(userId: string): Promise<UserProfile | null> {
  //   try {
  //     return await fetchFirestoreUserProfile(userId);
  //   } catch (error) {
  //     toast.error("Failed to fetch user profile.");
  //     return null;
  //   }
  // },
};
