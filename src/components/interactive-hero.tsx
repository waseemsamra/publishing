'use client';

import { useState, useMemo } from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { useCollection } from '@/firebase/firestore/use-collection';
import { useFirestore } from '@/firebase/provider';
import { collection, query } from 'firebase/firestore';
import type { Category } from '@/lib/types';
import { Loader2 } from 'lucide-react';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import { Button } from '@/components/ui/button';

export function InteractiveHero() {
  const db = useFirestore();
  const [activeHoverItem, setActiveHoverItem] = useState<Category | null>(null);

  const categoriesQuery = useMemo(() => {
    if (!db) return null;
    const q = query(collection(db, 'categories'));
    (q as any).__memo = true;
    return q;
  }, [db]);

  const { data: allCategories, isLoading } = useCollection<Category>(categoriesQuery);

  const { featuredItem, gridItems, allItemsForCarousel } = useMemo(() => {
    if (!allCategories || allCategories.length === 0) {
        return { featuredItem: null, gridItems: [], allItemsForCarousel: [] };
    }

    const topLevelCategories = allCategories
      .filter((cat) => !cat.parentId)
      .sort((a, b) => (a.order ?? Infinity) - (b.order ?? Infinity));

    // Find the item with order: 0 to be the main featured item
    const initialFeaturedItem = topLevelCategories.find(cat => cat.order === 0) || topLevelCategories[0] || null;

    // The grid items should be the rest of the categories, excluding the featured one.
    const gridItems = topLevelCategories
        .filter(cat => cat.id !== initialFeaturedItem?.id)
        .slice(0, 16);
    
    return {
      featuredItem: initialFeaturedItem,
      gridItems: gridItems,
      allItemsForCarousel: topLevelCategories, // This is for mobile carousel, let's keep all
    };
  }, [allCategories]);
  
  const displayItem = activeHoverItem || featuredItem;

  const handleItemHover = (item: Category) => {
    setActiveHoverItem(item);
  };
  
  const handleItemTap = (item: Category) => {
    setActiveHoverItem(item);
  };

  const handleMouseLeave = () => {
    setActiveHoverItem(null);
  };
  
  if (isLoading) {
    return (
      <section className="bg-muted flex items-center justify-center" style={{minHeight: '70vh'}}>
        <Loader2 className="h-8 w-8 animate-spin" />
      </section>
    );
  }

  if (!displayItem) {
    return (
      <section className="bg-muted flex flex-col items-center justify-center text-center p-4" style={{minHeight: '70vh'}}>
        <h3 className="font-headline text-2xl font-bold">
          No Categories Found
        </h3>
        <p className="text-muted-foreground mt-2">
          Add some top-level categories in the admin panel to see them here.
        </p>
      </section>
    );
  }

  return (
    <section>
      <div className="grid grid-cols-1 lg:grid-cols-2" style={{height: '70vh'}}>
        {/* Left Display Panel */}
        <div
          onMouseLeave={handleMouseLeave}
          className="relative isolate flex flex-col items-start justify-end p-8 text-white h-full"
        >
          {displayItem.imageUrl && (
            <Image
              src={displayItem.imageUrl}
              alt={displayItem.name}
              fill
              className="object-cover -z-10 transition-all duration-500 ease-in-out"
              key={displayItem.id}
              data-ai-hint={displayItem.imageHint}
              unoptimized
            />
          )}

          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/30 to-transparent -z-10"></div>

          <div className="relative z-10">
            <p className="text-white/80">HanaPac Customized Packaging</p>
            <h2 className="font-headline text-5xl font-bold text-white mt-2">
              {displayItem.name}
            </h2>
            <Button asChild className="mt-4">
              <Link href={`/products?category=${displayItem.id}`}>
                Shop Now
              </Link>
            </Button>
          </div>
        </div>

        {/* Right Panel */}
        <div className="lg:col-span-1 bg-border h-full">
          {/* Desktop Grid View */}
          <div className="hidden lg:grid grid-cols-4 grid-rows-4 w-full h-full gap-px">
            {gridItems.map((item) => (
              <Link
                href={`/products?category=${item.id}`}
                key={item.id}
                onMouseEnter={() => handleItemHover(item)}
                className={cn(
                  'relative isolate flex items-center justify-center p-4 text-center text-white transition-all duration-200 group bg-background',
                  'focus:z-10 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-inset'
                )}
              >
                {item.imageUrl && (
                  <Image
                    src={item.imageUrl}
                    alt={item.name}
                    fill
                    className="object-cover -z-10 group-hover:scale-105 transition-transform duration-300"
                    data-ai-hint={item.imageHint}
                    unoptimized
                  />
                )}
                <div
                  className={cn(
                    'absolute inset-0 bg-black/50 group-hover:bg-black/30 transition-colors -z-10'
                  )}
                ></div>
                <h3 className="font-semibold text-lg">{item.name}</h3>
              </Link>
            ))}
          </div>
          
          {/* Mobile Carousel View */}
          <div className="block lg:hidden p-4 bg-background">
            <Carousel
              opts={{
                align: 'start',
              }}
              className="w-full"
            >
              <CarouselContent>
                {allItemsForCarousel.map((item: Category) => (
                  <CarouselItem key={item.id} className="basis-1/2 sm:basis-1/3">
                    <div
                      role="button"
                      tabIndex={0}
                      onClick={() => handleItemTap(item)}
                      onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && handleItemTap(item)}
                      className={cn(
                        'relative isolate flex items-center justify-center p-4 text-center text-white aspect-square transition-all duration-200 group rounded-lg overflow-hidden',
                        'focus:z-10 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-inset'
                      )}
                    >
                      {item.imageUrl && (
                        <Image
                          src={item.imageUrl}
                          alt={item.name}
                          fill
                          className="object-cover -z-10 group-hover:scale-105 transition-transform duration-300"
                          data-ai-hint={item.imageHint}
                          unoptimized
                        />
                      )}
                      <div
                        className={cn(
                          'absolute inset-0 bg-black/50 group-hover:bg-black/30 transition-colors -z-10'
                        )}
                      ></div>
                      <h3 className="font-semibold text-lg">{item.name}</h3>
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious className="absolute -left-2 top-1/2 -translate-y-1/2 z-10" />
              <CarouselNext className="absolute -right-2 top-1/2 -translate-y-1/2 z-10" />
            </Carousel>
          </div>
        </div>
      </div>
    </section>
  );
}
