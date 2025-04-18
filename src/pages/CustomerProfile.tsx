import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthContext } from '@/contexts/AuthContext';
import NavBar from '@/components/NavBar';
import Footer from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { UserCircle, MapPin, Phone, Mail, Edit, Save } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
// Firestore imports
import { doc, updateDoc, serverTimestamp } from "firebase/firestore"; 
import { db } from "@/integrations/firebase/client";

const CustomerProfile: React.FC = () => {
  const { user, profile, loading } = useAuthContext();
  const navigate = useNavigate();
  
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    full_name: profile?.full_name || '',
    address: profile?.address || '',
    phone: profile?.phone || '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Update authentication and user type checks
  useEffect(() => {
    // Wait until loading is finished
    if (loading) return;
    
    // Check if user is logged in
    if (!user) {
      navigate('/customer/login');
      return;
    }
    
    // Check if user is a customer using the profile
    if (profile?.user_type !== 'customer') {
      navigate('/restaurant/dashboard'); // Or a relevant page
      toast.error('Only customers can access this page');
      return;
    }
    
    // Update form data when profile is loaded/changes
    if (profile) {
      setFormData({
        full_name: profile.full_name || '',
        address: profile.address || '',
        phone: profile.phone || '',
      });
    }
  }, [loading, user, profile, navigate]);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast.error("You must be logged in to update your profile.");
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Get a reference to the user's document in Firestore
      const userDocRef = doc(db, "users", user.uid);
      
      // Update the document
      await updateDoc(userDocRef, {
        full_name: formData.full_name, // Keep snake_case if UserProfile type uses it
        address: formData.address,
        phone: formData.phone,
        updatedAt: serverTimestamp() // Use server timestamp for update time
      });

      toast.success('Profile updated successfully');
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="min-h-screen flex flex-col">
      <NavBar />
      
      <div className="flex-grow py-8">
        <div className="container max-w-4xl mx-auto px-4">
          {loading ? (
            <p>Loading profile...</p> // Show loading indicator
          ) : (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-2xl font-bold">My Profile</CardTitle>
                <UserCircle size={28} className="text-primary" />
              </CardHeader>
              
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium mb-2">Account Information</h3>
                    <div className="grid gap-4 md:grid-cols-2">
                      <div>
                        <Label className="text-sm text-gray-500">Full Name</Label>
                        <p className="font-medium">{profile?.full_name || 'Not specified'}</p>
                      </div>
                      <div>
                        <Label className="text-sm text-gray-500">Email</Label>
                        <p className="font-medium">{user?.email}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="border-t pt-4">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-medium">Personal Information</h3>
                      {!isEditing ? (
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => setIsEditing(true)}
                        >
                          <Edit size={16} className="mr-2" />
                          Edit
                        </Button>
                      ) : (
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => setIsEditing(false)}
                        >
                          Cancel
                        </Button>
                      )}
                    </div>
                    
                    {isEditing ? (
                      <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                          <Label htmlFor="full_name">Full Name</Label>
                          <div className="relative">
                            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                              <UserCircle size={18} />
                            </div>
                            <Input
                              id="full_name"
                              name="full_name"
                              value={formData.full_name}
                              onChange={handleInputChange}
                              placeholder="Your full name"
                              className="pl-10"
                            />
                          </div>
                        </div>
                        
                        <div>
                          <Label htmlFor="address">Address</Label>
                          <div className="relative">
                            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                              <MapPin size={18} />
                            </div>
                            <Input
                              id="address"
                              name="address"
                              value={formData.address}
                              onChange={handleInputChange}
                              placeholder="Your address"
                              className="pl-10"
                            />
                          </div>
                        </div>
                        
                        <div>
                          <Label htmlFor="phone">Phone Number</Label>
                          <div className="relative">
                            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                              <Phone size={18} />
                            </div>
                            <Input
                              id="phone"
                              name="phone"
                              value={formData.phone}
                              onChange={handleInputChange}
                              placeholder="Your phone number"
                              className="pl-10"
                            />
                          </div>
                        </div>
                        
                        <Button 
                          type="submit" 
                          className="w-full"
                          disabled={isSubmitting}
                        >
                          {isSubmitting ? 'Saving...' : 'Save Changes'}
                          {!isSubmitting && <Save size={16} className="ml-2" />}
                        </Button>
                      </form>
                    ) : (
                      <div className="grid gap-4 md:grid-cols-2">
                        <div>
                          <Label className="text-sm text-gray-500">Full Name</Label>
                          <p className="font-medium flex items-center">
                            <UserCircle size={18} className="mr-2 text-gray-500" />
                            {profile?.full_name || 'Not specified'}
                          </p>
                        </div>
                        
                        <div>
                          <Label className="text-sm text-gray-500">Email</Label>
                          <p className="font-medium flex items-center">
                            <Mail size={18} className="mr-2 text-gray-500" />
                            {user?.email}
                          </p>
                        </div>
                        
                        <div>
                          <Label className="text-sm text-gray-500">Address</Label>
                          <p className="font-medium flex items-center">
                            <MapPin size={18} className="mr-2 text-gray-500" />
                            {profile?.address || 'Not specified'}
                          </p>
                        </div>
                        
                        <div>
                          <Label className="text-sm text-gray-500">Phone</Label>
                          <p className="font-medium flex items-center">
                            <Phone size={18} className="mr-2 text-gray-500" />
                            {profile?.phone || 'Not specified'}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="border-t pt-4">
                    <h3 className="text-lg font-medium mb-4">Account Settings</h3>
                    <div className="space-y-2">
                      <Button variant="outline" className="w-full justify-start">
                        Change Password
                      </Button>
                      <Button variant="outline" className="w-full justify-start text-red-500 hover:text-red-700 hover:bg-red-50">
                        Delete Account
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default CustomerProfile;
