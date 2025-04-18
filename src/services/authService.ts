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
import { UserProfile, UserType } from "@/types/auth";
import { toast } from "sonner";

// Helper function to fetch user profile from Firestore
async function fetchFirestoreUserProfile(userId: string): Promise<UserProfile | null> {
  try {
    const userDocRef = doc(db, "users", userId);
    const docSnap = await getDoc(userDocRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      // Construct UserProfile from Firestore data
      const profile = {
        id: docSnap.id,
        email: data.email,
        full_name: data.full_name ?? null,
        user_type: data.user_type as UserType, // Ensure this is properly typed
        address: data.address ?? null,
        phone: data.phone ?? null
      };
      
      // Validate the user_type
      if (!profile.user_type || (profile.user_type !== 'customer' && profile.user_type !== 'restaurant')) {
        console.error("Invalid user_type in profile:", profile.user_type);
        return null;
      }
      
      return profile;
    } else {
      console.log("No such user profile document!");
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
  async login(email: string, password: string, type: UserType): Promise<boolean> {
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
  async signup(email: string, password: string, type: UserType, fullName?: string): Promise<boolean> {
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

  // Simplified logout
  async logout(): Promise<void> {
    try {
      await signOut(auth);
      console.log("User logged out successfully");
    } catch (error: any) {
      console.error("Logout error:", error);
      toast.error("Error logging out.");
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
