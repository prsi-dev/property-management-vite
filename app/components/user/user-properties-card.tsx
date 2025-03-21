import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card';
import { Link } from 'react-router';
import { Home, ArrowRight } from 'lucide-react';
import { Badge } from '~/components/ui/badge';

type Property = {
  id: string;
  label: string;
  type: string;
  isActive: boolean;
};

type UserPropertiesCardProps = {
  userId: string;
  properties: Property[];
};

export function UserPropertiesCard({ userId, properties }: UserPropertiesCardProps) {
  if (!properties || properties.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Owned Properties</CardTitle>
        <Link
          to={`/dashboard/admin/users/${userId}/properties`}
          className="text-sm text-blue-600 hover:underline"
        >
          View all properties <ArrowRight className="ml-1 inline h-4 w-4" />
        </Link>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {properties.map(property => (
            <Link
              key={property.id}
              to={`/dashboard/admin/properties/${property.id}`}
              className="block"
            >
              <div className="flex items-center justify-between rounded-md border p-3 transition-colors hover:bg-gray-50">
                <div className="flex items-center space-x-3">
                  <Home className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="font-medium">{property.label}</p>
                    <p className="text-sm text-gray-500">{property.type}</p>
                  </div>
                </div>
                <Badge variant={property.isActive ? 'success' : 'secondary'}>
                  {property.isActive ? 'Active' : 'Inactive'}
                </Badge>
              </div>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
