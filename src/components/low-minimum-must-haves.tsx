'use client';

import * as React from 'react';
import Image from 'next/image';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import { Badge } from '@/components/ui/badge';
import { mustHaveProducts } from '@/lib/data';
import type { MustHaveProduct } from '@/lib/types';
import Link from 'next/link';

function MustHaveProductCard({ product }: { product: MustHaveProduct }) {
  return (
    <Link href="#" className="flex flex-col h-full group">
      <div className="relative overflow-hidden aspect-square rounded-xl">
        <Image
          src={product.image.imageUrl}
          alt={product.image.description}
          fill
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
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
        <h3 className="font-headline font-semibold mt-1 group-hover:text-primary">{product.name}</h3>
        <p className="text-sm text-muted-foreground mt-1">{product.price}</p>
      </div>
    </Link>
  );
}

export function LowMinimumMustHaves() {
  return (
    <section className="py-12 md:py-20">
      <div className="container">
        <div className="flex justify-between items-center mb-8">
            <h2 className="font-headline text-3xl font-bold md:text-4xl">
                Low Minimum Must-Haves
            </h2>
        </div>
        <Carousel
          opts={{
            align: 'start',
          }}
          className="w-full relative"
        >
          <CarouselContent className="-ml-4">
            {mustHaveProducts.map((product) => (
              <CarouselItem
                key={product.id}
                className="pl-4 basis-full sm:basis-1/2 md:basis-1/3 lg:basis-1/4"
              >
                <MustHaveProductCard product={product} />
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="absolute -left-12 top-1/2 -translate-y-1/2 hidden lg:flex" />
          <CarouselNext className="absolute -right-12 top-1/2 -translate-y-1/2 hidden lg:flex" />
        </Carousel>
      </div>
    </section>
  );
}
