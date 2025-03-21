import { useLoaderData, type LoaderFunctionArgs } from 'react-router';
import { FamilyBenefits } from '~/components/landing-page/family-benefits';
import { Footer } from '~/components/landing-page/footer';
import { Header } from '~/components/landing-page/header';
import { Hero } from '~/components/landing-page/hero';
import { HowItWorks } from '~/components/landing-page/how-it-works';
import { LandlordBenefits } from '~/components/landing-page/landlord-benefits';
import { SignupSection } from '~/components/landing-page/signup-section';
import { Testimonials } from '~/components/landing-page/testimonials';
import { createServerSupabase } from '~/lib/supabase.server';

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { supabase } = createServerSupabase(request);
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return { user: user && user.email ? { id: user.id, email: user.email } : null };
};

export default function Home() {
  const { user } = useLoaderData<typeof loader>();
  return (
    <div className="flex min-h-screen w-full flex-col overflow-x-hidden">
      <Header user={user} />
      <main className="w-full flex-1">
        <Hero />
        <FamilyBenefits />
        <LandlordBenefits />
        <HowItWorks />
        <Testimonials />
        <SignupSection />
      </main>
      <Footer />
    </div>
  );
}
