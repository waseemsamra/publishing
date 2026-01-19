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

    return topLevelCategories.slice(0, 12).map((cat): HeroGridItem => ({
        id: cat.id,
        title: cat.name,
        displayText: `${cat.name} Packaging`,
        displaySubtitle: "noissue Customized Packaging",
        backgroundImageUrl: cat.imageUrl || `https://picsum.photos/seed/${cat.id}/400/400`,
        displayImageUrl: cat.imageUrl || `https://picsum.photos/seed/${cat.id}/800/800`,
        imageHint: cat.imageHint || cat.name.toLowerCase()
    }));
  }, [allCategories]);

  const [activeItem, setActiveItem] = useState<HeroGridItem | null>(null);

  useEffect(() => {
    if (!activeItem && heroGridItems.length > 0) {
      setActiveItem(heroGridItems[0]);
    }
  }, [heroGridItems, activeItem]);

  if (isLoading) {
      return (
          <section className="bg-background">
              <div className="container py-12">
                  <div className="h-[600px] bg-muted rounded-xl flex items-center justify-center">
                      <Loader2 className="h-8 w-8 animate-spin" />
                  </div>
              </div>
          </section>
      )
  }
  
  if (!heroGridItems || heroGridItems.length === 0) {
    return (
        <section className="bg-background">
            <div className="container py-12">
                <div className="h-[600px] bg-muted rounded-xl flex flex-col items-center justify-center text-center">
                    <h3 className="font-headline text-2xl font-bold">No Categories Found</h3>
                    <p className="text-muted-foreground mt-2">Add some top-level categories in the admin panel to see them here.</p>
                </div>
            </div>
        </section>
    );
  }

  const currentActiveItem = activeItem || heroGridItems[0];

  return (
    <section className="bg-background">
        <div className="container py-12">
             <div className="grid grid-cols-1 lg:grid-cols-2 gap-px bg-border overflow-hidden rounded-xl border">
                {/* Left Display Panel */}
                <div className="relative isolate flex flex-col items-center justify-center p-8 text-white min-h-[400px] lg:min-h-0">
                <Image
                    src={currentActiveItem.displayImageUrl}
                    alt={currentActiveItem.displayText}
                    fill
                    className="object-cover -z-10 transition-all duration-500 ease-in-out"
                    key={currentActiveItem.id}
                    data-ai-hint={currentActiveItem.imageHint}
                    unoptimized
                />
                <div className="absolute inset-0 bg-primary/80 -z-10"></div>
                <div className="text-center relative">
                    <p className="text-primary-foreground/80">{currentActiveItem.displaySubtitle}</p>
                    <h2 className="font-headline text-5xl font-bold text-primary-foreground mt-2">{currentActiveItem.displayText}</h2>
                </div>
                </div>

                {/* Right Grid Panel */}
                <div className="grid grid-cols-3 grid-rows-4 bg-border">
                {heroGridItems.map((item) => (
                    <Link
                    href={`/products?category=${item.id}`}
                    key={item.id}
                    onMouseEnter={() => setActiveItem(item)}
                    className={cn(
                        "relative isolate flex items-center justify-center p-4 text-center text-white aspect-square transition-all duration-200 group",
                        "focus:z-10 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-inset"
                    )}
                    >
                    <Image
                        src={item.backgroundImageUrl}
                        alt={item.title}
                        fill
                        className="object-cover -z-10 group-hover:scale-105 transition-transform duration-300"
                        data-ai-hint={item.imageHint}
                        unoptimized
                      />
                    <div className={cn(
                        "absolute inset-0 bg-green-800/70 group-hover:bg-green-800/50 transition-colors -z-10",
                        activeItem?.id === item.id && "bg-green-800/30"
                    )}></div>
                    <h3 className="font-semibold text-lg">{item.title}</h3>
                    </Link>
                ))}
                </div>
            </div>
        </div>
    </section>
  );
}
