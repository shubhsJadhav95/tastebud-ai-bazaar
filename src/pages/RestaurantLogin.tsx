import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authService } from '../services/authService'; // Assuming reverted authService path
import { toast } from 'sonner';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Eye, EyeOff, LogIn } from 'lucide-react';

const RestaurantLogin: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      // Call the login function from authService, specifying 'restaurant' type
      const success = await authService.login(email, password, 'restaurant');

      if (success) {
        toast.success('Login successful! Redirecting...');
        navigate('/restaurant/select'); // Navigate to the new selection page
      } else {
        // Error toast is likely handled within authService.login
        // toast.error('Login failed. Please check credentials or user type.');
      }
    } catch (error: any) {
      // Catch any unexpected errors from the login function call itself
      console.error("Login component error:", error);
      toast.error(error.message || 'An unexpected error occurred during login.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-100 to-amber-200 p-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Restaurant Login</CardTitle>
          <CardDescription>Access your restaurant dashboard</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="********"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isLoading}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-1 top-1/2 h-7 w-7 -translate-y-1/2 text-gray-500"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </Button>
              </div>
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                 <>
                   <LogIn className="mr-2 h-4 w-4 animate-spin" /> Logging in...
                 </>
               ) : (
                 'Login'
               )}
            </Button>
          </form>
          {/* Optional: Add links for password reset or signup if applicable */}
          {/* <div className="mt-4 text-center text-sm">
            <Link to="/restaurant/forgot-password" className="underline">
              Forgot password?
            </Link>
          </div> */}
        </CardContent>
      </Card>
    </div>
  );
};

export default RestaurantLogin; 