import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthContext } from '@/contexts/AuthContext'; // Import auth context
import { auth, db } from '@/integrations/firebase/client'; // Import Firebase auth and firestore
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { setDoc, doc, serverTimestamp } from 'firebase/firestore'; // Import Firestore functions
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

const RestaurantSignup: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      toast.error('Passwords do not match.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      toast.error('Password must be at least 6 characters long.');
      return;
    }

    setLoading(true);
    try {
      // 1. Create user in Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // 2. Create user profile in Firestore
      if (user) {
        const userProfileRef = doc(db, 'users', user.uid);
        await setDoc(userProfileRef, {
          uid: user.uid,
          email: user.email,
          user_type: 'restaurant', // Set user type to restaurant
          created_at: serverTimestamp(),
          // Add other default fields if necessary (e.g., full_name: '', phone_number: '')
          // Ensure fields match the UserProfile type if needed
        });
        
        toast.success('Account created successfully! Redirecting...');
        
        // Firebase automatically logs in the user after creation
        // The AuthProvider listener should pick this up.
        // We can directly navigate to the next step for restaurants.
        // This assumes the AuthProvider updates the context state correctly upon auth change.
        navigate('/restaurant/select'); // Redirect to restaurant selection/creation page
      } else {
        throw new Error('User creation failed.');
      }

    } catch (err: any) {
      console.error("Signup error:", err);
      let message = 'Failed to create account.';
      if (err.code === 'auth/email-already-in-use') {
        message = 'This email address is already in use.';
      } else if (err.code === 'auth/weak-password') {
        message = 'Password is too weak.';
      } else if (err.message) {
        message = err.message;
      }
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Restaurant Signup</CardTitle>
          <CardDescription>Create your restaurant partner account</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSignup} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="restaurant@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="********"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm-password">Confirm Password</Label>
              <Input
                id="confirm-password"
                type="password"
                placeholder="********"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                disabled={loading}
              />
            </div>
            {error && <p className="text-sm text-red-600">{error}</p>}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Sign Up'}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="text-center text-sm">
          Already have an account?{' '}
          <Link to="/restaurant/login" className="font-medium text-food-primary hover:underline">
            Log In
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
};

export default RestaurantSignup; 