'use client';

import Image from 'next/image';
import { notFound } from 'next/navigation';
import { useMemo, useState, useEffect } from 'react';
import type { Product, Size, Colour } from '@/lib/types';
import { db } from '@/lib/firebase';
import { doc, collection, query, where, documentId } from 'firebase/firestore';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AddToCartForm } from '@/components/add-to-cart-form';
import { CheckCircle, Leaf, Loader2, Ruler, Palette } from 'lucide-react';
import { useDoc } from '@/firebase/firestore/use-doc';
import { useCollection } from '@/firebase/firestore/use-collection';
import { cn } from '@/lib/utils';
import type { ImagePlaceholder } from '@/lib/placeholder-images';

export default function ProductDetailPage({ params }: { params: { id: string } }) {
  const productRef = useMemo(() => {
    if (!params.id) return null;
    const ref = doc(db, 'products', params.id);
    (ref as any).__memo = true;
    return ref;
  }, [params.id]);

  const { data: product, isLoading, error } = useDoc<Product>(productRef);
  const [selectedImage, setSelectedImage] = useState<ImagePlaceholder | null>(null);

  useEffect(() => {
    if (product && product.images && product.images.length > 0) {
      setSelectedImage(product.images[0]);
    }
  }, [product]);

  const sizesQuery = useMemo(() => {
    if (!product?.sizeIds || product.sizeIds.length === 0) return null;
    const q = query(collection(db, 'sizes'), where(documentId(), 'in', product.sizeIds));
    (q as any).__memo = true;
    return q;
  }, [product]);
  const { data: availableSizes } = useCollection<Size>(sizesQuery);

  const coloursQuery = useMemo(() => {
    if (!product?.colourIds || product.colourIds.length === 0) return null;
    const q = query(collection(db, 'colours'), where(documentId(), 'in', product.colourIds));
    (q as any).__memo = true;
    return q;
  }, [product]);
  const { data: availableColours } = useCollection<Colour>(coloursQuery);

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
  
  return (
    <div className="container py-12">
      <div className="grid md:grid-cols-2 gap-8 lg:gap-16">
        <div>
          <Card className="overflow-hidden mb-4">
            <div className="aspect-square relative">
              {selectedImage ? (
                <Image
                  src={selectedImage.imageUrl || 'https://placehold.co/600x600'}
                  alt={selectedImage.description || product.name}
                  fill
                  className="object-cover"
                  data-ai-hint={selectedImage.imageHint}
                />
              ) : (
                <div className="bg-muted flex items-center justify-center h-full">
                    <span className="text-muted-foreground">No Image</span>
                </div>
              )}
            </div>
          </Card>
           {product.images && product.images.length > 1 && (
            <div className="grid grid-cols-5 gap-2">
              {product.images.map((image) => (
                <button
                  key={image.id}
                  className={cn(
                    'aspect-square relative overflow-hidden rounded-md border-2 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
                    selectedImage?.id === image.id ? 'border-primary' : 'border-transparent'
                  )}
                  onClick={() => setSelectedImage(image)}
                >
                  <Image
                    src={image.imageUrl || 'https://placehold.co/100x100'}
                    alt={image.description || product.name}
                    fill
                    className="object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>
        <div>
          <h1 className="font-headline text-4xl font-bold text-primary">{product.name}</h1>
          <p className="text-2xl font-semibold mt-2 mb-4">${product.price.toFixed(2)}</p>
          <p className="text-muted-foreground leading-relaxed">{product.description}</p>
          
          <AddToCartForm product={product} />

          <div className="mt-8 space-y-6">
            {availableSizes && availableSizes.length > 0 && (
                <div>
                    <h3 className="font-headline text-lg font-semibold mb-2 flex items-center"><Ruler className="mr-2 h-5 w-5 text-gray-600" />Available Sizes</h3>
                    <div className="flex flex-wrap gap-2">
                        {availableSizes.map((size) => (
                        <Badge key={size.id} variant="secondary">{size.name}</Badge>
                        ))}
                    </div>
                </div>
            )}

            {availableColours && availableColours.length > 0 && (
                <div>
                    <h3 className="font-headline text-lg font-semibold mb-2 flex items-center"><Palette className="mr-2 h-5 w-5 text-purple-600" />Available Colours</h3>
                    <div className="flex flex-wrap gap-2">
                        {availableColours.map((colour) => (
                            <div key={colour.id} className="flex items-center gap-2 border rounded-full px-3 py-1 text-sm bg-secondary">
                                <div className="h-4 w-4 rounded-full border" style={{ backgroundColor: colour.hexCode }}></div>
                                <span>{colour.name}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

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
