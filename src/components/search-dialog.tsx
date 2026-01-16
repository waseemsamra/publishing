'use client';

import { useState, useMemo, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, X, Loader2 } from 'lucide-react';
import { db } from '@/lib/firebase';
import { collection, query } from 'firebase/firestore';
import { useCollection } from '@/firebase/firestore/use-collection';
import type { Product } from '@/lib/types';
import { ProductCard } from './product-card';

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

  // Handle body scroll and Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false);
      }
    };

    if (open) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [open]);

  // Reset search term when closing
  useEffect(() => {
    if (!open) {
      const timer = setTimeout(() => setSearchTerm(''), 150);
      return () => clearTimeout(timer);
    }
  }, [open]);

  const DesktopTriggerContent = (
    <div className="relative w-full max-w-md cursor-pointer" role="button">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <div className="pl-9 w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm text-muted-foreground ring-offset-background flex items-center">
            Search for mailers
        </div>
    </div>
  );

  const MobileTriggerContent = (
    <Button variant="ghost" size="icon">
        <Search className="h-5 w-5" />
        <span className="sr-only">Search</span>
    </Button>
  );

  return (
    <>
      <div className="w-full" onClick={() => setOpen(true)}>
        <div className="hidden lg:block w-full">{DesktopTriggerContent}</div>
        <div className="lg:hidden">{MobileTriggerContent}</div>
      </div>

      {open && (
        <div className="fixed left-0 right-0 bottom-0 top-[120px] z-30 bg-background overflow-y-auto">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="max-w-2xl mx-auto relative">
               <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
               <Input
                autoFocus
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search for mailers, boxes, and more..."
                className="w-full h-16 rounded-full text-lg pl-14 pr-36 bg-secondary border-none focus-visible:ring-2 focus-visible:ring-ring"
              />
              <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
                 {filteredProducts && <span className="text-sm text-muted-foreground">{filteredProducts.length} results</span>}
                 <Button variant="ghost" size="icon" className="rounded-full h-10 w-10 bg-background/50 hover:bg-background" onClick={() => setOpen(false)}>
                    <X className="h-5 w-5" />
                 </Button>
              </div>
            </div>

            <div className="mt-8">
              {isLoading && searchTerm ? (
                <div className="flex justify-center items-center h-full p-8 pt-24">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : filteredProducts === null ? (
                <div className="text-center">
                  <div className="flex flex-wrap gap-2 justify-center max-w-2xl mx-auto">
                      {searchSuggestions.map(suggestion => (
                          <Button key={suggestion} variant="outline" className="rounded-full" onClick={() => setSearchTerm(suggestion)}>
                              {suggestion}
                          </Button>
                      ))}
                  </div>
                </div>
              ) : filteredProducts.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                    {filteredProducts.map(product => (
                        <div key={product.id} onClick={() => setOpen(false)}>
                            <ProductCard product={product} />
                        </div>
                    ))}
                </div>
              ) : (
                <div className="text-center py-24 px-8">
                    <h3 className="font-headline text-2xl font-bold">No Products Found</h3>
                    <p className="text-muted-foreground mt-2">Your search for "{searchTerm}" did not match any products.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
