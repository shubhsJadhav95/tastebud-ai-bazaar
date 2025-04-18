
import { User } from "@supabase/supabase-js";

export type UserType = "restaurant" | "customer" | null;

export interface UserProfile {
  id: string;
  email: string;
  full_name: string | null;
  user_type: UserType;
  address: string | null;
  phone: string | null;
}

export interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  login: (email: string, password: string, type: UserType) => Promise<boolean>;
  signup: (email: string, password: string, type: UserType, fullName?: string) => Promise<boolean>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  isLoading: boolean;
  userType: UserType;
}
