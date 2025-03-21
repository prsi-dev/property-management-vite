export function HowItWorks() {
  return (
    <section id="how-it-works" className="w-full px-4 py-12 sm:px-6 md:py-24 lg:px-8">
      <div className="container mx-auto">
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <div className="space-y-2">
            <div className="bg-primary text-primary-foreground inline-block rounded-lg px-3 py-1 text-sm">
              Simple Process
            </div>
            <h2 className="text-3xl font-bold tracking-tighter md:text-4xl">How It Works</h2>
            <p className="text-muted-foreground max-w-[900px] text-base md:text-lg lg:text-xl">
              Finding your family&apos;s next home is simple with our easy-to-use platform.
            </p>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-8 lg:flex-row lg:items-center lg:gap-12">
          <div className="w-full lg:w-1/2">
            <img
              src="https://picsum.photos/id/378/600/400"
              width={600}
              height={400}
              alt="Platform interface showing family rental listings"
              className="mx-auto aspect-video rounded-xl object-cover object-center sm:w-full"
            />
          </div>

          <div className="w-full lg:w-1/2">
            <ul className="grid gap-6">
              <li className="flex flex-col items-center gap-4 sm:inline-flex sm:items-start">
                <div className="grid gap-1">
                  <div className="flex items-start gap-2">
                    <div className="bg-primary text-primary-foreground flex h-8 w-8 items-center justify-center rounded-full">
                      1
                    </div>
                    <h3 className="text-xl font-bold">Sign Up</h3>
                  </div>
                  <p className="text-muted-foreground">
                    Complete our simple registration form with your family&apos;s details and
                    preferences.
                  </p>
                </div>
              </li>
              <li className="flex flex-col items-center gap-4 sm:inline-flex sm:items-start">
                <div className="grid gap-1">
                  <div className="flex items-start gap-2">
                    <div className="bg-primary text-primary-foreground flex h-8 w-8 items-center justify-center rounded-full">
                      2
                    </div>
                    <h3 className="text-xl font-bold">Get Matched</h3>
                  </div>
                  <p className="text-muted-foreground">
                    Our system matches your family with suitable properties based on your
                    requirements.
                  </p>
                </div>
              </li>
              <li className="flex flex-col items-center gap-4 sm:inline-flex sm:items-start">
                <div className="grid gap-1">
                  <div className="flex items-start gap-2">
                    <div className="bg-primary text-primary-foreground flex h-8 w-8 items-center justify-center rounded-full">
                      3
                    </div>
                    <h3 className="text-xl font-bold">Connect</h3>
                  </div>
                  <p className="text-muted-foreground">
                    Communicate directly with verified landlords through our secure platform.
                  </p>
                </div>
              </li>
              <li className="flex flex-col items-center gap-4 sm:inline-flex sm:items-start">
                <div className="grid gap-1">
                  <div className="flex items-start gap-2">
                    <div className="bg-primary text-primary-foreground flex h-8 w-8 items-center justify-center rounded-full">
                      4
                    </div>
                    <h3 className="text-xl font-bold">Move In</h3>
                  </div>
                  <p className="text-muted-foreground">
                    Finalize your agreement and move into your new family home with confidence.
                  </p>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
