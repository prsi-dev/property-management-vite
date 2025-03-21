import { Link } from 'react-router';

import { Button } from '../ui/button';

export function Hero() {
  return (
    <section className="w-full py-8 md:py-16 lg:py-24">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid gap-8 md:gap-12 lg:grid-cols-2">
          <div className="flex flex-col justify-center space-y-4">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl">
                Find Your Perfect Family Home
              </h1>
              <p className="text-muted-foreground max-w-[600px] text-base sm:text-lg md:text-xl">
                Connect with trusted landlords offering long-term rentals specifically designed for
                families like yours.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button size="lg" variant="default" asChild className="w-full sm:w-auto">
                <Link to="#signup">Request Access</Link>
              </Button>
              <Button variant="outline" size="lg" asChild className="w-full sm:w-auto">
                <Link to="#how-it-works">Learn More</Link>
              </Button>
            </div>
            <p className="text-muted-foreground text-sm">
              Join thousands of families who have found their perfect home.
            </p>
          </div>
          <div className="mt-8 flex items-center justify-center lg:mt-0">
            <img
              src="https://picsum.photos/id/238/500/300"
              width={550}
              height={550}
              alt="Cityscape"
              className="mx-auto w-full max-w-md rounded-xl object-cover sm:max-w-lg lg:max-w-full"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
