import { useState } from 'react';
import { Role } from '@prisma/client';
import { Button } from '~/components/ui/button';
import { Input } from '~/components/ui/input';
import { X, UserPlus } from 'lucide-react';

interface AddUserProps {
  isOpen: boolean;
  onClose: () => void;
  onAddUser: (userData: AddUserFormData) => void;
}

export interface AddUserFormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  role: Role;
  phoneNumber?: string;
}

export function AddUserDialog({ isOpen, onClose, onAddUser }: AddUserProps) {
  const [formData, setFormData] = useState<AddUserFormData>({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'TENANT',
    phoneNumber: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  if (!isOpen) return null;

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  }

  function validateForm(): boolean {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (validateForm()) {
      onAddUser(formData);
    }
  }

  return (
    <div className="bg-opacity-50 fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-background max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-lg shadow-lg">
        <div className="flex items-center justify-between border-b p-6">
          <h2 className="flex items-center gap-2 text-xl font-semibold">
            <UserPlus size={20} />
            Add New User
          </h2>
          <Button variant="ghost" size="sm" className="h-8 w-8 rounded-full p-0" onClick={onClose}>
            <X size={18} />
          </Button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="space-y-6 p-6">
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <label htmlFor="name" className="text-sm font-medium">
                    Full Name <span className="text-destructive">*</span>
                  </label>
                  <Input
                    id="name"
                    name="name"
                    placeholder="John Doe"
                    value={formData.name}
                    onChange={handleChange}
                    className={errors.name ? 'border-destructive' : ''}
                  />
                  {errors.name && <p className="text-destructive mt-1 text-xs">{errors.name}</p>}
                </div>

                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-medium">
                    Email <span className="text-destructive">*</span>
                  </label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="john@example.com"
                    value={formData.email}
                    onChange={handleChange}
                    className={errors.email ? 'border-destructive' : ''}
                  />
                  {errors.email && <p className="text-destructive mt-1 text-xs">{errors.email}</p>}
                </div>

                <div className="space-y-2">
                  <label htmlFor="password" className="text-sm font-medium">
                    Password <span className="text-destructive">*</span>
                  </label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={handleChange}
                    className={errors.password ? 'border-destructive' : ''}
                  />
                  {errors.password && (
                    <p className="text-destructive mt-1 text-xs">{errors.password}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <label htmlFor="confirmPassword" className="text-sm font-medium">
                    Confirm Password <span className="text-destructive">*</span>
                  </label>
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    placeholder="••••••••"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className={errors.confirmPassword ? 'border-destructive' : ''}
                  />
                  {errors.confirmPassword && (
                    <p className="text-destructive mt-1 text-xs">{errors.confirmPassword}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <label htmlFor="role" className="text-sm font-medium">
                    Role <span className="text-destructive">*</span>
                  </label>
                  <select
                    id="role"
                    name="role"
                    className="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus:ring-ring h-10 w-full rounded-md border px-3 py-2 text-sm focus:ring-2 focus:ring-offset-2 focus:outline-none"
                    value={formData.role}
                    onChange={handleChange}
                  >
                    <option value="ADMIN">Administrator</option>
                    <option value="PROPERTY_MANAGER">Property Manager</option>
                    <option value="OWNER">Owner</option>
                    <option value="TENANT">Tenant</option>
                    <option value="SERVICE_PROVIDER">Service Provider</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label htmlFor="phoneNumber" className="text-sm font-medium">
                    Phone Number <span className="text-muted-foreground text-xs">(Optional)</span>
                  </label>
                  <Input
                    id="phoneNumber"
                    name="phoneNumber"
                    type="tel"
                    placeholder="+1 (555) 123-4567"
                    value={formData.phoneNumber}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <p className="text-muted-foreground mt-2 text-sm">
                <span className="text-destructive">*</span> Required fields
              </p>
            </div>
          </div>

          <div className="bg-muted/20 flex justify-end gap-2 border-t p-6">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" className="flex items-center gap-1.5">
              <UserPlus size={16} />
              <span>Add User</span>
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
