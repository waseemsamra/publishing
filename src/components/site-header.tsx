'use client';

import Link from 'next/link';
import { ShoppingBag, Search, ChevronDown } from 'lucide-react';

import { useCart } from '@/context/cart-context';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/logo';
import { Input } from '@/components/ui/input';

export function SiteHeader() {
  const { cartCount } = useCart();

  const navLinks = [
    { href: '#', label: 'Products' },
    { href: '#', label: 'Industries', active: true },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-20 items-center px-4 md:px-6">
        <div className="flex items-center">
          <Logo />
          <nav className="hidden md:flex gap-6 ml-10">
            {navLinks.map(link => (
              <Link
                key={link.label}
                href={link.href}
                className={`text-sm font-medium transition-colors hover:text-primary ${
                  link.active ? 'text-accent' : 'text-foreground'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex flex-1 items-center justify-end space-x-4">
          <div className="relative w-full max-w-sm hidden sm:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search for bowls"
              className="pl-9"
            />
          </div>
          <div className="hidden md:flex items-center text-sm font-medium">
            <span>Ship to:</span>
            <Button variant="ghost" size="sm" className="ml-1">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 512 512"
                className="h-4 w-6 mr-2"
              >
                <path
                  d="M256 0C114.6 0 0 114.6 0 256s114.6 256 256 256s256-114.6 256-256S397.4 0 256 0zM388.1 108.1L123.9 388.1C152.1 409.2 184.8 424.3 220.1 432.7L432.7 220.1c-8.4-35.4-23.5-68-44.6-96.2zM123.9 123.9C152.1 102.8 184.8 87.7 220.1 79.3L79.3 220.1c-8.4-35.4-23.5-68-44.6-96.2z"
                  fill="#D80027"
                />
                <path d="M256 0v512c141.4 0 256-114.6 256-256S397.4 0 256 0z" fill="#F0F0F0" />
                <path d="M512 256c0 141.4-114.6 256-256 256V0c141.4 0 256 114.6 256 256z" fill="#0052B4" />
                <path
                  d="M432.7 291.9L220.1 79.3c-35.4 8.4-68 23.5-96.2 44.6L388.1 403.9c21.1-28.2 36.2-60.8 44.6-96.2z"
                  fill="#D80027"
                />
                <path
                  d="M220.1 220.1L79.3 79.3C34.7 123.9 0 185.2 0 256h256c-19.3 0-37.3-3.6-54.4-9.9L220.1 220.1zM291.9 291.9L432.7 432.7c44.6-44.6 79.3-105.9 79.3-176.7H256c19.3 0 37.3 3.6 54.4 9.9L291.9 291.9z"
                  fill="#F0F0F0"
                />
              </svg>
              GBP
              <ChevronDown className="h-4 w-4 ml-1" />
            </Button>
          </div>
          <Button asChild variant="outline">
            <Link href="/login">Login / Signup</Link>
          </Button>
          <Button asChild variant="ghost" size="icon" className="relative">
            <Link href="/cart">
              <ShoppingBag className="h-6 w-6" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-accent text-accent-foreground text-xs font-bold">
                  {cartCount}
                </span>
              )}
              <span className="sr-only">Shopping Cart</span>
            </Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
