import { useState, useEffect } from 'react';
import { 
  User,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  updateProfile,
  updateEmail,
  updatePassword
} from 'firebase/auth';
import { auth } from '@/integrations/firebase/client';
import { getFirebaseErrorMessage } from '@/utils/firebaseErrorHandler';

interface AuthState {
  user: User | null;
  loading: boolean;
  error: Error | null;
}

interface AuthActions {
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, displayName: string) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updateUserProfile: (data: { displayName?: string; photoURL?: string }) => Promise<void>;
  updateUserEmail: (email: string) => Promise<void>;
  updateUserPassword: (password: string) => Promise<void>;
}

export const useFirebaseAuth = (): AuthState & AuthActions => {
  const [state, setState] = useState<AuthState>({
    user: null,
    loading: true,
    error: null
  });

  // Listen for auth state changes
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(
      (user) => {
        setState((prev) => ({ ...prev, user, loading: false }));
      },
      (error) => {
        setState((prev) => ({ ...prev, error, loading: false }));
      }
    );

    return () => unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      setState((prev) => ({ ...prev, loading: true, error: null }));
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      const firebaseError = getFirebaseErrorMessage(error);
      setState((prev) => ({ ...prev, error: new Error(firebaseError.message) }));
      throw error;
    } finally {
      setState((prev) => ({ ...prev, loading: false }));
    }
  };

  const signUp = async (email: string, password: string, displayName: string) => {
    try {
      setState((prev) => ({ ...prev, loading: true, error: null }));
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(userCredential.user, { displayName });
    } catch (error) {
      const firebaseError = getFirebaseErrorMessage(error);
      setState((prev) => ({ ...prev, error: new Error(firebaseError.message) }));
      throw error;
    } finally {
      setState((prev) => ({ ...prev, loading: false }));
    }
  };

  const signOut = async () => {
    try {
      setState((prev) => ({ ...prev, loading: true, error: null }));
      await auth.signOut();
    } catch (error) {
      const firebaseError = getFirebaseErrorMessage(error);
      setState((prev) => ({ ...prev, error: new Error(firebaseError.message) }));
      throw error;
    } finally {
      setState((prev) => ({ ...prev, loading: false }));
    }
  };

  const resetPassword = async (email: string) => {
    try {
      setState((prev) => ({ ...prev, loading: true, error: null }));
      await sendPasswordResetEmail(auth, email);
    } catch (error) {
      const firebaseError = getFirebaseErrorMessage(error);
      setState((prev) => ({ ...prev, error: new Error(firebaseError.message) }));
      throw error;
    } finally {
      setState((prev) => ({ ...prev, loading: false }));
    }
  };

  const updateUserProfile = async (data: { displayName?: string; photoURL?: string }) => {
    if (!state.user) throw new Error('No user is currently signed in');
    
    try {
      setState((prev) => ({ ...prev, loading: true, error: null }));
      await updateProfile(state.user, data);
      setState((prev) => ({ ...prev, user: { ...state.user, ...data } as User }));
    } catch (error) {
      const firebaseError = getFirebaseErrorMessage(error);
      setState((prev) => ({ ...prev, error: new Error(firebaseError.message) }));
      throw error;
    } finally {
      setState((prev) => ({ ...prev, loading: false }));
    }
  };

  const updateUserEmail = async (email: string) => {
    if (!state.user) throw new Error('No user is currently signed in');
    
    try {
      setState((prev) => ({ ...prev, loading: true, error: null }));
      await updateEmail(state.user, email);
      setState((prev) => ({ ...prev, user: { ...state.user, email } as User }));
    } catch (error) {
      const firebaseError = getFirebaseErrorMessage(error);
      setState((prev) => ({ ...prev, error: new Error(firebaseError.message) }));
      throw error;
    } finally {
      setState((prev) => ({ ...prev, loading: false }));
    }
  };

  const updateUserPassword = async (password: string) => {
    if (!state.user) throw new Error('No user is currently signed in');
    
    try {
      setState((prev) => ({ ...prev, loading: true, error: null }));
      await updatePassword(state.user, password);
    } catch (error) {
      const firebaseError = getFirebaseErrorMessage(error);
      setState((prev) => ({ ...prev, error: new Error(firebaseError.message) }));
      throw error;
    } finally {
      setState((prev) => ({ ...prev, loading: false }));
    }
  };

  return {
    ...state,
    signIn,
    signUp,
    signOut,
    resetPassword,
    updateUserProfile,
    updateUserEmail,
    updateUserPassword
  };
}; 