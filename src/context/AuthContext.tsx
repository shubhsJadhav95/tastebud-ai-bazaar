import React, { createContext, useContext, useEffect } from "react";
import { auth } from "@/integrations/firebase/client";
import { onAuthStateChanged, User as FirebaseUser } from "firebase/auth";
import { AuthContextType, UserType } from "@/types/auth";
import { useAuthState } from "@/hooks/useAuthState";
import { authService } from "@/services/authService";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const {
    user,
    setUser,
    profile,
    setProfile,
    isLoading,
    setIsLoading,
    userType,
    setUserType
  } = useAuthState();

  useEffect(() => {
    console.log("Setting up Firebase auth state listener");
    setIsLoading(true);

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      console.log("Firebase auth state changed. User:", firebaseUser?.uid);
      setUser(firebaseUser);

      if (firebaseUser) {
        try {
          const userProfile = await authService.fetchUserProfile(firebaseUser.uid);
          console.log("Fetched user profile:", userProfile);
          setProfile(userProfile);
          setUserType(userProfile?.user_type ?? null);
        } catch (error) {
          console.error("Error fetching profile in auth state change:", error);
          setProfile(null);
          setUserType(null);
        }
      } else {
        setProfile(null);
        setUserType(null);
      }
      setIsLoading(false);
    });

    return () => {
      console.log("Cleaning up Firebase auth state listener");
      unsubscribe();
    };
  }, [setUser, setProfile, setUserType, setIsLoading]);

  const login = async (email: string, password: string, type: UserType) => {
    setIsLoading(true);
    try {
      const success = await authService.login(email, password, type);
      return success;
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (email: string, password: string, type: UserType, fullName?: string) => {
    setIsLoading(true);
    try {
      const success = await authService.signup(email, password, type, fullName);
      return success;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await authService.logout();
    } finally {
      setIsLoading(false);
    }
  };

  const contextValue: AuthContextType = {
    user,
    profile,
    login,
    signup,
    logout,
    isAuthenticated: !!user,
    isLoading,
    userType
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
