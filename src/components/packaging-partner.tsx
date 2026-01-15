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
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

function PackagingProductCard({ product }: { product: MustHaveProduct }) {
  return (
    <div className="flex flex-col h-full group">
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
          {product.minUnits} &middot; {product.delivery}
        </p>
        <h3 className="font-headline font-semibold mt-1">{product.name}</h3>
        <p className="text-sm text-primary mt-1 group-hover:underline">Request a Quote</p>
      </div>
    </div>
  );
}

export function PackagingPartner() {
  const tabs = ['New In', 'Most Popular', 'Ready to Ship'];
  const [activeTab, setActiveTab] = React.useState(tabs[0]);

  return (
    <section className="py-12 md:py-20 overflow-hidden">
        <div className="container">
            <div className="flex flex-col items-start mb-8">
                <h2 className="font-headline text-3xl font-bold md:text-4xl">
                    Packaging partner to world-leading brands
                </h2>
                <div className="flex items-center gap-2 mt-4">
                    {tabs.map((tab) => (
                       <Button
                        key={tab}
                        size="sm"
                        onClick={() => setActiveTab(tab)}
                        className={cn(
                            "rounded-full",
                            activeTab === tab
                                ? "bg-accent text-accent-foreground hover:bg-accent/90"
                                : "bg-secondary/50 border-transparent text-foreground"
                        )}
                        variant={activeTab === tab ? "default" : "outline"}
                       >
                           {tab}
                       </Button>
                    ))}
                </div>
            </div>
        </div>
      <Carousel
        opts={{
          align: 'start',
        }}
        className="w-full"
      >
        <CarouselContent className="pl-[var(--container-padding)]">
          {mustHaveProducts.map((product) => (
            <CarouselItem
              key={product.id}
              className="px-2 basis-full sm:basis-1/2 md:basis-1/3 lg:basis-[23.5%]"
            >
              <PackagingProductCard product={product} />
            </CarouselItem>
          ))}
        </CarouselContent>
        <div className="container relative">
            <CarouselNext className="hidden md:inline-flex absolute -top-24 right-8" />
        </div>
      </Carousel>
    </section>
  );
}
