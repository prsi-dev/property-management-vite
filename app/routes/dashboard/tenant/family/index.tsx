import { Button } from '~/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card';
import { Separator } from '~/components/ui/separator';
import { Avatar, AvatarFallback } from '~/components/ui/avatar';
import { Badge } from '~/components/ui/badge';
import { ArrowLeft, Calendar, DollarSign } from 'lucide-react';
import { useNavigate } from 'react-router';
import { prisma } from '~/lib/db';
import { useLoaderData } from 'react-router';
import { createServerSupabase } from '~/lib/supabase.server';

export async function loader({ request }: { params: { id: string }; request: Request }) {
  const { supabase } = createServerSupabase(request);
  const { data: authData } = await supabase.auth.getUser();

  try {
    const user = await prisma.user.findUnique({
      where: { email: authData.user?.email },
      include: {
        family: {
          include: {
            members: true,
            resourceApplications: {
              include: {
                resource: true,
              },
            },
            rentalHistory: true,
            location: true,
          },
        },
      },
    });

    if (!user) {
      throw new Error('User not found');
    }

    return { family: user.family };
  } catch (error) {
    console.error(error);
    return { family: null };
  }
}

export default function FamilyProfile() {
  const { family } = useLoaderData<typeof loader>();
  const navigate = useNavigate();
  if (!family) {
    return <div>Family not found</div>;
  }
  return (
    <div className="bg-background flex min-h-screen">
      <div className="flex-1 overflow-auto">
        <header className="bg-background sticky top-0 z-10 border-b px-6 py-3">
          <div className="flex items-center">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h1 className="text-xl font-semibold">Family Profile</h1>
          </div>
        </header>

        <main className="mx-auto max-w-5xl p-6">
          <div className="grid gap-6 md:grid-cols-3">
            <div className="md:col-span-2">
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-start gap-4">
                    <Avatar className="h-16 w-16 border">
                      <AvatarFallback>{family.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle className="text-xl">{family.name}</CardTitle>
                      <CardDescription className="text-sm">
                        {family.size} family members •
                      </CardDescription>
                      <div className="mt-2 flex flex-wrap gap-2">
                        <Badge
                          variant={
                            family.creditScore
                              ? family.creditScore >= 700
                                ? 'default'
                                : 'outline'
                              : 'outline'
                          }
                        >
                          {family.creditScore} Credit Score
                        </Badge>
                        {family.hasPets && <Badge variant="outline">Has Pets</Badge>}
                        <Badge variant="secondary">{family.status}</Badge>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h3 className="mb-1 font-medium">About</h3>
                      <p className="text-muted-foreground text-sm">{family.description}</p>
                    </div>

                    <Separator />

                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <h3 className="mb-1 font-medium">Employment</h3>
                        <p className="text-muted-foreground text-sm">{family.employmentDetails}</p>
                      </div>
                      <div>
                        <h3 className="mb-1 font-medium">Income</h3>
                        <div className="text-muted-foreground flex items-center gap-1 text-sm">
                          <DollarSign className="h-4 w-4" />
                          <span>${family.income?.toLocaleString()}/year</span>
                        </div>
                      </div>
                    </div>

                    <Separator />

                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <h3 className="mb-1 font-medium">Preferred Move-in Date</h3>
                        <div className="text-muted-foreground flex items-center gap-1 text-sm">
                          <Calendar className="h-4 w-4" />
                          <span>
                            {family.moveInDate
                              ? family.moveInDate.toLocaleDateString()
                              : 'Flexible'}
                          </span>
                        </div>
                      </div>
                    </div>

                    <Separator />

                    <div>
                      <h3 className="mb-1 font-medium">Pet Information</h3>
                      <p className="text-muted-foreground text-sm">
                        {family.hasPets ? family.petDetails : 'No pets'}
                      </p>
                    </div>

                    <Separator />

                    <div>
                      <h3 className="mb-1 font-medium">References</h3>
                      <p className="text-muted-foreground text-sm">{family.references}</p>
                    </div>

                    <Separator />

                    <div>
                      <h3 className="mb-1 font-medium">Documents</h3>
                    </div>

                    {family.resourceApplications.length > 0 && (
                      <>
                        <Separator />
                        <div>
                          <h3 className="mb-1 font-medium">Property Applications</h3>
                          <div className="space-y-2">
                            {family.resourceApplications.map(app => (
                              <div key={app.id} className="rounded-md border p-3">
                                <div className="flex items-center justify-between">
                                  <div>
                                    <div className="text-sm font-medium">{app.resource.label}</div>
                                    {/*                                     <div className="text-sm font-medium">{app.resource.label}</div>
                                     */}{' '}
                                    {/* <div className="text-muted-foreground text-xs">
                                      Submitted: {new Date(app.submittedDate).toLocaleDateString()}
                                    </div> */}
                                  </div>
                                  <Badge>{app.status}</Badge>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </>
                    )}

                    {/*    {family.eventAssignments.length > 0 && (
                      <>
                        <Separator />
                        <div>
                          <h3 className="mb-1 font-medium">Maintenance Requests</h3>
                          <div className="space-y-2">
                            {family.maintenanceRequests.map(req => (
                              <div key={req.id} className="rounded-md border p-3">
                                <div className="flex items-center justify-between">
                                  <div>
                                    <div className="text-sm font-medium">{req.title}</div>
                                 
                                  </div>
                                  <div className="flex gap-2">
                                    <Badge variant="outline">{req.priority}</Badge>
                                    <Badge>{req.status}</Badge>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </>
                    )} */}
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Family Members</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {family.members.map(member => (
                      <div key={member.id} className="flex items-center gap-3">
                        <Avatar className="h-8 w-8 border">
                          <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="text-sm font-medium">
                            {member.name}
                            {member.isHeadOfFamily && (
                              <Badge variant="secondary" className="ml-2 text-xs">
                                Head
                              </Badge>
                            )}
                          </div>

                          <Badge variant="outline">{member.role}</Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {family.preferredLocation && family.preferredRent && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Housing Preferences</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <div className="text-sm font-medium">Location</div>
                      <div className="text-muted-foreground text-sm">
                        {family.preferredLocation}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm font-medium">Budget</div>
                      <div className="text-muted-foreground text-sm">{family.preferredRent}</div>
                    </div>
                  </CardContent>
                </Card>
              )}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Contact</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-muted-foreground space-y-1 text-xs">
                    <div>
                      <strong>Email:</strong> {family.preferredContactEmail}
                    </div>
                    <div>
                      <strong>Phone:</strong> {family.preferredContactPhone}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
