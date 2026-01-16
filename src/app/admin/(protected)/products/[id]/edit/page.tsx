'use client';

import { ProductForm } from '@/components/admin/ProductForm';
import { db } from '@/lib/firebase';
import type { Product } from '@/lib/types';
import { doc } from 'firebase/firestore';
import { useDoc } from '@/firebase/firestore/use-doc';
import { useMemo } from 'react';
import { Loader2 } from 'lucide-react';
import { notFound } from 'next/navigation';

export default function EditProductPage({ params }: { params: { id: string } }) {
  const productRef = useMemo(() => {
    if (!params.id) return null;
    const ref = doc(db, 'products', params.id);
    (ref as any).__memo = true;
    return ref;
  }, [params.id]);

  const { data: product, isLoading, error } = useDoc<Product>(productRef);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-full min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error || !product) {
    return notFound();
  }

  return <ProductForm product={product} />;
}
