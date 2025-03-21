import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card';

type ParentProperty = {
  id: string;
  label: string;
  type: string;
};

type ParentPropertyCardProps = {
  parent: ParentProperty | null;
};

export function ParentPropertyCard({ parent }: ParentPropertyCardProps) {
  if (!parent) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Parent Property</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div>
            <h3 className="text-sm font-medium text-gray-500">Name</h3>
            <p>{parent.label}</p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500">Type</h3>
            <p>{parent.type}</p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500">ID</h3>
            <p className="font-mono text-sm">{parent.id}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
