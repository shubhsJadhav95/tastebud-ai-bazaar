import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { NGO } from '@/services/ngoService'; // Import the NGO type

// Validation schema using Zod
const formSchema = z.object({
  name: z.string().min(2, { message: 'NGO name must be at least 2 characters.' }),
  address: z.object({
      street: z.string().min(3, { message: 'Street address is required.' }),
      city: z.string().min(2, { message: 'City is required.' }),
      state: z.string().min(2, { message: 'State is required.' }),
      zip: z.string().regex(/^\d{5}(-\d{4})?$/, { message: 'Invalid ZIP code format.' }), // Basic US ZIP validation
  }),
  phone: z.string().regex(/^\+?[1-9]\d{1,14}$/, { message: 'Invalid phone number format.' }), // Basic E.164 validation
  category: z.string().min(3, { message: 'Category is required (e.g., Food Bank).' }),
});

// Define the form values type based on the schema
type NGOFormValues = z.infer<typeof formSchema>;

interface NGOFormProps {
  onSubmit: (data: NGOFormValues) => Promise<void>;
  initialData?: Partial<NGO>; // For potential future editing
  isSubmitting: boolean;
}

const NGOForm: React.FC<NGOFormProps> = ({ onSubmit, initialData = {}, isSubmitting }) => {
  const form = useForm<NGOFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
        name: initialData?.name || '',
        address: {
            street: initialData?.address?.street || '',
            city: initialData?.address?.city || '',
            state: initialData?.address?.state || '',
            zip: initialData?.address?.zip || '',
        },
        phone: initialData?.phone || '',
        category: initialData?.category || '',
    },
  });

  const handleFormSubmit = async (values: NGOFormValues) => {
    await onSubmit(values);
    // Optionally reset form after successful submission for 'create' mode
    // if (!initialData.id) { form.reset(); }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{initialData?.id ? 'Edit NGO Information' : 'Add New NGO'}</CardTitle>
        <CardDescription>
          {initialData?.id ? 'Update the details for this NGO.' : 'Enter the details for the new NGO.'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>NGO Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Community Food Bank" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Address Fields - Grouped or separate */}
            <FormField
              control={form.control}
              name="address.street"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Street Address</FormLabel>
                  <FormControl>
                    <Input placeholder="123 Main St" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="address.city"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>City</FormLabel>
                    <FormControl>
                      <Input placeholder="Anytown" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="address.state"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>State</FormLabel>
                    <FormControl>
                      <Input placeholder="CA" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="address.zip"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>ZIP Code</FormLabel>
                    <FormControl>
                      <Input placeholder="90210" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone Number</FormLabel>
                  <FormControl>
                    <Input placeholder="+15551234567" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <FormControl>
                    <Input placeholder="Food Bank, Shelter, etc." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end pt-4">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Saving...' : (initialData?.id ? 'Update NGO' : 'Create NGO')}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default NGOForm; 