'use client';

import Link from 'next/link';
import { ShoppingBag, Search, ChevronDown } from 'lucide-react';
import React, { useState, useEffect } from 'react';
import { useCart } from '@/context/cart-context';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/logo';
import { Input } from '@/components/ui/input';

function CartButton() {
  const { cartCount } = useCart();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  return (
    <Button asChild variant="ghost" size="icon" className="relative">
      <Link href="/cart">
        <ShoppingBag className="h-6 w-6" />
        {isClient && cartCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-accent text-accent-foreground text-xs font-bold">
            {cartCount}
          </span>
        )}
        <span className="sr-only">Shopping Cart</span>
      </Link>
    </Button>
  );
}

export function SiteHeader() {
  const navLinks = [
    { href: '#', label: 'Products' },
    { href: '#', label: 'Industries', active: true },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="bg-secondary/50">
        <div className="container flex h-10 items-center justify-between text-xs">
          <p className="font-medium">
            Custom Paper Bowls - <span className="text-muted-foreground">Serve in style! Now available</span>
          </p>
          <nav className="hidden md:flex items-center gap-6">
            <Link href="#" className="hover:underline">Tapkit by noissue</Link>
            <Link href="#" className="hover:underline">Help Center</Link>
            <Link href="#" className="hover:underline">Contact Us</Link>
          </nav>
        </div>
      </div>
      <div className="container flex h-20 items-center">
        <div className="flex items-center gap-6">
          <Logo />
          <nav className="hidden items-center gap-6 md:flex">
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

        <div className="flex flex-1 items-center justify-center px-8">
            <div className="relative w-full max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                type="search"
                placeholder="Search for mailers"
                className="pl-9"
                />
            </div>
        </div>

        <div className="flex items-center justify-end space-x-2">
          <div className="hidden md:flex items-center text-sm font-medium">
            <Button variant="ghost" size="sm" className="ml-1">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 512 512"
                className="h-4 w-6 mr-2"
              >
                <path fill="#00247d" d="M0 0h512v512H0z"/>
                <path fill="#fff" d="m64 0 192 128L448 0h64v64L320 256l192 192v64h-64L256 384 64 512H0v-64l192-192L0 64V0h64z"/>
                <path fill="#cf142b" d="m288 0 160 106.7V0h64v32l-160 106.7V224h-64v-85.3L64 0H0v64l224 149.3V288h64v-74.7L512 384v64l-224-149.3V224h-64v74.7L0 128V64l224 149.3V160h64v-53.3zM224 512l160-106.7V512h64v-32L288 373.3V320h-64v85.3L0 512h64v-64l224-149.3V288h-64v74.7L512 128V64l-224 149.3V224h64v-74.7L0 224v-64l224-149.3V160h-64V85.3L512 0v224h-64V117.3L256 256l256 128v-64h-64L256 192l-192 128v64h64l192-128 192 128h64v-64L320 256l192-192v-64h-64L256 128 64 0H0v64l192 192L0 448v64h64l192-128L448 512h64v-64L320 256l192-192V0h-64L256 128 64 0H0z"/>
              </svg>
              <span>Ship to:</span>
              <span className='font-bold ml-1'>GBP</span>
              <ChevronDown className="h-4 w-4 ml-1" />
            </Button>
          </div>
          <Button asChild variant="outline">
            <Link href="/login">Login / Signup</Link>
          </Button>
          <CartButton />
        </div>
      </div>
    </header>
  );
}
