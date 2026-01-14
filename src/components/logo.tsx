import { Leaf } from 'lucide-react';
import Link from 'next/link';

export function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2" aria-label="EcoCart Marketplace Home">
      <div className="bg-primary p-2 rounded-md">
        <Leaf className="h-6 w-6 text-primary-foreground" />
      </div>
      <span className="font-headline text-2xl font-bold text-primary hidden sm:inline-block">
        EcoCart
      </span>
    </Link>
  );
}
