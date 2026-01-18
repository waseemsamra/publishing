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
import { collection, query, orderBy, limit } from 'firebase/firestore';
import { useMemo } from 'react';
import type { HeroSlide } from '@/lib/types';

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
    <div className="relative group w-full h-[70vh] bg-cover bg-center flex items-end text-white">
      <Image src={imageSrc} alt={imageAlt} fill className="object-cover w-full h-full -z-10" data-ai-hint={imageHint}/>
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent"></div>
      <div className="relative z-10 p-8 md:p-12 w-full">
        <h2 className="font-headline text-4xl md:text-5xl font-bold">{title}</h2>
        {subtitle && <p className="mt-2 text-lg text-white/90 max-w-lg">{subtitle}</p>}
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


function TwoPanelHero() {
    const db = useFirestore();
    const heroSlidesQuery = useMemo(() => {
        if (!db) return null;
        const q = query(collection(db, 'heroSlides'), orderBy('order', 'asc'), limit(2));
        (q as any).__memo = true;
        return q;
    }, [db]);

    const { data: slides, isLoading } = useCollection<HeroSlide>(heroSlidesQuery);

    if (isLoading) {
        return (
            <section className="grid grid-cols-1 md:grid-cols-2 h-[70vh] bg-muted">
                <div className="w-full h-full flex items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin" />
                </div>
                 <div className="w-full h-full flex items-center justify-center border-l border-border">
                    <Loader2 className="h-8 w-8 animate-spin" />
                </div>
            </section>
        );
    }
    
    if (!slides || slides.length === 0) {
        return (
             <section className="grid grid-cols-1 md:grid-cols-2 h-[70vh]">
                <div className="w-full h-full bg-muted flex items-center justify-center text-center p-8 col-span-2">
                    <p className="text-muted-foreground">Could not load hero slides. Please add at least one slide in the admin panel.</p>
                </div>
            </section>
        );
    }

    const firstSlide = slides[0];
    const secondSlide = slides.length > 1 ? slides[1] : null;
    
    return (
        <section className="grid grid-cols-1 md:grid-cols-2">
            {firstSlide && (
              <HeroPanel 
                  title={firstSlide.title}
                  subtitle={firstSlide.subtitle}
                  links={firstSlide.links || []}
                  imageSrc={firstSlide.imageUrl}
                  imageHint={firstSlide.imageHint}
                  imageAlt={firstSlide.title}
                  href={firstSlide.links?.[0]?.href || '#'}
              />
            )}
            {secondSlide ? (
                <HeroPanel 
                    title={secondSlide.title}
                    subtitle={secondSlide.subtitle}
                    links={secondSlide.links || []}
                    imageSrc={secondSlide.imageUrl}
                    imageHint={secondSlide.imageHint}
                    imageAlt={secondSlide.title}
                    href={secondSlide.links?.[0]?.href || '#'}
                />
            ) : (
                <div className="w-full h-[70vh] bg-muted flex items-center justify-center text-center p-8">
                    <p className="text-muted-foreground">Add a second slide in the admin panel to display it here.</p>
                </div>
            )}
        </section>
    )
}


export default function HomePage() {
  return (
    <>
      <TwoPanelHero />
      
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
