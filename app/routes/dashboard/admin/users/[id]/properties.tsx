import { Link, useLoaderData, useNavigate } from 'react-router';
import { prisma } from '~/lib/db';
import { Button } from '~/components/ui/button';
import {
  ArrowLeft,
  Building,
  CircleDollarSign,
  Home,
  Plus,
  MapPin,
  Bed,
  Bath,
  CircleOff,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card';
import { Badge } from '~/components/ui/badge';
import { Progress } from '~/components/ui/progress';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '~/components/ui/table';
export async function loader({ params }: { params: { id: string } }) {
  const { id } = params;

  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      email: true,
      ownedResources: {
        select: {
          id: true,
          label: true, // Changed from label to name to match UI
          type: true,
          description: true,
          address: true,
          isActive: true,
          squareFootage: true,
          bedroomCount: true,
          bathroomCount: true,
          rentAmount: true,
          // Include any child or parent resources
          children: {
            select: {
              id: true,
              label: true, // Changed from label to label
              type: true,
              isActive: true,
            },
          },
          parent: {
            select: {
              id: true,
              label: true, // Changed from label to name
              type: true,
            },
          },
        },
      },
    },
  });

  if (!user) {
    throw new Response('User not found', { status: 404 });
  }

  // Calculate statistics for the user's properties
  const stats = {
    totalProperties: user.ownedResources.length,
    activeProperties: user.ownedResources.filter(p => p.isActive).length,
    // For demo purposes, randomly assign some properties as occupied
    occupiedProperties: user.ownedResources
      .filter(p => p.isActive)
      .filter(() => Math.random() > 0.3).length,
    get vacantProperties() {
      return this.activeProperties - this.occupiedProperties;
    },
    // Calculate total monthly revenue from active properties with rent
    totalMonthlyRevenue: user.ownedResources
      .filter(p => p.isActive && p.rentAmount)
      .reduce((sum, property) => sum + (property.rentAmount || 0), 0),
    // Count properties by type
    propertyTypes: user.ownedResources.reduce((acc: Record<string, number>, property) => {
      if (!acc[property.type]) {
        acc[property.type] = 0;
      }
      acc[property.type]++;
      return acc;
    }, {}),
  };

  // Simulate occupancy status for each property for demo purposes
  const ownedResourcesWithOccupancy = user.ownedResources.map(resource => ({
    ...resource,
    isOccupied: resource.isActive && Math.random() > 0.3,
  }));

  return { user: { ...user, ownedResources: ownedResourcesWithOccupancy }, stats };
}

export default function UserProperties() {
  const { user, stats } = useLoaderData<typeof loader>();
  const navigate = useNavigate();

  // Helper function to get icon based on property type
  function getPropertyTypeIcon(type: string) {
    switch (type) {
      case 'BUILDING':
        return <Building className="h-5 w-5" />;
      case 'UNIT':
        return <Home className="h-5 w-5" />;
      case 'COMMERCIAL_SPACE':
        return <Building className="h-5 w-5" />;
      case 'PARKING_SPOT':
        return <MapPin className="h-5 w-5" />;
      case 'STORAGE':
        return <Building className="h-5 w-5" />;
      case 'LAND':
        return <MapPin className="h-5 w-5" />;
      default:
        return <Building className="h-5 w-5" />;
    }
  }

  // Helper function to format property type display
  function formatPropertyType(type: string) {
    return type
      .replace(/_/g, ' ')
      .toLowerCase()
      .replace(/\b\w/g, l => l.toUpperCase());
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="icon"
            onClick={() => navigate(`/dashboard/admin/users/${user.id}`)}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Properties for {user.name}</h1>
            <p className="text-muted-foreground">{user.email}</p>
          </div>
        </div>

        <Link to={`/dashboard/admin/properties?ownerId=${user.id}`}>
          <Button className="gap-2">
            <Plus size={16} />
            Add Property
          </Button>
        </Link>
      </div>

      {/* Property Statistics Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Properties</CardTitle>
            <Building className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalProperties}</div>
            <p className="text-muted-foreground text-xs">
              {stats.activeProperties} active, {stats.totalProperties - stats.activeProperties}{' '}
              inactive
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Occupancy Rate</CardTitle>
            <Home className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.activeProperties > 0
                ? Math.round((stats.occupiedProperties / stats.activeProperties) * 100)
                : 0}
              %
            </div>
            <Progress
              value={
                stats.activeProperties > 0
                  ? (stats.occupiedProperties / stats.activeProperties) * 100
                  : 0
              }
              className="mt-2"
            />
            <p className="text-muted-foreground mt-1 text-xs">
              {stats.occupiedProperties} occupied, {stats.vacantProperties} vacant
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
            <CircleDollarSign className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.totalMonthlyRevenue.toLocaleString()}</div>
            <p className="text-muted-foreground text-xs">Potential monthly income</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Property Types</CardTitle>
            <Building className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {Object.entries(stats.propertyTypes).length > 0 ? (
                Object.entries(stats.propertyTypes)
                  .sort((a, b) => b[1] - a[1])
                  .slice(0, 2)
                  .map(([type, count]) => (
                    <div key={type} className="flex items-center justify-between text-xs">
                      <div className="flex items-center">
                        {getPropertyTypeIcon(type)}
                        <span className="ml-1">{formatPropertyType(type)}</span>
                      </div>
                      <Badge variant="outline">{count}</Badge>
                    </div>
                  ))
              ) : (
                <p className="text-muted-foreground text-xs">No properties</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {user.ownedResources.length === 0 ? (
        <div className="rounded-lg border border-dashed p-8 text-center">
          <Building className="text-muted-foreground mx-auto h-10 w-10" />
          <h3 className="mt-4 text-lg font-semibold">No properties</h3>
          <p className="text-muted-foreground mt-2 mb-4 text-sm">
            {user.name} doesn&apos;t have any properties yet.
          </p>
          <Link to={`/dashboard/admin/properties?ownerId=${user.id}`}>
            <Button variant="secondary" className="gap-1">
              <Plus size={16} />
              Add Property
            </Button>
          </Link>
        </div>
      ) : (
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Property</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Address</TableHead>
                <TableHead>Size</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Monthly Rent</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {user.ownedResources.map(property => (
                <TableRow key={property.id}>
                  <TableCell className="font-medium">
                    <div className="flex flex-col">
                      <span>{property.label}</span>
                      {property.description && (
                        <span className="text-muted-foreground text-xs">
                          {property.description.length > 40
                            ? property.description.substring(0, 40) + '...'
                            : property.description}
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      {getPropertyTypeIcon(property.type)}
                      <span>{formatPropertyType(property.type)}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-start gap-1">
                      <MapPin className="text-muted-foreground mt-0.5 h-3 w-3 flex-shrink-0" />
                      <span className="text-xs">{property.address || 'No address'}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      {property.squareFootage && (
                        <div className="flex items-center text-xs">
                          <span>{property.squareFootage} sq ft</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        {property.bedroomCount !== null && (
                          <span className="flex items-center gap-1 text-xs">
                            <Bed className="text-muted-foreground h-3 w-3" />
                            {property.bedroomCount}
                          </span>
                        )}
                        {property.bathroomCount !== null && (
                          <span className="flex items-center gap-1 text-xs">
                            <Bath className="text-muted-foreground h-3 w-3" />
                            {property.bathroomCount}
                          </span>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {property.isActive ? (
                      <Badge
                        variant="outline"
                        className={
                          property.isOccupied
                            ? 'border-green-200 bg-green-50 text-green-700'
                            : 'border-amber-200 bg-amber-50 text-amber-700'
                        }
                      >
                        {property.isOccupied ? 'Occupied' : 'Vacant'}
                      </Badge>
                    ) : (
                      <Badge
                        variant="outline"
                        className="flex items-center gap-1 border-gray-200 bg-gray-50 text-gray-500"
                      >
                        <CircleOff className="h-3 w-3" />
                        Inactive
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    {property.rentAmount ? (
                      <div className="flex items-center">
                        <CircleDollarSign className="text-muted-foreground mr-1 h-3 w-3" />
                        <span>{property.rentAmount.toLocaleString()}</span>
                      </div>
                    ) : (
                      <span className="text-muted-foreground text-xs">Not set</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <Link to={`/dashboard/admin/properties/${property.id}`}>
                      <Button variant="ghost" size="sm">
                        Manage
                      </Button>
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
