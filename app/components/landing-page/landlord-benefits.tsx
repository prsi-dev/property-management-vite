import { Shield, Clock, CheckCircle, DollarSign, Users, ThumbsUp } from 'lucide-react';
import { Link } from 'react-router';

import { Button } from '../ui/button';

export function LandlordBenefits() {
  return (
    <section id="landlord-benefits" className="bg-background w-full px-4 py-12 sm:px-6 lg:px-8">
      <div className="container mx-auto">
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <div className="space-y-2">
            <div className="bg-primary text-primary-foreground inline-block rounded-lg px-3 py-1 text-sm">
              For Property Owners
            </div>
            <h2 className="text-3xl font-bold tracking-tighter md:text-4xl">
              Why Landlords Choose Us
            </h2>
            <p className="text-muted-foreground max-w-[900px] text-base md:text-lg lg:text-xl">
              Our platform creates value for property owners by connecting you with reliable family
              tenants for secure, long-term relationships.
            </p>
          </div>
        </div>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <div className="flex flex-col items-center space-y-3 rounded-lg border p-6 shadow-sm">
            <Shield className="text-primary h-12 w-12" />
            <h3 className="text-xl font-bold">Enhanced Security</h3>
            <p className="text-muted-foreground text-center">
              All family tenants are pre-screened and verified, reducing risks associated with
              problematic renters and ensuring your property is in good hands.
            </p>
          </div>

          <div className="flex flex-col items-center space-y-3 rounded-lg border p-6 shadow-sm">
            <Clock className="text-primary h-12 w-12" />
            <h3 className="text-xl font-bold">Long-Term Stability</h3>
            <p className="text-muted-foreground text-center">
              Families typically seek longer tenancies, reducing turnover costs and providing
              consistent rental income for extended periods.
            </p>
          </div>

          <div className="flex flex-col items-center space-y-3 rounded-lg border p-6 shadow-sm">
            <CheckCircle className="text-primary h-12 w-12" />
            <h3 className="text-xl font-bold">Reduced Workload</h3>
            <p className="text-muted-foreground text-center">
              Our platform handles marketing, initial screening, and matching, saving you countless
              hours of work finding the right tenants.
            </p>
          </div>

          <div className="flex flex-col items-center space-y-3 rounded-lg border p-6 shadow-sm">
            <DollarSign className="text-primary h-12 w-12" />
            <h3 className="text-xl font-bold">Better Property Care</h3>
            <p className="text-muted-foreground text-center">
              Families tend to treat rental properties as homes, often resulting in better
              maintenance and care of your investment.
            </p>
          </div>

          <div className="flex flex-col items-center space-y-3 rounded-lg border p-6 shadow-sm">
            <Users className="text-primary h-12 w-12" />
            <h3 className="text-xl font-bold">Quality Tenants</h3>
            <p className="text-muted-foreground text-center">
              Connect with families who have been vetted for reliability, financial stability, and
              respectful property treatment.
            </p>
          </div>

          <div className="flex flex-col items-center space-y-3 rounded-lg border p-6 shadow-sm">
            <ThumbsUp className="text-primary h-12 w-12" />
            <h3 className="text-xl font-bold">Landlord Support</h3>
            <p className="text-muted-foreground text-center">
              Access dedicated support, resources, and tools to help you manage your properties and
              tenant relationships effectively.
            </p>
          </div>
        </div>

        <div className="bg-muted mt-12 rounded-lg p-6 sm:p-8">
          <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
            <div className="space-y-2 text-center sm:text-left">
              <h3 className="text-2xl font-bold">Ready to find your ideal family tenants?</h3>
              <p className="text-muted-foreground">
                Join thousands of satisfied property owners on our platform.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button variant="default" size="default" asChild className="w-full sm:w-auto">
                <Link to="#signup">List Your Property</Link>
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
