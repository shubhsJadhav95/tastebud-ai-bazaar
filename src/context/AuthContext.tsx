
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
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        console.log("Auth state changed:", event, newSession?.user?.id);
        setSession(newSession);
        setUser(newSession?.user ?? null);
        
        if (newSession?.user) {
          const userProfile = await authService.fetchUserProfile(newSession.user.id);
          setProfile(userProfile);
          setUserType(userProfile?.user_type ?? null);
        } else {
          setProfile(null);
          setUserType(null);
        }
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(async ({ data: { session: currentSession } }) => {
      setSession(currentSession);
      setUser(currentSession?.user ?? null);
      
      if (currentSession?.user) {
        const userProfile = await authService.fetchUserProfile(currentSession.user.id);
        setProfile(userProfile);
        setUserType(userProfile?.user_type ?? null);
      }
      
      setIsLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string, type: UserType) => {
    setIsLoading(true);
    const success = await authService.login(email, password, type);
    setIsLoading(false);
    return success;
  };

  const signup = async (email: string, password: string, type: UserType, fullName?: string) => {
    setIsLoading(true);
    const success = await authService.signup(email, password, type, fullName);
    setIsLoading(false);
    return success;
  };

  const contextValue: AuthContextType = {
    user,
    profile,
    login,
    signup,
    logout: authService.logout,
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
