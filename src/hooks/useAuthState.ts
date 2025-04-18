import { useState } from "react";
import { User as FirebaseUser } from "firebase/auth";
import { UserProfile, UserType } from "@/types/auth";

export const useAuthState = () => {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [userType, setUserType] = useState<UserType>(null);

  return {
    user,
    setUser,
    profile,
    setProfile,
    isLoading,
    setIsLoading,
    userType,
    setUserType,
  };
};
