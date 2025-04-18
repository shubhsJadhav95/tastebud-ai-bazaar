
import React, { createContext, useContext, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AuthContextType, UserType } from "@/types/auth";
import { useAuthState } from "@/hooks/useAuthState";
import { authService } from "@/services/authService";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const {
    session,
    setSession,
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
    console.log("Setting up auth state listener");
    
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        console.log("Auth state changed:", event, newSession?.user?.id);
        setSession(newSession);
        setUser(newSession?.user ?? null);
        
        if (newSession?.user) {
          try {
            const userProfile = await authService.fetchUserProfile(newSession.user.id);
            console.log("Fetched user profile:", userProfile);
            setProfile(userProfile);
            setUserType(userProfile?.user_type ?? null);
          } catch (error) {
            console.error("Error fetching profile in auth state change:", error);
          }
        } else {
          setProfile(null);
          setUserType(null);
        }
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(async ({ data: { session: currentSession } }) => {
      console.log("Checking for existing session:", currentSession?.user?.id);
      setSession(currentSession);
      setUser(currentSession?.user ?? null);
      
      if (currentSession?.user) {
        try {
          const userProfile = await authService.fetchUserProfile(currentSession.user.id);
          console.log("Fetched existing user profile:", userProfile);
          setProfile(userProfile);
          setUserType(userProfile?.user_type ?? null);
        } catch (error) {
          console.error("Error fetching profile in session check:", error);
        }
      }
      
      setIsLoading(false);
    });

    return () => {
      console.log("Cleaning up auth state listener");
      subscription.unsubscribe();
    };
  }, []);

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
