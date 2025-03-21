import { Card, CardContent } from '../ui/card';

export function Testimonials() {
  return (
    <section id="testimonials" className="bg-muted w-full px-4 py-12 sm:px-6 md:py-24 lg:px-8">
      <div className="container mx-auto">
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <div className="space-y-2">
            <div className="bg-primary text-primary-foreground inline-block rounded-lg px-3 py-1 text-sm">
              Testimonials
            </div>
            <h2 className="text-3xl font-bold tracking-tighter md:text-4xl">Happy Families</h2>
            <p className="text-muted-foreground max-w-[900px] text-base md:text-lg lg:text-xl">
              Don&apos;t just take our word for it. Here&apos;s what families are saying about their
              experience.
            </p>
          </div>
        </div>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col items-center gap-4">
                <img
                  src="https://picsum.photos/id/400/80/80"
                  width={80}
                  height={80}
                  alt="Testimonial avatar"
                  className="rounded-full"
                />
                <div className="space-y-2 text-center">
                  <h3 className="font-bold">The Johnson Family</h3>
                  <p className="text-muted-foreground text-sm">
                    &quot;We found our dream apartment in just two weeks! The landlord was
                    pre-screened and everything was exactly as described.&quot;
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col items-center gap-4">
                <img
                  src="https://picsum.photos/id/400/80/80"
                  width={80}
                  height={80}
                  alt="Testimonial avatar"
                  className="rounded-full"
                />
                <div className="space-y-2 text-center">
                  <h3 className="font-bold">The Martinez Family</h3>
                  <p className="text-muted-foreground text-sm">
                    &quot;As a family with pets, finding a rental was always difficult. This
                    platform made it easy to find pet-friendly options.&quot;
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col items-center gap-4">
                <img
                  src="https://picsum.photos/id/400/80/80"
                  width={80}
                  height={80}
                  alt="Testimonial avatar"
                  className="rounded-full"
                />
                <div className="space-y-2 text-center">
                  <h3 className="font-bold">The Smith Family</h3>
                  <p className="text-muted-foreground text-sm">
                    &quot;The personalized matching saved us so much time. We found a home near the
                    perfect school for our kids.&quot;
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
