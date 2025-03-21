import { Home, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router';

import { Button } from '../ui/button';
import type { User } from '@prisma/client';

export function Header({ user }: { user: User | null }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  console.log(user);
  const navigate = useNavigate();
  const navigateToDashboard = () => {
    if (user?.role === 'ADMIN') {
      navigate('/dashboard/admin');
    }
    if (user?.role === 'OWNER') {
      navigate('/dashboard/owner');
    }
    if (user?.role === 'TENANT') {
      navigate('/dashboard/tenant');
    }
    if (user?.role === 'PROPERTY_MANAGER') {
      navigate('/dashboard/manager');
    }
    if (user?.role === 'SERVICE_PROVIDER') {
      navigate('/dashboard/service');
    }
  };

  return (
    <header className="bg-background/95 supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50 w-full border-b backdrop-blur">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center gap-2 text-lg font-semibold">
            <Home className="h-5 w-5" />
            <span>FamilyHomeFinder</span>
          </Link>

          {}
          <nav className="hidden gap-6 md:flex">
            <Link
              to="#family-benefits"
              className="text-sm font-medium underline-offset-4 hover:underline"
            >
              Family Benefits
            </Link>
            <Link
              to="#landlord-benefits"
              className="text-sm font-medium underline-offset-4 hover:underline"
            >
              Landlord Benefits
            </Link>
            <Link
              to="#how-it-works"
              className="text-sm font-medium underline-offset-4 hover:underline"
            >
              How It Works
            </Link>
            <Link
              to="#testimonials"
              className="text-sm font-medium underline-offset-4 hover:underline"
            >
              Testimonials
            </Link>
            <Link to="#signup" className="text-sm font-medium underline-offset-4 hover:underline">
              Sign Up
            </Link>
          </nav>

          {}
          <div className="hidden items-center gap-4 md:flex">
            <Button variant="outline" size="sm" asChild>
              <Link to="#signup">Request Access</Link>
            </Button>
            {user ? (
              <Button size="sm" onClick={navigateToDashboard}>
                Dashboard
              </Button>
            ) : (
              <Button size="sm" asChild>
                <Link to="/auth/login">Login</Link>
              </Button>
            )}
          </div>

          {}
          <button
            className="text-foreground inline-flex items-center justify-center rounded-md p-2 md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <span className="sr-only">Open main menu</span>
            {mobileMenuOpen ? (
              <X className="h-6 w-6" aria-hidden="true" />
            ) : (
              <Menu className="h-6 w-6" aria-hidden="true" />
            )}
          </button>
        </div>
      </div>

      {}
      {mobileMenuOpen && (
        <div className="md:hidden">
          <div className="space-y-1 px-4 pt-2 pb-3">
            <Link
              to="#family-benefits"
              className="block py-2 text-base font-medium"
              onClick={() => setMobileMenuOpen(false)}
            >
              Family Benefits
            </Link>
            <Link
              to="#landlord-benefits"
              className="block py-2 text-base font-medium"
              onClick={() => setMobileMenuOpen(false)}
            >
              Landlord Benefits
            </Link>
            <Link
              to="#how-it-works"
              className="block py-2 text-base font-medium"
              onClick={() => setMobileMenuOpen(false)}
            >
              How It Works
            </Link>
            <Link
              to="#testimonials"
              className="block py-2 text-base font-medium"
              onClick={() => setMobileMenuOpen(false)}
            >
              Testimonials
            </Link>
            <Link
              to="#signup"
              className="block py-2 text-base font-medium"
              onClick={() => setMobileMenuOpen(false)}
            >
              Sign Up
            </Link>
            <div className="flex flex-col gap-2 pt-2">
              <Button variant="outline" size="sm" asChild className="w-full justify-center">
                <Link to="#signup" onClick={() => setMobileMenuOpen(false)}>
                  Request Access
                </Link>
              </Button>
              <Button size="sm" asChild className="w-full justify-center">
                <Link to="#signup" onClick={() => setMobileMenuOpen(false)}>
                  Landlord Login
                </Link>
              </Button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
