import { useState } from 'react';
import { Role } from '@prisma/client';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { Button } from '~/components/ui/button';
import { Input } from '~/components/ui/input';
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
import { Checkbox } from '~/components/ui/checkbox';

// Special value for "none" selection in organization dropdown
const NONE_VALUE = 'none';

const formSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email format'),
  role: z.enum(['ADMIN', 'PROPERTY_MANAGER', 'OWNER', 'TENANT', 'SERVICE_PROVIDER']),
  phoneNumber: z.string().optional().nullable(),
  alternativeContact: z.string().optional().nullable(),
  identificationVerified: z.boolean().default(false),
  organizationId: z.string().optional().nullable(),
  sendEmailNotification: z.boolean().default(false),
});

type FormValues = z.infer<typeof formSchema>;

interface EditUserFormProps {
  user: {
    id: string;
    name: string;
    email: string;
    role: Role;
    phoneNumber?: string | null;
    alternativeContact?: string | null;
    identificationVerified?: boolean;
    organizationId?: string | null;
  };
  organizations?: { id: string; name: string }[];
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function EditUserForm({
  user,
  organizations = [],
  isOpen,
  onClose,
  onSuccess,
}: EditUserFormProps) {
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: user.name,
      email: user.email,
      role: user.role,
      phoneNumber: user.phoneNumber || '',
      alternativeContact: user.alternativeContact || '',
      identificationVerified: user.identificationVerified || false,
      organizationId: user.organizationId || NONE_VALUE, // Use NONE_VALUE when organizationId is null
      sendEmailNotification: false,
    },
  });

  async function onSubmit(data: FormValues) {
    setIsLoading(true);

    try {
      // Extract the sendEmailNotification flag but don't send it to the API
      const { sendEmailNotification, ...updateData } = data;

      // Convert NONE_VALUE to null for organizationId
      if (updateData.organizationId === NONE_VALUE) {
        updateData.organizationId = null;
      }

      const response = await fetch(`/api/users/${user.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || error.error || 'Failed to update user');
      }

      const _result = await response.json();

      // If the user requested to send an email notification (magic link)
      if (sendEmailNotification) {
        const magicLinkResponse = await fetch(`/api/users/${user.id}/send-magic-link`, {
          method: 'POST',
        });

        if (!magicLinkResponse.ok) {
          const linkError = await magicLinkResponse.json();
          toast.warning('User updated but failed to send magic link email', {
            description: linkError.message || linkError.error || 'Unknown error',
          });
        } else {
          toast.success('User updated successfully and magic link email sent');
        }
      } else {
        toast.success('User updated successfully');
      }

      if (onSuccess) {
        onSuccess();
      } else {
        onClose();
      }
    } catch (error) {
      toast.error('Failed to update user', {
        description: error instanceof Error ? error.message : 'Unknown error',
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={open => !open && onClose()}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Edit User</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
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
                    <FormDescription>Changing email will update the auth account.</FormDescription>
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
                      <Input
                        placeholder="Enter phone number"
                        {...field}
                        value={field.value || ''}
                      />
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
                      <Input
                        placeholder="Enter alternative contact"
                        {...field}
                        value={field.value || ''}
                      />
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
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value || NONE_VALUE}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select an organization" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value={NONE_VALUE}>None</SelectItem>
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
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                    <div className="space-y-0.5">
                      <FormLabel>Verification Status</FormLabel>
                      <FormDescription>Mark user as verified</FormDescription>
                    </div>
                    <FormControl>
                      <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="sendEmailNotification"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                    <div className="space-y-0.5">
                      <FormLabel>Send Magic Link Email</FormLabel>
                      <FormDescription>Send a login link to the user</FormDescription>
                    </div>
                    <FormControl>
                      <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" type="button" onClick={onClose} disabled={isLoading}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
