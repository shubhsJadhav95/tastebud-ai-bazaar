
import { supabase } from "@/integrations/supabase/client";
import { UserProfile, UserType } from "@/types/auth";
import { toast } from "sonner";

export const authService = {
  async fetchUserProfile(userId: string): Promise<UserProfile | null> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (error) {
        console.error("Error fetching profile:", error);
        throw error;
      }
      
      if (data) {
        return {
          id: data.id,
          email: data.email,
          full_name: data.full_name,
          user_type: data.user_type as UserType,
          address: data.address ?? null,
          phone: data.phone ?? null
        };
      }
      
      return null;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }
  },

  async login(email: string, password: string, type: UserType): Promise<boolean> {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ 
        email, 
        password 
      });
      
      if (error) {
        toast.error(error.message);
        return false;
      }
      
      if (data.user) {
        // Check if user type matches
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('user_type')
          .eq('id', data.user.id)
          .single();
        
        if (profileError) {
          toast.error("Error fetching profile");
          await this.logout();
          return false;
        }
        
        if (profileData.user_type !== type) {
          toast.error(`This account is not registered as a ${type}`);
          await this.logout();
          return false;
        }
        
        return true;
      }
      
      return false;
    } catch (error) {
      console.error("Login error:", error);
      toast.error("An error occurred during login");
      return false;
    }
  },

  async signup(email: string, password: string, type: UserType, fullName?: string): Promise<boolean> {
    try {
      console.log("Signing up user:", email, type, fullName);
      
      const { data, error } = await supabase.auth.signUp({ 
        email, 
        password,
        options: {
          data: {
            full_name: fullName || "",
          }
        }
      });
      
      if (error) {
        console.error("Signup auth error:", error);
        toast.error(error.message);
        return false;
      }
      
      if (!data.user) {
        console.error("No user returned from signUp");
        toast.error("Failed to create account");
        return false;
      }
      
      console.log("User signed up, updating profile:", data.user.id);
      
      // Update the user_type in profiles table
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ user_type: type, full_name: fullName || null })
        .eq('id', data.user.id);
      
      if (updateError) {
        console.error("Error updating profile:", updateError);
        toast.error("Error setting up user profile");
        return false;
      }
      
      toast.success("Account created successfully!");
      return true;
    } catch (error) {
      console.error("Signup error:", error);
      toast.error("An error occurred during signup");
      return false;
    }
  },

  async logout(): Promise<void> {
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error("Logout error:", error);
    }
  }
};
