import { db } from '@/integrations/firebase/client';
import { UserProfile } from '@/types';
import { doc, getDoc, updateDoc, increment, serverTimestamp, collection, query, where, getDocs, limit } from 'firebase/firestore';

const USER_COLLECTION = 'users';

/**
 * Fetches a user's profile data.
 * @param userId The user's ID.
 * @returns The UserProfile object or null if not found.
 */
export const getUserProfile = async (userId: string): Promise<UserProfile | null> => {
  try {
    const userDocRef = doc(db, USER_COLLECTION, userId);
    const docSnap = await getDoc(userDocRef);
    if (docSnap.exists()) {
      // Explicitly cast data to Partial first, then combine
      const data = docSnap.data() as Partial<UserProfile>; 
      // Assume required fields like uid, email etc. *are* present in Firestore data
      // for a valid profile, but acknowledge TS cannot guarantee it here.
      return { id: docSnap.id, ...data } as UserProfile;
    } else {
      console.warn(`No profile found for user ID: ${userId}`);
      return null;
    }
  } catch (error) {
    console.error("Error fetching user profile:", error);
    throw new Error("Failed to fetch user profile.");
  }
};

/**
 * Awards Supercoins to a user.
 * @param userId The user's ID.
 * @param amount The number of coins to award (e.g., 100).
 */
export const awardSupercoins = async (userId: string, amount: number): Promise<void> => {
  if (!userId || amount <= 0) {
    console.error("Invalid userId or amount for awarding supercoins.");
    return;
  }
  try {
    const userDocRef = doc(db, USER_COLLECTION, userId);
    await updateDoc(userDocRef, {
      supercoins: increment(amount),
      updatedAt: serverTimestamp()
    });
    console.log(`Awarded ${amount} Supercoins to user ${userId}`);
  } catch (error) {
    console.error(`Error awarding Supercoins to user ${userId}:`, error);
    // Depending on requirements, you might want to throw an error here
    // or implement retry logic. For now, just log it.
  }
};

/**
 * Deducts Supercoins from a user.
 * @param userId The user's ID.
 * @param amount The number of coins to deduct (should be positive).
 */
export const deductSupercoins = async (userId: string, amount: number): Promise<void> => {
  if (!userId || amount <= 0) {
    console.error("Invalid userId or amount for deducting supercoins.");
    return;
  }
  try {
    const userDocRef = doc(db, USER_COLLECTION, userId);
    // Use increment with a negative value to deduct
    await updateDoc(userDocRef, {
      supercoins: increment(-amount),
      updatedAt: serverTimestamp()
    });
    console.log(`Deducted ${amount} Supercoins from user ${userId}`);
  } catch (error) {
    console.error(`Error deducting Supercoins from user ${userId}:`, error);
    // Consider re-throwing or handling more robustly based on application needs
    // If deducting fails after order placement, it could lead to inconsistencies.
    throw new Error("Failed to deduct Supercoins."); 
  }
};

/**
 * Applies a Supercoin discount to a user's account:
 * - Deducts the coins spent.
 * - Increments the total discount value claimed via coins.
 * @param userId The user's ID.
 * @param coinsApplied The number of coins spent for the discount.
 * @param discountAmount The monetary value of the discount applied.
 */
export const applyCoinDiscountToUser = async (
  userId: string, 
  coinsApplied: number, 
  discountAmount: number
): Promise<void> => {
  if (!userId || coinsApplied <= 0 || discountAmount < 0) { // Allow 0 discount amount just in case
    console.error("Invalid parameters for applying coin discount.");
    throw new Error("Invalid parameters for applying coin discount.");
  }
  
  try {
    const userDocRef = doc(db, USER_COLLECTION, userId);
    
    await updateDoc(userDocRef, {
      supercoins: increment(-coinsApplied),
      totalCoinDiscountClaimed: increment(discountAmount),
      updatedAt: serverTimestamp()
    });
    
    console.log(`Applied discount for user ${userId}: Deducted ${coinsApplied} coins, Added ₹${discountAmount.toFixed(2)} to total claimed.`);
  } catch (error) {
    console.error(`Error applying coin discount for user ${userId}:`, error);
    // Critical error - should be logged/monitored as it affects user balance/stats
    throw new Error("Failed to apply Supercoin discount transaction."); 
  }
};

/**
 * Generates a simple referral code.
 * Example: TB-A8X3B4
 * Note: This doesn't guarantee global uniqueness but is simple.
 * Collision chance is low, especially when tied to a user.
 * @returns A generated referral code string.
 */
const generateReferralCode = (): string => {
  const prefix = "TB"; // TasteBud prefix
  const randomPart = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `${prefix}-${randomPart}`;
};

/**
 * Retrieves the user's referral code, generating and saving one if it doesn't exist.
 * @param userId The user's ID.
 * @returns The user's referral code, or null if an error occurs.
 */
export const generateOrRetrieveReferralCode = async (userId: string): Promise<string | null> => {
  if (!userId) {
    console.error("User ID is required to generate/retrieve referral code.");
    return null;
  }

  try {
    const userDocRef = doc(db, USER_COLLECTION, userId);
    const docSnap = await getDoc(userDocRef);

    if (docSnap.exists()) {
      const userData = docSnap.data() as UserProfile;
      if (userData.referralCode) {
        console.log(`Referral code already exists for user ${userId}: ${userData.referralCode}`);
        return userData.referralCode;
      } else {
        const newCode = generateReferralCode();
        console.log(`Generated new referral code for user ${userId}: ${newCode}`);
        await updateDoc(userDocRef, {
          referralCode: newCode,
          updatedAt: serverTimestamp()
        });
        return newCode;
      }
    } else {
      console.error(`User profile not found for ID: ${userId}. Cannot generate referral code.`);
      return null;
    }
  } catch (error) {
    console.error(`Error generating/retrieving referral code for user ${userId}:`, error);
    return null; // Return null on error
  }
};

/**
 * Validates if a referral code exists for any user.
 * @param code The referral code entered by the user.
 * @returns Promise resolving to an object with validity, message, and referrerId.
 */
export const validateReferralCode = async (code: string): Promise<{ valid: boolean; referrerId: string | null; message: string }> => {
  if (!code || typeof code !== 'string' || code.length < 5) { // Basic sanity check
    return { valid: false, referrerId: null, message: "Invalid code format." };
  }

  try {
    const usersRef = collection(db, USER_COLLECTION);
    // Query for a user where their referralCode field matches the entered code
    const q = query(usersRef, where("referralCode", "==", code), limit(1));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      // No user found with this referral code
      return { valid: false, referrerId: null, message: "Referral code not found." };
    } else {
      // Found a user with this code
      const referrerDoc = querySnapshot.docs[0];
      return { valid: true, referrerId: referrerDoc.id, message: "Referral code valid." };
    }
  } catch (error) {
    console.error("Error validating referral code:", error);
    return { valid: false, referrerId: null, message: "Error checking referral code." };
  }
};

/**
 * Marks that a user has successfully used a referral code.
 * Sets the `referralCodeUsed` flag to true on their profile.
 * Optionally stores the code they used.
 * @param userId The ID of the user who used the code.
 * @param codeUsed The referral code that was used.
 */
export const markReferralUsed = async (userId: string, codeUsed: string): Promise<void> => {
  if (!userId || !codeUsed) {
    console.error("Invalid userId or codeUsed for marking referral.");
    // Potentially throw an error here or handle more gracefully
    return; 
  }
  try {
    const userDocRef = doc(db, USER_COLLECTION, userId);
    await updateDoc(userDocRef, {
      referralCodeUsed: true,
      referredByCode: codeUsed, // Store which code was used (optional)
      updatedAt: serverTimestamp()
    });
    console.log(`Marked referral code ${codeUsed} as used for user ${userId}`);
  } catch (error) {
    console.error(`Error marking referral code used for user ${userId}:`, error);
    // Critical error if this fails after order placement
    throw new Error("Failed to mark referral code as used."); 
  }
};

// Add other user-specific service functions here as needed
// e.g., update profile, check referral code validity etc.

// Export functions individually and/or as a service object
export const userService = {
  getUserProfile,
  awardSupercoins,
  deductSupercoins,
  applyCoinDiscountToUser,
  generateOrRetrieveReferralCode,
  validateReferralCode,
  markReferralUsed,
}; 