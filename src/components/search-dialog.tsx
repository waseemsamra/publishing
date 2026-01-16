'use client';

import { useState, useMemo, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogClose,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, X, Loader2 } from 'lucide-react';
import { db } from '@/lib/firebase';
import { collection, query } from 'firebase/firestore';
import { useCollection } from '@/firebase/firestore/use-collection';
import type { Product } from '@/lib/types';
import { ProductCard } from './product-card';
import { ScrollArea } from './ui/scroll-area';

const searchSuggestions = [
  'cups',
  'coffee cups',
  'cold cups',
  'hot cups',
  'compostable cups',
];

export function SearchDialog() {
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const productsQuery = useMemo(() => {
    if (!open) return null;
    const q = query(collection(db, 'products'));
    (q as any).__memo = true;
    return q;
  }, [open]);

  const { data: allProducts, isLoading } = useCollection<Product>(productsQuery);

  const filteredProducts = useMemo(() => {
    if (!searchTerm) return null;
    if (!allProducts) return [];
    return allProducts.filter(
      (product) =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm, allProducts]);

  useEffect(() => {
    if (!open) {
      const timer = setTimeout(() => setSearchTerm(''), 150);
      return () => clearTimeout(timer);
    }
  }, [open]);

  const DesktopTrigger = (
    <div className="relative w-full max-w-md cursor-pointer" role="button">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <div className="pl-9 w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm text-muted-foreground ring-offset-background flex items-center">
            Search for mailers
        </div>
    </div>
  );

  const MobileTrigger = (
    <Button variant="ghost" size="icon">
        <Search className="h-5 w-5" />
        <span className="sr-only">Search</span>
    </Button>
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <>
            <div className="hidden lg:block w-full">{DesktopTrigger}</div>
            <div className="lg:hidden">{MobileTrigger}</div>
        </>
      </DialogTrigger>
      <DialogContent className="max-w-full w-full h-full sm:rounded-none p-0 flex flex-col gap-0">
          <header className="flex items-center gap-4 border-b p-4 shrink-0">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                autoFocus
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search for mailers, boxes, and more..."
                className="text-lg h-12 pl-10 pr-24"
              />
              {searchTerm && (
                <div className="absolute right-12 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                  {filteredProducts?.length ?? 0} results
                </div>
              )}
            </div>
            <DialogClose asChild>
              <Button variant="ghost" size="icon" className="rounded-full shrink-0">
                <X className="h-6 w-6" />
                <span className="sr-only">Close</span>
              </Button>
            </DialogClose>
          </header>
          
          <ScrollArea className="flex-1">
            {isLoading && searchTerm ? (
              <div className="flex justify-center items-center h-full p-8 pt-24">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : filteredProducts === null ? (
                <div className="p-8">
                    <h3 className="font-semibold text-muted-foreground mb-4">Popular Searches</h3>
                    <div className="flex flex-wrap gap-2">
                        {searchSuggestions.map(suggestion => (
                            <Button key={suggestion} variant="outline" className="rounded-full" onClick={() => setSearchTerm(suggestion)}>
                                {suggestion}
                            </Button>
                        ))}
                    </div>
                </div>
            ) : filteredProducts.length > 0 ? (
                <div className="p-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                    {filteredProducts.map(product => (
                        <ProductCard key={product.id} product={product} />
                    ))}
                </div>
            ) : (
                <div className="text-center py-24 px-8">
                    <h3 className="font-headline text-2xl font-bold">No Products Found</h3>
                    <p className="text-muted-foreground mt-2">Your search for "{searchTerm}" did not match any products.</p>
                </div>
            )}
          </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
