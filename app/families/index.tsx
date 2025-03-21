import { Button } from '~/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '~/components/ui/card';
import { Checkbox } from '~/components/ui/checkbox';
import { Input } from '~/components/ui/input';
import { Label } from '~/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '~/components/ui/select';
import { Separator } from '~/components/ui/separator';
import { Slider } from '~/components/ui/slider';
import { Badge } from '~/components/ui/badge';
import { Avatar, AvatarFallback } from '~/components/ui/avatar';
import { Building2, DollarSign, Filter, Home, MessageSquare, Search, Users } from 'lucide-react';
import { Link } from 'react-router';
import { prisma } from '~/lib/db';
import { useLoaderData } from 'react-router';
export async function loader() {
  const families = await prisma.family.findMany();
  return { families };
}

export default function FamilyMatching() {
  const { families } = useLoaderData<typeof loader>();

  return (
    <div className="bg-background flex min-h-screen">
      {/* Sidebar */}
      <div className="bg-muted/40 hidden w-64 border-r p-6 lg:block">
        <div className="mb-6 flex items-center gap-2 text-lg font-semibold">
          <Home className="h-5 w-5" />
          <span>Family Matching</span>
        </div>
        <nav className="space-y-1">
          <Link
            to="#"
            className="bg-primary text-primary-foreground flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium"
          >
            <Users className="h-4 w-4" />
            <span>Family Matching</span>
          </Link>
          <Link
            to="#"
            className="text-muted-foreground hover:bg-muted hover:text-foreground flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium"
          >
            <Building2 className="h-4 w-4" />
            <span>My Properties</span>
          </Link>
          <Link
            to="#"
            className="text-muted-foreground hover:bg-muted hover:text-foreground flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium"
          >
            <MessageSquare className="h-4 w-4" />
            <span>Messages</span>
          </Link>
        </nav>
        <Separator className="my-6" />
        <div className="space-y-4">
          <h3 className="text-sm font-medium">Filters</h3>
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
            <Label htmlFor="family-status">Status</Label>
            <Select defaultValue="ACTIVE">
              <SelectTrigger id="family-status">
                <SelectValue placeholder="Any status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="any">Any status</SelectItem>
                <SelectItem value="ACTIVE">Active</SelectItem>
                <SelectItem value="PENDING_VERIFICATION">Pending Verification</SelectItem>
                <SelectItem value="INACTIVE">Inactive</SelectItem>
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
          <div className="flex items-center space-x-2">
            <Checkbox id="pets" />
            <Label htmlFor="pets">Allow pets</Label>
          </div>
          <Button className="w-full">Apply Filters</Button>
        </div>
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
              <Button variant="outline" size="sm" className="hidden gap-1 md:flex">
                <Filter className="h-4 w-4" />
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
                        <AvatarFallback>{family.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <CardTitle className="text-base">{family.name}</CardTitle>
                        <CardDescription className="text-xs">
                          {family.size} {family.size === 1 ? 'member' : 'members'}
                        </CardDescription>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <Badge
                        variant={
                          family.creditScore
                            ? family.creditScore >= 700
                              ? 'default'
                              : 'outline'
                            : 'outline'
                        }
                      >
                        {family.creditScore} Credit
                      </Badge>
                      {family.status === 'PENDING_VERIFICATION' && (
                        <Badge variant="secondary" className="text-xs">
                          Pending Verification
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pb-3">
                  <p className="text-muted-foreground mb-4 text-sm">{family.description}</p>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="flex items-center gap-2">
                      <DollarSign className="text-muted-foreground h-4 w-4" />
                      {/*  <span>${(family.income / 1000).toFixed(0)}k/year</span> */}
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="text-muted-foreground h-4 w-4" />
                      <span>
                        {family.size} {family.size === 1 ? 'person' : 'people'}
                      </span>
                    </div>
                    <div className="col-span-2 flex items-center gap-2">
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
                  <Button variant="ghost" size="sm" asChild>
                    <Link to={`/families/${family.id}`}>View Profile</Link>
                  </Button>
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
