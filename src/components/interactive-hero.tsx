'use client';

import { useState, useMemo, useEffect } from 'react';
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

const fallbackColors = [
  'bg-sky-700',
  'bg-emerald-700',
  'bg-amber-700',
  'bg-rose-700',
  'bg-indigo-700',
  'bg-teal-700',
  'bg-lime-700',
  'bg-fuchsia-700',
  'bg-cyan-700',
  'bg-orange-700',
  'bg-pink-700',
  'bg-violet-700',
];

export function InteractiveHero() {
  const db = useFirestore();

  const categoriesQuery = useMemo(() => {
    if (!db) return null;
    const q = query(collection(db, 'categories'));
    (q as any).__memo = true;
    return q;
  }, [db]);

  const { data: allCategories, isLoading } = useCollection<Category>(categoriesQuery);

  const [featuredItem, setFeaturedItem] = useState<Category | null>(null);
  const [gridItems, setGridItems] = useState<Category[]>([]);
  const [activeHoverItem, setActiveHoverItem] = useState<Category | null>(null);

  useEffect(() => {
    if (allCategories) {
      const topLevelCategories = allCategories.filter((cat) => !cat.parentId);

      const foodPackagingCategory = topLevelCategories.find(
        (cat) => cat.name.toLowerCase() === 'food packaging'
      );

      const initial = foodPackagingCategory || topLevelCategories[0] || null;
      
      setFeaturedItem(initial);

      if (initial) {
        const otherItems = topLevelCategories.filter((cat) => cat.id !== initial.id);
        setGridItems(otherItems.slice(0, 12));
      } else {
        setGridItems(topLevelCategories.slice(0, 12));
      }
    }
  }, [allCategories]);

  const handleItemHover = (item: Category) => {
    setActiveHoverItem(item);
  };

  const handleMouseLeave = () => {
    setActiveHoverItem(null);
  };

  const displayItem = activeHoverItem || featuredItem;

  const allItemsForCarousel = useMemo(() => {
      if (!featuredItem) return gridItems;
      return [featuredItem, ...gridItems];
  }, [featuredItem, gridItems]);
  
  if (isLoading) {
    return (
      <section className="bg-muted h-[480px] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </section>
    );
  }

  if (!featuredItem && gridItems.length === 0) {
    return (
      <section className="bg-muted h-[480px] flex flex-col items-center justify-center text-center p-4">
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
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-px bg-border overflow-hidden">
        {/* Left Display Panel */}
        <div
          onMouseLeave={handleMouseLeave}
          className="relative isolate flex flex-col items-center justify-center p-8 text-white min-h-[400px] lg:min-h-0"
        >
          {displayItem?.imageUrl ? (
            <Image
              src={displayItem.imageUrl}
              alt={displayItem.name}
              fill
              className="object-cover -z-10 transition-all duration-500 ease-in-out"
              key={displayItem.id}
              data-ai-hint={displayItem.imageHint}
              unoptimized
            />
          ) : (
            <div
              className={cn(
                'absolute inset-0 -z-10',
                fallbackColors[
                  (allCategories?.findIndex((c) => c.id === displayItem?.id) ??
                    0) % fallbackColors.length
                ]
              )}
            ></div>
          )}

          <div className="absolute inset-0 bg-black/30 -z-10"></div>

          <div className="text-center relative">
            <p className="text-white/80">HanaPac Customized Packaging</p>
            <h2 className="font-headline text-5xl font-bold text-white mt-2">
              {displayItem?.name} Packaging
            </h2>
          </div>
        </div>

        {/* Right Panel */}
        <div>
          {/* Desktop Grid View */}
          <div className="hidden lg:grid grid-cols-4 grid-rows-3 bg-border aspect-[4/3] lg:aspect-auto">
            {gridItems.map((item, index) => (
              <Link
                href={`/products?category=${item.id}`}
                key={item.id}
                onMouseEnter={() => handleItemHover(item)}
                className={cn(
                  'relative isolate flex items-center justify-center p-4 text-center text-white aspect-[4/3] transition-all duration-200 group',
                  'focus:z-10 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-inset'
                )}
              >
                {item.imageUrl ? (
                  <Image
                    src={item.imageUrl}
                    alt={item.name}
                    fill
                    className="object-cover -z-10 group-hover:scale-105 transition-transform duration-300"
                    data-ai-hint={item.imageHint}
                    unoptimized
                  />
                ) : (
                  <div
                    className={cn(
                      'absolute inset-0 -z-10',
                      fallbackColors[
                        (allCategories?.findIndex((c) => c.id === item.id) ?? 0) %
                          fallbackColors.length
                      ]
                    )}
                  ></div>
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
                {allItemsForCarousel.map((item) => (
                  <CarouselItem key={item.id} className="basis-1/2 sm:basis-1/3">
                    <Link
                      href={`/products?category=${item.id}`}
                      className={cn(
                        'relative isolate flex items-center justify-center p-4 text-center text-white aspect-square transition-all duration-200 group rounded-lg overflow-hidden',
                        'focus:z-10 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-inset'
                      )}
                    >
                      {item.imageUrl ? (
                        <Image
                          src={item.imageUrl}
                          alt={item.name}
                          fill
                          className="object-cover -z-10 group-hover:scale-105 transition-transform duration-300"
                          data-ai-hint={item.imageHint}
                          unoptimized
                        />
                      ) : (
                        <div
                          className={cn(
                            'absolute inset-0 -z-10',
                            fallbackColors[
                              (allCategories?.findIndex((c) => c.id === item.id) ?? 0) %
                                fallbackColors.length
                            ]
                          )}
                        ></div>
                      )}
                      <div
                        className={cn(
                          'absolute inset-0 bg-black/50 group-hover:bg-black/30 transition-colors -z-10'
                        )}
                      ></div>
                      <h3 className="font-semibold text-lg">{item.name}</h3>
                    </Link>
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
