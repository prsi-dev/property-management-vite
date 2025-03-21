import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card';
import { Link } from 'react-router';

type Owner = {
  id: string;
  name: string;
};

type OwnersCardProps = {
  owners?: Owner[];
  organizationOwners?: Owner[];
};

export function OwnersCard({ owners = [], organizationOwners = [] }: OwnersCardProps) {
  if (owners.length === 0 && organizationOwners.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Ownership</CardTitle>
      </CardHeader>
      <CardContent>
        {owners.length > 0 && (
          <div className="mb-4">
            <h3 className="mb-2 text-sm font-medium text-gray-500">Individual Owners</h3>
            <div className="space-y-2">
              {owners.map(owner => (
                <Link to={`/dashboard/admin/users/${owner.id}`} key={owner.id}>
                  <div className="flex justify-between">
                    <span>{owner.name}</span>
                    <span className="font-mono text-xs text-gray-500">{owner.id}</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {organizationOwners.length > 0 && (
          <div>
            <h3 className="mb-2 text-sm font-medium text-gray-500">Organization Owners</h3>
            <div className="space-y-2">
              {organizationOwners.map(org => (
                <div key={org.id} className="flex justify-between">
                  <span>{org.name}</span>
                  <span className="font-mono text-xs text-gray-500">{org.id}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
