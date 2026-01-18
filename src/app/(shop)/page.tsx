'use client';

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
import { useCollection } from '@/firebase/firestore/use-collection';
import { useFirestore } from '@/firebase/provider';
import { collection, query, orderBy } from 'firebase/firestore';
import { useMemo, useRef } from 'react';
import type { HeroSlide } from '@/lib/types';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import Autoplay from 'embla-carousel-autoplay';

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

const HeroPanel = ({ title, subtitle, links, imageSrc, imageHint, imageAlt, href }: { title: string; subtitle?: string; links: {text: string, href: string}[]; imageSrc: string; imageHint: string; imageAlt: string; href: string; }) => {
  return (
    <div className="relative group w-full h-[50vh] md:h-[70vh] bg-cover bg-center flex items-end text-white">
      <Image src={imageSrc} alt={imageAlt} fill className="object-cover w-full h-full -z-10" data-ai-hint={imageHint}/>
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent"></div>
      <div className="relative z-10 p-6 md:p-12 w-full">
        <h2 className="font-headline text-3xl md:text-4xl font-bold">{title}</h2>
        {subtitle && <p className="mt-2 text-md text-white/90 max-w-lg">{subtitle}</p>}
        <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2">
          {links.map((link) => (
            <Link key={link.text} href={link.href} className="text-sm font-semibold hover:underline">
              {link.text}
            </Link>
          ))}
        </div>
        <Link href={href} className="absolute bottom-8 right-8 md:bottom-12 md:right-12 flex items-center gap-2 text-sm font-semibold hover:underline">
          Shop now <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
};


function HeroCarousel() {
    const db = useFirestore();
    const heroSlidesQuery = useMemo(() => {
        if (!db) return null;
        const q = query(collection(db, 'heroSlides'), orderBy('order', 'asc'));
        (q as any).__memo = true;
        return q;
    }, [db]);

    const { data: slides, isLoading } = useCollection<HeroSlide>(heroSlidesQuery);

    const plugin = useRef(
      Autoplay({ delay: 5000, stopOnInteraction: true })
    );

    const slidePairs = useMemo(() => {
        if (!slides) return [];
        const pairs = [];
        for (let i = 0; i < slides.length; i += 2) {
            pairs.push(slides.slice(i, i + 2));
        }
        return pairs;
    }, [slides]);

    if (isLoading) {
        return (
            <section className="h-[70vh] bg-muted flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin" />
            </section>
        );
    }
    
    if (!slides || slides.length === 0) {
        return (
             <section className="h-[70vh] bg-muted flex items-center justify-center text-center p-8">
                <p className="text-muted-foreground">Could not load hero slides. Please add at least one slide in the admin panel.</p>
            </section>
        );
    }
    
    return (
        <section className="relative">
            <Carousel
                plugins={[plugin.current]}
                className="w-full"
                opts={{
                    loop: slidePairs.length > 1,
                }}
                onMouseEnter={plugin.current.stop}
                onMouseLeave={plugin.current.reset}
            >
                <CarouselContent>
                    {slidePairs.map((pair, index) => (
                        <CarouselItem key={index}>
                            <div className="grid grid-cols-1 md:grid-cols-2">
                                {pair.map((slide) => (
                                    <HeroPanel 
                                        key={slide.id}
                                        title={slide.title}
                                        subtitle={slide.subtitle}
                                        links={slide.links || []}
                                        imageSrc={slide.imageUrl}
                                        imageHint={slide.imageHint}
                                        imageAlt={slide.title}
                                        href={slide.links?.[0]?.href || '#'}
                                    />
                                ))}
                                {pair.length === 1 && (
                                     <div className="relative group w-full h-[50vh] md:h-[70vh] bg-muted flex items-center justify-center text-center p-8">
                                        <div className="text-center">
                                            <h3 className="font-headline text-2xl font-bold">Add another slide</h3>
                                            <p className="text-muted-foreground mt-2">Go to the admin panel to complete this pair.</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </CarouselItem>
                    ))}
                </CarouselContent>
                {slidePairs.length > 1 && (
                  <>
                    <CarouselPrevious className="absolute left-4 top-1/2 -translate-y-1/2 z-10 hidden md:flex" />
                    <CarouselNext className="absolute right-4 top-1/2 -translate-y-1/2 z-10 hidden md:flex" />
                  </>
                )}
            </Carousel>
        </section>
    )
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
