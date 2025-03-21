import { Button } from '../../components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '../../components/ui/card';
import { Checkbox } from '../../components/ui/checkbox';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';
import { Slider } from '../../components/ui/slider';
import { Badge } from '../../components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/avatar';
import {
  Building2,
  Calendar,
  CheckCircle,
  DollarSign,
  Home,
  HomeIcon,
  Search,
  SlidersHorizontal,
  Star,
  Users,
} from 'lucide-react';
import { Link } from 'react-router';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { prisma } from '~/lib/db';
import { useLoaderData } from 'react-router';

export async function loader() {
  const families = await prisma.family.findMany();
  const properties = await prisma.resource.findMany();
  return { families, properties };
}

export default function FamilyMatching() {
  const { families, properties } = useLoaderData<typeof loader>();

  return (
    <div className="bg-background flex min-h-screen">
      {/* Sidebar */}
      <div className="bg-muted/40 hidden w-72 border-r p-6 lg:block">
        <div className="mb-6 flex items-center gap-2 text-lg font-semibold">
          <Home className="h-5 w-5" />
          <span>Family Matching</span>
        </div>

        <Tabs defaultValue="filters">
          <TabsList className="mb-4 w-full">
            <TabsTrigger value="filters" className="flex-1">
              Filters
            </TabsTrigger>
            <TabsTrigger value="properties" className="flex-1">
              My Properties
            </TabsTrigger>
          </TabsList>

          <TabsContent value="filters" className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="family-size">Family Size</Label>
              <Select defaultValue="any">
                <SelectTrigger id="family-size">
                  <SelectValue placeholder="Any size" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="any">Any size</SelectItem>
                  <SelectItem value="1-2">1-2 members</SelectItem>
                  <SelectItem value="3-4">3-4 members</SelectItem>
                  <SelectItem value="5+">5+ members</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="income">Minimum Income</Label>
              <div className="pt-2">
                <Slider defaultValue={[50000]} max={150000} step={5000} />
                <div className="text-muted-foreground mt-1 flex justify-between text-xs">
                  <span>$50k</span>
                  <span>$100k</span>
                  <span>$150k+</span>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="credit-score">Minimum Credit Score</Label>
              <div className="pt-2">
                <Slider defaultValue={[650]} max={850} step={10} />
                <div className="text-muted-foreground mt-1 flex justify-between text-xs">
                  <span>650</span>
                  <span>750</span>
                  <span>850</span>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="move-in-date">Move-in Date</Label>
              <Select defaultValue="any">
                <SelectTrigger id="move-in-date">
                  <SelectValue placeholder="Any date" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="any">Any date</SelectItem>
                  <SelectItem value="1-month">Within 1 month</SelectItem>
                  <SelectItem value="3-months">Within 3 months</SelectItem>
                  <SelectItem value="flexible">Flexible</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-3">
              <Label>Preferences</Label>
              <div className="flex items-center space-x-2">
                <Checkbox id="pets" />
                <Label htmlFor="pets" className="text-sm">
                  Allow pets
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox id="verified" defaultChecked />
                <Label htmlFor="verified" className="text-sm">
                  Verified families only
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox id="long-term" />
                <Label htmlFor="long-term" className="text-sm">
                  Long-term leases (2+ years)
                </Label>
              </div>
            </div>

            <Button className="mt-4 w-full">Apply Filters</Button>
          </TabsContent>

          <TabsContent value="properties" className="space-y-4">
            <p className="text-muted-foreground mb-2 text-sm">
              Select a property to find matching families:
            </p>

            {properties.map(property => (
              <div
                key={property.id}
                className="hover:bg-muted/50 flex cursor-pointer items-start gap-3 rounded-md border p-3"
              >
                <HomeIcon className="text-muted-foreground mt-0.5 h-5 w-5" />
                <div className="flex-1">
                  <div className="text-sm font-medium">{property.label}</div>
                  <div className="text-muted-foreground mt-1 flex items-center gap-2 text-xs">
                    <span>{property.bedroomCount} bed</span>
                    <span>•</span>
                    <span>{property.bathroomCount} bath</span>
                    <span>•</span>
                    <span>${property.rentAmount}/mo</span>
                  </div>
                  {property.isAvailable ? (
                    <Badge
                      variant="outline"
                      className="mt-2 bg-green-50 text-xs text-green-600 hover:bg-green-50"
                    >
                      Available
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="mt-2 text-xs">
                      Occupied
                    </Badge>
                  )}
                </div>
              </div>
            ))}

            <Button variant="outline" className="mt-2 w-full">
              <Building2 className="mr-2 h-4 w-4" />
              View All Properties
            </Button>
          </TabsContent>
        </Tabs>
      </div>

      {/* Main content */}
      <div className="flex-1 overflow-auto">
        <header className="bg-background sticky top-0 z-10 border-b px-6 py-3">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-semibold">Family Matching</h1>
            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="text-muted-foreground absolute top-2.5 left-2.5 h-4 w-4" />
                <Input
                  type="search"
                  placeholder="Search families..."
                  className="w-[200px] pl-8 md:w-[260px] lg:w-[300px]"
                />
              </div>
              <Select defaultValue="compatibility">
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="compatibility">Compatibility</SelectItem>
                  <SelectItem value="income">Income</SelectItem>
                  <SelectItem value="credit-score">Credit Score</SelectItem>
                  <SelectItem value="move-in-date">Move-in Date</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="sm" className="flex gap-1 lg:hidden">
                <SlidersHorizontal className="h-4 w-4" />
                Filters
              </Button>
            </div>
          </div>
        </header>

        <main className="p-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {families.map(family => (
              <Card key={family.id} className="overflow-hidden">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10 border">
                        {family.image ? (
                          <AvatarImage src={family.image} alt={family.name} />
                        ) : (
                          <AvatarFallback>{family.name.charAt(0)}</AvatarFallback>
                        )}
                      </Avatar>
                      <div>
                        <div className="flex items-center gap-1">
                          <CardTitle className="text-base">{family.name}</CardTitle>
                          {family.verified && <CheckCircle className="h-4 w-4 text-green-500" />}
                        </div>
                        <CardDescription className="text-xs">
                          {family.size} {family.size === 1 ? 'member' : 'members'}
                        </CardDescription>
                      </div>
                    </div>
                    {/* <Badge
                      variant={family.compatibility >= 90 ? 'default' : 'outline'}
                      className={family.compatibility >= 90 ? 'bg-green-500' : ''}
                    >
                      {family.compatibility}% Match
                    </Badge> */}
                  </div>
                </CardHeader>
                <CardContent className="pb-3">
                  {/*    <div className="mb-3">
                    <div className="mb-1 flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Compatibility</span>
                      <span className="font-medium">{family.compatibility}%</span>
                    </div>
                    <Progress value={family.compatibility} className="h-1.5" />
                  </div> */}

                  <p className="text-muted-foreground mb-4 line-clamp-2 text-sm">
                    {family.description}
                  </p>

                  <div className="grid grid-cols-2 gap-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <DollarSign className="text-muted-foreground h-4 w-4" />
                      {family.income && <span>${(family.income / 1000).toFixed(0)}k/year</span>}
                    </div>
                    <div className="flex items-center gap-2">
                      <Star className="text-muted-foreground h-4 w-4" />
                      <span>{family.creditScore} credit</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="text-muted-foreground h-4 w-4" />
                      <span>{family.moveInDate?.toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="text-muted-foreground h-4 w-4" />
                      <span>
                        {family.size} {family.size === 1 ? 'person' : 'people'}
                      </span>
                    </div>
                    <div className="col-span-2 mt-1 flex items-center gap-2">
                      {family.hasPets ? (
                        <Badge variant="outline" className="text-xs">
                          Has pets: {family.petDetails}
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-xs">
                          No pets
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="bg-muted/50 flex justify-between border-t px-6 py-3">
                  <Link to={`/families/${family.id}`}>
                    <Button variant="ghost" size="sm">
                      View Profile
                    </Button>
                  </Link>
                  <Button size="sm">Contact</Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}
