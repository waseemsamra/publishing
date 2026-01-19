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

// Define HeroGridItem here as it's removed from types.ts
interface HeroGridItem {
    id: string;
    title: string;
    displayText: string;
    displaySubtitle: string;
    backgroundImageUrl: string;
    displayImageUrl: string;
    imageHint: string;
}

const fallbackColors = [
    'bg-sky-700', 'bg-emerald-700', 'bg-amber-700', 'bg-rose-700',
    'bg-indigo-700', 'bg-teal-700', 'bg-lime-700', 'bg-fuchsia-700',
    'bg-cyan-700', 'bg-orange-700', 'bg-pink-700', 'bg-violet-700'
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

  const heroGridItems = useMemo((): HeroGridItem[] => {
    if (!allCategories) return [];
    
    const topLevelCategories = allCategories.filter(cat => !cat.parentId);

    return topLevelCategories.slice(0, 12).map((cat): HeroGridItem => {
        return {
            id: cat.id,
            title: cat.name,
            displayText: `${cat.name} Packaging`,
            displaySubtitle: "HanaPac Customized Packaging",
            backgroundImageUrl: cat.imageUrl || '',
            displayImageUrl: cat.imageUrl || '',
            imageHint: cat.imageHint || cat.name.toLowerCase()
        };
    });
  }, [allCategories]);

  const [activeItem, setActiveItem] = useState<HeroGridItem | null>(null);

  useEffect(() => {
    if (!activeItem && heroGridItems.length > 0) {
      setActiveItem(heroGridItems[0]);
    }
  }, [heroGridItems, activeItem]);

  const activeItemIndex = useMemo(() => {
      if (!activeItem || !heroGridItems) return 0;
      const index = heroGridItems.findIndex(item => item.id === activeItem.id);
      return index > -1 ? index : 0;
  }, [activeItem, heroGridItems]);

  if (isLoading) {
      return (
          <section className="bg-muted h-[480px] flex items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin" />
          </section>
      )
  }
  
  if (!heroGridItems || heroGridItems.length === 0) {
    return (
        <section className="bg-muted h-[480px] flex flex-col items-center justify-center text-center p-4">
            <h3 className="font-headline text-2xl font-bold">No Categories Found</h3>
            <p className="text-muted-foreground mt-2">Add some top-level categories in the admin panel to see them here.</p>
        </section>
    );
  }

  const currentActiveItem = activeItem || heroGridItems[0];

  return (
    <section>
         <div className="grid grid-cols-1 lg:grid-cols-2 gap-px bg-border overflow-hidden">
            {/* Left Display Panel */}
            <div className="relative isolate flex flex-col items-center justify-center p-8 text-white min-h-[400px] lg:min-h-0">
            {currentActiveItem.displayImageUrl ? (
                <Image
                    src={currentActiveItem.displayImageUrl}
                    alt={currentActiveItem.displayText}
                    fill
                    className="object-cover -z-10 transition-all duration-500 ease-in-out"
                    key={currentActiveItem.id}
                    data-ai-hint={currentActiveItem.imageHint}
                    unoptimized
                />
            ) : (
                <div className={cn("absolute inset-0 -z-10", fallbackColors[activeItemIndex % fallbackColors.length])}></div>
            )}

            <div className="absolute inset-0 bg-black/30 -z-10"></div>

            <div className="text-center relative">
                <p className="text-white/80">{currentActiveItem.displaySubtitle}</p>
                <h2 className="font-headline text-5xl font-bold text-white mt-2">{currentActiveItem.displayText}</h2>
            </div>
            </div>

            {/* Right Grid Panel */}
            <div className="grid grid-cols-4 grid-rows-3 bg-border">
            {heroGridItems.map((item, index) => (
                <Link
                href={`/products?category=${item.id}`}
                key={item.id}
                onMouseEnter={() => setActiveItem(item)}
                className={cn(
                    "relative isolate flex items-center justify-center p-4 text-center text-white aspect-[4/3] transition-all duration-200 group",
                    "focus:z-10 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-inset"
                )}
                >
                {item.backgroundImageUrl ? (
                    <Image
                        src={item.backgroundImageUrl}
                        alt={item.title}
                        fill
                        className="object-cover -z-10 group-hover:scale-105 transition-transform duration-300"
                        data-ai-hint={item.imageHint}
                        unoptimized
                    />
                ) : (
                    <div className={cn("absolute inset-0 -z-10", fallbackColors[index % fallbackColors.length])}></div>
                )}
                <div className={cn(
                    "absolute inset-0 bg-black/50 group-hover:bg-black/30 transition-colors -z-10",
                     activeItem?.id === item.id && "bg-black/10"
                )}></div>
                <h3 className="font-semibold text-lg">{item.title}</h3>
                </Link>
            ))}
            </div>
        </div>
    </section>
  );
}
