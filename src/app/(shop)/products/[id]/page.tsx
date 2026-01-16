'use client';

import Image from 'next/image';
import { notFound, useParams } from 'next/navigation';
import { useMemo, useState, useEffect } from 'react';
import type { Product, Size, WallType } from '@/lib/types';
import { db } from '@/lib/firebase';
import { doc, collection, query, where, documentId } from 'firebase/firestore';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useDoc } from '@/firebase/firestore/use-doc';
import { useCollection } from '@/firebase/firestore/use-collection';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import { Loader2, Truck, Zap, Leaf, HelpCircle } from 'lucide-react';

export default function ProductDetailPage() {
  const params = useParams<{ id: string }>();
  const productRef = useMemo(() => {
    if (!params.id) return null;
    const ref = doc(db, 'products', params.id);
    (ref as any).__memo = true;
    return ref;
  }, [params.id]);

  const { data: product, isLoading, error } = useDoc<Product>(productRef);

  const sizesQuery = useMemo(() => {
    if (!product?.sizeIds || product.sizeIds.length === 0) return null;
    const q = query(collection(db, 'sizes'), where(documentId(), 'in', product.sizeIds));
    (q as any).__memo = true;
    return q;
  }, [product]);
  const { data: availableSizes } = useCollection<Size>(sizesQuery);

  const wallTypesQuery = useMemo(() => {
    if (!product?.wallTypeIds || product.wallTypeIds.length === 0) return null;
    const q = query(collection(db, 'wallTypes'), where(documentId(), 'in', product.wallTypeIds));
    (q as any).__memo = true;
    return q;
  }, [product]);
  const { data: availableWallTypes } = useCollection<WallType>(wallTypesQuery);

  const [selectedWall, setSelectedWall] = useState<string | null>(null);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [selectedLid, setSelectedLid] = useState<string | null>('None');

  useEffect(() => {
    if (availableWallTypes && availableWallTypes.length > 0 && !selectedWall) {
      setSelectedWall(availableWallTypes[0].id);
    }
    if (availableSizes && availableSizes.length > 0 && !selectedSize) {
      setSelectedSize(availableSizes[0].id);
    }
  }, [availableWallTypes, availableSizes, selectedWall, selectedSize]);

  if (isLoading || !params.id) {
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
    <div className="grid grid-cols-1 md:grid-cols-2 md:min-h-[calc(100vh-120px)]">
        <div className="md:h-auto flex items-center justify-center bg-muted/30">
            <Carousel className="w-full">
            <CarouselContent>
                {product.images && product.images.length > 0 ? (
                product.images.map((image) => (
                    <CarouselItem key={image.id}>
                    <div className="aspect-[4/3] relative">
                        <Image
                        src={image.imageUrl || 'https://placehold.co/800x600'}
                        alt={image.description || product.name}
                        fill
                        className="object-cover"
                        data-ai-hint={image.imageHint}
                        />
                    </div>
                    </CarouselItem>
                ))
                ) : (
                    <CarouselItem>
                        <div className="aspect-[4/3] relative bg-muted flex items-center justify-center">
                            <span className="text-muted-foreground">No Image</span>
                        </div>
                    </CarouselItem>
                )}
            </CarouselContent>
            <CarouselPrevious className="absolute left-4 top-1/2 -translate-y-1/2 hidden md:flex" />
            <CarouselNext className="absolute right-4 top-1/2 -translate-y-1/2 hidden md:flex" />
            </Carousel>
        </div>
        <div className="flex flex-col justify-center p-8 sm:p-12">
            <div className="mx-auto w-full max-w-md">
            <div className="text-sm text-muted-foreground">
                <span>Hot Cups</span> — <span>Custom Coffee Cups Compostable</span>
            </div>

            <h1 className="font-headline text-3xl lg:text-4xl font-bold mt-2">{product.name}</h1>

            <p className="text-lg text-muted-foreground mt-2">from ${product.price.toFixed(3)} / unit</p>

            <div className="mt-4 p-3 bg-primary/10 border border-primary/20 rounded-md text-sm text-primary">
                Free standard shipping & proofing available on all orders*
            </div>

            <p className="mt-4 text-muted-foreground">{product.description}</p>
            
            <div className="flex flex-wrap gap-2 mt-4">
                <Badge variant="outline">Low Minimums</Badge>
                <Badge variant="outline">Fast Delivery</Badge>
                <Badge variant="outline">Compostable</Badge>
                <Badge variant="outline">Custom</Badge>
            </div>

            <div className="mt-6 space-y-3">
                <h3 className="text-sm font-semibold text-muted-foreground">Estimated arrival:</h3>
                <div className="flex items-center justify-between p-3 border rounded-md bg-gray-50">
                    <div className="flex items-center gap-3">
                        <Truck className="h-5 w-5 text-muted-foreground" />
                        <span className="font-semibold">Standard (Free): Feb 13 - Feb 15</span>
                    </div>
                    <div className="h-6 w-6 rounded-full bg-green-100 flex items-center justify-center">
                        <Leaf className="h-4 w-4 text-green-600"/>
                    </div>
                </div>
                <div className="flex items-center justify-between p-3 border rounded-md bg-gray-50">
                    <div className="flex items-center gap-3">
                        <Zap className="h-5 w-5 text-muted-foreground" />
                        <span className="font-semibold">Express: Feb 02 - Feb 04</span>
                    </div>
                    <div className="h-6 w-6 rounded-full bg-green-100 flex items-center justify-center">
                        <Leaf className="h-4 w-4 text-green-600"/>
                    </div>
                </div>
                <p className="text-xs text-muted-foreground">*Lead times temporarily affected due to public holidays observed in some of our production hubs, please see checkout for updated lead times.</p>
            </div>
            
            <div className="mt-6 space-y-6">
                {availableWallTypes && availableWallTypes.length > 0 && (
                    <div>
                    <h3 className="text-sm font-semibold mb-2">Wall</h3>
                    <div className="grid grid-cols-2 gap-2">
                        {availableWallTypes.map((wall) => (
                            <Button key={wall.id} variant={selectedWall === wall.id ? 'default' : 'outline'} onClick={() => setSelectedWall(wall.id)}>{wall.name}</Button>
                        ))}
                    </div>
                    </div>
                )}
                
                {availableSizes && availableSizes.length > 0 && (
                    <div>
                        <h3 className="text-sm font-semibold mb-2 flex items-center gap-1">Size (Capacity) <HelpCircle className="h-4 w-4 text-muted-foreground"/></h3>
                        <div className="grid grid-cols-2 gap-2">
                            {availableSizes.map((size) => (
                                <Button key={size.id} variant={selectedSize === size.id ? 'default' : 'outline'} onClick={() => setSelectedSize(size.id)}>{size.name}</Button>
                            ))}
                        </div>
                    </div>
                )}

                <div>
                    <h3 className="text-sm font-semibold mb-2 flex items-center gap-1">Lid Type <HelpCircle className="h-4 w-4 text-muted-foreground"/></h3>
                    <div className="grid grid-cols-2 gap-2">
                        <Button variant={selectedLid === 'None' ? 'default' : 'outline'} onClick={() => setSelectedLid('None')}>None</Button>
                        <Button variant={selectedLid === 'Sip' ? 'default' : 'outline'} onClick={() => setSelectedLid('Sip')}>Sip (Fiber)</Button>
                    </div>
                </div>
            </div>
            </div>
        </div>
    </div>
  );
}
