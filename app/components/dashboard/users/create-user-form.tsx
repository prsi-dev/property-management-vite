import { useState } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { Button } from '~/components/ui/button';
import { Input } from '~/components/ui/input';
import { Checkbox } from '~/components/ui/checkbox';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '~/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '~/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '~/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '~/components/ui/tabs';
import type { UseFormReturn } from 'react-hook-form';

// Define a base schema with common fields
const commonFieldsSchema = {
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email format'),
  role: z.enum(['ADMIN', 'PROPERTY_MANAGER', 'OWNER', 'TENANT', 'SERVICE_PROVIDER']),
  phoneNumber: z.string().optional().nullable(),
  alternativeContact: z.string().optional().nullable(),
  identificationVerified: z.boolean().default(false),
  organizationId: z.string().optional().nullable(),
};

const passwordFormSchema = z
  .object({
    ...commonFieldsSchema,
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string().min(8, 'Please confirm the password'),
  })
  .refine(data => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

const magicLinkFormSchema = z.object({
  ...commonFieldsSchema,
});

type PasswordFormValues = z.infer<typeof passwordFormSchema>;
type MagicLinkFormValues = z.infer<typeof magicLinkFormSchema>;
// Define a common fields type for shared props
type CommonFormFields = {
  name: string;
  email: string;
  role: 'ADMIN' | 'PROPERTY_MANAGER' | 'OWNER' | 'TENANT' | 'SERVICE_PROVIDER';
  phoneNumber?: string | null;
  alternativeContact?: string | null;
  identificationVerified: boolean;
  organizationId?: string | null;
};

interface CreateUserFormProps {
  organizations?: { id: string; name: string }[];
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function CreateUserForm({
  organizations = [],
  isOpen,
  onClose,
  onSuccess,
}: CreateUserFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [_authMethod, setAuthMethod] = useState<'password' | 'magiclink'>('password');

  const passwordForm = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordFormSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      role: 'TENANT',
      phoneNumber: '',
      alternativeContact: '',
      identificationVerified: false,
      organizationId: null,
    },
  });

  const magicLinkForm = useForm<MagicLinkFormValues>({
    resolver: zodResolver(magicLinkFormSchema),
    defaultValues: {
      name: '',
      email: '',
      role: 'TENANT',
      phoneNumber: '',
      alternativeContact: '',
      identificationVerified: false,
      organizationId: null,
    },
  });

  async function onSubmitPassword(data: PasswordFormValues) {
    setIsLoading(true);

    try {
      // Remove confirmPassword field before sending
      const { confirmPassword: _confirmPassword, ...userData } = data;

      const response = await fetch('/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || error.error || 'Failed to create user');
      }

      toast.success('User created successfully');

      if (onSuccess) {
        onSuccess();
      } else {
        onClose();
      }
    } catch (error) {
      toast.error('Failed to create user', {
        description: error instanceof Error ? error.message : 'Unknown error',
      });
    } finally {
      setIsLoading(false);
    }
  }

  async function onSubmitMagicLink(data: MagicLinkFormValues) {
    setIsLoading(true);

    try {
      // For magic link, we need to create a temporary password
      const temporaryPassword =
        Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8);

      const userData = {
        ...data,
        password: temporaryPassword,
        useMagicLink: true,
      };

      // Use the correct API endpoint for creating users with magic links
      const response = await fetch('/api/users/create-with-magic-link', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || error.error || 'Failed to create user');
      }

      toast.success('User created and magic link sent successfully');

      if (onSuccess) {
        onSuccess();
      } else {
        onClose();
      }
    } catch (error) {
      toast.error('Failed to create user', {
        description: error instanceof Error ? error.message : 'Unknown error',
      });
    } finally {
      setIsLoading(false);
    }
  }

  // Common form fields for both types of forms
  const renderCommonFields = (form: UseFormReturn<CommonFormFields>) => (
    <>
      <FormField
        control={form.control}
        name="name"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Full Name</FormLabel>
            <FormControl>
              <Input placeholder="Enter full name" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="email"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Email</FormLabel>
            <FormControl>
              <Input placeholder="Enter email address" type="email" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="role"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Role</FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="ADMIN">Administrator</SelectItem>
                <SelectItem value="PROPERTY_MANAGER">Property Manager</SelectItem>
                <SelectItem value="OWNER">Owner</SelectItem>
                <SelectItem value="TENANT">Tenant</SelectItem>
                <SelectItem value="SERVICE_PROVIDER">Service Provider</SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="phoneNumber"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Phone Number</FormLabel>
            <FormControl>
              <Input placeholder="Enter phone number" {...field} value={field.value || ''} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="alternativeContact"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Alternative Contact</FormLabel>
            <FormControl>
              <Input placeholder="Enter alternative contact" {...field} value={field.value || ''} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {organizations.length > 0 && (
        <FormField
          control={form.control}
          name="organizationId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Organization</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value || undefined}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select an organization" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="">None</SelectItem>
                  {organizations.map(org => (
                    <SelectItem key={org.id} value={org.id}>
                      {org.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
      )}

      <FormField
        control={form.control}
        name="identificationVerified"
        render={({ field }) => (
          <FormItem className="flex flex-row items-center space-y-0 space-x-3 rounded-md border p-4">
            <FormControl>
              <Checkbox checked={field.value} onCheckedChange={field.onChange} />
            </FormControl>
            <div className="space-y-1 leading-none">
              <FormLabel>Verification Status</FormLabel>
              <FormDescription>Mark user as verified</FormDescription>
            </div>
          </FormItem>
        )}
      />
    </>
  );

  return (
    <Dialog open={isOpen} onOpenChange={open => !open && onClose()}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Add New User</DialogTitle>
        </DialogHeader>

        <Tabs
          defaultValue="password"
          onValueChange={value => setAuthMethod(value as 'password' | 'magiclink')}
        >
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="password">Password</TabsTrigger>
            <TabsTrigger value="magiclink">Magic Link</TabsTrigger>
          </TabsList>

          <TabsContent value="password">
            <Form {...passwordForm}>
              <form onSubmit={passwordForm.handleSubmit(onSubmitPassword)} className="space-y-6">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  {renderCommonFields(passwordForm as unknown as UseFormReturn<CommonFormFields>)}

                  <FormField
                    control={passwordForm.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                          <Input placeholder="••••••••" type="password" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={passwordForm.control}
                    name="confirmPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Confirm Password</FormLabel>
                        <FormControl>
                          <Input placeholder="••••••••" type="password" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="flex justify-end gap-2">
                  <Button variant="outline" type="button" onClick={onClose} disabled={isLoading}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isLoading}>
                    {isLoading ? 'Creating...' : 'Create User'}
                  </Button>
                </div>
              </form>
            </Form>
          </TabsContent>

          <TabsContent value="magiclink">
            <Form {...magicLinkForm}>
              <form onSubmit={magicLinkForm.handleSubmit(onSubmitMagicLink)} className="space-y-6">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  {renderCommonFields(magicLinkForm as unknown as UseFormReturn<CommonFormFields>)}
                </div>

                <div className="rounded-md bg-blue-50 p-4">
                  <div className="flex">
                    <div className="ml-3">
                      <p className="text-sm text-blue-700">
                        A magic link will be sent to the user&apos;s email address allowing them to
                        sign in without a password.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-2">
                  <Button variant="outline" type="button" onClick={onClose} disabled={isLoading}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isLoading}>
                    {isLoading ? 'Creating...' : 'Create & Send Magic Link'}
                  </Button>
                </div>
              </form>
            </Form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
