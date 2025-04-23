import { db } from '@/integrations/firebase/client';
import { collection, addDoc, serverTimestamp, GeoPoint, query, where, getDocs, orderBy, doc, getDoc } from 'firebase/firestore';
import { toast } from 'sonner';

// Define the NGO type
export interface NGO {
  id?: string; // Firestore document ID (optional)
  name: string;
  address: {
    street: string;
    city: string;
    state: string;
    zip: string;
    // Consider adding GeoPoint for map integration later
    // location?: GeoPoint;
  };
  phone: string;
  category: string; // e.g., Food Bank, Shelter, Community Kitchen
  ownerId: string; // User ID of the restaurant owner who added the NGO
  createdAt: any; // Firestore Timestamp
}

export const ngoService = {
  /**
   * Creates a new NGO document in Firestore.
   * @param ngoData - Object containing NGO details (excluding id and createdAt).
   * @returns The ID of the newly created NGO document.
   */
  async createNGO(ngoData: Omit<NGO, 'id' | 'createdAt'>): Promise<string | null> {
    if (!ngoData.ownerId) {
        console.error('Owner ID is required to create an NGO entry.');
        toast.error('Authentication error. Could not save NGO.');
        return null;
    }
    try {
      const ngoCollectionRef = collection(db, 'ngos');
      const docRef = await addDoc(ngoCollectionRef, {
        ...ngoData,
        createdAt: serverTimestamp(),
      });
      console.log('NGO created with ID:', docRef.id);
      toast.success('NGO information saved successfully!');
      return docRef.id;
    } catch (error) {
      console.error('Error creating NGO:', error);
      toast.error('Failed to save NGO information. ' + (error instanceof Error ? error.message : ''));
      return null;
    }
  },

  /**
   * Fetches all NGOs added by a specific owner.
   * @param ownerId - The user ID of the restaurant owner.
   * @returns A promise resolving to an array of NGO objects.
   */
  async getNGOsByOwner(ownerId: string): Promise<NGO[]> {
    if (!ownerId) {
        console.error('Owner ID is required to fetch NGOs.');
        return [];
    }
    try {
        const ngosRef = collection(db, 'ngos');
        const q = query(ngosRef, where('ownerId', '==', ownerId), orderBy('createdAt', 'desc'));
        const querySnapshot = await getDocs(q);
        
        const ngos: NGO[] = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
        })) as NGO[];
        
        return ngos;
    } catch (error) {
        console.error('Error fetching NGOs by owner:', error);
        toast.error('Failed to load NGOs.');
        return [];
    }
  },

  /**
   * Fetches all NGOs, ordered by name.
   * @returns A promise resolving to an array of all NGO objects.
   */
  async getAllNGOs(): Promise<NGO[]> {
    try {
        const ngosRef = collection(db, 'ngos');
        // Order by name for display purposes
        const q = query(ngosRef, orderBy('name', 'asc')); 
        const querySnapshot = await getDocs(q);
        
        const ngos: NGO[] = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
        })) as NGO[];
        
        console.log(`Fetched ${ngos.length} NGOs total.`);
        return ngos;
    } catch (error) {
        console.error('Error fetching all NGOs:', error);
        toast.error('Failed to load list of NGOs.');
        return []; // Return empty array on error
    }
  },

  /**
   * Fetches a single NGO by its document ID.
   * @param ngoId - The ID of the NGO document.
   * @returns A promise resolving to the NGO object or null if not found/error.
   */
  async getNgoById(ngoId: string): Promise<NGO | null> {
    if (!ngoId) {
      console.error("NGO ID is required to fetch NGO details.");
      return null;
    }
    try {
      const ngoDocRef = doc(db, 'ngos', ngoId);
      const docSnap = await getDoc(ngoDocRef);

      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as NGO;
      } else {
        console.warn(`NGO document not found for ID: ${ngoId}`);
        return null;
      }
    } catch (error) {
      console.error(`Error fetching NGO details for ID ${ngoId}:`, error);
      // Avoid showing generic error toast here, let caller handle UI feedback
      return null;
    }
  }
}; 