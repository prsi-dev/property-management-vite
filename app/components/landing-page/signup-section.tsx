import { useState } from 'react';

import { FamilySignupForm } from './family-signup-form';
import { LandlordSignupForm } from './landlord-signup-form';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';

export function SignupSection() {
  const [activeTab, setActiveTab] = useState('family');

  return (
    <section id="signup" className="w-full px-4 py-12 sm:px-6 md:py-24 lg:px-8">
      <div className="container mx-auto">
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <div className="space-y-2">
            <div className="bg-primary text-primary-foreground inline-block rounded-lg px-3 py-1 text-sm">
              Join Us
            </div>
            <h2 className="text-3xl font-bold tracking-tighter md:text-4xl">Request Access</h2>
            <p className="text-muted-foreground max-w-[700px] text-base md:text-lg lg:text-xl">
              Fill out the form below to request access to our platform and start connecting.
            </p>
          </div>
        </div>

        <div className="mx-auto mt-12 max-w-lg space-y-6">
          <Tabs
            defaultValue="family"
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="family">For Families</TabsTrigger>
              <TabsTrigger value="landlord">For Landlords</TabsTrigger>
            </TabsList>
            <TabsContent value="family" className="mt-6">
              <FamilySignupForm />
            </TabsContent>
            <TabsContent value="landlord" className="mt-6">
              <LandlordSignupForm />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </section>
  );
}
