import { useState } from 'react';
import { Role } from '@prisma/client';
import { Button } from '~/components/ui/button';
import { Input } from '~/components/ui/input';
import { Badge } from '~/components/ui/badge';
import { X, Save, Check } from 'lucide-react';

interface UserDetailProps {
  user: {
    id: string;
    name: string;
    email: string;
    role: Role;
    phoneNumber?: string | null;
    createdAt: string;
    updatedAt: string;
    identificationVerified?: boolean;
    organizationName?: string | null;
  };
  isOpen: boolean;
  onClose: () => void;
  onSave?: (userData: {
    id: string;
    name: string;
    email: string;
    phoneNumber: string;
    role: Role;
  }) => void;
}

export function UserDetailDialog({ user, isOpen, onClose, onSave }: UserDetailProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user.name,
    email: user.email,
    phoneNumber: user.phoneNumber || '',
    role: user.role,
  });

  if (!isOpen) return null;

  function formatRoleName(role: Role) {
    return role
      .replace(/_/g, ' ')
      .toLowerCase()
      .replace(/\b\w/g, l => l.toUpperCase());
  }

  function getRoleBadgeVariant(role: Role) {
    switch (role) {
      case 'ADMIN':
        return 'destructive';
      case 'PROPERTY_MANAGER':
        return 'info';
      case 'OWNER':
        return 'secondary';
      case 'TENANT':
        return 'success';
      case 'SERVICE_PROVIDER':
        return 'warning';
      default:
        return 'default';
    }
  }

  function formatDate(dateString: string) {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (onSave) {
      onSave({ id: user.id, ...formData });
    }
    setIsEditing(false);
  }

  return (
    <div className="bg-opacity-50 fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-background max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-lg shadow-lg">
        <div className="flex items-center justify-between border-b p-6">
          <h2 className="text-xl font-semibold">{isEditing ? 'Edit User' : 'User Details'}</h2>
          <Button variant="ghost" size="sm" className="h-8 w-8 rounded-full p-0" onClick={onClose}>
            <X size={18} />
          </Button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="space-y-6 p-6">
            {!isEditing ? (
              <div className="space-y-4">
                <div className="grid grid-cols-1 gap-x-6 gap-y-4 md:grid-cols-2">
                  <div>
                    <h3 className="text-muted-foreground text-sm font-medium">Name</h3>
                    <p className="text-foreground mt-1">{user.name}</p>
                  </div>
                  <div>
                    <h3 className="text-muted-foreground text-sm font-medium">Email</h3>
                    <p className="text-foreground mt-1">{user.email}</p>
                  </div>
                  <div>
                    <h3 className="text-muted-foreground text-sm font-medium">Role</h3>
                    <div className="mt-1">
                      <Badge variant={getRoleBadgeVariant(user.role)}>
                        {formatRoleName(user.role)}
                      </Badge>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-muted-foreground text-sm font-medium">Phone Number</h3>
                    <p className="text-foreground mt-1">{user.phoneNumber || '—'}</p>
                  </div>
                  <div>
                    <h3 className="text-muted-foreground text-sm font-medium">
                      Verification Status
                    </h3>
                    <div className="mt-1">
                      {user.identificationVerified ? (
                        <Badge variant="success" className="flex w-fit items-center gap-1">
                          <Check size={12} /> Verified
                        </Badge>
                      ) : (
                        <Badge variant="warning" className="w-fit">
                          Not Verified
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div>
                    <h3 className="text-muted-foreground text-sm font-medium">Organization</h3>
                    <p className="text-foreground mt-1">{user.organizationName || '—'}</p>
                  </div>
                </div>

                <div className="border-t pt-2">
                  <h3 className="text-muted-foreground mb-2 text-sm font-medium">
                    Account Information
                  </h3>
                  <div className="grid grid-cols-1 gap-x-6 gap-y-4 md:grid-cols-2">
                    <div>
                      <h3 className="text-muted-foreground text-sm font-medium">Created</h3>
                      <p className="text-foreground mt-1">{formatDate(user.createdAt)}</p>
                    </div>
                    <div>
                      <h3 className="text-muted-foreground text-sm font-medium">Last Updated</h3>
                      <p className="text-foreground mt-1">{formatDate(user.updatedAt)}</p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <label htmlFor="name" className="text-sm font-medium">
                      Name
                    </label>
                    <Input
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="email" className="text-sm font-medium">
                      Email
                    </label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="phoneNumber" className="text-sm font-medium">
                      Phone Number
                    </label>
                    <Input
                      id="phoneNumber"
                      name="phoneNumber"
                      value={formData.phoneNumber}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="role" className="text-sm font-medium">
                      Role
                    </label>
                    <select
                      id="role"
                      name="role"
                      className="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus:ring-ring h-10 w-full rounded-md border px-3 py-2 text-sm focus:ring-2 focus:ring-offset-2 focus:outline-none"
                      value={formData.role}
                      onChange={handleChange}
                      required
                    >
                      <option value="ADMIN">Administrator</option>
                      <option value="PROPERTY_MANAGER">Property Manager</option>
                      <option value="OWNER">Owner</option>
                      <option value="TENANT">Tenant</option>
                      <option value="SERVICE_PROVIDER">Service Provider</option>
                    </select>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="bg-muted/20 flex justify-end gap-2 border-t p-6">
            {isEditing ? (
              <>
                <Button type="button" variant="outline" onClick={() => setIsEditing(false)}>
                  Cancel
                </Button>
                <Button type="submit" className="flex items-center gap-1.5">
                  <Save size={16} />
                  <span>Save Changes</span>
                </Button>
              </>
            ) : (
              <>
                <Button type="button" variant="outline" onClick={onClose}>
                  Close
                </Button>
                <Button type="button" onClick={() => setIsEditing(true)}>
                  Edit User
                </Button>
              </>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
