'use client';

import * as React from 'react';
import Image from 'next/image';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
} from '@/components/ui/carousel';
import { brandStories } from '@/lib/data';
import type { BrandStory } from '@/lib/types';
import Link from 'next/link';
import { Button } from './ui/button';

function BrandStoryCard({ story }: { story: BrandStory }) {
  return (
    <div className="flex flex-col h-full">
      <Link href="#" className="flex flex-col h-full group">
        <div className="relative overflow-hidden aspect-[3/4] rounded-xl">
          <Image
            src={story.image.imageUrl}
            alt={story.image.description}
            fill
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            data-ai-hint={story.image.imageHint}
          />
        </div>
        <div className="mt-4">
          <h3 className="font-headline font-semibold mt-1 group-hover:text-primary">{story.title}</h3>
          <p className="text-sm text-muted-foreground mt-1 line-clamp-3">{story.description}</p>
        </div>
      </Link>
    </div>
  );
}

export function BrandStories() {
  return (
    <section className="py-12 md:py-20 overflow-hidden">
        <div className="container text-center">
            <h2 className="font-headline text-4xl font-bold">Ready to get inspired?</h2>
            <p className="mt-2 text-muted-foreground max-w-xl mx-auto">Unwrap our Brand Stories and read insights from industry experts</p>
        </div>

      <Carousel
        opts={{
          align: 'start',
        }}
        className="w-full mt-8"
      >
        <CarouselContent className="pl-[calc((100%-1280px)/2+1rem)]">
          {brandStories.map((story) => (
            <CarouselItem
              key={story.id}
              className="px-2 basis-full sm:basis-1/2 md:basis-1/3 lg:basis-1/4 xl:basis-1/5"
            >
              <BrandStoryCard story={story} />
            </CarouselItem>
          ))}
        </CarouselContent>
         <div className="hidden md:block">
            <CarouselNext className="absolute top-1/2 -translate-y-1/2 right-[calc((100%-1280px)/2)]" />
        </div>
      </Carousel>
      <div className="container text-center mt-8">
        <Button size="lg" style={{ backgroundColor: 'hsl(var(--accent))', color: 'hsl(var(--accent-foreground))' }}>
            Explore More
        </Button>
      </div>
    </section>
  );
}
