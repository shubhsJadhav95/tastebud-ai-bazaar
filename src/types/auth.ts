import { User as FirebaseUser } from 'firebase/auth';

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
  user: FirebaseUser | null;
  profile: UserProfile | null;
  login: (email: string, password: string, type: UserType) => Promise<boolean>;
  signup: (email: string, password: string, type: UserType, fullName?: string) => Promise<boolean>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  isLoading: boolean;
  userType: UserType;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials extends LoginCredentials {
  // Add any additional fields needed for registration, e.g.:
  // fullName?: string;
  // userType?: string;
}
