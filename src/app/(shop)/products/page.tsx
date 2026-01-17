'use client';

import { useState, useMemo, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { db } from '@/lib/firebase';
import { collection, query, where, Query, DocumentData } from 'firebase/firestore';
import { useCollection } from '@/firebase/firestore/use-collection';
import type { Product } from '@/lib/types';
import { ProductCard } from '@/components/product-card';
import { Loader2, LayoutGrid, List } from 'lucide-react';
import { ProductFilters } from '@/components/product-filters';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/auth-context';

function ProductsPageContent() {
  const [filters, setFilters] = useState<Record<string, string[]>>({});
  const [layout, setLayout] = useState<'grid' | 'list'>('grid');
  const { loading: authLoading } = useAuth();
  
  const searchParams = useSearchParams();
  const categoryId = searchParams.get('category');

  const initialFilters = useMemo(() => {
    return categoryId ? { categoryIds: [categoryId] } : {};
  }, [categoryId]);

  const productsQuery = useMemo(() => {
    if (authLoading || !db) return null;
    let q: Query<DocumentData> = collection(db, 'products');

    Object.entries(filters).forEach(([key, values]) => {
      if (values.length > 0) {
        q = query(q, where(key, 'array-contains-any', values));
      }
    });

    (q as any).__memo = true;
    return q;
  }, [filters, authLoading]);

  const { data: products, isLoading: isLoadingData, error } = useCollection<Product>(productsQuery);
  const isLoading = authLoading || isLoadingData;

  return (
    <div className="container py-12">
      <div className="text-center mb-12">
        <h1 className="font-headline text-4xl font-bold">Find Your Perfect Packaging</h1>
        <p className="text-muted-foreground mt-2 max-w-2xl mx-auto">Use our advanced filters to discover products tailored to your brand's needs. Select materials, sizes, colors, and more.</p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
        <aside className="lg:col-span-1">
          <div className="sticky top-24">
            <ProductFilters onFiltersChange={setFilters} initialFilters={initialFilters} />
          </div>
        </aside>

        <main className="lg:col-span-3">
          <div className="flex justify-between items-center mb-6">
            <p className="text-sm text-muted-foreground">
              {isLoading ? 'Searching...' : `Showing ${products?.length || 0} products`}
            </p>
            <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" onClick={() => setLayout('grid')} className={cn(layout === 'grid' && 'bg-accent')}>
                    <LayoutGrid className="h-5 w-5" />
                </Button>
                 <Button variant="ghost" size="icon" onClick={() => setLayout('list')} className={cn(layout === 'list' && 'bg-accent')}>
                    <List className="h-5 w-5" />
                </Button>
            </div>
          </div>
          
          {isLoading && (
            <div className="flex justify-center items-center min-h-[50vh]">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          )}

          {error && (
            <div className="text-center text-red-500 py-12">
              <p>Error loading products: {error.message}</p>
            </div>
          )}

          {!isLoading && !error && (
            <>
            {products && products.length > 0 ? (
                <div className={cn(
                    "grid gap-8",
                    layout === 'grid' ? "grid-cols-1 sm:grid-cols-2 xl:grid-cols-3" : "grid-cols-1"
                )}>
                    {products.map(product => (
                        <ProductCard key={product.id} product={product} layout={layout} />
                    ))}
                </div>
             ) : (
                <div className="text-center py-24 border-2 border-dashed rounded-lg">
                    <h3 className="font-headline text-2xl font-bold">No Products Found</h3>
                    <p className="text-muted-foreground mt-2">Try adjusting your filters to find what you're looking for.</p>
                </div>
            )}
            </>
          )}
        </main>
      </div>
    </div>
  );
}

export default function ProductsPage() {
    return (
        <Suspense fallback={
            <div className="container py-12 flex justify-center items-center min-h-[50vh]">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        }>
            <ProductsPageContent />
        </Suspense>
    )
}
