import { Badge } from 'lucide-react';
import { Link } from 'react-router';
import { Card, CardHeader, CardTitle, CardContent } from '~/components/ui/card';
import { cn } from '~/lib/utils';
type ResourceAssignment = {
  id: string;
  resourceId: string;
  resource: {
    label: string;
    type: string;
    isActive: boolean;
    owners?: {
      id: string;
      name: string;
    }[];
  };
};

interface UserAssignmentsCardProps {
  assignments: ResourceAssignment[];
}

export function UserAssignmentsCard({ assignments }: UserAssignmentsCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Resource Assignments</CardTitle>
      </CardHeader>
      <CardContent>
        {assignments.length === 0 ? (
          <p className="text-muted-foreground">No resource assignments found</p>
        ) : (
          <div className="space-y-4">
            {assignments.map(assignment => (
              <div key={assignment.id} className="rounded-lg border p-4">
                <div className="flex items-center justify-between">
                  <Link
                    to={`/dashboard/admin/resources/${assignment.resourceId}`}
                    className="font-medium hover:underline"
                  >
                    {assignment.resource.label}
                  </Link>
                  <Badge
                    className={cn(assignment.resource.isActive ? 'bg-green-500' : 'bg-red-500')}
                  >
                    {assignment.resource.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
                <div className="text-muted-foreground mt-2 text-sm">
                  <p>Type: {assignment.resource.type}</p>
                  {assignment.resource.owners && assignment.resource.owners.length > 0 && (
                    <p>
                      Owner:{' '}
                      <Link
                        to={`/dashboard/admin/users/${assignment.resource.owners[0].id}`}
                        className="hover:underline"
                      >
                        {assignment.resource.owners[0].name}
                      </Link>
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
