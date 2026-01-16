'use client';

import Image from 'next/image';
import { notFound } from 'next/navigation';
import { useMemo } from 'react';
import type { Product } from '@/lib/types';
import { db } from '@/lib/firebase';
import { doc } from 'firebase/firestore';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AddToCartForm } from '@/components/add-to-cart-form';
import { CheckCircle, Leaf, Loader2 } from 'lucide-react';
import { useDoc } from '@/firebase/firestore/use-doc';

export default function ProductDetailPage({ params }: { params: { id: string } }) {
  const productRef = useMemo(() => {
    if (!params.id) return null;
    const ref = doc(db, 'products', params.id);
    (ref as any).__memo = true;
    return ref;
  }, [params.id]);

  const { data: product, isLoading, error } = useDoc<Product>(productRef);

  if (isLoading) {
    return (
      <div className="container py-12 flex justify-center items-center min-h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !product) {
    return notFound();
  }
  
  const primaryImage = product.images?.[0];

  return (
    <div className="container py-12">
      <div className="grid md:grid-cols-2 gap-8 lg:gap-16">
        <div>
          <Card className="overflow-hidden">
            <div className="aspect-square relative">
              {primaryImage ? (
                <Image
                  src={primaryImage.imageUrl || 'https://placehold.co/600x600'}
                  alt={primaryImage.description || product.name}
                  fill
                  className="object-cover"
                  data-ai-hint={primaryImage.imageHint}
                />
              ) : (
                <div className="bg-muted flex items-center justify-center h-full">
                    <span className="text-muted-foreground">No Image</span>
                </div>
              )}
            </div>
          </Card>
          {/* TODO: Add image gallery for multiple images */}
        </div>
        <div>
          <h1 className="font-headline text-4xl font-bold text-primary">{product.name}</h1>
          <p className="text-2xl font-semibold mt-2 mb-4">${product.price.toFixed(2)}</p>
          <p className="text-muted-foreground leading-relaxed">{product.description}</p>
          
          <AddToCartForm product={product} />

          <div className="mt-8 space-y-6">
            <div>
              <h3 className="font-headline text-lg font-semibold mb-2 flex items-center"><Leaf className="mr-2 h-5 w-5 text-green-600" />Sustainability Impact</h3>
              <p className="text-sm text-muted-foreground">{product.sustainabilityImpact}</p>
            </div>
            
            {product.materials && product.materials.length > 0 && (
                <div>
                    <h3 className="font-headline text-lg font-semibold mb-2">Materials</h3>
                    <div className="flex flex-wrap gap-2">
                        {product.materials.map((material) => (
                        <Badge key={material} variant="secondary">{material}</Badge>
                        ))}
                    </div>
                </div>
            )}

            {product.certifications && product.certifications.length > 0 && (
              <div>
                <h3 className="font-headline text-lg font-semibold mb-2 flex items-center"><CheckCircle className="mr-2 h-5 w-5 text-blue-600" />Certifications</h3>
                <div className="flex flex-wrap gap-2">
                  {product.certifications.map((cert) => (
                    <Badge key={cert} variant="outline">{cert}</Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
