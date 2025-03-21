import { Badge } from '~/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card';

type ChildProperty = {
  id: string;
  label: string;
  type: string;
  isActive: boolean;
};

type ChildPropertiesCardProps = {
  childProperties: ChildProperty[];
};

export function ChildPropertiesCard({ childProperties }: ChildPropertiesCardProps) {
  if (!childProperties || childProperties.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Child Properties</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {childProperties.map(child => (
            <div key={child.id} className="flex items-center justify-between border-b pb-2">
              <div>
                <h3 className="font-medium">{child.label}</h3>
                <p className="text-sm text-gray-500">{child.type}</p>
              </div>
              <Badge variant={child.isActive ? 'success' : 'secondary'}>
                {child.isActive ? 'Active' : 'Inactive'}
              </Badge>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
