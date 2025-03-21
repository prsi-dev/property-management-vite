import { Role } from '@prisma/client';
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card';
import { Badge } from '~/components/ui/badge';

type UserDetailsProps = {
  id: string;
  name: string;
  email: string;
  role: Role;
  phoneNumber?: string | null;
  identificationVerified?: boolean;
  alternativeContact?: string | null;
};

export function UserDetailsCard({
  id,
  name,
  email,
  role,
  phoneNumber,
  identificationVerified,
  alternativeContact,
}: UserDetailsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>User Details</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <h3 className="text-sm font-medium text-gray-500">ID</h3>
          <p className="font-mono text-sm">{id}</p>
        </div>
        <div>
          <h3 className="text-sm font-medium text-gray-500">Name</h3>
          <p>{name}</p>
        </div>
        <div>
          <h3 className="text-sm font-medium text-gray-500">Email</h3>
          <p>{email}</p>
        </div>
        <div>
          <h3 className="text-sm font-medium text-gray-500">Role</h3>
          <Badge
            variant={
              role === 'ADMIN'
                ? 'destructive'
                : role === 'PROPERTY_MANAGER'
                  ? 'default'
                  : role === 'OWNER'
                    ? 'secondary'
                    : 'outline'
            }
          >
            {role}
          </Badge>
        </div>
        <div>
          <h3 className="text-sm font-medium text-gray-500">Phone Number</h3>
          <p>{phoneNumber || 'Not provided'}</p>
        </div>
        {alternativeContact && (
          <div>
            <h3 className="text-sm font-medium text-gray-500">Alternative Contact</h3>
            <p>{alternativeContact}</p>
          </div>
        )}
        <div>
          <h3 className="text-sm font-medium text-gray-500">Identity Verification</h3>
          <Badge variant={identificationVerified ? 'success' : 'warning'}>
            {identificationVerified ? 'Verified' : 'Not Verified'}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}
