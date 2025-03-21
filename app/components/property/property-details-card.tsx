import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card';

type PropertyDetailsProps = {
  id: string;
  label: string;
  type: string;
  address?: string | null;
  description?: string | null;
};

export function PropertyDetailsCard({
  id,
  label,
  type,
  address,
  description,
}: PropertyDetailsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Property Details</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <h3 className="text-sm font-medium text-gray-500">ID</h3>
          <p className="font-mono text-sm">{id}</p>
        </div>
        <div>
          <h3 className="text-sm font-medium text-gray-500">Name</h3>
          <p>{label}</p>
        </div>
        <div>
          <h3 className="text-sm font-medium text-gray-500">Type</h3>
          <p>{type}</p>
        </div>
        <div>
          <h3 className="text-sm font-medium text-gray-500">Address</h3>
          <p>{address || 'No address available'}</p>
        </div>
        <div>
          <h3 className="text-sm font-medium text-gray-500">Description</h3>
          <p>{description || 'No description available'}</p>
        </div>
      </CardContent>
    </Card>
  );
}
