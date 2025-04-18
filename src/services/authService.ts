import { 
  getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut,
  User as FirebaseUser // Rename to avoid conflict if UserProfile uses 'User'
} from "firebase/auth";
import { doc, getDoc, setDoc, getFirestore } from "firebase/firestore"; 
import { auth, db } from "@/integrations/firebase/client"; // Import initialized auth and db
import { UserProfile, UserType } from "@/types/auth";
import { toast } from "sonner";

// Helper function to fetch user profile from Firestore
async function fetchFirestoreUserProfile(userId: string): Promise<UserProfile | null> {
  try {
    const userDocRef = doc(db, "users", userId); // Assumes a 'users' collection
    const docSnap = await getDoc(userDocRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      // Construct UserProfile from Firestore data
      return {
        id: docSnap.id,
        email: data.email, // Assuming email is stored in Firestore doc
        full_name: data.full_name ?? null,
        user_type: data.user_type as UserType,
        address: data.address ?? null,
        phone: data.phone ?? null
      };
    } else {
      console.log("No such user profile document!");
      return null;
    }
  } catch (error) {
    console.error("Error fetching Firestore profile:", error);
    throw error; // Rethrow to be caught by calling function
  }
}

export const authService = {
  async fetchUserProfile(userId: string): Promise<UserProfile | null> {
    try {
      return await fetchFirestoreUserProfile(userId);
    } catch (error) {
      // Error already logged in helper function
      toast.error("Failed to fetch user profile.");
      return null;
    }
  },

  async login(email: string, password: string, type: UserType): Promise<boolean> {
    try {
      console.log(`Logging in user with email: ${email}, type: ${type}`);
      
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      if (user) {
        // Check if user type matches by fetching profile from Firestore
        const profile = await fetchFirestoreUserProfile(user.uid);

        if (!profile) {
          console.error("Profile not found for user:", user.uid);
          toast.error("User profile not found. Please contact support.");
          await this.logout(); // Log out the user
          return false;
        }
        
        if (profile.user_type !== type) {
          console.error(`User type mismatch. Expected: ${type}, Got: ${profile.user_type}`);
          toast.error(`This account is not registered as a ${type}.`);
          await this.logout(); // Log out the user
          return false;
        }
        
        console.log("Login successful");
        return true;
      }
      
      // This case should technically not be reached if signInWithEmailAndPassword resolves
      // without throwing an error, but included for safety.
      console.error("No user returned from signInWithEmailAndPassword");
      toast.error("Login failed. Please try again.");
      return false;
    } catch (error: any) { // Catch Firebase auth errors
      console.error("Login error:", error);
      // Provide more specific error messages based on error.code if needed
      toast.error(error.message || "An error occurred during login.");
      return false;
    }
  },

  async signup(email: string, password: string, type: UserType, fullName?: string): Promise<boolean> {
    try {
      console.log("Signing up user:", email, type, fullName);
      
      // 1. Create user in Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      if (!user) {
         // This case should technically not happen if createUserWithEmailAndPassword resolves
        console.error("No user returned from createUserWithEmailAndPassword");
        toast.error("Failed to create account.");
        return false;
      }
      
      console.log("Firebase Auth user created:", user.uid);

      // 2. Create user profile document in Firestore
      const userDocRef = doc(db, "users", user.uid);
      await setDoc(userDocRef, {
        email: user.email, // Store email for easy access
        user_type: type,
        full_name: fullName || null,
        // Add other default profile fields if necessary (e.g., address, phone)
        address: null, 
        phone: null,
        createdAt: new Date() // Optional: track creation time
      });

      console.log("Firestore profile created for user:", user.uid);
      
      toast.success("Account created successfully!");
      // Note: User is automatically signed in after signup in Firebase v9+
      // You might want to redirect the user or update the UI state accordingly.
      return true;
    } catch (error: any) { // Catch Firebase auth errors
      console.error("Signup error:", error);
       // Provide more specific error messages based on error.code if needed
      toast.error(error.message || "An error occurred during signup.");
      return false;
    }
  },

  async logout(): Promise<void> {
    try {
      await signOut(auth); // Use Firebase signOut
      console.log("User logged out successfully");
      // You might want to clear local state or redirect here
    } catch (error: any) {
      console.error("Logout error:", error);
      toast.error("Error logging out.");
    }
  }
};
