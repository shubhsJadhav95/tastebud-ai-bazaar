import * as React from "react";
import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuthContext } from "@/contexts/AuthContext";
import { toast } from "sonner";
import NavBar from "@/components/NavBar";
import Footer from "@/components/Footer";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UserProfile } from "@/types";
import { Separator } from "@/components/ui/separator";
import { Chrome } from "lucide-react";

const CustomerLogin: React.FC = () => {
  // Login state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  
  // Signup state
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [isSigningUp, setIsSigningUp] = useState(false);
  
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  
  const { signIn, signUp, signInWithGoogle, user, profile, loading: authLoading, error: authError } = useAuthContext();
  const navigate = useNavigate();

  // Redirect if already logged in
  useEffect(() => {
    // --- DETAILED REDIRECT LOGGING --- 
    console.log('REDIRECT EFFECT Triggered. State:', { 
      authLoading,
      userId: user?.uid, 
      profileExists: !!profile,
      profileUserType: profile?.user_type 
    });
    // --- END DETAILED LOGGING --- 
    
    if (authLoading) {
      console.log('REDIRECT EFFECT: Still loading auth, returning.');
      return;
    }
    
    if (user && profile?.user_type === "customer") {
      console.log('REDIRECT EFFECT: Condition MET! Preparing to navigate...'); // Added log
      console.log('Current User:', user);
      console.log('Current Profile:', profile);
      console.log('Navigating to /customer/home...'); // Added log
      navigate("/customer/home");
    } else if (user && profile?.user_type === "restaurant") {
      console.log('REDIRECT EFFECT: Condition MET! Navigating to /restaurant/select...'); // Corrected log and target route
      navigate("/restaurant/select"); // <-- Change target route
    } else if (user && !profile) {
      console.log('REDIRECT EFFECT: User exists, but profile is null/undefined.');
    } else if (!user) {
      console.log('REDIRECT EFFECT: User is null/undefined.');
    } else {
      // Log if conditions aren't met for some other reason
      console.log('REDIRECT EFFECT: Conditions NOT MET. User:', user, 'Profile:', profile);
    }
  }, [user, profile, authLoading, navigate]);

  // Display auth error if present
  useEffect(() => {
    if (authError) {
      // Use toast or another method to display the error from the context
      toast.error(authError || "An authentication error occurred.");
      // Consider clearing the error in the context if needed after showing it
    }
  }, [authError]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast.error("Please enter both email and password");
      return;
    }
    
    setIsLoggingIn(true);

    try {
      // Pass "customer" as the user type for customer login
      const success = await signIn(email, password, "customer");
      
      if (!success) {
        // If login returns false, show a generic error
        toast.error("Login failed. Please check your credentials and try again.");
        setIsLoggingIn(false);
        return;
      }

      // Success case is handled by the useEffect watching user/profile in this component
      toast.success("Login successful!");
    } catch (error: any) { 
      console.error("Login error caught in component:", error);
      toast.error(error.message || "Failed to login. Please try again.");
      setIsLoggingIn(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!signupEmail || !signupPassword || !confirmPassword) {
      toast.error("Please fill all required fields");
      return;
    }
    
    if (signupPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    
    if (signupPassword.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    
    setIsSigningUp(true);

    try {
      // Pass "customer" as the user type for customer signup
      const success = await signUp(signupEmail, signupPassword, "customer", fullName);
      
      if (!success) {
        toast.error("Failed to create account. Please try again.");
        setIsSigningUp(false);
        return;
      }

      // Success case is handled by the useEffect watching user/profile
      toast.success("Account created successfully!");
    } catch (error: any) {
      console.error("Signup error caught in component:", error);
      toast.error(error.message || "Failed to create account. Please try again.");
      setIsSigningUp(false);
    }
  };

  // New handler for Google Sign-In button
  const handleGoogleSignIn = async () => {
      setIsGoogleLoading(true);
      try {
          await signInWithGoogle();
          // Redirect is handled by useEffect
          // toast.success("Signed in with Google!"); // Optional success toast
      } catch (error) {
          // Error is displayed by the authError useEffect
          console.error("Google Sign-In error caught in component:", error);
          // Don't show generic toast if user just closed popup
          if ((error as any)?.code !== 'auth/popup-closed-by-user') {
             toast.error("Google Sign-In failed. Please try again.");
          }
      } finally {
          setIsGoogleLoading(false);
      }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <NavBar />
      
      <div className="flex-grow flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <Card className="max-w-md w-full">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold">Customer Portal</CardTitle>
            <CardDescription>
              Order food from your favorite restaurants
            </CardDescription>
          </CardHeader>
          
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>
            
            <TabsContent value="login">
              <form onSubmit={handleLogin}>
                <CardContent className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="your@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <input
                        id="remember-me"
                        name="remember-me"
                        type="checkbox"
                        className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                      />
                      <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
                        Remember me
                      </label>
                    </div>
                    
                    <Link to="#" className="text-sm font-medium text-primary hover:underline">
                      Forgot password?
                    </Link>
                  </div>
                </CardContent>
                
                <CardFooter className="flex-col items-stretch gap-4">
                  <Button 
                    type="submit" 
                    className="w-full" 
                    disabled={isLoggingIn || authLoading}
                  >
                    {isLoggingIn ? "Signing in..." : "Sign in"}
                  </Button>

                  <div className="relative my-2">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-background px-2 text-muted-foreground">
                        Or continue with
                      </span>
                    </div>
                  </div>
                  <Button 
                     variant="outline" 
                     className="w-full" 
                     type="button" 
                     onClick={handleGoogleSignIn}
                     disabled={isGoogleLoading || authLoading}
                   >
                     {isGoogleLoading ? (
                       <span className="animate-spin h-4 w-4 mr-2 border-t-2 border-b-2 border-primary rounded-full"></span> 
                     ) : (
                       <Chrome className="mr-2 h-4 w-4" />
                     )}
                     Google
                   </Button>
                </CardFooter>
              </form>
            </TabsContent>
            
            <TabsContent value="signup">
              <form onSubmit={handleSignup}>
                <CardContent className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <Label htmlFor="fullName">Full Name</Label>
                    <Input
                      id="fullName"
                      type="text"
                      placeholder="John Doe"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="signupEmail">Email</Label>
                    <Input
                      id="signupEmail"
                      type="email"
                      placeholder="your@email.com"
                      value={signupEmail}
                      onChange={(e) => setSignupEmail(e.target.value)}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="signupPassword">Password</Label>
                    <Input
                      id="signupPassword"
                      type="password"
                      placeholder="••••••••"
                      value={signupPassword}
                      onChange={(e) => setSignupPassword(e.target.value)}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm Password</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                    />
                  </div>
                </CardContent>
                
                <CardFooter>
                  <Button 
                    type="submit" 
                    className="w-full" 
                    disabled={isSigningUp || authLoading}
                  >
                    {isSigningUp ? "Creating Account..." : "Create Account"}
                  </Button>
                </CardFooter>
              </form>
            </TabsContent>
          </Tabs>
        </Card>
      </div>
      
      <Footer />
    </div>
  );
};

export default CustomerLogin;
