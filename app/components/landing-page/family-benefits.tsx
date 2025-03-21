import { Home, Heart, Star, Calendar, Lock, Sparkles } from 'lucide-react';
import { Link } from 'react-router';

import { Button } from '../ui/button';

export function FamilyBenefits() {
  return (
    <section id="family-benefits" className="bg-muted w-full px-4 py-12 sm:px-6 lg:px-8">
      <div className="container mx-auto">
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <div className="space-y-2">
            <div className="bg-primary text-primary-foreground inline-block rounded-lg px-3 py-1 text-sm">
              For Families
            </div>
            <h2 className="text-3xl font-bold tracking-tighter md:text-4xl">
              Why Families Choose Us
            </h2>
            <p className="text-muted-foreground max-w-[900px] text-base md:text-lg lg:text-xl">
              Our platform is specifically designed to meet the unique needs of families looking for
              long-term rental homes.
            </p>
          </div>
        </div>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <div className="bg-background flex flex-col items-center space-y-3 rounded-lg border p-6 shadow-sm">
            <Home className="text-primary h-12 w-12" />
            <h3 className="text-xl font-bold">Family-Friendly Homes</h3>
            <p className="text-muted-foreground text-center">
              All our listings are vetted for family suitability, including safety features and
              proximity to schools.
            </p>
          </div>

          <div className="bg-background flex flex-col items-center space-y-3 rounded-lg border p-6 shadow-sm">
            <Heart className="text-primary h-12 w-12" />
            <h3 className="text-xl font-bold">Community Focus</h3>
            <p className="text-muted-foreground text-center">
              Find homes in family-friendly communities with access to parks, schools, and other
              families.
            </p>
          </div>

          <div className="bg-background flex flex-col items-center space-y-3 rounded-lg border p-6 shadow-sm">
            <Star className="text-primary h-12 w-12" />
            <h3 className="text-xl font-bold">Trusted Landlords</h3>
            <p className="text-muted-foreground text-center">
              Every landlord on our platform is thoroughly vetted to ensure they provide quality
              housing and fair terms.
            </p>
          </div>

          <div className="bg-background flex flex-col items-center space-y-3 rounded-lg border p-6 shadow-sm">
            <Calendar className="text-primary h-12 w-12" />
            <h3 className="text-xl font-bold">Long-Term Stability</h3>
            <p className="text-muted-foreground text-center">
              Focus on long-term rentals with stable pricing, giving your family peace of mind and
              security.
            </p>
          </div>

          <div className="bg-background flex flex-col items-center space-y-3 rounded-lg border p-6 shadow-sm">
            <Lock className="text-primary h-12 w-12" />
            <h3 className="text-xl font-bold">Secure Process</h3>
            <p className="text-muted-foreground text-center">
              Our secure platform protects your personal information while making it easy to connect
              with property owners.
            </p>
          </div>

          <div className="bg-background flex flex-col items-center space-y-3 rounded-lg border p-6 shadow-sm">
            <Sparkles className="text-primary h-12 w-12" />
            <h3 className="text-xl font-bold">Personalized Matching</h3>
            <p className="text-muted-foreground text-center">
              Our algorithm matches your family&apos;s specific needs with the most suitable
              properties in your desired area.
            </p>
          </div>
        </div>

        <div className="bg-background mt-12 rounded-lg p-6 sm:p-8">
          <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
            <div className="space-y-2 text-center sm:text-left">
              <h3 className="text-2xl font-bold">Ready to find your perfect family home?</h3>
              <p className="text-muted-foreground">
                Join thousands of families who have found their ideal home.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button variant="default" size="default" asChild className="w-full sm:w-auto">
                <Link to="#signup">Find Your Home</Link>
              </Button>
              <Button variant="outline" size="default" asChild className="w-full sm:w-auto">
                <Link to="#how-it-works">Learn More</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
