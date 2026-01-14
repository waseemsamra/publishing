import { Logo } from "./logo";
import Link from 'next/link';
import { Github, Twitter, Instagram } from 'lucide-react';

export function SiteFooter() {
  return (
    <footer className="border-t">
      <div className="container py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center md:text-left">
          <div className="flex flex-col gap-4 items-center md:items-start">
            <Logo />
            <p className="text-sm text-muted-foreground max-w-xs">
              Your one-stop shop for sustainable and eco-friendly products.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 col-span-1 md:col-span-3 gap-8">
            <div>
              <h4 className="font-headline font-semibold mb-4">Shop</h4>
              <ul className="space-y-2">
                <li><Link href="#" className="text-sm text-muted-foreground hover:text-primary">All Products</Link></li>
                <li><Link href="#" className="text-sm text-muted-foreground hover:text-primary">New Arrivals</Link></li>
                <li><Link href="#" className="text-sm text-muted-foreground hover:text-primary">Best Sellers</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-headline font-semibold mb-4">About</h4>
              <ul className="space-y-2">
                <li><Link href="#" className="text-sm text-muted-foreground hover:text-primary">Our Story</Link></li>
                <li><Link href="/sustainability-report" className="text-sm text-muted-foreground hover:text-primary">Sustainability</Link></li>
                <li><Link href="#" className="text-sm text-muted-foreground hover:text-primary">Contact Us</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-headline font-semibold mb-4">Support</h4>
              <ul className="space-y-2">
                <li><Link href="#" className="text-sm text-muted-foreground hover:text-primary">FAQ</Link></li>
                <li><Link href="#" className="text-sm text-muted-foreground hover:text-primary">Shipping & Returns</Link></li>
                <li><Link href="/account" className="text-sm text-muted-foreground hover:text-primary">My Account</Link></li>
              </ul>
            </div>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-sm text-muted-foreground">&copy; {new Date().getFullYear()} EcoCart Marketplace. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <Link href="#" aria-label="Twitter"><Twitter className="h-5 w-5 text-muted-foreground hover:text-primary" /></Link>
            <Link href="#" aria-label="Instagram"><Instagram className="h-5 w-5 text-muted-foreground hover:text-primary" /></Link>
            <Link href="#" aria-label="Github"><Github className="h-5 w-5 text-muted-foreground hover:text-primary" /></Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
