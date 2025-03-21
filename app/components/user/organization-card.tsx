import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card';
import { Link } from 'react-router';
import { Building } from 'lucide-react';

type Organization = {
  id: string;
  name: string;
  type: string;
  contactEmail?: string | null;
  contactPhone?: string | null;
  website?: string | null;
};

type OrganizationCardProps = {
  organization: Organization | null;
};

export function OrganizationCard({ organization }: OrganizationCardProps) {
  if (!organization) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Organization</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-2">
          <Building className="h-5 w-5 text-gray-500" />
          <div>
            <h3 className="text-sm font-medium text-gray-500">Name</h3>
            <Link
              to={`/dashboard/admin/organizations/${organization.id}`}
              className="font-semibold text-blue-600 hover:underline"
            >
              {organization.name}
            </Link>
          </div>
        </div>
        <div>
          <h3 className="text-sm font-medium text-gray-500">Type</h3>
          <p>{organization.type}</p>
        </div>
        {organization.contactEmail && (
          <div>
            <h3 className="text-sm font-medium text-gray-500">Contact Email</h3>
            <p>{organization.contactEmail}</p>
          </div>
        )}
        {organization.contactPhone && (
          <div>
            <h3 className="text-sm font-medium text-gray-500">Contact Phone</h3>
            <p>{organization.contactPhone}</p>
          </div>
        )}
        {organization.website && (
          <div>
            <h3 className="text-sm font-medium text-gray-500">Website</h3>
            <a
              href={organization.website}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              {organization.website}
            </a>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
