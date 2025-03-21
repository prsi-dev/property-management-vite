import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card';

type AdditionalInfoCardProps = {
  createdAt?: string | Date | null;
  updatedAt?: string | Date | null;
  metadataGroupId?: string | null;
};

export function AdditionalInfoCard({
  createdAt,
  updatedAt,
  metadataGroupId,
}: AdditionalInfoCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Additional Information</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <h3 className="text-sm font-medium text-gray-500">Created At</h3>
          <p>{createdAt ? createdAt.toLocaleString() : 'N/A'}</p>
        </div>
        <div>
          <h3 className="text-sm font-medium text-gray-500">Last Updated</h3>
          <p>{updatedAt ? updatedAt.toLocaleString() : 'N/A'}</p>
        </div>
        {metadataGroupId && (
          <div>
            <h3 className="text-sm font-medium text-gray-500">Metadata Group ID</h3>
            <p className="font-mono text-sm">{metadataGroupId}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
