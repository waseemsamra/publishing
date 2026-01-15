'use client';

import * as React from 'react';
import Image from 'next/image';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
} from '@/components/ui/carousel';
import { Badge } from '@/components/ui/badge';
import { mustHaveProducts } from '@/lib/data';
import type { MustHaveProduct } from '@/lib/types';

function MustHaveProductCard({ product }: { product: MustHaveProduct }) {
  return (
    <div className="flex flex-col">
      <div className="relative overflow-hidden rounded-xl">
        <Image
          src={product.image.imageUrl}
          alt={product.image.description}
          width={400}
          height={400}
          className="aspect-[4/5] w-full object-cover"
          data-ai-hint={product.image.imageHint}
        />
        {product.badge && (
          <Badge
            variant="secondary"
            className="absolute top-3 right-3 bg-white/80 backdrop-blur-sm text-black"
          >
            {product.badge}
          </Badge>
        )}
      </div>
      <div className="mt-4">
        <p className="text-xs text-muted-foreground">
          {product.minUnits} - {product.delivery}
        </p>
        <h3 className="font-headline font-semibold mt-1">{product.name}</h3>
        <p className="text-sm text-muted-foreground mt-1">{product.price}</p>
      </div>
    </div>
  );
}

export function LowMinimumMustHaves() {
  return (
    <section className="py-12 md:py-20 overflow-hidden">
      <Carousel
        opts={{
          align: 'start',
          containScroll: 'keepSnaps',
        }}
        className="w-full"
      >
        <div className="container">
          <div className="flex items-center justify-between mb-8">
            <h2 className="font-headline text-3xl md:text-4xl font-bold">
              Low Minimum Must-Haves
            </h2>
            <CarouselNext className="relative -top-4 -right-4 hidden md:inline-flex" />
          </div>
        </div>
        <CarouselContent className="pl-4 md:pl-8 lg:pl-[calc((100vw-var(--container-width))/2)] -ml-0">
          {mustHaveProducts.map((product) => (
            <CarouselItem
              key={product.id}
              className="basis-3/4 sm:basis-1/2 md:basis-1/3 lg:basis-[23%] pl-4"
            >
              <MustHaveProductCard product={product} />
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>
    </section>
  );
}
