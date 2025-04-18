import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  QueryConstraint,
  DocumentData,
  CollectionReference,
  DocumentReference,
  Firestore,
  Timestamp,
  serverTimestamp,
  WriteBatch,
  writeBatch,
} from 'firebase/firestore';
// This assumes firebaseConfig.ts exists and exports db correctly.
// If firebaseConfig.ts was also deleted, it needs to be recreated first.
// Or adjust the import path if db is initialized elsewhere.
import { db } from '../integrations/firebase/firebaseConfig';

class FirestoreService {
  private db: Firestore;

  constructor(firestoreInstance: Firestore) {
    this.db = firestoreInstance;
  }

  // --- Basic CRUD ---

  async addDocument<T extends DocumentData>(
    collectionPath: string,
    data: T
  ): Promise<DocumentReference<T>> {
    try {
      const dataWithTimestamp = { ...data, createdAt: serverTimestamp() };
      const collectionRef = collection(this.db, collectionPath) as CollectionReference<T>;
      const docRef = await addDoc(collectionRef, dataWithTimestamp);
      return docRef;
    } catch (error) {
      console.error(`Error adding document to ${collectionPath}:`, error);
      throw error;
    }
  }

  async setDocument<T extends DocumentData>(
    collectionPath: string,
    docId: string,
    data: T,
    merge = false
  ): Promise<void> {
    try {
      const dataWithTimestamp = {
          ...data,
          [merge ? 'updatedAt' : 'createdAt']: serverTimestamp()
      };
      const docRef = doc(this.db, collectionPath, docId) as DocumentReference<T>;
      await setDoc(docRef, dataWithTimestamp, { merge });
    } catch (error) {
      console.error(`Error setting document ${collectionPath}/${docId}:`, error);
      throw error;
    }
  }

  async updateDocument<T extends DocumentData>(
    collectionPath: string,
    docId: string,
    data: Partial<T>
  ): Promise<void> {
    try {
      const dataWithTimestamp = { ...data, updatedAt: serverTimestamp() };
      const docRef = doc(this.db, collectionPath, docId) as DocumentReference<T>;
      await updateDoc(docRef, dataWithTimestamp);
    } catch (error) {
      console.error(`Error updating document ${collectionPath}/${docId}:`, error);
      throw error;
    }
  }

  async deleteDocument(collectionPath: string, docId: string): Promise<void> {
    try {
      const docRef = doc(this.db, collectionPath, docId);
      await deleteDoc(docRef);
    } catch (error) {
      console.error(`Error deleting document ${collectionPath}/${docId}:`, error);
      throw error;
    }
  }

  // --- Read Operations --- 

  async getDocument<T extends DocumentData>(collectionPath: string, docId: string): Promise<T | null> {
    try {
      const docRef = doc(this.db, collectionPath, docId) as DocumentReference<T>;
      const docSnap = await getDoc(docRef);
      // Add id to the returned document data
      return docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } as T : null;
    } catch (error) {
      console.error(`Error getting document ${collectionPath}/${docId}:`, error);
      throw error;
    }
  }

  async getCollection<T extends DocumentData>(
    collectionPath: string,
    constraints: QueryConstraint[] = []
  ): Promise<T[]> {
    try {
      const collectionRef = collection(this.db, collectionPath) as CollectionReference<T>;
      const q = query(collectionRef, ...constraints);
      const querySnapshot = await getDocs(q);
      // Add id to each document data
      return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }) as T);
    } catch (error) {
      console.error(`Error getting collection ${collectionPath}:`, error);
      throw error;
    }
  }

  // --- Realtime Listener --- 

  onSnapshotDocument<T extends DocumentData>(
    collectionPath: string,
    docId: string,
    callback: (data: T | null) => void,
    onError?: (error: Error) => void
  ): () => void {
    const docRef = doc(this.db, collectionPath, docId) as DocumentReference<T>;
    const unsubscribe = onSnapshot(docRef,
      (docSnap) => {
        // Add id to the returned document data
        callback(docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } as T : null);
      },
      (error) => {
        console.error(`Error listening to document ${collectionPath}/${docId}:`, error);
        if (onError) {
          onError(error);
        }
      }
    );
    return unsubscribe;
  }

   onSnapshotCollection<T extends DocumentData>(
    collectionPath: string,
    callback: (data: T[]) => void,
    constraints: QueryConstraint[] = [],
    onError?: (error: Error) => void
  ): () => void {
    const collectionRef = collection(this.db, collectionPath) as CollectionReference<T>;
    const q = query(collectionRef, ...constraints);
    const unsubscribe = onSnapshot(q,
      (querySnapshot) => {
        // Add id to each document data
        const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }) as T);
        callback(data);
      },
      (error) => {
        console.error(`Error listening to collection ${collectionPath}:`, error);
        if (onError) {
          onError(error);
        }
      }
    );
    return unsubscribe;
  }

  // --- Batch Writes --- 

  createBatch(): WriteBatch {
      return writeBatch(this.db);
  }
}

// Export a singleton instance
export const firestoreService = new FirestoreService(db);

// Export utility functions if needed separately
export { serverTimestamp, Timestamp, where, orderBy, limit, startAfter }; 