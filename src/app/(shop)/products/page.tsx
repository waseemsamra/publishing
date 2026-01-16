'use client';

import { useMemo } from 'react';
import { db } from '@/lib/firebase';
import { collection, query } from 'firebase/firestore';
import { useCollection } from '@/firebase/firestore/use-collection';
import type { Product } from '@/lib/types';
import { ProductCard } from '@/components/product-card';
import { Loader2 } from 'lucide-react';

export default function ProductsPage() {
  const productsQuery = useMemo(() => {
    const q = query(collection(db, 'products'));
    (q as any).__memo = true;
    return q;
  }, []);

  const { data: products, isLoading, error } = useCollection<Product>(productsQuery);

  return (
    <div className="container py-12">
      <h1 className="font-headline text-4xl font-bold mb-8">All Products</h1>
      
      {isLoading && (
        <div className="flex justify-center items-center min-h-[50vh]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      )}

      {error && (
        <div className="text-center text-red-500">
          <p>Error loading products: {error.message}</p>
        </div>
      )}

      {!isLoading && !error && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {products && products.length > 0 ? (
            products.map(product => (
              <ProductCard key={product.id} product={product} />
            ))
          ) : (
            <p>No products found.</p>
          )}
        </div>
      )}
    </div>
  );
}
