import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '~/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '~/components/ui/form';
import { Input } from '~/components/ui/input';
import { Textarea } from '~/components/ui/textarea';
import { Checkbox } from '~/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '~/components/ui/select';
import { toast } from 'sonner';
import { useLoaderData } from 'react-router';

const formSchema = z.object({
  label: z.string().min(2, { message: 'Property name is required' }),
  type: z.enum(['BUILDING', 'UNIT', 'COMMERCIAL_SPACE', 'PARKING_SPOT', 'STORAGE', 'LAND'], {
    required_error: 'Please select a property type',
  }),
  address: z.string().optional(),
  description: z.string().optional(),
  parentId: z.string().optional(),
  bedroomCount: z.preprocess(
    val => (val === '' ? undefined : Number(val)),
    z.number().int().gte(0).optional()
  ),
  bathroomCount: z.preprocess(
    val => (val === '' ? undefined : Number(val)),
    z.number().gte(0).optional()
  ),
  squareFootage: z.preprocess(
    val => (val === '' ? undefined : Number(val)),
    z.number().gte(0).optional()
  ),
  rentAmount: z.preprocess(
    val => (val === '' ? undefined : Number(val)),
    z.number().gte(0).optional()
  ),
  isActive: z.boolean().default(true),
});

const propertyTypes = [
  { value: 'BUILDING', label: 'Building' },
  { value: 'UNIT', label: 'Unit' },
  { value: 'COMMERCIAL_SPACE', label: 'Commercial Space' },
  { value: 'PARKING_SPOT', label: 'Parking Spot' },
  { value: 'STORAGE', label: 'Storage' },
  { value: 'LAND', label: 'Land' },
];

type FormValues = z.infer<typeof formSchema>;

interface ParentProperty {
  id: string;
  label: string;
  type: string;
}

interface CreatePropertyFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function CreatePropertyForm({ onSuccess, onCancel }: CreatePropertyFormProps) {
  const [loading, setLoading] = useState(false);
  const { parentProperties } = useLoaderData() as { parentProperties: ParentProperty[] };

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      label: '',
      type: undefined,
      address: '',
      description: '',
      parentId: undefined,
      bedroomCount: undefined,
      bathroomCount: undefined,
      squareFootage: undefined,
      rentAmount: undefined,
      isActive: true,
    },
  });

  async function onSubmit(data: FormValues) {
    setLoading(true);
    try {
      const formData = {
        ...data,
        parentId: data.parentId === 'none' ? null : data.parentId,
      };

      const response = await fetch('/api/properties', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to create property');
      }

      toast.success('Property created successfully');

      form.reset();
      if (onSuccess) onSuccess();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to create property');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <FormField
            control={form.control}
            name="label"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Property Name</FormLabel>
                <FormControl>
                  <Input placeholder="Enter property name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Property Type</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a property type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {propertyTypes.map(type => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="address"
            render={({ field }) => (
              <FormItem className="col-span-2">
                <FormLabel>Address</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Enter property address"
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
            name="description"
            render={({ field }) => (
              <FormItem className="col-span-2">
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Property description"
                    className="resize-none"
                    {...field}
                    value={field.value || ''}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {parentProperties && parentProperties.length > 0 && (
            <FormField
              control={form.control}
              name="parentId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Parent Property</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a parent property (optional)" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      {parentProperties.map(property => (
                        <SelectItem key={property.id} value={property.id}>
                          {property.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Optionally select a parent property (e.g., building for a unit)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          <FormField
            control={form.control}
            name="bedroomCount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Bedrooms</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="Number of bedrooms"
                    {...field}
                    value={field.value !== undefined ? field.value : ''}
                    onChange={e => field.onChange(e.target.value)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="bathroomCount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Bathrooms</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="Number of bathrooms"
                    {...field}
                    value={field.value !== undefined ? field.value : ''}
                    onChange={e => field.onChange(e.target.value)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="squareFootage"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Square Footage</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="Square footage"
                    {...field}
                    value={field.value !== undefined ? field.value : ''}
                    onChange={e => field.onChange(e.target.value)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="rentAmount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Rent Amount</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="Monthly rent amount"
                    {...field}
                    value={field.value !== undefined ? field.value : ''}
                    onChange={e => field.onChange(e.target.value)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="isActive"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-y-0 space-x-3 rounded-md border p-4">
                <FormControl>
                  <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>Active</FormLabel>
                  <FormDescription>
                    Indicates if this property is available and active in the system
                  </FormDescription>
                </div>
              </FormItem>
            )}
          />
        </div>

        <div className="flex justify-end space-x-2">
          {onCancel && (
            <Button variant="outline" onClick={onCancel} type="button">
              Cancel
            </Button>
          )}
          <Button type="submit" disabled={loading}>
            {loading ? 'Creating...' : 'Create Property'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
