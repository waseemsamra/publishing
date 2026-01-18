

'use client';

import { useMemo } from 'react';
import { collection, query, orderBy } from 'firebase/firestore';
import { useCollection } from '@/firebase/firestore/use-collection';
import { useFirestore } from '@/firebase/provider';
import type { HeroSlide } from '@/lib/types';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Loader2 } from 'lucide-react';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { LowMinimumMustHaves } from '@/components/low-minimum-must-haves';
import { BrandStories } from '@/components/brand-stories';
import { PackagingAlliance } from '@/components/packaging-alliance';
import { PackagingPartner } from '@/components/packaging-partner';
import { PackagingForBrands } from '@/components/packaging-for-brands';
import { SignupBanner } from '@/components/signup-banner';

const TrendingNowCard = ({ imageId, title }: { imageId: string, title: string }) => {
  const image = PlaceHolderImages.find(p => p.id === imageId);
  if (!image) return null;

  return (
    <Link href="#" className="relative group block overflow-hidden aspect-[4/3]">
      <Image
        src={image.imageUrl}
        alt={image.description}
        fill
        className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-105"
        data-ai-hint={image.imageHint}
      />
      <div className="absolute inset-0 bg-black/40"></div>
      <div className="absolute inset-0 flex items-end p-6">
        <h3 className="text-white font-headline text-2xl font-bold">{title}</h3>
      </div>
    </Link>
  );
};


function HeroCarousel() {
  const db = useFirestore();
  const slidesQuery = useMemo(() => {
    if (!db) return null;
    const q = query(collection(db, 'heroSlides'), orderBy('order', 'asc'));
    (q as any).__memo = true;
    return q;
  }, [db]);
  
  const { data: slides, isLoading } = useCollection<HeroSlide>(slidesQuery);

  if (isLoading) {
    return (
      <section className="h-[60vh] flex items-center justify-center bg-muted">
        <Loader2 className="h-8 w-8 animate-spin" />
      </section>
    );
  }

  if (!slides || slides.length === 0) {
    return (
       <section className="h-[60vh] flex items-center justify-center bg-muted text-center p-8">
        <div>
          <h2 className="font-headline text-2xl font-bold">Hero Slides Not Configured</h2>
          <p className="text-muted-foreground mt-2">
            Please go to the <Link href="/admin/content/hero-slides" className="underline text-primary">admin panel</Link> to add slides to the hero carousel.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section>
      <Carousel className="w-full" opts={{ loop: true }}>
        <CarouselContent>
          {slides.map(slide => (
            <CarouselItem key={slide.id}>
              <div className="relative h-[60vh] bg-secondary/50 flex items-end p-8 md:p-12">
                {slide.imageUrl && <Image
                  src={slide.imageUrl}
                  alt={slide.title}
                  fill
                  priority
                  className="object-cover"
                  data-ai-hint={slide.imageHint}
                />}
                <div className="relative z-10 text-white w-full">
                  <h1 className="font-headline text-4xl md:text-5xl font-bold">{slide.title}</h1>
                  {slide.subtitle && <p className="mt-2 text-lg max-w-xl">{slide.subtitle}</p>}
                  <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2">
                    {slide.links?.map((link, index) => (
                      <Link key={index} href={link.href} className="text-sm font-semibold hover:underline">
                        {link.text}
                      </Link>
                    ))}
                  </div>
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="absolute left-4 top-1/2 -translate-y-1/2 hidden md:flex" />
        <CarouselNext className="absolute right-4 top-1/2 -translate-y-1/2 hidden md:flex" />
      </Carousel>
    </section>
  );
}


export default function HomePage() {
  return (
    <>
      <HeroCarousel />
      
      <LowMinimumMustHaves />

      <section>
        <div className="container pt-12 md:pt-20">
            <h2 className="font-headline text-4xl font-bold mb-8">Trending now</h2>
        </div>
        <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px bg-border">
            <TrendingNowCard imageId="trending-tapes" title="Tapes" />
            <TrendingNowCard imageId="trending-coffee-bags" title="Coffee Bags" />
            <TrendingNowCard imageId="trending-product-boxes" title="Product Boxes" />
            <TrendingNowCard imageId="trending-totes" title="Totes" />
        </div>
      </section>

      <PackagingAlliance />

      <PackagingPartner />

      <BrandStories />

      <PackagingForBrands />

      <SignupBanner />
    </>
  );
}

    