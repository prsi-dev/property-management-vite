import { Button } from '~/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card';
import { Input } from '~/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '~/components/ui/table';
import { Link } from 'react-router';
import { prisma } from '~/lib/db';
import { useLoaderData } from 'react-router';

export async function loader() {
  try {
    const families = await prisma.family.findMany({
      include: {
        members: true,
        location: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return { families };
  } catch (error) {
    console.error(error);
    return { families: [] };
  }
}

export default function FamiliesPage() {
  const { families } = useLoaderData<typeof loader>();

  return (
    <div className="flex min-h-screen flex-col space-y-6 p-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Families</h1>
        <Button asChild>
          <Link to="/dashboard/owner/families/new">Add Family</Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Families</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <Input placeholder="Search families..." />
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Size</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Credit Score</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {families.map(family => (
                <TableRow key={family.id}>
                  <TableCell>{family.name}</TableCell>
                  <TableCell>{family.size} members</TableCell>
                  <TableCell>
                    {family.location?.city}, {family.location?.state}
                  </TableCell>
                  <TableCell>{family.creditScore || 'N/A'}</TableCell>
                  <TableCell>{family.status}</TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm" asChild>
                      <Link to={`/dashboard/owner/families/${family.id}`}>View</Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
