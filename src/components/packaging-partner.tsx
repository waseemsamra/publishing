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
import Link from 'next/link';
import { Button } from './ui/button';

const tabs = ['New In', 'Most Popular', 'Ready to Ship'];
const tabMapping: Record<string, MustHaveProduct['tags'][number]> = {
    'New In': 'new-in',
    'Most Popular': 'most-popular',
    'Ready to Ship': 'ready-to-ship',
};

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

export function PackagingPartner() {
  const [activeTab, setActiveTab] = React.useState(tabs[0]);
  const activeTag = tabMapping[activeTab];

  const filteredProducts = mustHaveProducts.filter(product => product.tags && product.tags.includes(activeTag));

  return (
    <section className="py-12 md:py-20 overflow-hidden">
       <div className="container">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
                <h2 className="font-headline text-3xl font-bold md:text-4xl">
                    Packaging partner to world-leading brands
                </h2>
                <div className="flex items-center gap-2 mt-4 sm:mt-0">
                    {tabs.map(tab => (
                        <Button
                            key={tab}
                            variant={activeTab === tab ? 'default' : 'ghost'}
                            onClick={() => setActiveTab(tab)}
                            className={`rounded-full ${activeTab === tab ? 'bg-accent text-accent-foreground' : 'bg-gray-100 hover:bg-gray-200'}`}
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
        <CarouselContent className="pl-[calc((100%-1280px)/2+1rem)]">
          {filteredProducts.map((product) => (
            <CarouselItem
              key={product.id}
              className="px-2 basis-full sm:basis-1/2 md:basis-1/3 lg:basis-[23.5%]"
            >
              <MustHaveProductCard product={product} />
            </CarouselItem>
          ))}
        </CarouselContent>
        <div className="hidden md:block">
            <CarouselNext className="absolute top-0 right-[calc((100%-1280px)/2)]" />
        </div>
      </Carousel>
    </section>
  );
}
