'use client';

import Image from 'next/image';
import { notFound } from 'next/navigation';
import { useEffect, useState } from 'react';
import type { Product } from '@/lib/types';
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AddToCartForm } from '@/components/add-to-cart-form';
import { CheckCircle, Leaf, Loader2 } from 'lucide-react';

export default function ProductDetailPage({ params }: { params: { id: string } }) {
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const docRef = doc(db, 'products', params.id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setProduct({ id: docSnap.id, ...docSnap.data() } as Product);
        } else {
          notFound();
        }
      } catch (error) {
        console.error("Error fetching product:", error);
        notFound();
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [params.id]);

  if (loading) {
    return (
      <div className="container py-12 flex justify-center items-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!product) {
    return notFound();
  }

  return (
    <div className="container py-12">
      <div className="grid md:grid-cols-2 gap-8 lg:gap-16">
        <div>
          <Card className="overflow-hidden">
            <div className="aspect-square relative">
              <Image
                src={product.image.imageUrl || 'https://placehold.co/600x600'}
                alt={product.image.description || product.name}
                fill
                className="object-cover"
                data-ai-hint={product.image.imageHint}
              />
            </div>
          </Card>
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
            
            <div>
              <h3 className="font-headline text-lg font-semibold mb-2">Materials</h3>
              <div className="flex flex-wrap gap-2">
                {product.materials.map((material) => (
                  <Badge key={material} variant="secondary">{material}</Badge>
                ))}
              </div>
            </div>

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
