import { Home, Mail, Phone, MapPin, Facebook, Twitter, Instagram } from 'lucide-react';
import { Link } from 'react-router';

export function Footer() {
  return (
    <footer className="bg-background w-full border-t">
      <div className="container mx-auto px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div className="flex flex-col gap-4">
            <Link to="/" className="flex items-center gap-2 text-lg font-semibold">
              <Home className="h-5 w-5" />
              <span>FamilyHomeFinder</span>
            </Link>
            <p className="text-muted-foreground text-sm">
              Connecting families with their perfect long-term rental homes since 2023.
            </p>
            <div className="flex gap-4 pt-2">
              <Link to="#" className="text-muted-foreground hover:text-foreground">
                <Facebook className="h-5 w-5" />
                <span className="sr-only">Facebook</span>
              </Link>
              <Link to="#" className="text-muted-foreground hover:text-foreground">
                <Twitter className="h-5 w-5" />
                <span className="sr-only">Twitter</span>
              </Link>
              <Link to="#" className="text-muted-foreground hover:text-foreground">
                <Instagram className="h-5 w-5" />
                <span className="sr-only">Instagram</span>
              </Link>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <h3 className="text-lg font-semibold">Quick Links</h3>
            <nav className="flex flex-col gap-2">
              <Link to="#family-benefits" className="text-muted-foreground hover:text-foreground">
                Family Benefits
              </Link>
              <Link to="#landlord-benefits" className="text-muted-foreground hover:text-foreground">
                Landlord Benefits
              </Link>
              <Link to="#how-it-works" className="text-muted-foreground hover:text-foreground">
                How It Works
              </Link>
              <Link to="#testimonials" className="text-muted-foreground hover:text-foreground">
                Testimonials
              </Link>
              <Link to="#signup" className="text-muted-foreground hover:text-foreground">
                Sign Up
              </Link>
            </nav>
          </div>

          <div className="flex flex-col gap-4">
            <h3 className="text-lg font-semibold">Contact Us</h3>
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <Mail className="text-muted-foreground h-4 w-4" />
                <span className="text-sm">support@familyhomefinder.com</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="text-muted-foreground h-4 w-4" />
                <span className="text-sm">(555) 123-4567</span>
              </div>
              <div className="flex items-start gap-2">
                <MapPin className="text-muted-foreground h-4 w-4" />
                <span className="text-sm">
                  123 Main Street, Suite 100
                  <br />
                  San Francisco, CA 94105
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <h3 className="text-lg font-semibold">Legal</h3>
            <nav className="flex flex-col gap-2">
              <Link to="#" className="text-muted-foreground hover:text-foreground">
                Terms of Service
              </Link>
              <Link to="#" className="text-muted-foreground hover:text-foreground">
                Privacy Policy
              </Link>
              <Link to="#" className="text-muted-foreground hover:text-foreground">
                Cookie Policy
              </Link>
              <Link to="#" className="text-muted-foreground hover:text-foreground">
                Accessibility
              </Link>
            </nav>
          </div>
        </div>

        <div className="mt-10 border-t pt-6">
          <p className="text-muted-foreground text-center text-sm">
            &copy; {new Date().getFullYear()} FamilyHomeFinder. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
