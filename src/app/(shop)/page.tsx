'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Loader2 } from 'lucide-react';
import { BrandStories } from '@/components/brand-stories';
import { PackagingAlliance } from '@/components/packaging-alliance';
import { PackagingForBrands } from '@/components/packaging-for-brands';
import { SignupBanner } from '@/components/signup-banner';
import { useCollection } from '@/firebase/firestore/use-collection';
import { useFirestore } from '@/firebase/provider';
import { collection, query, orderBy, limit } from 'firebase/firestore';
import { useMemo } from 'react';
import type { TrendingItem } from '@/lib/types';
import dynamic from 'next/dynamic';
import { Skeleton } from '@/components/ui/skeleton';
import { InteractiveHero } from '@/components/interactive-hero';

const LowMinimumMustHaves = dynamic(
  () => import('@/components/low-minimum-must-haves').then((mod) => mod.LowMinimumMustHaves),
  { 
    ssr: false,
    loading: () => (
      <section className="py-12 md:py-20">
        <div className="container"><Skeleton className="h-96 w-full" /></div>
      </section>
    ),
  }
);

const PackagingPartner = dynamic(
  () => import('@/components/packaging-partner').then((mod) => mod.PackagingPartner),
  { 
    ssr: false,
    loading: () => (
      <section className="py-12 md:py-20">
        <div className="container"><Skeleton className="h-96 w-full" /></div>
      </section>
    ),
  }
);


const TrendingNowCard = ({ item }: { item: TrendingItem }) => {
  return (
    <Link href="#" className="relative group block overflow-hidden aspect-[4/3]">
      <Image
        src={item.imageUrl}
        alt={item.title}
        fill
        className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-105"
        data-ai-hint={item.imageHint}
        unoptimized
      />
      <div className="absolute inset-0 bg-black/40"></div>
      <div className="absolute inset-0 flex items-end p-6">
        <h3 className="text-white font-headline text-2xl font-bold">{item.title}</h3>
      </div>
    </Link>
  );
};

function TrendingNowSection() {
    const db = useFirestore();
    const trendingItemsQuery = useMemo(() => {
        if (!db) return null;
        const q = query(collection(db, 'trendingItems'), orderBy('order', 'asc'), limit(4));
        (q as any).__memo = true;
        return q;
    }, [db]);

    const { data: items, isLoading } = useCollection<TrendingItem>(trendingItemsQuery);

    if (isLoading) {
        return (
            <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px bg-border">
                {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="aspect-[4/3] bg-muted animate-pulse"></div>
                ))}
            </div>
        );
    }

    if (!items || items.length === 0) {
        return null; // Don't render anything if there are no items
    }
    
    return (
        <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px bg-border">
            {items.map((item) => (
                <TrendingNowCard key={item.id} item={item} />
            ))}
        </div>
    );
}


export default function HomePage() {
  return (
    <>
      <InteractiveHero />
      
      <LowMinimumMustHaves />

      <section>
        <div className="container pt-12 md:pt-20">
            <h2 className="font-headline text-4xl font-bold mb-8">Trending now</h2>
        </div>
        <TrendingNowSection />
      </section>

      <PackagingAlliance />

      <PackagingPartner />

      <BrandStories />

      <PackagingForBrands />

      <SignupBanner />
    </>
  );
}
